// models/invoiceDetailModel.js
import { DataTypes } from "sequelize";

const InvoiceDetailModel = (sequelize) => {
  const InvoiceDetail = sequelize.define(
    "InvoiceDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "invoices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      wasteName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      baleNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      grossWt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tareWt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      netWt: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "invoice_details",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["invoiceId", "baleNo"],
        },
      ],
    }
  );

  return InvoiceDetail;
};

export default InvoiceDetailModel;