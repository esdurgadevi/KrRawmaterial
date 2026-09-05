// models/salesOrderModel.js
import { DataTypes } from "sequelize";

const SalesOrderModel = (sequelize) => {
  const SalesOrder = sequelize.define(
    "SalesOrder",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      orderNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "suppliers",   // table name
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "supplier_id",
      },

      broker: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      broker1: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      payTerms: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      payMode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      creditDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      bank: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      despatchTo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "sales_orders",
      timestamps: true,
    }
  );

  return SalesOrder;
};

export default SalesOrderModel;