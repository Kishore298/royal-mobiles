const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOrderConfirmationEmail = async (order) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: order.user.email,
    subject: 'Order Confirmation - Royal Mobiles',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmation</h2>
        <p>Dear ${order.user.name},</p>
        <p>Thank you for your order with Royal Mobiles. Your order has been received and is being processed.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order ID: ${order._id}</li>
          <li>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</li>
          <li>Total Amount: ₹${order.totalPrice}</li>
        </ul>
        <p>The retailer will contact you shortly regarding your order. Please be patient.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Royal Mobiles Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

const sendOrderNotificationEmail = async (order) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Order Received - Royal Mobiles',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Order Notification</h2>
        <p>A new order has been received in the system.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order ID: ${order._id}</li>
          <li>Customer Name: ${order.user.name}</li>
          <li>Customer Email: ${order.user.email}</li>
          <li>Customer Phone: ${order.user.phone}</li>
          <li>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</li>
          <li>Total Amount: ₹${order.totalPrice}</li>
        </ul>
        <p>Please check the admin panel for more details.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order notification email:', error);
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail, sendOrderNotificationEmail }; 