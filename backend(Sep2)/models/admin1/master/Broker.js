import { DataTypes } from "sequelize";

const BrokerModel = (sequelize) => {
  const Broker = sequelize.define(
    "Broker",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      brokerCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      brokerName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
      },
      shortDesc: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        trim: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "brokers",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["brokerCode"] },
        { fields: ["brokerName"] }, // for faster name-based searches
      ],
    }
  );

  return Broker;
};

export default BrokerModel;