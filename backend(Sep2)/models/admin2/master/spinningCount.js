import { DataTypes } from "sequelize";

const SpinningCountModel = (sequelize) => {
  const SpinningCount = sequelize.define(
    "SpinningCount",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      countName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        trim: true,
      },
      ActCount: {
        type: DataTypes.DECIMAL(6, 2),     // e.g. 40.00, 60.25
        allowNull: false,
      },
      Noils: {                             // Noils% stored as decimal
        type: DataTypes.DECIMAL(5, 2),     // e.g. 12.50 = 12.5%
        allowNull: false,
        defaultValue: 0.00,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "spinning_counts",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["countName"],
        },
      ],
    }
  );

  return SpinningCount;
};

export default SpinningCountModel;