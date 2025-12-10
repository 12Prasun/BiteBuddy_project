// Migration: Create indexes on collections
// Description: Add database indexes for optimal query performance
// Applied: When needed

const mongoose = require('mongoose');

exports.up = async function() {
  const db = mongoose.connection.db;

  try {
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('Created index on users.email');

    // Orders collection indexes
    const ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ userId: 1 });
    await ordersCollection.createIndex({ orderId: 1 }, { unique: true });
    await ordersCollection.createIndex({ createdAt: -1 });
    await ordersCollection.createIndex({ status: 1 });
    console.log('Created indexes on orders collection');

    // Reviews collection indexes
    const reviewsCollection = db.collection('reviews');
    await reviewsCollection.createIndex({ foodItemId: 1 });
    await reviewsCollection.createIndex({ userId: 1 });
    await reviewsCollection.createIndex({ createdAt: -1 });
    console.log('Created indexes on reviews collection');

    // OrderStatus collection indexes
    const orderStatusCollection = db.collection('orderstatuses');
    await orderStatusCollection.createIndex({ orderId: 1 }, { unique: true });
    await orderStatusCollection.createIndex({ email: 1 });
    await orderStatusCollection.createIndex({ status: 1 });
    console.log('Created indexes on orderstatuses collection');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

exports.down = async function() {
  const db = mongoose.connection.db;

  try {
    // Drop all indexes except _id
    await db.collection('users').dropIndex('email_1');
    await db.collection('orders').dropAllIndexes();
    await db.collection('reviews').dropAllIndexes();
    await db.collection('orderstatuses').dropAllIndexes();
    console.log('Dropped all indexes');
  } catch (error) {
    console.error('Error dropping indexes:', error);
    throw error;
  }
};
