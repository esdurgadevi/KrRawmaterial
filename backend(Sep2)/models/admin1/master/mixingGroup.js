import { DataTypes } from "sequelize";

const MixingGroupModel = (sequelize) => {
  const MixingGroup = sequelize.define(
    "MixingGroup",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mixingCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,           // Important: mixing codes should be unique
      },
      mixingName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
    },
    {
      tableName: "mixing_groups",
      timestamps: true,         // createdAt & updatedAt for auditing
      indexes: [
        {
          unique: true,
          fields: ["mixingCode"],
        },
      ],
    }
  );

  return MixingGroup;
};

export default MixingGroupModel;