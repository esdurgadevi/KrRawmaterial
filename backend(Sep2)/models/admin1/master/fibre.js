import { DataTypes } from "sequelize";

const FibreModel = (sequelize) => {
  const Fibre = sequelize.define(
    "Fibre",
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
        trim: true,
      },
      commodityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "commodities", // Your existing commodities table
          key: "id",
        },
        onDelete: "RESTRICT", // Prevent deletion of commodity if linked to fibre
        onUpdate: "CASCADE",
        field: "commodity_id",
      },
    },
    {
      tableName: "fibres",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["name"] },
        { fields: ["commodity_id"] },
      ],
    }
  );

  return Fibre;
};

export default FibreModel;