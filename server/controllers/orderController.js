const { pool } = require('../config/database');

// Create order (Customer only)
const createOrder = async (req, res) => {
    try {
        const customerId = req.userId;
        const { items, payment_method, notes } = req.body;
        const shipping_address = req.body.shipping_address || req.body.delivery_address || 'Default Delivery Address';

        let normalizedPaymentMethod = payment_method;
        if (!normalizedPaymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }
        if (normalizedPaymentMethod === 'cod') normalizedPaymentMethod = 'cash_on_delivery';
        if (!['cash_on_delivery', 'upi', 'card'].includes(normalizedPaymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method. Supported methods: cash_on_delivery, upi, card'
            });
        }
        const paymentStatus = 'pending';

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            let totalAmount = 0;
            const orderItems = [];

            // Process each item
            for (const item of items) {
                const [products] = await connection.query(
                    'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
                    [item.product_id]
                );

                if (products.length === 0) {
                    throw new Error(`Product ${item.product_id} not found or unavailable`);
                }

                const product = products[0];
                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    product_id: product.id,
                    farmer_id: product.farmer_id,
                    quantity: item.quantity,
                    price: product.price,
                    total: itemTotal
                });

                // Update product quantity
                await connection.query(
                    'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                    [item.quantity, product.id]
                );
            }

            // Generate order number
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

            const destLat = req.body.destination_latitude || null;
            const destLng = req.body.destination_longitude || null;

            // Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders 
                 (customer_id, order_number, total_amount, shipping_address, destination_latitude, destination_longitude, payment_method, payment_status, notes, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [customerId, orderNumber, totalAmount, shipping_address, destLat, destLng, normalizedPaymentMethod, paymentStatus, notes]
            );

            const orderId = orderResult.insertId;

            // Create order items
            for (const item of orderItems) {
                await connection.query(
                    `INSERT INTO order_items 
                     (order_id, product_id, farmer_id, quantity, price, total)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.farmer_id, item.quantity, item.price, item.total]
                );
            }

            // Insert initial status history
            await connection.query(
                'INSERT INTO order_status_history (order_id, status, note, updated_by, updated_by_role) VALUES (?, ?, ?, ?, ?)',
                [orderId, 'pending', 'Order placed by customer', customerId, 'customer']
            );

            // Create notification for farmer(s)
            const farmerIds = [...new Set(orderItems.map(i => i.farmer_id))];
            for (const farmerId of farmerIds) {
                await connection.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                    [farmerId, 'New Order Received', `You have a new order #${orderNumber}`, 'order']
                ).catch(() => {});
            }

            // Log activity
            await connection.query(
                'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                [customerId, 'create_order', 'order', orderId, JSON.stringify({ orderNumber, totalAmount })]
            ).catch(() => {});

            // Commit transaction
            await connection.commit();

            // Get complete order details
            const [orderDetails] = await connection.query(
                `SELECT o.*, u.name as customer_name 
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 WHERE o.id = ?`,
                [orderId]
            );

            const [orderItemsDetails] = await connection.query(
                `SELECT oi.*, p.name as product_name, u.name as farmer_name
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 JOIN users u ON oi.farmer_id = u.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order: {
                    ...orderDetails[0],
                    items: orderItemsDetails
                }
            });

        } catch (error) {
            // Rollback on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating order',
            error: error.message
        });
    }
};

// Get customer orders
const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.userId;

        const [orders] = await pool.query(
            `SELECT o.*, 
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC`,
            [customerId]
        );

        // Get items for each order
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.name as product_name, p.image_url,
                        u.name as farmer_name
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 JOIN users u ON oi.farmer_id = u.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json({
            success: true,
            orders,
            count: orders.length
        });

    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get farmer orders (for products they sell)
const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.userId;

        const [orders] = await pool.query(
            `SELECT DISTINCT o.*, u.name as customer_name,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN users u ON o.customer_id = u.id
             WHERE oi.farmer_id = ?
             ORDER BY o.created_at DESC`,
            [farmerId]
        );

        // Get items for each order
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.name as product_name, p.image_url
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ? AND oi.farmer_id = ?`,
                [order.id, farmerId]
            );
            order.items = items;
        }

        res.json({
            success: true,
            orders,
            count: orders.length
        });

    } catch (error) {
        console.error('Get farmer orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer orders',
            error: error.message
        });
    }
};

// Get order by ID
const getOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;
        const userRole = req.userRole;

        let query = `
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.id = ?
        `;

        // Restrict access based on role
        if (userRole === 'customer') {
            query += ' AND o.customer_id = ?';
        } else if (userRole === 'farmer') {
            query += ` AND EXISTS (
                SELECT 1 FROM order_items oi 
                WHERE oi.order_id = o.id AND oi.farmer_id = ?
            )`;
        }

        const params = userRole === 'customer' 
            ? [orderId, userId] 
            : [orderId, userId];

        const [orders] = await pool.query(query, params);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or you do not have permission'
            });
        }

        // Get order items
        const [items] = await pool.query(
            `SELECT oi.*, p.name as product_name, p.image_url,
                    u.name as farmer_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN users u ON oi.farmer_id = u.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.json({
            success: true,
            order: {
                ...orders[0],
                items
            }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status (Farmer can update, Customer can cancel)
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;
        const userRole = req.userRole;
        const { status, note } = req.body;

        const validStatuses = ['pending','confirmed','preparing','ready','out_for_delivery','on_the_way','delivered','cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        // Check if order exists and user has permission
        let checkQuery = 'SELECT * FROM orders WHERE id = ?';
        const checkParams = [orderId];

        if (userRole === 'customer') {
            checkQuery += ' AND customer_id = ?';
            checkParams.push(userId);
            // Customers can only cancel pending orders
            if (status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    message: 'Customers can only cancel orders'
                });
            }
        } else if (userRole === 'farmer') {
            checkQuery += ` AND EXISTS (
                SELECT 1 FROM order_items oi 
                WHERE oi.order_id = ? AND oi.farmer_id = ?
            )`;
            checkParams.push(orderId, userId);
        }

        const [orders] = await pool.query(checkQuery, checkParams);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or you do not have permission'
            });
        }

        const order = orders[0];

        // Update order status
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        // Insert status history
        await pool.query(
            'INSERT INTO order_status_history (order_id, status, note, updated_by, updated_by_role) VALUES (?, ?, ?, ?, ?)',
            [orderId, status, note || null, userId, userRole]
        ).catch(() => {});

        // Notify customer
        const statusMessages = {
            confirmed: 'Your order has been confirmed by the farmer',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup/delivery',
            out_for_delivery: 'Your order is out for delivery',
            on_the_way: 'Your order is on the way to you',
            delivered: 'Your order has been delivered successfully',
            cancelled: 'Your order has been cancelled'
        };
        if (statusMessages[status]) {
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                [order.customer_id, 'Order Update', statusMessages[status], 'order']
            ).catch(() => {});
        }

        // Log activity
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'update_order_status', 'order', orderId, JSON.stringify({ status, note })]
        ).catch(() => {});

        res.json({
            success: true,
            message: 'Order status updated successfully',
            newStatus: status
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Get order status history (for tracking timeline)
const getOrderHistory = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;
        const userRole = req.userRole;

        // Check access
        let accessQuery = 'SELECT id, customer_id, status FROM orders WHERE id = ?';
        const [orders] = await pool.query(accessQuery, [orderId]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orders[0];

        // Access control
        if (userRole === 'customer' && order.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (userRole === 'farmer') {
            const [items] = await pool.query(
                'SELECT id FROM order_items WHERE order_id = ? AND farmer_id = ?',
                [orderId, userId]
            );
            if (items.length === 0) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        const [history] = await pool.query(
            `SELECT osh.*, u.name as updated_by_name
             FROM order_status_history osh
             LEFT JOIN users u ON osh.updated_by = u.id
             WHERE osh.order_id = ?
             ORDER BY osh.created_at ASC`,
            [orderId]
        );

        res.json({ success: true, history, currentStatus: order.status });
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({ success: false, message: 'Error fetching order history' });
    }
};

// Get order statistics for farmer
const getFarmerStats = async (req, res) => {
    try {
        const farmerId = req.userId;

        // Total orders
        const [totalOrders] = await pool.query(
            `SELECT COUNT(DISTINCT o.id) as count 
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.farmer_id = ?`,
            [farmerId]
        );

        // Orders by status
        const [ordersByStatus] = await pool.query(
            `SELECT o.status, COUNT(DISTINCT o.id) as count 
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.farmer_id = ?
             GROUP BY o.status`,
            [farmerId]
        );

        // Total revenue
        const [revenue] = await pool.query(
            `SELECT COALESCE(SUM(oi.total), 0) as total 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.farmer_id = ? AND o.status != 'cancelled'`,
            [farmerId]
        );

        // Total products
        const [products] = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE farmer_id = ?',
            [farmerId]
        );

        // Recent orders
        const [recentOrders] = await pool.query(
            `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
                    u.name as customer_name,
                    (SELECT GROUP_CONCAT(CONCAT(p.name, ' (', oi2.quantity, ')') SEPARATOR ', ')
                     FROM order_items oi2 
                     JOIN products p ON oi2.product_id = p.id 
                     WHERE oi2.order_id = o.id AND oi2.farmer_id = ?) as items_description
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN users u ON o.customer_id = u.id
             WHERE oi.farmer_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT 5`,
            [farmerId, farmerId]
        );

        // Top selling products
        const [topProducts] = await pool.query(
            `SELECT p.id, p.name, p.image_url, p.price, p.unit,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    COALESCE(SUM(oi.total), 0) as total_revenue
             FROM products p
             LEFT JOIN order_items oi ON p.id = oi.product_id
             LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
             WHERE p.farmer_id = ?
             GROUP BY p.id
             ORDER BY total_sold DESC, total_revenue DESC
             LIMIT 4`,
            [farmerId]
        );

        // Real-time sales overview by date (for revenue/orders chart)
        const [salesByDate] = await pool.query(
            `SELECT DATE(o.created_at) as order_date,
                    COUNT(DISTINCT o.id) as orders_count,
                    COALESCE(SUM(oi.total), 0) as revenue
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.farmer_id = ? AND o.status != 'cancelled'
             GROUP BY DATE(o.created_at)
             ORDER BY DATE(o.created_at) ASC
             LIMIT 14`,
            [farmerId]
        );

        // Today's orders count
        const [todayOrders] = await pool.query(
            `SELECT COUNT(DISTINCT o.id) as count
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.farmer_id = ? AND DATE(o.created_at) = CURDATE()`,
            [farmerId]
        );

        // Distinct customer count
        const [customerCount] = await pool.query(
            `SELECT COUNT(DISTINCT o.customer_id) as count
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.farmer_id = ?`,
            [farmerId]
        );

        // Reviews count
        const [reviewsCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             WHERE p.farmer_id = ?`,
            [farmerId]
        );

        // Calculate pending orders
        const pendingOrders = ordersByStatus.find(s => s.status === 'pending')?.count || 0;

        res.json({
            success: true,
            stats: {
                totalOrders: totalOrders[0].count || 0,
                pendingOrders: pendingOrders || 0,
                processingOrders: ordersByStatus.find(s => ['confirmed', 'preparing', 'ready'].includes(s.status))?.count || 0,
                completedOrders: ordersByStatus.find(s => s.status === 'delivered')?.count || 0,
                totalRevenue: parseFloat(revenue[0].total) || 0,
                totalProducts: products[0].count || 0,
                recentOrders: recentOrders || [],
                topProducts: topProducts || [],
                ordersByStatus: ordersByStatus || [],
                salesByDate: salesByDate || [],
                ordersToday: todayOrders[0]?.count || 0,
                totalCustomers: customerCount[0]?.count || 0,
                totalReviews: reviewsCount[0]?.count || 0
            }
        });

    } catch (error) {
        console.error('Get farmer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer stats',
            error: error.message
        });
    }
};

// Get customer notifications
const getCustomerNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        const [[{ unread }]] = await pool.query(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        res.json({ success: true, notifications, unread });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (id === 'all') {
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
        } else {
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
        }
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error marking notification' });
    }
};

module.exports = {
    createOrder,
    getCustomerOrders,
    getFarmerOrders,
    getOrder,
    updateOrderStatus,
    getFarmerStats,
    getOrderHistory,
    getCustomerNotifications,
    markNotificationRead
};