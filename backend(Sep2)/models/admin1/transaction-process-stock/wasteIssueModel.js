import { DataTypes } from "sequelize";

const WasteIssueModel = (sequelize) => {
  const WasteIssue = sequelize.define(
    "WasteIssue",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      issued: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      realised: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "waste_issues",
      timestamps: true,
    }
  );

  return WasteIssue;
};

export default WasteIssueModel;