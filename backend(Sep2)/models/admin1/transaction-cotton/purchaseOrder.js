import { DataTypes } from "sequelize";

const PurchaseOrderModel = (sequelize) => {
  const PurchaseOrder = sequelize.define(
    "PurchaseOrder",
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
        field: "order_no",
      },
      orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "order_date",
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "suppliers", key: "id" },
        onDelete: "RESTRICT",
        field: "supplier_id",
      },
      brokerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "brokers", key: "id" },
        onDelete: "SET NULL",
        field: "broker_id",
      },
      varietyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "varieties", key: "id" },
        onDelete: "RESTRICT",
        field: "variety_id",
      },
      mixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "mixing_groups", key: "id" },
        onDelete: "RESTRICT",
        field: "mixing_group_id",
      },
      stationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "stations", key: "id" },
        onDelete: "RESTRICT",
        field: "station_id",
      },
      companyBrokerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "company_brokers", key: "id" },
        onDelete: "SET NULL",
        field: "company_broker_id",
      },
      expectedDeliveryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "exp_delivery_date",
      },
      orderType: {
        type: DataTypes.ENUM("SPOT", "F.O.R"),
        allowNull: false,
        defaultValue: "SPOT",
        field: "order_type",
      },
      packingType: {
        type: DataTypes.ENUM("Bale", "Bora"),
        allowNull: false,
        defaultValue: "Bale",
        field: "packing_type",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
        field: "candy_rate",
      },
      quintalRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
        field: "quintal_rate",
      },
      ratePerKg: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: null,
        field: "rate_per_kg",
      },
      selectedRateType: {
        type: DataTypes.ENUM("CANDY", "QUINTAL", "PER_KG"),
        allowNull: false,
        field: "selected_rate_type",
      },
      approxLotValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: "approx_lot_value",
      },
      paymentMode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "payment_mode",
      },
      currency: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "RUPEES",
      },
      staple: { 
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      moist: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      mic: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      str: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      rd: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lotClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "lot_closed",
      }
    },
    {
      tableName: "purchase_orders",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["order_no"] },
      ],
    }
  );

  return PurchaseOrder;
};

export default PurchaseOrderModel;