const { Sequelize } = require('sequelize');

// Use DB_URL if present, otherwise construct from individual variables
const databaseUrl = process.env.DB_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'saas_project_dashboard'}`;

console.log('🔍 Database URL being used:', databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test the connection
const testConnection = async () => {
  try {
    // Debug: Log the connection details (without password)
    console.log('🔍 Database connection details:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'saas_project_dashboard'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.log(`   Using DB_URL: ${process.env.DB_URL ? 'Yes' : 'No'}`);
    
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    // Import models to ensure associations are defined
    require('../models');
    
    // Sync database - create tables if they don't exist (preserve existing data)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
