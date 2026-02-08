const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProgressEntry = sequelize.define('ProgressEntry', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    goalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    progressValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  return ProgressEntry;
};
