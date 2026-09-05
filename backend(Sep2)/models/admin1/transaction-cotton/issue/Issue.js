import { DataTypes } from "sequelize";

const IssueModel = (sequelize) => {
  const Issue = sequelize.define(
    "Issue",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issueNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },

      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      mixingNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      mixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      toMixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      issueQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "issues",
      timestamps: true,
    }
  );

  return Issue;
};

export default IssueModel;
