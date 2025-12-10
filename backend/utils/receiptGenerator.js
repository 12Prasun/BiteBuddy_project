// Receipt generation utility
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate receipt PDF
 * @param {Object} order - Order object with all details
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateReceiptPDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('🍔 BiteBuddy', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Food Delivery Service', { align: 'center' });
      doc.moveDown();

      // Order Title
      doc.fontSize(14).font('Helvetica-Bold').text('ORDER RECEIPT', { align: 'center' });
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Order Details
      doc.fontSize(10).font('Helvetica-Bold').text('Order Information', { underline: true });
      doc.fontSize(9).font('Helvetica');
      doc.text(`Order ID: ${order.orderId}`, { width: 250 });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { width: 250 });
      doc.text(`Status: ${order.status.toUpperCase()}`, { width: 250 });
      doc.moveDown();

      // Customer Details
      doc.fontSize(10).font('Helvetica-Bold').text('Delivery Details', { underline: true });
      doc.fontSize(9).font('Helvetica');
      doc.text(`Name: ${order.userName}`, { width: 250 });
      doc.text(`Email: ${order.email}`, { width: 250 });
      doc.text(`Phone: ${order.userPhone}`, { width: 250 });
      doc.text(`Address: ${order.deliveryAddress}`, { width: 250 });
      if (order.estimatedDelivery) {
        doc.text(`Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleString()}`, { width: 250 });
      }
      doc.moveDown();

      // Items Table
      doc.fontSize(10).font('Helvetica-Bold').text('Order Items', { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 250;
      const col3 = 350;
      const col4 = 450;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Item', col1, tableTop);
      doc.text('Qty', col2, tableTop);
      doc.text('Size', col3, tableTop);
      doc.text('Price', col4, tableTop);

      // Table rows
      doc.font('Helvetica').fontSize(9);
      let yPosition = tableTop + 20;

      order.items.forEach((item, index) => {
        doc.text(item.name.substring(0, 20), col1, yPosition);
        doc.text(item.quantity.toString(), col2, yPosition);
        doc.text(item.size || 'N/A', col3, yPosition);
        doc.text(`₹${item.price.toFixed(2)}`, col4, yPosition);
        yPosition += 20;
      });

      // Divider
      doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
      yPosition += 10;

      // Summary
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Summary', 50, yPosition);
      yPosition += 20;

      doc.fontSize(9).font('Helvetica');
      const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
      const tax = subtotal * 0.05; // 5% tax
      const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
      const total = subtotal + tax + deliveryFee;

      doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, { width: 400, align: 'right' });
      doc.text(`Tax (5%): ₹${tax.toFixed(2)}`, { width: 400, align: 'right' });
      doc.text(`Delivery Fee: ₹${deliveryFee.toFixed(2)}`, { width: 400, align: 'right' });

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Total: ₹${total.toFixed(2)}`, { width: 400, align: 'right' });
      doc.moveDown();

      // Payment Details
      doc.fontSize(10).font('Helvetica-Bold').text('Payment Information', { underline: true });
      doc.fontSize(9).font('Helvetica');
      doc.text(`Method: ${order.paymentMethod.toUpperCase()}`, { width: 250 });
      doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, { width: 250 });
      if (order.transactionId) {
        doc.text(`Transaction ID: ${order.transactionId}`, { width: 250 });
      }
      doc.moveDown();

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'Thank you for ordering with BiteBuddy! For support, contact us at support@bitebuddy.com',
        { align: 'center' }
      );
      doc.text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate receipt HTML
 * @param {Object} order - Order object
 * @returns {string} HTML string
 */
const generateReceiptHTML = (order) => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .container { max-width: 800px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #28a745; font-size: 32px; }
        .header p { color: #666; margin-top: 5px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14px; color: #28a745; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; text-transform: uppercase; }
        .section p { margin: 5px 0; color: #333; font-size: 13px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        table { width: 100%; margin: 10px 0; }
        table th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        table td { padding: 10px; border-bottom: 1px solid #eee; }
        .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .summary-row.total { font-weight: bold; font-size: 16px; color: #28a745; border-top: 2px solid #ddd; padding-top: 10px; }
        .status-badge { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        @media print {
          body { background: white; }
          .container { box-shadow: none; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍔 BiteBuddy</h1>
          <p>Food Delivery Service</p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 10px;">ORDER RECEIPT</h2>
          <p style="color: #666;">Order ID: <strong>${order.orderId}</strong></p>
        </div>

        <div class="details-grid">
          <div class="section">
            <h2>Order Information</h2>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
          </div>

          <div class="section">
            <h2>Delivery Details</h2>
            <p><strong>Name:</strong> ${order.userName}</p>
            <p><strong>Phone:</strong> ${order.userPhone}</p>
            <p><strong>Email:</strong> ${order.email}</p>
          </div>
        </div>

        <div class="section">
          <p><strong>Delivery Address:</strong><br>${order.deliveryAddress}</p>
          ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleString()}</p>` : ''}
        </div>

        <div class="section">
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Size</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.size || 'N/A'}</td>
                  <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (5%):</span>
            <span>₹${tax.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee:</span>
            <span>₹${deliveryFee.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total Amount:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="section" style="margin-top: 20px;">
          <h2>Payment Information</h2>
          <p><strong>Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span></p>
          ${order.transactionId ? `<p><strong>Transaction ID:</strong> ${order.transactionId}</p>` : ''}
        </div>

        <div class="footer">
          <p>Thank you for ordering with BiteBuddy!</p>
          <p>For support, contact us at <strong>support@bitebuddy.com</strong></p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generateReceiptPDF,
  generateReceiptHTML
};
