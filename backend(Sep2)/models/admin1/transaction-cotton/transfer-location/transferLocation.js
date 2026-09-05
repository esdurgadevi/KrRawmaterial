import { DataTypes } from "sequelize";

const LocationTransferModel = (sequelize) => {
  const LocationTransfer = sequelize.define(
    "LocationTransfer",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      transferNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "transfer_no",
      },

      transferDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "transfer_date",
      },

      // FROM GODOWN
      fromLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "godowns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "from_location_id",
      },

      // TO GODOWN
      toLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "godowns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "to_location_id",
      },

      transportId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "transports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "transport_id",
      },

      transMode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "trans_mode",
      },

      lorryNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "lorry_no",
      },

      driverName: {
        type: DataTypes.STRING(120),
        allowNull: true,
        field: "driver_name",
      },

      ownerMobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "owner_mobile",
      },

      driverMobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "driver_mobile",
      },

      itemName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: "item_name",
      },

      qty: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      kgs: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
      },

      value: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
    },
    {
      tableName: "location_transfers",
      timestamps: true,
    }
  );

  return LocationTransfer;
};

export default LocationTransferModel;