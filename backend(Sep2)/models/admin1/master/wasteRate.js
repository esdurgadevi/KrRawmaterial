import { DataTypes } from "sequelize";

const WasteRateModel = (sequelize) => {
  const WasteRate = sequelize.define(
    "WasteRate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wasteMasterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_masters",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "waste_master_id",
      },
      rateDate: {
        type: DataTypes.DATEONLY, // Stores date only (YYYY-MM-DD)
        allowNull: false,
        field: "rate_date",
      },
      rate: {
        type: DataTypes.DECIMAL(12, 2), // ₹ per kg/unit
        allowNull: false,
        defaultValue: 0.00,
      },
      remarks: {
        type: DataTypes.STRING(250),
        allowNull: true,
        trim: true,
      },
    },
    {
      tableName: "waste_rates",
      timestamps: true,
      indexes: [
        { fields: ["waste_master_id"] },
        { fields: ["rate_date"] },
        // Prevent duplicate rate for same waste on same date
        { unique: true, fields: ["waste_master_id", "rate_date"] },
      ],
    }
  );

  return WasteRate;
};

export default WasteRateModel;