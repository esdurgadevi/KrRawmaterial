import { DataTypes } from "sequelize";

const LocationTransferDetailModel = (sequelize) => {
  const LocationTransferDetail = sequelize.define(
    "LocationTransferDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      transferId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "location_transfers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "transfer_id",
      },

      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "lot_id",
      },

      stockQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "stock_qty",
      },

      transferQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "transfer_qty",
      },
    },
    {
      tableName: "location_transfer_details",
      timestamps: true,
    }
  );

  return LocationTransferDetail;
};

export default LocationTransferDetailModel;