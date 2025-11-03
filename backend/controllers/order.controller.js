const Order = require("../models/order.model");
const Notification = require("../models/notification.model");
const Product = require("../models/product.model");
const asyncHandler = require("express-async-handler");
const {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} = require("../utils/email");

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
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
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // Update stock for all products
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      // Update stock safely
      product.stock -= item.quantity;
      product.inStock = product.stock > 0;
      await product.save({ session });
    }

    // Create order
    const order = await Order.create(
      [
        {
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
        },
      ],
      { session }
    );

    // Send emails in parallel
    const emailPromises = [
      sendOrderConfirmationEmail(order[0]).catch((err) => {
        console.error('Failed to send order confirmation email:', err);
        return { error: 'Failed to send confirmation email' };
      }),
      sendOrderNotificationEmail(order[0]).catch((err) => {
        console.error('Failed to send admin notification email:', err);
        return { error: 'Failed to send admin notification email' };
      }),
    ];

    const emailResults = await Promise.all(emailPromises);
    const emailErrors = emailResults.filter((r) => r.error);

    // Create notification
    try {
      await Notification.create(
        [
          {
            title: 'New Order Received',
            message: `Order #${order[0]._id} has been received from ${user.name}`,
            type: 'order',
            data: { orderId: order[0]._id },
          },
        ],
        { session }
      );
    } catch (notificationError) {
      console.error('Failed to create order notification:', notificationError);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: order[0],
      emailStatus: {
        confirmationSent: !emailResults[0].error,
        notificationSent: !emailResults[1].error,
        errors: emailErrors.length > 0 ? emailErrors : undefined,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
