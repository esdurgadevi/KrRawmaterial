import { DataTypes } from "sequelize";

const WasteEntryDetailModel = (sequelize) => {
  const WasteEntryDetail = sequelize.define(
    "WasteEntryDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      wasteEntryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_entries",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      wasteMasterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_masters",
          key: "id",
        },
      },

      packingTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packing_types",
          key: "id",
        },
      },

      godownId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "godowns",
          key: "id",
        },
      },

      netWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
       department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "waste_entry_details",
      timestamps: true,
    }
  );

  return WasteEntryDetail;
};

export default WasteEntryDetailModel;
