const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'review', 'completed', 'cancelled'),
    defaultValue: 'todo',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0
  },
  actualHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0
  },
  labels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  timeEntries: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  subtasks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  activity: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'tasks'
});

// Define associations
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

// Instance methods
Task.prototype.addComment = async function(userId, content) {
  const comment = {
    id: require('crypto').randomUUID(),
    userId: userId,
    content: content,
    createdAt: new Date()
  };
  
  this.comments = [...this.comments, comment];
  await this.save();
  return comment;
};

Task.prototype.addTimeEntry = async function(userId, startTime, endTime, description) {
  const timeEntry = {
    id: require('crypto').randomUUID(),
    userId: userId,
    startTime: startTime,
    endTime: endTime,
    duration: (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60), // hours
    description: description,
    createdAt: new Date()
  };
  
  this.timeEntries = [...this.timeEntries, timeEntry];
  await this.save();
  return timeEntry;
};

Task.prototype.addSubtask = async function(title, description = '') {
  const subtask = {
    id: require('crypto').randomUUID(),
    title: title,
    description: description,
    completed: false,
    createdAt: new Date()
  };
  
  this.subtasks = [...this.subtasks, subtask];
  await this.save();
  return subtask;
};

Task.prototype.updateSubtask = async function(subtaskId, updates) {
  this.subtasks = this.subtasks.map(subtask => 
    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
  );
  await this.save();
};

Task.prototype.addActivity = async function(userId, action, details = {}) {
  const activity = {
    id: require('crypto').randomUUID(),
    userId: userId,
    action: action,
    details: details,
    timestamp: new Date()
  };
  
  this.activity = [...this.activity, activity];
  await this.save();
  return activity;
};

module.exports = Task;
