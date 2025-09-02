const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// Define associations with unique aliases
User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'ownerId' });
Project.belongsTo(User, { as: 'projectOwner', foreignKey: 'ownerId' });

// Many-to-many relationship between Users and Projects through ProjectMembers
User.belongsToMany(Project, { 
  through: ProjectMember, 
  as: 'memberProjects',
  foreignKey: 'userId',
  otherKey: 'projectId'
});

Project.belongsToMany(User, { 
  through: ProjectMember, 
  as: 'projectMembers',
  foreignKey: 'projectId',
  otherKey: 'userId'
});

// Task associations with unique aliases
Project.hasMany(Task, { as: 'projectTasks', foreignKey: 'projectId' });
Task.belongsTo(Project, { as: 'taskProject', foreignKey: 'projectId' });

User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'taskAssignedTo', foreignKey: 'assignedToId' });

User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdById' });
Task.belongsTo(User, { as: 'taskCreatedBy', foreignKey: 'createdById' });

module.exports = {
  User,
  Project,
  ProjectMember,
  Task
};
