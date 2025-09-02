const { sequelize } = require('../config/database');
const { User, Project, Task, ProjectMember } = require('../models');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Import models to ensure associations are defined
    require('../models');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Check if admin user exists
    let adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check if test user exists
    let testUser = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'member',
        isActive: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Create sample project
    let sampleProject = await Project.findOne({ where: { name: 'Sample Project' } });
    
    if (!sampleProject) {
      console.log('📁 Creating sample project...');
      sampleProject = await Project.create({
        name: 'Sample Project',
        description: 'A sample project for testing',
        status: 'active',
        priority: 'high',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        budget: 10000,
        ownerId: adminUser.id
      });
      console.log('✅ Sample project created');
      
      // Add test user as project member
      await ProjectMember.create({
        projectId: sampleProject.id,
        userId: testUser.id,
        role: 'member'
      });
      console.log('✅ Project member added');
    } else {
      console.log('✅ Sample project already exists');
    }
    
    // Create sample tasks
    const taskCount = await Task.count();
    if (taskCount === 0) {
      console.log('📋 Creating sample tasks...');
      
      const tasks = [
        {
          title: 'Setup Development Environment',
          description: 'Install and configure all necessary development tools',
          status: 'completed',
          priority: 'high',
          projectId: sampleProject.id,
          assignedToId: adminUser.id,
          createdById: adminUser.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: 8
        },
        {
          title: 'Design Database Schema',
          description: 'Create the database schema for the project',
          status: 'in-progress',
          priority: 'high',
          projectId: sampleProject.id,
          assignedToId: testUser.id,
          createdById: adminUser.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          estimatedHours: 16
        },
        {
          title: 'Implement User Authentication',
          description: 'Create login and registration functionality',
          status: 'todo',
          priority: 'medium',
          projectId: sampleProject.id,
          assignedToId: testUser.id,
          createdById: adminUser.id,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          estimatedHours: 12
        },
        {
          title: 'Create API Endpoints',
          description: 'Develop REST API endpoints for the application',
          status: 'todo',
          priority: 'medium',
          projectId: sampleProject.id,
          assignedToId: adminUser.id,
          createdById: adminUser.id,
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          estimatedHours: 20
        }
      ];
      
      for (const taskData of tasks) {
        await Task.create(taskData);
      }
      
      console.log('✅ Sample tasks created');
    } else {
      console.log('✅ Sample tasks already exist');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: test@example.com / password123');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
