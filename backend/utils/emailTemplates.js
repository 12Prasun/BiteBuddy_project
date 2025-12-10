// Email templates for BiteBuddy notifications

const emailTemplates = {
  // Order confirmation email
  orderConfirmation: (order) => {
    return {
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Order Confirmed!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${order.userName},</p>
            
            <p>Thank you for your order! Your food will be prepared and delivered soon.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleString()}</p>
              <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            </div>
            
            <h4>Items Ordered:</h4>
            <ul>
              ${order.items.map(item => `<li>${item.quantity}x ${item.name} (${item.size}) - ₹${item.price}</li>`).join('')}
            </ul>
            
            <p>You can track your order status using the order ID: <strong>${order.orderId}</strong></p>
            
            <p>If you have any questions, feel free to contact us.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              BiteBuddy © 2024. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  },

  // Order status update email
  orderStatusUpdate: (order, previousStatus) => {
    const statusMessages = {
      pending: 'Your order has been received and is awaiting confirmation.',
      confirmed: 'Your order has been confirmed! We are preparing your food.',
      preparing: 'Your food is being prepared in our kitchen.',
      on_the_way: 'Your order is on the way! Our delivery partner will arrive soon.',
      delivered: 'Your order has been delivered. Thank you for ordering!',
      cancelled: 'Your order has been cancelled as requested.'
    };

    return {
      subject: `Order ${order.status.toUpperCase()} - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Order Status Update</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${order.userName},</p>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h3>Status: ${order.status.toUpperCase()}</h3>
              <p>${statusMessages[order.status]}</p>
            </div>
            
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleString()}</p>` : ''}
            
            <p>Thank you for choosing BiteBuddy!</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
  },

  // Welcome email
  welcome: (userName, email) => {
    return {
      subject: 'Welcome to BiteBuddy!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>🍔 Welcome to BiteBuddy!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${userName},</p>
            
            <p>Thank you for creating an account with BiteBuddy! We're excited to have you on board.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Browse our delicious menu</li>
              <li>Place food orders with ease</li>
              <li>Track your orders in real-time</li>
              <li>Save your favorite items</li>
              <li>Leave reviews and ratings</li>
            </ul>
            
            <p>Get started by exploring our menu and placing your first order!</p>
            
            <p>Happy ordering!</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    };
  },

  // Password reset email
  passwordReset: (userName, resetLink) => {
    return {
      subject: 'Reset Your BiteBuddy Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset Request</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${userName},</p>
            
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request this, you can ignore this email.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              BiteBuddy © 2024. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  },

  // Review reminder email
  reviewReminder: (userName, orderId, itemName) => {
    return {
      subject: `How was your ${itemName}? Leave a review!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>Share Your Experience</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi ${userName},</p>
            
            <p>We hope you enjoyed your order from BiteBuddy!</p>
            
            <p>Your feedback helps us improve. Would you like to leave a review for <strong>${itemName}</strong>?</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bitebuddy.com/review/${orderId}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Write a Review
              </a>
            </div>
            
            <p>Your reviews help other customers make better choices and help us serve you better!</p>
            
            <p>Thank you!</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              BiteBuddy © 2024. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
  }
};

module.exports = emailTemplates;
