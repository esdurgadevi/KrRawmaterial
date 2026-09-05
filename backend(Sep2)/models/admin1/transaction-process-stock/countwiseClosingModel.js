import { DataTypes } from "sequelize";

const CountwiseClosingModel = (sequelize) => {
  const CountwiseClosing = sequelize.define(
    "CountwiseClosing",
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
      productName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      closingKgs: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "countwise_closing",
      timestamps: true,
      indexes: [
        { fields: ["date"] },
        { fields: ["productName"] },
        { fields: ["date", "productName"] },
      ],
    }
  );

  return CountwiseClosing;
};

export default CountwiseClosingModel;