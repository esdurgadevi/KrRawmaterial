import { DataTypes } from "sequelize";

const PackingTypeModel = (sequelize) => {
  const PackingType = sequelize.define(
    "PackingType",
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

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      tareWeight: {
        type: DataTypes.DECIMAL(10, 2),  // supports weight like 12.50
        allowNull: false,
        defaultValue: 0,
      },

      rate: {
        type: DataTypes.DECIMAL(10, 2),  // supports money values
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "packing_types",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["name"] },
      ],
    }
  );

  return PackingType;
};

export default PackingTypeModel;
