import { DataTypes } from "sequelize";

const MixingModel = (sequelize) => {
  const Mixing = sequelize.define(
    "Mixing",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mixingCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "mixing_code",
      },
      mixingName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
        field: "mixing_name",
      },
      fibreId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fibres",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "fibre_id",
      },
      mixingGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mixing_groups",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "mixing_group_id",
      },
    },
    {
      tableName: "mixings",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["mixing_code"] },
        { fields: ["fibre_id"] },
        { fields: ["mixing_group_id"] },
      ],
    }
  );

  return Mixing;
};

export default MixingModel;