const { sequelize } = require('../config/database');
const { User } = require('../models');

const checkUsers = async () => {
  try {
    console.log('🔍 Checking users in database...');
    
    // Import models to ensure associations are defined
    require('../models');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt']
    });
    
    console.log(`📊 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - Active: ${user.isActive} - Created: ${user.createdAt}`);
    });
    
    // Check specific user
    const specificUser = await User.findOne({ where: { email: 'nabia34@gmail.com' } });
    if (specificUser) {
      console.log('✅ User nabia34@gmail.com found:', {
        id: specificUser.id,
        firstName: specificUser.firstName,
        lastName: specificUser.lastName,
        email: specificUser.email,
        role: specificUser.role,
        isActive: specificUser.isActive,
        createdAt: specificUser.createdAt
      });
    } else {
      console.log('❌ User nabia34@gmail.com NOT found');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await sequelize.close();
  }
};

checkUsers();
