-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 23, 2026 at 06:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `farmer_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'create_order', 'order', 1, '{\"orderNumber\":\"ORD-1788689618474-692\",\"totalAmount\":98}', NULL, '2026-09-06 10:13:38'),
(2, 2, 'update_order_status', 'order', 1, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-06 10:13:38'),
(3, 2, 'update_order_status', 'order', 1, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-06 10:13:38'),
(4, 2, 'update_order_status', 'order', 1, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-06 10:13:38'),
(5, 2, 'update_order_status', 'order', 1, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-06 10:13:38'),
(6, 2, 'update_order_status', 'order', 1, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-06 10:13:38'),
(7, 2, 'update_order_status', 'order', 1, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-06 10:13:38'),
(8, 1, 'create_order', 'order', 2, '{\"orderNumber\":\"ORD-1788693357239-299\",\"totalAmount\":98}', NULL, '2026-09-06 11:15:57'),
(9, 2, 'update_order_status', 'order', 2, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farm\"}', NULL, '2026-09-06 11:15:57'),
(10, 2, 'update_order_status', 'order', 2, '{\"status\":\"preparing\",\"note\":\"Produce harvested fresh\"}', NULL, '2026-09-06 11:15:57'),
(11, 2, 'update_order_status', 'order', 2, '{\"status\":\"ready\",\"note\":\"Packed and ready for dispatch\"}', NULL, '2026-09-06 11:15:57'),
(12, 1, 'create_order', 'order', 3, '{\"orderNumber\":\"ORD-1788693763635-478\",\"totalAmount\":49}', NULL, '2026-09-06 11:22:43'),
(13, 2, 'update_order_status', 'order', 3, '{\"status\":\"confirmed\"}', NULL, '2026-09-06 11:22:43'),
(14, 2, 'update_order_status', 'order', 3, '{\"status\":\"preparing\"}', NULL, '2026-09-06 11:22:43'),
(15, 2, 'update_order_status', 'order', 3, '{\"status\":\"ready\"}', NULL, '2026-09-06 11:22:43'),
(16, 5, 'create_order', 'order', 4, '{\"orderNumber\":\"ORD-1788694518499-386\",\"totalAmount\":138}', NULL, '2026-09-06 11:35:18'),
(17, 5, 'create_order', 'order', 5, '{\"orderNumber\":\"ORD-1788697118436-552\",\"totalAmount\":98}', NULL, '2026-09-06 12:18:38'),
(18, 5, 'create_order', 'order', 6, '{\"orderNumber\":\"ORD-1790064983462-674\",\"totalAmount\":98}', NULL, '2026-09-22 08:16:23'),
(19, 6, 'create_order', 'order', 8, '{\"orderNumber\":\"ORD-1790065393878-936\",\"totalAmount\":120}', NULL, '2026-09-22 08:23:13'),
(20, 6, 'create_order', 'order', 9, '{\"orderNumber\":\"ORD-1790066025299-663\",\"totalAmount\":120}', NULL, '2026-09-22 08:33:45'),
(21, 8, 'create_order', 'order', 10, '{\"orderNumber\":\"ORD-1790066743043-6735\",\"totalAmount\":85}', NULL, '2026-09-22 08:45:43'),
(22, 8, 'create_order', 'order', 11, '{\"orderNumber\":\"ORD-1790066828048-6411\",\"totalAmount\":85}', NULL, '2026-09-22 08:47:08'),
(23, 9, 'update_order_status', 'order', 11, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-22 08:47:23'),
(24, 8, 'create_order', 'order', 12, '{\"orderNumber\":\"ORD-1790067067957-8378\",\"totalAmount\":205}', NULL, '2026-09-22 08:51:07'),
(25, 9, 'update_order_status', 'order', 12, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-22 08:52:31'),
(26, 9, 'update_order_status', 'order', 12, '{\"status\":\"preparing\",\"note\":\"Farm items are being harvested and packed\"}', NULL, '2026-09-22 08:53:15'),
(27, 9, 'update_order_status', 'order', 12, '{\"status\":\"ready\",\"note\":\"Order packed and ready for dispatch\"}', NULL, '2026-09-22 08:53:35'),
(28, 9, 'update_order_status', 'order', 12, '{\"status\":\"out_for_delivery\",\"note\":\"Order handed over for local delivery\"}', NULL, '2026-09-22 09:04:29'),
(29, 9, 'update_order_status', 'order', 12, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent is on the way to destination\"}', NULL, '2026-09-22 09:04:44'),
(30, 9, 'update_order_status', 'order', 12, '{\"status\":\"delivered\",\"note\":\"Order delivered fresh to customer\"}', NULL, '2026-09-22 09:05:03'),
(31, 9, 'update_order_status', 'order', 11, '{\"status\":\"cancelled\",\"note\":\"Order cancelled by farmer\"}', NULL, '2026-09-22 15:06:04'),
(32, 9, 'update_order_status', 'order', 10, '{\"status\":\"cancelled\",\"note\":\"Order cancelled by farmer\"}', NULL, '2026-09-22 15:06:08'),
(33, 8, 'create_order', 'order', 13, '{\"orderNumber\":\"ORD-1790092203434-4685\",\"totalAmount\":100}', NULL, '2026-09-22 15:50:03'),
(34, 9, 'update_order_status', 'order', 13, '{\"status\":\"confirmed\",\"note\":\"Advancing to confirmed\"}', NULL, '2026-09-22 15:50:03'),
(35, 9, 'update_order_status', 'order', 13, '{\"status\":\"preparing\",\"note\":\"Advancing to preparing\"}', NULL, '2026-09-22 15:50:03'),
(36, 9, 'update_order_status', 'order', 13, '{\"status\":\"ready\",\"note\":\"Advancing to ready\"}', NULL, '2026-09-22 15:50:03'),
(37, 9, 'update_order_status', 'order', 13, '{\"status\":\"cancelled\",\"note\":\"Customer requested cancellation\"}', NULL, '2026-09-22 15:50:03'),
(38, 8, 'create_order', 'order', 14, '{\"orderNumber\":\"ORD-1790098011480-1405\",\"totalAmount\":100}', NULL, '2026-09-22 17:26:51'),
(39, 9, 'update_order_status', 'order', 14, '{\"status\":\"confirmed\",\"note\":\"Advancing to confirmed\"}', NULL, '2026-09-22 17:26:51'),
(40, 9, 'update_order_status', 'order', 14, '{\"status\":\"preparing\",\"note\":\"Advancing to preparing\"}', NULL, '2026-09-22 17:26:51'),
(41, 9, 'update_order_status', 'order', 14, '{\"status\":\"ready\",\"note\":\"Advancing to ready\"}', NULL, '2026-09-22 17:26:51'),
(42, 9, 'update_order_status', 'order', 14, '{\"status\":\"cancelled\",\"note\":\"Customer requested cancellation\"}', NULL, '2026-09-22 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_assignments`
--

CREATE TABLE `delivery_assignments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `delivery_person_name` varchar(100) NOT NULL,
  `delivery_person_phone` varchar(20) NOT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `tracking_token` varchar(64) NOT NULL,
  `tracking_active` tinyint(1) DEFAULT 0,
  `status` enum('assigned','picked_up','out_for_delivery','on_the_way','delivered') DEFAULT 'assigned',
  `notes` text DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_started_at` timestamp NULL DEFAULT NULL,
  `delivery_completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_assignments`
--

INSERT INTO `delivery_assignments` (`id`, `order_id`, `farmer_id`, `delivery_person_name`, `delivery_person_phone`, `vehicle_type`, `vehicle_number`, `tracking_token`, `tracking_active`, `status`, `notes`, `assigned_at`, `delivery_started_at`, `delivery_completed_at`, `created_at`, `updated_at`) VALUES
(3, 12, 9, 'vijoy', '123456789', 'Motorcycle / Bike', 'gj 5', '5eab6c218936eafb33073fa3879df92054067ef64bfe7d0e1fe141834ebf5379', 1, 'assigned', NULL, '2026-09-22 09:02:47', '2026-09-22 09:03:01', NULL, '2026-09-22 08:57:24', '2026-09-22 09:03:01');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_locations`
--

CREATE TABLE `delivery_locations` (
  `id` int(11) NOT NULL,
  `delivery_assignment_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` float DEFAULT NULL,
  `speed` float DEFAULT NULL,
  `heading` float DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(27, 9, 'New Order Received', 'You have a new order #ORD-1790066743043-6735', 'order', 0, '2026-09-22 08:45:43'),
(28, 9, 'New Order Received', 'You have a new order #ORD-1790066828048-6411', 'order', 0, '2026-09-22 08:47:08'),
(29, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 08:47:23'),
(30, 9, 'New Order Received', 'You have a new order #ORD-1790067067957-8378', 'order', 0, '2026-09-22 08:51:07'),
(32, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 08:52:31'),
(33, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 08:53:15'),
(34, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 08:53:35'),
(35, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-22 09:04:29'),
(36, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-22 09:04:44'),
(37, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-22 09:05:03'),
(38, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:06:04'),
(39, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:06:08'),
(40, 9, 'New Order Received', 'You have a new order #ORD-1790092203434-4685', 'order', 0, '2026-09-22 15:50:03'),
(41, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 15:50:03'),
(42, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 15:50:03'),
(43, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 15:50:03'),
(44, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:50:03'),
(45, 9, 'New Order Received', 'You have a new order #ORD-1790098011480-1405', 'order', 0, '2026-09-22 17:26:51'),
(46, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 17:26:51'),
(47, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 17:26:51'),
(48, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 17:26:51'),
(49, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','out_for_delivery','on_the_way','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `destination_latitude` decimal(10,8) DEFAULT NULL,
  `destination_longitude` decimal(11,8) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','completed','failed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `order_number`, `total_amount`, `status`, `shipping_address`, `destination_latitude`, `destination_longitude`, `payment_method`, `payment_status`, `notes`, `created_at`, `updated_at`) VALUES
(10, 8, 'ORD-1790066743043-6735', 85.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Phone: 9876543210', '2026-09-22 08:45:43', '2026-09-22 15:06:08'),
(11, 8, 'ORD-1790066828048-6411', 85.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Phone: 9876543210', '2026-09-22 08:47:08', '2026-09-22 15:06:04'),
(12, 8, 'ORD-1790067067957-8378', 85.00, 'delivered', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-22 08:51:07', '2026-09-22 14:35:37'),
(13, 8, 'ORD-1790092203434-4685', 100.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Please pack in fresh paper bag', '2026-09-22 15:50:03', '2026-09-22 15:50:03'),
(14, 8, 'ORD-1790098011480-1405', 100.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Please pack in fresh paper bag', '2026-09-22 17:26:51', '2026-09-22 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `farmer_id`, `quantity`, `price`, `total`, `created_at`) VALUES
(10, 10, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:45:43'),
(11, 11, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:47:08'),
(12, 12, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:51:07'),
(14, 13, 18, 9, 2, 50.00, 100.00, '2026-09-22 15:50:03'),
(15, 14, 18, 9, 2, 50.00, 100.00, '2026-09-22 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_by_role` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `note`, `updated_by`, `updated_by_role`, `created_at`) VALUES
(28, 10, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:45:43'),
(29, 11, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:47:08'),
(30, 11, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-22 08:47:23'),
(31, 12, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:51:07'),
(32, 12, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-22 08:52:31'),
(33, 12, 'preparing', 'Farm items are being harvested and packed', 9, 'farmer', '2026-09-22 08:53:15'),
(34, 12, 'ready', 'Order packed and ready for dispatch', 9, 'farmer', '2026-09-22 08:53:35'),
(35, 12, 'ready', 'Delivery assigned to vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 08:57:24'),
(36, 12, 'ready', 'Delivery assigned to vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 09:00:35'),
(37, 12, 'ready', 'Delivery assigned to vijoy (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 09:02:47'),
(38, 12, 'out_for_delivery', 'Order handed over for local delivery', 9, 'farmer', '2026-09-22 09:04:29'),
(39, 12, 'on_the_way', 'Delivery agent is on the way to destination', 9, 'farmer', '2026-09-22 09:04:44'),
(40, 12, 'delivered', 'Order delivered fresh to customer', 9, 'farmer', '2026-09-22 09:05:03'),
(41, 11, 'cancelled', 'Order cancelled by farmer', 9, 'farmer', '2026-09-22 15:06:04'),
(42, 10, 'cancelled', 'Order cancelled by farmer', 9, 'farmer', '2026-09-22 15:06:08'),
(43, 13, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 15:50:03'),
(44, 13, 'confirmed', 'Advancing to confirmed', 9, 'farmer', '2026-09-22 15:50:03'),
(45, 13, 'preparing', 'Advancing to preparing', 9, 'farmer', '2026-09-22 15:50:03'),
(46, 13, 'ready', 'Advancing to ready', 9, 'farmer', '2026-09-22 15:50:03'),
(47, 13, 'cancelled', 'Customer requested cancellation', 9, 'farmer', '2026-09-22 15:50:03'),
(48, 14, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 17:26:51'),
(49, 14, 'confirmed', 'Advancing to confirmed', 9, 'farmer', '2026-09-22 17:26:51'),
(50, 14, 'preparing', 'Advancing to preparing', 9, 'farmer', '2026-09-22 17:26:51'),
(51, 14, 'ready', 'Advancing to ready', 9, 'farmer', '2026-09-22 17:26:51'),
(52, 14, 'cancelled', 'Customer requested cancellation', 9, 'farmer', '2026-09-22 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT 'kg',
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `farmer_id`, `name`, `category`, `description`, `price`, `quantity`, `unit`, `image_url`, `is_available`, `created_at`, `updated_at`) VALUES
(17, 9, 'Fresh Organic Golden Honeycrisp Apples', 'Fruits', 'Crisp, sweet, organically cultivated apples directly from Organic Sun Farms.', 85.00, 97, 'kg', NULL, 1, '2026-09-22 08:40:38', '2026-09-22 08:51:07'),
(18, 9, 'Farm Fresh Organic Vine Tomatoes', 'Vegetables', 'Vine-ripened, organic, juicy tomatoes harvested fresh every morning.', 50.00, 22, 'kg', NULL, 1, '2026-09-22 09:13:08', '2026-09-22 17:26:51'),
(19, 9, 'Crisp Organic Garden Carrots', 'Vegetables', 'Sweet and crunchy organic carrots rich in beta-carotene.', 45.00, 60, 'kg', NULL, 0, '2026-09-22 09:13:08', '2026-09-22 18:45:21'),
(20, 9, 'Fresh Tender Baby Spinach', 'Leafy Greens', 'Nutrient-rich, pesticide-free baby spinach leaves.', 40.00, 50, 'bunch', NULL, 1, '2026-09-22 09:13:08', '2026-09-22 09:13:08'),
(21, 9, 'Farm Sweet Organic Strawberries', 'Fruits', 'Naturally sweet organic strawberries freshly picked from our polyhouse.', 110.00, 40, 'box', NULL, 1, '2026-09-22 09:13:08', '2026-09-22 09:13:08'),
(22, 9, 'Organic Green Bell Peppers', 'Vegetables', 'Crisp, vibrant green bell peppers bursting with flavor.', 60.00, 45, 'kg', NULL, 1, '2026-09-22 09:13:08', '2026-09-22 09:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('farmer','customer') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `farm_name` varchar(100) DEFAULT NULL,
  `farm_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `address`, `profile_image`, `bio`, `farm_name`, `farm_location`, `created_at`, `updated_at`) VALUES
(8, 'Fresh Customer', 'freshcustomer@freshfield.test', '$2b$10$C6Wy74L9Vm7L8gryr8hq8eaF.mWVbPDm7Sa6j6Kx8LSII7EsTN6fy', 'customer', '9876543210', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, NULL, NULL, '2026-09-22 08:40:38', '2026-09-22 08:40:38'),
(9, 'Fresh Farmer', 'freshfarmer@freshfield.test', '$2b$10$IqhrIWTZU3XbA2CB1YzX4ObHDjjhE93jUs7MCMZlbh1ECdSAyfTIa', 'farmer', '9812345678', NULL, NULL, NULL, 'Organic Sun Farms', 'Pune, Maharashtra', '2026-09-22 08:40:38', '2026-09-22 08:40:38'),
(10, 'OM OM', 'om@gmail.com', '$2b$10$RoKpdpdd72z80Bi9EsQLYe0ZtS7ZklwbNCidwgd/eNhrNRuO6ipUe', 'customer', '+919173708805', NULL, NULL, NULL, NULL, NULL, '2026-09-23 04:07:04', '2026-09-23 04:07:04');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD UNIQUE KEY `tracking_token` (`tracking_token`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_tracking_token` (`tracking_token`),
  ADD KEY `idx_farmer_id` (`farmer_id`);

--
-- Indexes for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assignment_id` (`delivery_assignment_id`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_order_number` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_farmer` (`farmer_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_availability` (`is_available`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`product_id`,`customer_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`customer_id`,`product_id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD CONSTRAINT `delivery_assignments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_assignments_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  ADD CONSTRAINT `delivery_locations_ibfk_1` FOREIGN KEY (`delivery_assignment_id`) REFERENCES `delivery_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
