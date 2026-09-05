import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ComberEntry = sequelize.define(
    "ComberEntry",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      shift: {
        type: DataTypes.INTEGER,
      },

      // ✅ SIMPLEX MACHINE REFERENCE
      simplexMachineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "simplex_machines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      // ✅ COUNT REFERENCE
      countId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "spinning_counts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      lapWeight: DataTypes.FLOAT,
      speedMPM: DataTypes.FLOAT,
      noilsPercent: DataTypes.FLOAT,
      totalNoils: DataTypes.FLOAT,

      aValue: DataTypes.FLOAT,
      bValue: DataTypes.FLOAT,
      cValue: DataTypes.FLOAT,

      draft: DataTypes.FLOAT,
      indexValue: DataTypes.FLOAT,
      topComSetting: DataTypes.FLOAT,

      tTrumpet: DataTypes.FLOAT,
      cTrumpet: DataTypes.FLOAT,
      feedMM: DataTypes.FLOAT,

      piecingIndex: DataTypes.FLOAT,
      ratchet: DataTypes.FLOAT,
      bDraft: DataTypes.FLOAT,
      tableDraft: DataTypes.FLOAT,
      setting: DataTypes.FLOAT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "comber_entries",
      timestamps: true,
    }
  );

  return ComberEntry;
};
