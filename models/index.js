const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('teacher', 'student'), allowNull: false }
});

const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  due_date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('Draft', 'Published', 'Completed'), defaultValue: 'Draft' }
});

const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  answer: { type: DataTypes.TEXT, allowNull: false },
  submitted_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  reviewed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Relationships
User.hasMany(Assignment, { foreignKey: 'teacher_id', as: 'assignments' });
Assignment.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

User.hasMany(Submission, { foreignKey: 'student_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Assignment.hasMany(Submission, { foreignKey: 'assignment_id', as: 'submissions' });
Submission.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

module.exports = { sequelize, User, Assignment, Submission };
