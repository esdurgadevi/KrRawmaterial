import { DataTypes } from "sequelize";

const CostMasterModel = (sequelize) => {
  const CostMaster = sequelize.define(
    "CostMaster",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      cost: {
        type: DataTypes.DECIMAL(12, 4), // Supports up to 4 decimal places (e.g., 0.2300)
        allowNull: false,
        defaultValue: 0.0000,
      },
    },
    {
      tableName: "cost_masters",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["department"], // Prevent duplicate departments
        },
      ],
    }
  );

  return CostMaster;
};

export default CostMasterModel;