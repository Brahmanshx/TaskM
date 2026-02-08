const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

const Goal = require('./Goal')(sequelize);
const ProgressEntry = require('./ProgressEntry')(sequelize);
const SubGoal = require('./SubGoal')(sequelize);

// Define relationships
Goal.hasMany(ProgressEntry, { foreignKey: 'goalId', as: 'progressEntries' });
ProgressEntry.belongsTo(Goal, { foreignKey: 'goalId', as: 'goal' });

Goal.hasMany(SubGoal, { foreignKey: 'goalId', as: 'subGoals' });
SubGoal.belongsTo(Goal, { foreignKey: 'goalId', as: 'goal' });

module.exports = {
  sequelize,
  Goal,
  ProgressEntry,
  SubGoal,
};
