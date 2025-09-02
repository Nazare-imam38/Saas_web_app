const { sequelize } = require('../config/database');
const { Task } = require('../models');

const checkTasks = async () => {
  try {
    console.log('🔍 Checking tasks in database...');
    
    // Import models to ensure associations are defined
    require('../models');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get all tasks
    const tasks = await Task.findAll({
      attributes: ['id', 'title', 'status', 'priority', 'createdAt']
    });
    
    console.log(`📊 Found ${tasks.length} tasks in database:`);
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} - Status: ${task.status} - Priority: ${task.priority} - Created: ${task.createdAt}`);
    });
    
    // Group by status
    const statusCounts = {};
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    console.log('\n📈 Tasks by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} tasks`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tasks:', error);
  } finally {
    await sequelize.close();
  }
};

checkTasks();
