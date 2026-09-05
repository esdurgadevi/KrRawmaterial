import { DataTypes } from "sequelize";

const LocationTransferBaleModel = (sequelize) => {
  const LocationTransferBale = sequelize.define(
    "LocationTransferBale",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      transferDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "location_transfer_details",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "transfer_detail_id",
      },

      weightmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lot_weightments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "weightment_id",
      },
    },
    {
      tableName: "location_transfer_bales",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["transfer_detail_id", "weightment_id"],
        },
      ],
    }
  );

  return LocationTransferBale;
};

export default LocationTransferBaleModel;