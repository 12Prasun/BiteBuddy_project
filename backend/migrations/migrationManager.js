// Database Migration Manager
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, './migrations');
    this.migrationCollection = 'migrations';
  }

  async connect(mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async getMigrationHistory() {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);
    return await collection.find({}).toArray();
  }

  async recordMigration(name, timestamp) {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);
    await collection.insertOne({
      name,
      appliedAt: new Date(timestamp),
      completedAt: new Date()
    });
  }

  async runMigrations() {
    try {
      console.log('Starting migrations...');
      const history = await this.getMigrationHistory();
      const appliedMigrations = history.map(m => m.name);

      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(f => f.endsWith('.js'))
        .sort();

      for (const file of migrationFiles) {
        if (appliedMigrations.includes(file)) {
          console.log(`⏭️  Skipped: ${file} (already applied)`);
          continue;
        }

        try {
          const migration = require(path.join(this.migrationsPath, file));
          console.log(`▶️  Running: ${file}`);
          
          await migration.up();
          
          await this.recordMigration(file, Date.now());
          console.log(`✅ Completed: ${file}`);
        } catch (error) {
          console.error(`❌ Failed: ${file}`, error);
          throw error;
        }
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async rollbackMigration(name) {
    try {
      const migration = require(path.join(this.migrationsPath, name));
      console.log(`▶️  Rolling back: ${name}`);
      
      await migration.down();
      
      const db = mongoose.connection.db;
      const collection = db.collection(this.migrationCollection);
      await collection.deleteOne({ name });
      
      console.log(`✅ Rolled back: ${name}`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${name}`, error);
      throw error;
    }
  }
}

module.exports = MigrationManager;
