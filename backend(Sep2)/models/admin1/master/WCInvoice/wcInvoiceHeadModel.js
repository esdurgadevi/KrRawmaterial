import { DataTypes } from "sequelize";

const WCInvoiceHeadModel = (sequelize) => {
  const WCInvoiceHead = sequelize.define(
    "WCInvoiceHead",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      roundOffDigits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      packingForwardingCharges: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "wc_invoice_heads",
      timestamps: true,
    }
  );

  return WCInvoiceHead;
};

export default WCInvoiceHeadModel;