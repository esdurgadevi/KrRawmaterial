import { DataTypes } from "sequelize";

const GodownModel = (sequelize) => {
  const Godown = sequelize.define(
    "Godown",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      godownName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: "godown_name",
      },
      locationName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "location_name",
      },
      type: {
        type: DataTypes.STRING(50), // ✅ simple string
        allowNull: false,
        defaultValue: "General",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shortAddress: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: "short_address",
      },
    },
    {
      tableName: "godowns",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["godown_name"] },
        { fields: ["location_name"] },
        { fields: ["type"] },
      ],
    }
  );

  return Godown;
};

export default GodownModel;
