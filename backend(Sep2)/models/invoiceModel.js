// models/invoiceModel.js
import { DataTypes } from "sequelize";

const InvoiceModel = (sequelize) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      invoiceNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      invoiceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      // ✅ Supplier reference instead of partyName
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "suppliers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      assessableValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      charity: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      vatTax: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      cenvat: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      duty: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      cess: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      hsCess: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      tcs: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      pfCharges: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      subTotal: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      roundOff: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      invoiceValue: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      gst: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      igst: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },

      creditDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      interestPercent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
      },

      transport: {
        type: DataTypes.STRING(100),
      },

      lrNo: {
        type: DataTypes.STRING(50),
      },

      lrDate: {
        type: DataTypes.DATEONLY,
      },

      vehicleNo: {
        type: DataTypes.STRING(50),
      },

      removalTime: {
        type: DataTypes.STRING(20),
      },

      eBill: {
        type: DataTypes.STRING(50),
      },

      exportTo: {
        type: DataTypes.STRING(100),
      },

      approve: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "sales_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "invoices",
      timestamps: true,
    }
  );

  return Invoice;
};

export default InvoiceModel;