const Order = require("../models/order.model");
const Notification = require("../models/notification.model");
const Product = require("../models/product.model");
const asyncHandler = require("express-async-handler");
const {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
  sendLowStockEmail
} = require("../utils/email");

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const { search, status, minDate, maxDate, minTotal, maxTotal, sortBy, sortOrder } = req.query;

  // Build query
  let query = {};

  // Search by Order ID or User Name (if populated) - for now supporting Order ID
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    // If search is a valid ObjectId, we can search by _id. 
    // Otherwise we can search user name (requires lookup) or other fields.
    // For simplicity and performance, currently mostly supporting ID string matching if stored as string or just basic ID match.
    // Since _id is ObjectId, regex doesn't work directly on it in strict mode. 
    // However, widespread MERN pattern often uses a separate field or just assumes 'search' might be status or similar.
    // Given the user prompt "search orders", let's assume they might type an ID.
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = search;
    } else {
      // Fallback: This gets complicated with references. 
      // For now, let's keep it simple or assume we might search populated user? 
      // MongoDB doesn't easily support regex on populated fields in a simple find query without aggregation.
      // We will skip complex user name search for this specific step to avoid breaking existing logic significantly 
      // unless requested. We'll stick to ID if valid.
    }
  }

  // Filter by Status
  if (status && status !== 'All Statuses') {
    query.orderStatus = status;
  }

  // Filter by Date Range
  if (minDate || maxDate) {
    query.createdAt = {};
    if (minDate) query.createdAt.$gte = new Date(minDate);
    if (maxDate) query.createdAt.$lte = new Date(maxDate);
  }

  // Filter by Total Amount
  if (minTotal || maxTotal) {
    query.totalPrice = {};
    if (minTotal) query.totalPrice.$gte = Number(minTotal);
    if (maxTotal) query.totalPrice.$lte = Number(maxTotal);
  }

  // Sorting
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort = { createdAt: -1 };
  }

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .sort(sort)
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'name email');

  // Pagination result
  const pagination = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});
// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = asyncHandler(async (req, res) => {
  try {
    const { orderItems, user, itemsPrice, shippingPrice, taxPrice, totalPrice, orderStatus, paymentInfo, isPaid, isDelivered } = req.body;

    // Validate orderItems
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order format – orderItems must be a non-empty array',
      });
    }

    // Validate each item
    for (const item of orderItems) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each orderItem must have product, quantity, and price',
        });
      }
    }

    const lowStockProducts = [];

    // Update stock for all products
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      // Update stock safely
      product.stock -= item.quantity;
      product.inStock = product.stock > 0;
      await product.save();

      if (product.stock < 10) {
        lowStockProducts.push(product);
      }
    }

    // Create order
    const order = await Order.create({
      orderItems,
      user,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus,
      paymentInfo,
      isPaid,
      isDelivered,
    });

    // Send emails in parallel
    const emailPromises = [
      sendOrderConfirmationEmail(order).catch((err) => {
        console.error('Failed to send order confirmation email:', err);
        return { error: 'Failed to send confirmation email' };
      }),
      sendOrderNotificationEmail(order).catch((err) => {
        console.error('Failed to send admin notification email:', err);
        return { error: 'Failed to send admin notification email' };
      }),
      ...lowStockProducts.map(p => sendLowStockEmail(p).catch(err => {
        console.error(`Failed to send low stock email for ${p.name}:`, err);
        return { error: `Failed to send low stock email for ${p.name}` };
      }))
    ];

    const emailResults = await Promise.all(emailPromises);
    const emailErrors = emailResults.filter((r) => r.error);

    // Create notifications
    try {
      await Notification.create([
        {
          title: 'New Order Received',
          message: `Order #${order._id} has been received from ${user.name}`,
          type: 'order',
          data: { orderId: order._id },
        },
        ...lowStockProducts.map(p => ({
          title: 'Low Stock Alert',
          message: `Product "${p.name}" has low stock (${p.stock} remaining).`,
          type: 'low_stock',
          data: { productId: p._id, currentStock: p.stock }
        }))
      ]);
    } catch (notificationError) {
      console.error('Failed to create order notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      data: order,
      emailStatus: {
        confirmationSent: !emailResults[0].error,
        notificationSent: !emailResults[1].error,
        errors: emailErrors.length > 0 ? emailErrors : undefined,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = req.body.orderStatus;
  await order.save();

  // Create notification for status change
  if (oldStatus !== order.orderStatus) {
    await Notification.create({
      title: "Order Status Updated",
      message: `Order #${order._id} status changed from ${oldStatus} to ${order.orderStatus}`,
      type: "order",
      data: { orderId: order._id },
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
