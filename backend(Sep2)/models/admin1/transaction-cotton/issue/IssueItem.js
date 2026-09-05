import { DataTypes } from "sequelize";

const IssueItemModel = (sequelize) => {
  const IssueItem = sequelize.define(
    "IssueItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "issues",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      weightmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lot_weightments",
          key: "id",
        },
      },

      issueWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "issue_items",
      timestamps: true,
    }
  );

  return IssueItem;
};

export default IssueItemModel;
