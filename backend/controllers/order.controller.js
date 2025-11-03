const Order = require('../models/order.model');
const Notification = require('../models/notification.model');
const Product = require('../models/product.model');
const asyncHandler = require('express-async-handler');
const { sendOrderConfirmationEmail, sendOrderNotificationEmail } = require('../utils/email');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
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
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = asyncHandler(async (req, res) => {
  try {
    console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
    
    // Update product stocks
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`
        });
      }
      
      await product.updateStock(item.quantity);
    }

    // Create the order
    const order = await Order.create(req.body);
    console.log('Order created successfully:', order._id);

    // Send emails in parallel
    const emailPromises = [
      sendOrderConfirmationEmail(order).catch(error => {
        console.error('Failed to send order confirmation email:', error);
        return { error: 'Failed to send confirmation email' };
      }),
      sendOrderNotificationEmail(order).catch(error => {
        console.error('Failed to send admin notification email:', error);
        return { error: 'Failed to send admin notification email' };
      })
    ];

    // Wait for all email operations to complete
    const emailResults = await Promise.all(emailPromises);
    const emailErrors = emailResults.filter(result => result.error);

    // Create notification
    try {
      await Notification.create({
        title: 'New Order Received',
        message: `Order #${order._id} has been received from ${order.user.name}`,
        type: 'order',
        data: { orderId: order._id }
      });
      console.log('Order notification created');
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
    }

    // Return response with email status
    res.status(201).json({
      success: true,
      data: order,
      emailStatus: {
        confirmationSent: !emailResults[0].error,
        notificationSent: !emailResults[1].error,
        errors: emailErrors.length > 0 ? emailErrors : undefined
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
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
      message: 'Order not found'
    });
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = req.body.orderStatus;
  await order.save();

  // Create notification for status change
  if (oldStatus !== order.orderStatus) {
    await Notification.create({
      title: 'Order Status Updated',
      message: `Order #${order._id} status changed from ${oldStatus} to ${order.orderStatus}`,
      type: 'order',
      data: { orderId: order._id }
    });
  }

  res.status(200).json({
    success: true,
    data: order
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
      message: 'Order not found'
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 