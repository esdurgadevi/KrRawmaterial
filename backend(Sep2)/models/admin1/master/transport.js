import { DataTypes } from "sequelize";

const TransportModel = (sequelize) => {
  const Transport = sequelize.define(
    "Transport",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      transportCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      transportName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
      },
      place: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "transports",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["transportCode"] },
        { fields: ["transportName"] },
        { fields: ["place"] }, // Useful for filtering by location
      ],
    }
  );

  return Transport;
};

export default TransportModel;