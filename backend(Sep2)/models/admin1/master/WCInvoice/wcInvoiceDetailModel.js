import { DataTypes } from "sequelize";

const WCInvoiceDetailModel = (sequelize) => {
  const WCInvoiceDetail = sequelize.define(
    "WCInvoiceDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      wcInvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      fieldName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      shortCode: {
        type: DataTypes.STRING(20), // X, G, H
        allowNull: false,
      },

      displayKey: {
        type: DataTypes.STRING(20), // [X]
      },

      formula: {
        type: DataTypes.TEXT,
      },

      sequence: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "wc_invoice_details",
      timestamps: true,
    }
  );

  return WCInvoiceDetail;
};

export default WCInvoiceDetailModel;