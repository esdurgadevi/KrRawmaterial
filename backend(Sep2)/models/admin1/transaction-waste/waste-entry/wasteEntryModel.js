import { DataTypes } from "sequelize";

const WasteEntryModel = (sequelize) => {
  const WasteEntry = sequelize.define(
    "WasteEntry",
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
      shift: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "ALL", // ALL, Morning, Afternoon, Night, etc.
      },
      totalNetWeight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true, // auto-calculated from details
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "waste_entries",
      timestamps: true,
    }
  );

  return WasteEntry;
};

export default WasteEntryModel;