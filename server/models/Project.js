const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled'),
    defaultValue: 'planning',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allowComments: true,
      allowFileUploads: true,
      allowTimeTracking: true,
      notifications: true
    }
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalTasks: 0,
      completedTasks: 0,
      totalHours: 0,
      teamSize: 0
    }
  }
}, {
  tableName: 'projects'
});

// Associations are defined in models/index.js

// Instance methods
Project.prototype.updateProgress = async function() {
  const Task = require('./Task');
  const totalTasks = await Task.count({ where: { projectId: this.id } });
  const completedTasks = await Task.count({ 
    where: { 
      projectId: this.id, 
      status: 'completed' 
    } 
  });
  
  this.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  await this.save();
};

Project.prototype.addMember = async function(userId, role = 'member') {
  const ProjectMember = require('./ProjectMember');
  return await ProjectMember.create({
    projectId: this.id,
    userId: userId,
    role: role
  });
};

Project.prototype.removeMember = async function(userId) {
  const ProjectMember = require('./ProjectMember');
  return await ProjectMember.destroy({
    where: {
      projectId: this.id,
      userId: userId
    }
  });
};

module.exports = Project;
