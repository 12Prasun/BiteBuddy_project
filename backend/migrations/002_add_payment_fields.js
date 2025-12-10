// Migration: Add payment fields to orders
// Description: Add payment-related fields to existing orders
// Applied: Before Phase 4 deployment

const mongoose = require('mongoose');

exports.up = async function() {
  const db = mongoose.connection.db;

  try {
    const ordersCollection = db.collection('orderstatuses');
    
    // Add payment fields to all documents that don't have them
    await ordersCollection.updateMany(
      { paymentStatus: { $exists: false } },
      {
        $set: {
          paymentStatus: 'pending',
          paymentMethod: 'unknown',
          transactionId: null
        }
      }
    );

    console.log('Added payment fields to orders');
  } catch (error) {
    console.error('Error adding payment fields:', error);
    throw error;
  }
};

exports.down = async function() {
  const db = mongoose.connection.db;

  try {
    const ordersCollection = db.collection('orderstatuses');
    
    // Remove payment fields
    await ordersCollection.updateMany(
      {},
      {
        $unset: {
          paymentStatus: '',
          paymentMethod: '',
          transactionId: ''
        }
      }
    );

    console.log('Removed payment fields from orders');
  } catch (error) {
    console.error('Error removing payment fields:', error);
    throw error;
  }
};
