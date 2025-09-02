const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const testPassword = async () => {
  try {
    console.log('🔍 Testing password functionality...');
    
    // Import models to ensure associations are defined
    require('../models');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Find the user
    const user = await User.findOne({ where: { email: 'nabia34@gmail.com' } });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    // Test password comparison
    const testPassword = 'password123';
    console.log('🔍 Testing password:', testPassword);
    
    const isMatch = await user.comparePassword(testPassword);
    console.log('🔍 Password match result:', isMatch);
    
    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    console.log('🔍 Testing wrong password:', wrongPassword);
    
    const isWrongMatch = await user.comparePassword(wrongPassword);
    console.log('🔍 Wrong password match result:', isWrongMatch);
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  } finally {
    await sequelize.close();
  }
};

testPassword();
