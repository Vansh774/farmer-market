// FreshField Farmer & Admin Dashboard Logic
const farmer = {
    currentPage: 'dashboard',
    revenueChartInstance: null,
    donutChartInstance: null,
    editingProductId: null,

    init() {
        // Authenticate check
        const user = auth.getCurrentUser();
        if (user) {
            const name = user.name || 'Farmer';
            const firstName = name.split(' ')[0];
            const role = 'Verified Farmer';

            const greetingEl = document.getElementById('user-greeting');
            if (greetingEl) greetingEl.textContent = firstName;

            const headerNameEl = document.getElementById('header-user-name');
            if (headerNameEl) headerNameEl.textContent = name;

            const headerRoleEl = document.getElementById('header-user-role');
            if (headerRoleEl) headerRoleEl.textContent = role;

            const avatarEl = document.getElementById('header-avatar');
            if (avatarEl) {
                if (user.profile_image) {
                    avatarEl.innerHTML = `<img src="${user.profile_image}" alt="${name}">`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEl.innerHTML = `<span>${initials || 'AD'}</span>`;
                }
            }
        }

        // Set current date
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Setup navigation
        this.setupNavigation();

        // Setup upload drag and drop areas
        this.setupUploadAreas();

        // Load dashboard data
        this.loadDashboard();

        // Show default page
        this.showPage('dashboard');
    },

    setupNavigation() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.showPage(page);
                    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    },

    showPage(page) {
        this.currentPage = page;
        
        // Hide all page contents
        document.querySelectorAll('.page-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show target page
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Trigger page-specific data fetch
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    },

    setupUploadAreas() {
        // Product image upload
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('product-image');
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleFilePreview(fileInput, 'upload-preview');
                }
            });
            fileInput.addEventListener('change', () => this.handleFilePreview(fileInput, 'upload-preview'));
        }

        // Profile image upload
        const profileUploadArea = document.getElementById('profile-upload-area');
        const profileInput = document.getElementById('profile-image');
        if (profileUploadArea && profileInput) {
            profileUploadArea.addEventListener('click', () => profileInput.click());
            profileInput.addEventListener('change', () => this.handleFilePreview(profileInput, 'profile-preview'));
        }
    },

    handleFilePreview(input, previewId = 'upload-preview') {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        preview.innerHTML = '';
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'upload-preview-img';
                preview.appendChild(img);
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    // ============================================
    // DASHBOARD OVERVIEW & CHARTS
    // ============================================
    async loadDashboard() {
        try {
            const res = await API.orders.getFarmerStats();
            if (res && res.success && res.stats) {
                const data = res.stats;
                const revEl = document.getElementById('stat-revenue');
                if (revEl) revEl.textContent = `₹${parseFloat(data.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                const prodEl = document.getElementById('stat-products');
                if (prodEl) prodEl.textContent = (data.totalProducts ?? 0).toLocaleString();

                const pendingEl = document.getElementById('stat-pending');
                if (pendingEl) pendingEl.textContent = (data.pendingOrders ?? 0).toLocaleString();

                const ordEl = document.getElementById('stat-orders');
                if (ordEl) ordEl.textContent = (data.totalOrders ?? 0).toLocaleString();

                const badge = document.getElementById('pending-badge');
                if (badge) {
                    badge.textContent = data.pendingOrders ?? 0;
                    badge.style.display = (data.pendingOrders > 0) ? 'inline' : 'none';
                }

                // Render Charts with real-time data
                this.renderRevenueChart(data.salesByDate);
                this.renderDonutChart(data.ordersByStatus, data.totalOrders);

                // Render Top Products with real-time data
                this.renderTopProducts(data.topProducts);

                // Render Recent Orders with real-time data
                this.renderRecentOrders(data.recentOrders);

                // Render Activity Overview with real-time data
                this.renderActivity(data);
                return;
            }
        } catch (error) {
            console.error('Failed to load farmer stats:', error);
        }

        // Clean fallback
        this.renderRevenueChart([]);
        this.renderDonutChart({}, 0);
        this.renderTopProducts([]);
        this.renderRecentOrders([]);
        this.renderActivity({});
    },

    renderRevenueChart(salesByDate = []) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        let labels = [];
        let revenueData = [];
        let ordersData = [];

        if (Array.isArray(salesByDate) && salesByDate.length > 0) {
            labels = salesByDate.map(item => {
                const dateVal = item.order_date || item.date;
                const d = new Date(dateVal);
                return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            });
            revenueData = salesByDate.map(item => parseFloat(item.revenue || 0));
            ordersData = salesByDate.map(item => parseInt(item.orders_count || item.orders || 0));
        } else {
            labels = ['No Data'];
            revenueData = [0];
            ordersData = [0];
        }

        this.revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue (₹)',
                        data: revenueData,
                        borderColor: '#355C24',
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return 'rgba(53, 92, 36, 0.08)';
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(53, 92, 36, 0.25)');
                            gradient.addColorStop(1, 'rgba(53, 92, 36, 0.01)');
                            return gradient;
                        },
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#355C24',
                        pointBorderColor: '#FFF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Orders',
                        data: ordersData,
                        borderColor: '#F28C28',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#F28C28',
                        pointBorderColor: '#FFF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1F211B',
                        titleFont: { family: 'Poppins', size: 12, weight: '600' },
                        bodyFont: { family: 'Poppins', size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Poppins', size: 11 }, color: '#6F7168' }
                    },
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: '#EEE9DA', drawBorder: false },
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168',
                            callback: (val) => (val >= 1000 ? (val/1000) + 'K' : '₹' + val)
                        }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        grid: { display: false },
                        ticks: {
                            precision: 0,
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168'
                        }
                    }
                }
            }
        });
    },

    renderDonutChart(statusCounts = {}, totalOrders = 0) {
        const ctx = document.getElementById('user-distribution-chart');
        if (!ctx) return;

        if (this.donutChartInstance) {
            this.donutChartInstance.destroy();
        }

        const centerValEl = document.getElementById('donut-center-val');
        if (centerValEl) centerValEl.textContent = (totalOrders ?? 0).toLocaleString();

        const centerLblEl = document.getElementById('donut-center-lbl');
        if (centerLblEl) centerLblEl.textContent = 'Total Orders';

        const statusMap = {
            'pending': { label: 'Pending', color: '#F28C28' },
            'confirmed': { label: 'Confirmed', color: '#3B82F6' },
            'processing': { label: 'Processing', color: '#6366F1' },
            'shipped': { label: 'Shipped', color: '#8B5CF6' },
            'delivered': { label: 'Delivered', color: '#355C24' },
            'cancelled': { label: 'Cancelled', color: '#EF4444' }
        };

        const counts = {};
        if (Array.isArray(statusCounts)) {
            statusCounts.forEach(item => {
                if (item && item.status) counts[item.status] = item.count;
            });
        } else if (typeof statusCounts === 'object' && statusCounts !== null) {
            Object.assign(counts, statusCounts);
        }

        const labels = [];
        const data = [];
        const colors = [];

        Object.keys(statusMap).forEach(key => {
            const count = counts[key] || 0;
            if (count > 0 || totalOrders === 0) {
                labels.push(statusMap[key].label);
                data.push(count);
                colors.push(statusMap[key].color);
            }
        });

        if (totalOrders === 0 || data.every(v => v === 0)) {
            labels.length = 0;
            data.length = 0;
            colors.length = 0;
            labels.push('No Orders Yet');
            data.push(1);
            colors.push('#E5E7EB');
        }

        this.donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#FFFDF8',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '76%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1F211B',
                        bodyFont: { family: 'Poppins', size: 12 },
                        padding: 8,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                if (totalOrders === 0) return ' No orders recorded';
                                return ` ${context.label}: ${context.raw} orders`;
                            }
                        }
                    }
                }
            }
        });
    },

    renderTopProducts(products = []) {
        const container = document.getElementById('top-products-container');
        if (!container) return;

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    <i class="fas fa-leaf" style="font-size: 24px; color: var(--green-primary); margin-bottom: 8px; display: block; opacity: 0.6;"></i>
                    No product sales recorded yet.
                </div>`;
            return;
        }

        const maxSales = Math.max(...products.map(p => Number(p.total_sold ?? p.sales_count ?? 0)), 1);

        container.innerHTML = products.slice(0, 4).map((p, idx) => {
            let imgUrl = p.image_url || '';
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                imgUrl = `http://localhost:5000${imgUrl}`;
            }
            const fallback = 'assets/images/tomatoes.png';
            const salesCount = Number(p.total_sold ?? p.sales_count ?? 0);
            const revenue = parseFloat(p.total_revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const fillPercent = Math.min(Math.round((salesCount / maxSales) * 100), 100);

            return `
                <div class="top-product-item">
                    <span class="product-rank">${idx + 1}</span>
                    <img src="${imgUrl || fallback}" class="product-thumb" alt="${p.name}" onerror="this.onerror=null;this.src='${fallback}';">
                    <div class="product-meta">
                        <div class="product-name-txt">${p.name}</div>
                        <div class="product-bar-wrap">
                            <div class="product-bar-fill" style="width:${Math.max(fillPercent, 12)}%;"></div>
                        </div>
                    </div>
                    <div>
                        <div class="product-sales-txt">${salesCount} Sales</div>
                        <div class="product-rev-txt">₹${revenue}</div>
                    </div>
                </div>`;
        }).join('');
    },

    renderRecentOrders(orders = []) {
        const container = document.getElementById('recent-orders-container');
        if (!container) return;

        if (!Array.isArray(orders) || orders.length === 0) {
            container.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    <i class="fas fa-receipt" style="font-size: 24px; color: var(--accent-orange); margin-bottom: 8px; display: block; opacity: 0.6;"></i>
                    No orders placed yet.
                </div>`;
            return;
        }

        container.innerHTML = orders.slice(0, 5).map(o => {
            const statusClass = (o.status || 'pending').toLowerCase();
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const total = parseFloat(o.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const customerName = o.customer_name || 'Customer';
            const prodDesc = o.items_description || o.product_description || 'Produce order';

            let imgUrl = o.product_image || '';
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                imgUrl = `http://localhost:5000${imgUrl}`;
            }
            const fallback = 'assets/images/hero-produce.png';

            return `
                <div class="order-row-item" style="cursor: pointer;" onclick="farmer.showPage('orders')">
                    <img src="${imgUrl || fallback}" class="order-img" alt="Order product" onerror="this.onerror=null;this.src='${fallback}';">
                    <div class="order-info">
                        <div class="order-id-txt">#${o.order_number || o.id}</div>
                        <div class="order-cust-name">${customerName}</div>
                        <div class="order-prod-desc">${prodDesc}</div>
                    </div>
                    <div class="order-status-wrap">
                        <span class="status-badge-pill ${statusClass}">${o.status || 'Pending'}</span>
                        <div class="order-date-txt">${dateStr}</div>
                        <div class="order-amt-txt">₹${total}</div>
                    </div>
                </div>`;
        }).join('');
    },

    renderActivity(stats = {}) {
        const actCust = document.getElementById('act-customers');
        if (actCust) actCust.textContent = (stats.totalCustomers ?? 0).toLocaleString();

        const actOrdToday = document.getElementById('act-orders-today');
        if (actOrdToday) actOrdToday.textContent = (stats.ordersToday ?? 0).toLocaleString();

        const actProd = document.getElementById('act-products');
        if (actProd) actProd.textContent = (stats.totalProducts ?? 0).toLocaleString();

        const actRev = document.getElementById('act-reviews');
        if (actRev) actRev.textContent = (stats.totalReviews ?? 0).toLocaleString();
    },

    // ============================================
    // PRODUCTS MANAGEMENT (Executive Catalog Suite)
    // ============================================
    products: [],
    productViewMode: localStorage.getItem('freshfield_farmer_prod_view') || 'grid',

    async loadProducts(silent = false) {
        const container = document.getElementById('farmer-products');
        const refreshIcon = document.getElementById('refresh-products-icon');
        if (refreshIcon) refreshIcon.classList.add('fa-spin');

        if (!silent && container && (!this.products || this.products.length === 0)) {
            container.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:24px; color:var(--green-primary); margin-bottom:12px;"></i><p>Loading farm catalog...</p></div>';
        }

        try {
            const data = await API.products.getFarmerProducts();
            if (data && data.success && Array.isArray(data.products)) {
                this.products = data.products;
                this.updateProductKPIs();
                this.syncViewToggleButtons();
                this.renderProducts();
            } else {
                this.products = [];
                this.updateProductKPIs();
                this.syncViewToggleButtons();
                this.renderProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            if (container) {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 30px;">Failed to load products. Please click Refresh to try again.</p>';
            }
        } finally {
            if (refreshIcon) {
                setTimeout(() => refreshIcon.classList.remove('fa-spin'), 400);
            }
        }
    },

    syncViewToggleButtons() {
        const btnGrid = document.getElementById('btn-view-grid');
        const btnTable = document.getElementById('btn-view-table');
        if (btnGrid) btnGrid.classList.toggle('active', this.productViewMode === 'grid');
        if (btnTable) btnTable.classList.toggle('active', this.productViewMode === 'table');
    },

    updateProductKPIs() {
        const total = this.products.length;
        const healthy = this.products.filter(p => (parseInt(p.quantity) || 0) > 20).length;
        const low = this.products.filter(p => (parseInt(p.quantity) || 0) <= 20).length;
        const totalVal = this.products.reduce((sum, p) => {
            const pr = parseFloat(p.price) || 0;
            const q = parseInt(p.quantity) || 0;
            return sum + (pr * q);
        }, 0);

        const badgeEl = document.getElementById('products-count-badge');
        if (badgeEl) badgeEl.textContent = `${total} ${total === 1 ? 'Product Listed' : 'Products Listed'}`;

        const totalEl = document.getElementById('prod-stat-total');
        if (totalEl) totalEl.textContent = total;

        const healthyEl = document.getElementById('prod-stat-healthy');
        if (healthyEl) healthyEl.textContent = healthy;

        const lowEl = document.getElementById('prod-stat-low');
        if (lowEl) lowEl.textContent = low;

        const valEl = document.getElementById('prod-stat-value');
        if (valEl) valEl.textContent = `₹${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    setProductViewMode(mode) {
        this.productViewMode = mode;
        try {
            localStorage.setItem('freshfield_farmer_prod_view', mode);
        } catch (e) {}

        const btnGrid = document.getElementById('btn-view-grid');
        const btnTable = document.getElementById('btn-view-table');
        if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
        if (btnTable) btnTable.classList.toggle('active', mode === 'table');

        this.renderProducts();
    },

    filterProducts() {
        this.renderProducts();
    },

    clearProductSearch() {
        const input = document.getElementById('product-search');
        if (input) input.value = '';
        this.renderProducts();
    },

    renderProducts() {
        const container = document.getElementById('farmer-products');
        if (!container) return;

        const searchInput = document.getElementById('product-search');
        const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

        const clearBtn = document.getElementById('product-search-clear');
        if (clearBtn) clearBtn.style.display = searchVal ? 'block' : 'none';

        const catSelect = document.getElementById('product-category-filter');
        const catVal = catSelect ? catSelect.value : 'all';

        const stockSelect = document.getElementById('product-stock-filter');
        const stockVal = stockSelect ? stockSelect.value : 'all';

        const sortSelect = document.getElementById('product-sort-filter');
        const sortVal = sortSelect ? sortSelect.value : 'newest';

        // Filter
        let list = [...this.products].filter(p => {
            if (searchVal) {
                const name = (p.name || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                const cat = (p.category || '').toLowerCase();
                if (!name.includes(searchVal) && !desc.includes(searchVal) && !cat.includes(searchVal)) {
                    return false;
                }
            }

            if (catVal !== 'all') {
                if (p.category !== catVal) return false;
            }

            const q = parseInt(p.quantity) || 0;
            const isAvail = p.is_available !== false && p.is_available !== 0 && p.is_available !== 'false';

            if (stockVal === 'healthy' && q <= 20) return false;
            if (stockVal === 'low' && (q <= 0 || q > 20)) return false;
            if (stockVal === 'out' && q > 0) return false;
            if (stockVal === 'available' && !isAvail) return false;
            if (stockVal === 'hidden' && isAvail) return false;

            return true;
        });

        // Sort
        list.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            const stockA = parseInt(a.quantity) || 0;
            const stockB = parseInt(b.quantity) || 0;

            if (sortVal === 'price-asc') return priceA - priceB;
            if (sortVal === 'price-desc') return priceB - priceA;
            if (sortVal === 'stock-desc') return stockB - stockA;
            if (sortVal === 'stock-low') return stockA - stockB;
            if (sortVal === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            return (b.id || 0) - (a.id || 0);
        });

        // Empty state
        if (list.length === 0) {
            if (this.products.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:60px 20px; background:var(--white); border-radius:18px; border:1px dashed var(--beige-mid);">
                        <div style="width:72px; height:72px; background:var(--green-pale); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--green-primary); font-size:30px;">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <h3 style="font-family:var(--font-serif); font-size:22px; color:var(--text-dark); margin-bottom:8px;">No Produce Listed Yet</h3>
                        <p style="font-size:13.5px; color:var(--text-muted); max-width:440px; margin:0 auto 20px;">
                            Start listing your harvest produce so local customers can discover, purchase, and support your farm.
                        </p>
                        <button class="btn-add-product" onclick="farmer.showAddProductForm()">
                            <i class="fas fa-plus-circle"></i> Add First Farm Produce
                        </button>
                    </div>`;
            } else {
                container.innerHTML = `
                    <div style="text-align:center; padding:50px 20px; background:var(--white); border-radius:18px; border:1px solid var(--beige);">
                        <div style="width:58px; height:58px; background:var(--cream); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; color:var(--text-muted); font-size:24px;">
                            <i class="fas fa-filter"></i>
                        </div>
                        <h3 style="font-family:var(--font-serif); font-size:19px; color:var(--text-dark); margin-bottom:6px;">No matching produce found</h3>
                        <p style="font-size:13px; color:var(--text-muted); max-width:400px; margin:0 auto 18px;">
                            Try clearing your search query or selecting a different category/stock filter.
                        </p>
                        <button class="btn-refresh-catalog" onclick="farmer.clearProductFilters()">
                            <i class="fas fa-redo"></i> Reset All Filters
                        </button>
                    </div>`;
            }
            return;
        }

        // Render Grid View
        if (this.productViewMode === 'grid') {
            container.innerHTML = `
                <div class="farmer-products-grid">
                    ${list.map(p => this.createProductCardHTML(p)).join('')}
                </div>`;
        } else {
            // Render Table View
            container.innerHTML = `
                <div class="farmer-products-table-wrap">
                    <table class="farmer-products-table">
                        <thead>
                            <tr>
                                <th>Produce Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Inventory</th>
                                <th>Total Sold</th>
                                <th>Visibility</th>
                                <th style="text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(p => this.createProductTableRowHTML(p)).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
    },

    clearProductFilters() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) searchInput.value = '';
        const catSelect = document.getElementById('product-category-filter');
        if (catSelect) catSelect.value = 'all';
        const stockSelect = document.getElementById('product-stock-filter');
        if (stockSelect) stockSelect.value = 'all';
        const sortSelect = document.getElementById('product-sort-filter');
        if (sortSelect) sortSelect.value = 'newest';
        this.renderProducts();
    },

    createProductCardHTML(p) {
        let imgUrl = p.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
            imgUrl = `http://localhost:5000${imgUrl}`;
        }
        const fallback = 'assets/images/tomatoes.png';
        const price = parseFloat(p.price).toFixed(2);
        const unit = p.unit || 'kg';
        const quantity = parseInt(p.quantity) || 0;
        const totalSold = parseInt(p.total_sold) || 0;
        const isAvail = p.is_available !== false && p.is_available !== 0 && p.is_available !== 'false';

        // Stock calculation
        let stockClass = 'healthy';
        let stockLabel = `In Stock (${quantity} ${unit})`;
        let fillWidth = Math.min(100, Math.max(10, Math.round((quantity / 100) * 100)));

        if (quantity <= 0) {
            stockClass = 'out';
            stockLabel = 'Out of Stock (0)';
            fillWidth = 100;
        } else if (quantity <= 20) {
            stockClass = 'low';
            stockLabel = `Low Stock (${quantity} ${unit} left)`;
            fillWidth = Math.round((quantity / 20) * 100);
        }

        const safeDesc = p.description ? p.description.replace(/"/g, '&quot;') : 'Freshly harvested natural produce directly from our farm soil.';

        return `
            <div class="farmer-prod-card" data-product-id="${p.id}">
                <div class="farmer-prod-img-wrap">
                    <img src="${imgUrl || fallback}" alt="${p.name}" class="farmer-prod-img" loading="lazy" onerror="this.onerror=null;this.src='${fallback}';">
                    <span class="farmer-prod-cat-pill">${p.category || 'Produce'}</span>
                    <button type="button" class="farmer-prod-status-pill ${isAvail ? 'available' : 'unavailable'}" 
                        onclick="farmer.toggleProductAvailability(${p.id})" 
                        title="Click to toggle visibility in store">
                        <i class="fas ${isAvail ? 'fa-check-circle' : 'fa-eye-slash'}"></i> ${isAvail ? 'Available' : 'Hidden'}
                    </button>
                </div>

                <div class="farmer-prod-body">
                    <h4 class="farmer-prod-title">${p.name}</h4>
                    <p class="farmer-prod-desc">${safeDesc}</p>

                    <div class="farmer-prod-pricing-row">
                        <div class="farmer-prod-price">
                            ₹${price} <span class="farmer-prod-unit">/ ${unit}</span>
                        </div>
                        <span class="farmer-prod-sold">
                            <i class="fas fa-shopping-bag" style="margin-right:4px;"></i>${totalSold} sold
                        </span>
                    </div>

                    <div class="farmer-prod-stock-wrap">
                        <div class="farmer-prod-stock-meta">
                            <span class="stock-level-${stockClass}">
                                <i class="fas ${stockClass === 'healthy' ? 'fa-boxes' : stockClass === 'low' ? 'fa-exclamation-triangle' : 'fa-times-circle'}"></i> ${stockLabel}
                            </span>
                            <span style="color:var(--text-muted); font-size:11px;">Max 100+</span>
                        </div>
                        <div class="farmer-prod-stock-bar">
                            <div class="farmer-prod-stock-fill ${stockClass}" style="width: ${fillWidth}%;"></div>
                        </div>
                    </div>

                    <div class="farmer-prod-actions">
                        <button type="button" class="btn-prod-edit" onclick="farmer.editProduct(${p.id})">
                            <i class="fas fa-pen"></i> Edit Produce
                        </button>
                        <button type="button" class="btn-prod-delete" onclick="farmer.deleteProduct(${p.id})" title="Delete Produce Listing">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    },

    createProductTableRowHTML(p) {
        let imgUrl = p.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
            imgUrl = `http://localhost:5000${imgUrl}`;
        }
        const fallback = 'assets/images/tomatoes.png';
        const price = parseFloat(p.price).toFixed(2);
        const unit = p.unit || 'kg';
        const quantity = parseInt(p.quantity) || 0;
        const totalSold = parseInt(p.total_sold) || 0;
        const isAvail = p.is_available !== false && p.is_available !== 0 && p.is_available !== 'false';

        let stockBadgeClass = 'status-delivered';
        let stockText = `${quantity} in stock`;
        if (quantity <= 0) {
            stockBadgeClass = 'status-cancelled';
            stockText = 'Out of Stock';
        } else if (quantity <= 20) {
            stockBadgeClass = 'status-processing';
            stockText = `Low (${quantity} left)`;
        }

        return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${imgUrl || fallback}" alt="${p.name}" style="width:52px; height:52px; border-radius:10px; object-fit:cover; border:1px solid var(--beige-mid);" onerror="this.onerror=null;this.src='${fallback}';">
                        <div>
                            <div style="font-family:var(--font-serif); font-size:15px; font-weight:700; color:var(--text-dark);">${p.name}</div>
                            <div style="font-size:11.5px; color:var(--text-muted); max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.description || 'Fresh natural produce'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="background:var(--cream); padding:4px 10px; border-radius:var(--radius-pill); font-size:11.5px; font-weight:600; color:var(--text-dark); border:1px solid var(--beige-mid);">
                        ${p.category || 'Produce'}
                    </span>
                </td>
                <td>
                    <div style="font-family:var(--font-serif); font-size:16px; font-weight:700; color:var(--green-primary);">₹${price}</div>
                    <div style="font-size:11px; color:var(--text-muted);">per ${unit}</div>
                </td>
                <td>
                    <span class="status-badge-pill ${stockBadgeClass}">
                        ${stockText}
                    </span>
                </td>
                <td>
                    <span style="font-weight:600; font-size:13px; color:var(--text-dark);">${totalSold}</span> <span style="font-size:11px; color:var(--text-muted);">orders</span>
                </td>
                <td>
                    <button type="button" class="farmer-prod-status-pill ${isAvail ? 'available' : 'unavailable'}" 
                        style="position:static;" 
                        onclick="farmer.toggleProductAvailability(${p.id})" 
                        title="Click to toggle visibility">
                        <i class="fas ${isAvail ? 'fa-check-circle' : 'fa-eye-slash'}"></i> ${isAvail ? 'Available' : 'Hidden'}
                    </button>
                </td>
                <td style="text-align:right;">
                    <div style="display:inline-flex; gap:6px;">
                        <button type="button" class="btn-icon-sm" onclick="farmer.editProduct(${p.id})" title="Edit Produce">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button type="button" class="btn-icon-sm danger" onclick="farmer.deleteProduct(${p.id})" title="Delete Produce">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    },

    openProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    },

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
        this.resetProductForm();
    },

    showAddProductForm() {
        this.resetProductForm();
        const title = document.getElementById('product-form-title');
        if (title) title.textContent = 'Add New Farm Produce';
        this.openProductModal();
    },

    async editProduct(id) {
        try {
            const data = await API.products.getById(id);
            if (data && data.success && data.product) {
                const p = data.product;
                const title = document.getElementById('product-form-title');
                if (title) title.textContent = `Edit Produce: ${p.name}`;

                document.getElementById('product-id').value = p.id;
                document.getElementById('product-name').value = p.name || '';
                document.getElementById('product-category').value = p.category || '';
                document.getElementById('product-description').value = p.description || '';
                document.getElementById('product-price').value = p.price || '';
                document.getElementById('product-quantity').value = p.quantity || '';
                document.getElementById('product-unit').value = p.unit || 'kg';

                const availSelect = document.getElementById('product-available');
                if (availSelect) {
                    const isAvail = p.is_available !== false && p.is_available !== 0 && p.is_available !== 'false';
                    availSelect.value = isAvail ? 'true' : 'false';
                }

                const preview = document.getElementById('upload-preview');
                if (preview) {
                    preview.innerHTML = '';
                    if (p.image_url) {
                        const img = document.createElement('img');
                        img.src = p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`;
                        img.className = 'upload-preview-img';
                        img.style.maxHeight = '140px';
                        img.style.borderRadius = '12px';
                        img.style.border = '1px solid var(--beige-mid)';
                        img.style.marginTop = '12px';
                        preview.appendChild(img);
                    }
                }

                this.editingProductId = p.id;
                this.openProductModal();
            }
        } catch (error) {
            console.error('Error fetching product for edit:', error);
            if (typeof toast !== 'undefined') toast.error('Failed to load product details');
        }
    },

    async toggleProductAvailability(id) {
        const prod = this.products.find(p => p.id === Number(id));
        if (!prod) return;

        const currentAvail = prod.is_available !== false && prod.is_available !== 0 && prod.is_available !== 'false';
        const newAvail = !currentAvail;

        // Optimistic UI update
        prod.is_available = newAvail;
        this.renderProducts();

        try {
            const formData = new FormData();
            formData.append('is_available', newAvail);
            const res = await API.products.update(id, formData);
            if (res && res.success) {
                if (typeof toast !== 'undefined') {
                    toast.success(`${prod.name} is now ${newAvail ? 'Available in store' : 'Hidden from store'}`);
                }
            } else {
                throw new Error(res.message || 'Update failed');
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
            // Revert
            prod.is_available = currentAvail;
            this.renderProducts();
            if (typeof toast !== 'undefined') toast.error('Failed to change produce visibility');
        }
    },

    async saveProduct() {
        const saveBtn = document.getElementById('btn-save-product');
        const origBtnText = saveBtn ? saveBtn.innerHTML : 'Save Produce Listing';

        try {
            const id = document.getElementById('product-id').value;
            const name = document.getElementById('product-name').value.trim();
            const category = document.getElementById('product-category').value;
            const description = document.getElementById('product-description').value.trim();
            const price = document.getElementById('product-price').value;
            const quantity = document.getElementById('product-quantity').value;
            const unit = document.getElementById('product-unit').value;
            const availSelect = document.getElementById('product-available');
            const isAvail = availSelect ? availSelect.value === 'true' : true;
            const imageFile = document.getElementById('product-image').files[0];

            if (!name) { if (typeof toast!=='undefined') toast.error('Please enter a produce name'); return; }
            if (!category) { if (typeof toast!=='undefined') toast.error('Please select a category'); return; }
            if (!price || parseFloat(price) <= 0) { if (typeof toast!=='undefined') toast.error('Please enter a valid price'); return; }
            if (quantity === '' || parseInt(quantity) < 0) { if (typeof toast!=='undefined') toast.error('Please enter a valid stock quantity'); return; }

            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('description', description || '');
            formData.append('price', parseFloat(price));
            formData.append('quantity', parseInt(quantity));
            formData.append('unit', unit || 'kg');
            formData.append('is_available', isAvail);
            if (imageFile) formData.append('image', imageFile);

            let result;
            if (id) {
                result = await API.products.update(id, formData);
                if (result && result.success && typeof toast!=='undefined') toast.success('Produce updated successfully! 🌿');
            } else {
                result = await API.products.create(formData);
                if (result && result.success && typeof toast!=='undefined') toast.success('New produce listed successfully! 🌿');
            }

            if (result && result.success) {
                this.closeProductModal();
                await this.loadProducts(true);
            }
        } catch (error) {
            console.error('Save product error:', error);
            if (typeof toast!=='undefined') toast.error(error.message || 'Failed to save product');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origBtnText;
            }
        }
    },

    resetProductForm() {
        const fields = document.getElementById('product-form-fields');
        if (fields) fields.reset();
        const idField = document.getElementById('product-id');
        if (idField) idField.value = '';
        const prev = document.getElementById('upload-preview');
        if (prev) prev.innerHTML = '';
        const title = document.getElementById('product-form-title');
        if (title) title.textContent = 'Add New Farm Produce';
        this.editingProductId = null;
    },

    async deleteProduct(id) {
        const prod = this.products.find(p => p.id === Number(id));
        const name = prod ? prod.name : 'this produce';

        if (!confirm(`Are you sure you want to permanently remove "${name}" from your catalog?`)) return;

        try {
            const result = await API.products.delete(id);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success('Produce deleted successfully');
                await this.loadProducts(true);
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to delete produce');
        }
    },

    // ============================================
    // ORDERS MANAGEMENT
    // ============================================
    async loadOrders() {
        const container = document.getElementById('farmer-orders');
        if (!container) return;
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Loading orders...</p>';

        try {
            const filterEl = document.getElementById('order-filter');
            const filter = filterEl ? filterEl.value : 'all';
            const data = await API.orders.getFarmerOrders();

            if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
                let orders = data.orders;
                if (filter !== 'all') {
                    orders = orders.filter(o => o.status === filter);
                }

                if (orders.length === 0) {
                    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No orders found for selected filter</p>';
                    return;
                }

                const nextStageMap = {
                    'pending': { next: 'confirmed', label: 'Confirm Order' },
                    'confirmed': { next: 'preparing', label: 'Start Preparing' },
                    'preparing': { next: 'ready', label: 'Mark Ready' },
                    'ready': { next: 'out_for_delivery', label: 'Dispatch' },
                    'out_for_delivery': { next: 'on_the_way', label: 'On The Way' },
                    'on_the_way': { next: 'delivered', label: 'Mark Delivered' }
                };

                container.innerHTML = `<table class="orders-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer & Delivery</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Update Stage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const nextAction = nextStageMap[o.status];
                            const itemsList = (o.items || []).map(i => `${i.product_name} (${i.quantity})`).join(', ') || `${o.item_count || 1} items`;
                            const isReadyForDelivery = o.status === 'ready';
                            const isInDelivery = ['out_for_delivery','on_the_way'].includes(o.status);
                            return `<tr>
                            <td><strong>${o.order_number||'#ORD-'+o.id}</strong></td>
                            <td>
                                <div style="font-weight:600; color:var(--text-dark);">${o.customer_name||'Customer'}</div>
                                <div style="font-size:12px; color:var(--text-muted); max-width:220px; line-height:1.3; margin-top:2px;">
                                    <i class="fas fa-map-marker-alt" style="color:var(--green-primary); margin-right:4px;"></i>${o.shipping_address || 'Standard Address'}
                                </div>
                            </td>
                            <td style="font-size:13px; color:var(--text-body); max-width:180px;">${itemsList}</td>
                            <td style="font-weight:600; color:var(--green-dark);">₹${parseFloat(o.total_amount||0).toFixed(2)}</td>
                            <td><span class="status-badge-pill ${o.status||'pending'}">${(o.status||'pending').replace(/_/g, ' ').toUpperCase()}</span></td>
                            <td style="font-size:12px; color:var(--text-muted);">${new Date(o.created_at||Date.now()).toLocaleDateString()}</td>
                            <td>
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <select onchange="farmer.updateOrderStatus(${o.id}, this.value)" class="sales-period-select" style="padding:5px 8px; font-size:12px; border-radius:6px; background:#fff; border:1px solid #D9D2C5;">
                                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>1. Order Placed</option>
                                        <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>2. Confirmed</option>
                                        <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>3. Preparing</option>
                                        <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>4. Ready</option>
                                        <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>5. Out for Delivery</option>
                                        <option value="on_the_way" ${o.status === 'on_the_way' ? 'selected' : ''}>6. On the Way</option>
                                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>7. Delivered</option>
                                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                    ${nextAction ? `<button onclick="farmer.updateOrderStatus(${o.id}, '${nextAction.next}')" class="btn-primary" style="padding:4px 10px; font-size:11px; border-radius:4px; font-weight:600; cursor:pointer; background:var(--green-primary); color:#fff; border:none;">
                                        <i class="fas fa-forward" style="font-size:10px; margin-right:4px;"></i>${nextAction.label}
                                    </button>` : ''}
                                    ${isReadyForDelivery ? `<button onclick="farmer.openAssignDeliveryModal(${o.id}, '${o.order_number||'ORD-'+o.id}')" style="padding:5px 10px; font-size:11px; border-radius:6px; font-weight:700; cursor:pointer; background:#F28C28; color:#fff; border:none; display:flex; align-items:center; gap:5px;">
                                        <i class="fas fa-motorcycle"></i> Assign Delivery
                                    </button>` : ''}
                                    ${isInDelivery || isReadyForDelivery ? `<button onclick="farmer.viewLiveTracking(${o.id})" style="padding:5px 10px; font-size:11px; border-radius:6px; font-weight:700; cursor:pointer; background:#0284C7; color:#fff; border:none; display:flex; align-items:center; gap:5px;">
                                        <i class="fas fa-map-location-dot"></i> Live Tracking
                                    </button>` : ''}
                                </div>
                            </td>
                        </tr>`;
                        }).join('')}
                    </tbody>
                </table>`;
            } else {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No customer orders yet</p>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Failed to load orders</p>';
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const statusNotes = {
                'confirmed': 'Order confirmed by farmer',
                'preparing': 'Farm items are being harvested and packed',
                'ready': 'Order packed and ready for dispatch',
                'out_for_delivery': 'Order handed over for local delivery',
                'on_the_way': 'Delivery agent is on the way to destination',
                'delivered': 'Order delivered fresh to customer',
                'cancelled': 'Order cancelled by farmer'
            };
            const note = statusNotes[status] || `Status updated to ${status}`;
            const result = await API.orders.updateStatus(orderId, status, note);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success(`Order advanced to: ${status.replace(/_/g, ' ')}`);
                await this.loadOrders();
                await this.loadDashboard();
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error(error.message || 'Failed to update order status');
        }
    },

    // ============================================
    // GPS DELIVERY ASSIGNMENT & REAL-TIME TRACKING
    // ============================================
    openAssignDeliveryModal(orderId, orderNumber) {
        const existing = document.getElementById('assign-delivery-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'assign-delivery-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:20px;padding:28px 32px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.22);max-height:92vh;overflow-y:auto;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid #EEE9DA;padding-bottom:14px;">
                    <div>
                        <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#1F211B;margin-bottom:2px;">Assign Delivery Person</h3>
                        <p style="font-size:12px;color:#6F7168;">Order ${orderNumber}</p>
                    </div>
                    <button onclick="document.getElementById('assign-delivery-modal').remove()" style="width:32px;height:32px;border-radius:50%;border:none;background:#F8F5EC;cursor:pointer;font-size:18px;color:#6F7168;">×</button>
                </div>

                <div style="display:flex;flex-direction:column;gap:14px;">
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Delivery Person Name *</label>
                        <input id="dp-name" type="text" placeholder="e.g. Ramesh Kumar"
                               style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13.5px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Phone Number *</label>
                        <input id="dp-phone" type="tel" placeholder="e.g. +91 98765 43210"
                               style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13.5px;outline:none;">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Vehicle Type</label>
                            <select id="dp-vehicle-type" style="width:100%;padding:11px 12px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;background:#fff;">
                                <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                                <option value="Electric Scooter">Electric Scooter</option>
                                <option value="Delivery Van">Delivery Van</option>
                                <option value="Auto Rickshaw">Auto Rickshaw</option>
                                <option value="Bicycle">Bicycle</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Vehicle Number</label>
                            <input id="dp-vehicle-number" type="text" placeholder="e.g. MH 12 AB 1234"
                                   style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Delivery Notes (Optional)</label>
                        <textarea id="dp-notes" placeholder="Special handling notes, gate code, landmarks..."
                                  style="width:100%;padding:10px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;resize:vertical;min-height:60px;"></textarea>
                    </div>
                </div>

                <!-- Result Box with Link -->
                <div id="dp-result" style="display:none;margin-top:16px;padding:16px;background:#EAF0DF;border-radius:12px;border:1px solid #C5D9A5;">
                    <div style="font-size:13px;font-weight:700;color:#355C24;margin-bottom:6px;"><i class="fas fa-check-circle" style="margin-right:4px;"></i> Delivery Assigned Successfully!</div>
                    <div style="font-size:12px;color:#6F7168;margin-bottom:8px;">Share this unique tracking link with the delivery person:</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="dp-tracking-url" type="text" readonly
                               style="flex:1;padding:8px 12px;border:1.5px solid #C5D9A5;border-radius:8px;font-size:11.5px;background:#fff;font-family:monospace;color:#1F211B;">
                        <button onclick="farmer.copyTrackingLink()" style="padding:8px 14px;background:#355C24;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        <button onclick="farmer.openTrackingLink()" style="flex:1;padding:9px;background:#F28C28;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">
                            <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> Open Tracking Page
                        </button>
                        <button onclick="document.getElementById('assign-delivery-modal').remove();farmer.loadOrders();" style="flex:1;padding:9px;background:#355C24;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">
                            <i class="fas fa-check" style="margin-right:4px;"></i> Done
                        </button>
                    </div>
                </div>

                <div id="dp-error" style="display:none;margin-top:12px;padding:10px 14px;background:#FEE2E2;border-radius:8px;font-size:12.5px;color:#DC2626;"></div>

                <div style="display:flex;gap:12px;margin-top:20px;" id="dp-actions">
                    <button onclick="document.getElementById('assign-delivery-modal').remove()" 
                            style="flex:1;padding:11px;border:1.5px solid #E5DEC8;border-radius:10px;background:#fff;color:#6F7168;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">Cancel</button>
                    <button onclick="farmer.submitAssignDelivery(${orderId})" 
                            style="flex:1;padding:11px;border:none;border-radius:10px;background:#F28C28;color:#fff;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
                        <i class="fas fa-motorcycle"></i> Assign & Generate Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('dp-name').focus();
    },

    async submitAssignDelivery(orderId) {
        const name = document.getElementById('dp-name').value.trim();
        const phone = document.getElementById('dp-phone').value.trim();
        const vehicleType = document.getElementById('dp-vehicle-type').value;
        const vehicleNumber = document.getElementById('dp-vehicle-number').value.trim();
        const notes = document.getElementById('dp-notes').value.trim();
        const errorEl = document.getElementById('dp-error');
        const resultEl = document.getElementById('dp-result');
        const actionsEl = document.getElementById('dp-actions');

        if (!name) {
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Please enter delivery person name.'; }
            return;
        }
        if (!phone) {
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Please enter delivery person phone number.'; }
            return;
        }
        if (errorEl) errorEl.style.display = 'none';

        const submitBtn = document.querySelector('#dp-actions button:last-child');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...'; }

        try {
            const payload = {
                delivery_person_name: name,
                delivery_person_phone: phone,
                vehicle_type: vehicleType,
                vehicle_number: vehicleNumber,
                notes
            };

            let data;
            if (typeof API !== 'undefined' && API.delivery && typeof API.delivery.assign === 'function') {
                data = await API.delivery.assign(orderId, payload);
            } else {
                const token = (typeof auth !== 'undefined' && typeof auth.getToken === 'function') 
                    ? auth.getToken() 
                    : (localStorage.getItem('token') || '');
                const baseUrl = (typeof API !== 'undefined' && API.baseURL) ? API.baseURL : 'http://localhost:5000/api';
                const res = await fetch(`${baseUrl}/delivery/orders/${orderId}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to assign delivery.');
                }
            }

            if (data && data.success) {
                this._lastTrackingUrl = data.tracking_url || `http://localhost:5000/delivery-tracking.html?token=${data.tracking_token}`;
                const urlInput = document.getElementById('dp-tracking-url');
                if (urlInput) urlInput.value = this._lastTrackingUrl;
                if (resultEl) resultEl.style.display = 'block';
                if (actionsEl) actionsEl.style.display = 'none';
                if (typeof toast !== 'undefined') toast.success('Delivery assigned! Share the tracking link with the driver.');
            } else {
                if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = (data && data.message) || 'Failed to assign delivery.'; }
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-motorcycle"></i> Assign & Generate Link'; }
            }
        } catch (e) {
            console.error('Assign delivery error:', e);
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = e.message || 'Network error. Please try again.'; }
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-motorcycle"></i> Assign & Generate Link'; }
        }
    },

    copyTrackingLink() {
        const url = this._lastTrackingUrl;
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                if (typeof toast !== 'undefined') toast.success('Tracking link copied to clipboard!');
            }).catch(() => {
                const urlInput = document.getElementById('dp-tracking-url');
                if (urlInput) { urlInput.select(); document.execCommand('copy'); }
                if (typeof toast !== 'undefined') toast.success('Tracking link copied!');
            });
        }
    },

    openTrackingLink() {
        if (this._lastTrackingUrl) window.open(this._lastTrackingUrl, '_blank');
    },

    async viewLiveTracking(orderId) {
        const existing = document.getElementById('live-tracking-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'live-tracking-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:20px;width:100%;max-width:760px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.28);">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #EEE9DA;background:#F8F5EC;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:16px;">
                            <i class="fas fa-map-location-dot"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#1F211B;margin:0;">Live Delivery Tracking</h3>
                            <p style="font-size:12px;color:#6F7168;margin-top:2px;" id="lt-subtitle">Connecting live location feed...</p>
                        </div>
                    </div>
                    <button onclick="farmer.closeLiveTracking()" style="width:32px;height:32px;border-radius:50%;border:none;background:#fff;cursor:pointer;font-size:18px;color:#6F7168;box-shadow:0 2px 6px rgba(0,0,0,0.1);">×</button>
                </div>
                
                <div id="live-track-map" style="flex:1;min-height:360px;background:#EAE6DC;position:relative;"></div>

                <div style="padding:16px 24px;background:#F8F5EC;border-top:1px solid #EEE9DA;">
                    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
                        <div id="lt-person" style="font-size:13px;color:#1F211B;"><i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>—</strong></div>
                        <div id="lt-phone" style="font-size:12px;color:#6F7168;"></div>
                        <div id="lt-vehicle" style="font-size:12px;color:#6F7168;"></div>
                        <div id="lt-status" style="font-size:12px;"><i class="fas fa-circle" style="color:#ccc;margin-right:5px;"></i>—</div>
                        <div id="lt-updated" style="font-size:11.5px;color:#6F7168;margin-left:auto;font-weight:500;"></div>
                    </div>
                    <div style="font-size:12px;color:#6F7168;display:flex;align-items:flex-start;gap:6px;" id="lt-address"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) farmer.closeLiveTracking(); });

        setTimeout(() => this.initLiveTrackMap(orderId), 100);
    },

    async initLiveTrackMap(orderId) {
        if (typeof L === 'undefined') {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(cssLink);

            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        const mapEl = document.getElementById('live-track-map');
        if (!mapEl) return;

        this._liveMap = L.map(mapEl, { center: [20.5937, 78.9629], zoom: 5 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this._liveMap);

        this._liveOrderId = orderId;
        this._liveDeliveryMarker = null;
        this._liveDestMarker = null;
        this._liveTrailLine = null;

        // Connect Socket.io
        try {
            if (typeof io !== 'undefined') {
                this._liveSocket = io('http://localhost:5000');
                this._liveSocket.emit('join_order_room', { orderId, userToken: auth.getToken() });

                this._liveSocket.on('location_updated', (data) => {
                    if (data.orderId == this._liveOrderId) {
                        this.applyLiveGPSUpdate(data);
                    }
                });

                this._liveSocket.on('status_updated', (data) => {
                    if (data.orderId == this._liveOrderId) {
                        const statusEl = document.getElementById('lt-status');
                        if (statusEl) {
                            statusEl.innerHTML = `<i class="fas fa-circle" style="color:${data.isDelivered ? '#355C24' : '#F28C28'};margin-right:5px;"></i>${(data.status||'').replace(/_/g,' ').toUpperCase()}`;
                        }
                    }
                });
            }
        } catch(e) {
            console.warn('Socket error on live map, using polling');
        }

        // Initial fetch and polling fallback
        this.pollLiveLocation();
        this._livePollInterval = setInterval(() => this.pollLiveLocation(), 6000);
    },

    applyLiveGPSUpdate(data) {
        if (!this._liveMap) return;
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const updatedEl = document.getElementById('lt-updated');
        if (updatedEl) {
            const acc = data.accuracy ? ` (±${Math.round(data.accuracy)}m)` : '';
            updatedEl.innerHTML = `<i class="fas fa-satellite-dish" style="color:#22c55e;margin-right:4px;"></i>Live: ${new Date(data.recordedAt || Date.now()).toLocaleTimeString()}${acc}`;
        }

        const deliveryIcon = L.divIcon({
            html: `<div style="background:#355C24;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"><i class="fas fa-motorcycle" style="color:white;font-size:14px"></i></div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18]
        });

        if (!this._liveDeliveryMarker) {
            this._liveDeliveryMarker = L.marker([lat, lng], { icon: deliveryIcon })
                .bindPopup(`<b>🛵 Delivery Partner: ${data.delivery_person_name || 'Assigned'}</b>`)
                .addTo(this._liveMap);
        } else {
            this._liveDeliveryMarker.setLatLng([lat, lng]);
        }

        this._liveMap.setView([lat, lng], Math.max(this._liveMap.getZoom(), 15));
    },

    async pollLiveLocation() {
        const orderId = this._liveOrderId;
        if (!orderId || !this._liveMap) return;

        try {
            const token = auth.getToken();
            const res = await fetch(`http://localhost:5000/api/delivery/orders/${orderId}/live`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const subtitle = document.getElementById('lt-subtitle');
            const personEl = document.getElementById('lt-person');
            const phoneEl = document.getElementById('lt-phone');
            const vehicleEl = document.getElementById('lt-vehicle');
            const statusEl = document.getElementById('lt-status');
            const updatedEl = document.getElementById('lt-updated');
            const addressEl = document.getElementById('lt-address');

            if (data.order) {
                if (subtitle) subtitle.textContent = `Order #${data.order.order_number} · Customer: ${data.order.customer_name}`;
                if (addressEl) addressEl.innerHTML = `<i class="fas fa-house" style="color:#F28C28;margin-top:2px;flex-shrink:0;"></i><span>${data.order.shipping_address || 'Delivery Address'}</span>`;
            }

            if (data.assignment) {
                const a = data.assignment;
                if (personEl) personEl.innerHTML = `<i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>${a.delivery_person_name || '—'}</strong>`;
                if (phoneEl && a.delivery_person_phone) phoneEl.innerHTML = `<i class="fas fa-phone" style="margin-right:4px;"></i>${a.delivery_person_phone}`;
                if (vehicleEl && (a.vehicle_type || a.vehicle_number)) {
                    vehicleEl.innerHTML = `<i class="fas fa-truck" style="margin-right:4px;"></i>${a.vehicle_type || ''} ${a.vehicle_number ? '(' + a.vehicle_number + ')' : ''}`;
                }
                const statusColor = a.delivery_status === 'delivered' ? '#355C24' : a.delivery_status ? '#F28C28' : '#ccc';
                if (statusEl) statusEl.innerHTML = `<i class="fas fa-circle" style="color:${statusColor};margin-right:5px;"></i>${(a.delivery_status||'assigned').replace(/_/g,' ').toUpperCase()}`;
            }

            if (data.location) {
                this.applyLiveGPSUpdate(data.location);

                if (data.trail && data.trail.length > 1) {
                    const coords = data.trail.map(p => [p.latitude, p.longitude]);
                    if (this._liveTrailLine) this._liveMap.removeLayer(this._liveTrailLine);
                    this._liveTrailLine = L.polyline(coords, { color:'#355C24', weight:3, opacity:0.6, dashArray:'6, 8' }).addTo(this._liveMap);
                }
            } else {
                if (updatedEl && !updatedEl.textContent.includes('Live')) {
                    updatedEl.textContent = 'Waiting for driver GPS signal...';
                }
            }
        } catch(e) {}
    },

    closeLiveTracking() {
        if (this._livePollInterval) clearInterval(this._livePollInterval);
        if (this._liveSocket) {
            this._liveSocket.disconnect();
            this._liveSocket = null;
        }
        this._liveMap = null;
        this._liveOrderId = null;
        const modal = document.getElementById('live-tracking-modal');
        if (modal) modal.remove();
    },

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================
    async loadProfile() {
        try {
            const data = await API.user.getProfile();
            if (data && data.success && data.user) {
                const u = data.user;
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
                setVal('profile-name', u.name);
                setVal('profile-email', u.email);
                setVal('profile-phone', u.phone);
                setVal('profile-address', u.address);
                setVal('profile-farm-name', u.farm_name);
                setVal('profile-farm-location', u.farm_location);
                setVal('profile-bio', u.bio);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    },

    async updateProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();
        const farmName = document.getElementById('profile-farm-name').value.trim();
        const farmLocation = document.getElementById('profile-farm-location').value.trim();
        const bio = document.getElementById('profile-bio').value.trim();
        const imageFile = document.getElementById('profile-image').files[0];

        if (!name) {
            if (typeof toast!=='undefined') toast.error('Name is required');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('farm_name', farmName);
        formData.append('farm_location', farmLocation);
        formData.append('bio', bio);
        if (imageFile) formData.append('profile_image', imageFile);

        try {
            const result = await API.user.updateProfile(formData);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success('Profile updated successfully!');
                const user = auth.getCurrentUser();
                if (user) {
                    user.name = name;
                    auth.setUserData(user);
                }
                const nameEl = document.getElementById('header-user-name');
                if (nameEl) nameEl.textContent = name;
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to update profile');
        }
    }
};

// Export to window
window.farmer = farmer;
