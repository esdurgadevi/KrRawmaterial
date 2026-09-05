// models/finalInvoiceHead.js
import { DataTypes } from "sequelize";

const FinalInvoiceHeadModel = (sequelize) => {
  const FinalInvoiceHead = sequelize.define(
    "FinalInvoiceHead",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      voucherNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      invoiceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      tcType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      weight: {
        type: DataTypes.DECIMAL(15, 3),
        allowNull: true,
        defaultValue: 0.000,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      invoiceValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      freight: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      billNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      billDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // Charges
      insurance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      charity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      eduCess: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      hrSecCess: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      cst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      tngst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      vat: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      commission: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      tcs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      roundOff: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      netAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      deliveryType: {
        type: DataTypes.ENUM("SPOT", "FOR"),
        allowNull: false,
        defaultValue: "SPOT",
      },

      // Service Tax & TDS section
      totalLRValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      lrValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      serviceTax: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      eduCess2: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      hrSecCess2: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      tds: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      sgst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      cgst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      igst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
    },
    {
      tableName: "final_invoice_heads",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["voucherNo"],
        },
      ],
    }
  );

  return FinalInvoiceHead;
};

export default FinalInvoiceHeadModel;