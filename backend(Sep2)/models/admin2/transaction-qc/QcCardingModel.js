import { DataTypes } from "sequelize";

export default (sequelize) => {
  const QcCarding = sequelize.define(
    "QcCarding",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // ✅ COUNT REFERENCE
      countId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "spinning_counts",
          key: "id",
        },
      },

      // ✅ CARDING MACHINE REFERENCE
      cardingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "simplex_machines",
          key: "id",
        },
      },

      remarks: DataTypes.STRING,
      shift: DataTypes.INTEGER,

      noilsPercent: DataTypes.FLOAT,
      hank: DataTypes.FLOAT,

      // Production Section
      avgWeight: DataTypes.FLOAT,
      avgHank: DataTypes.FLOAT,
      speedMPM: DataTypes.FLOAT,
      lickerin: DataTypes.FLOAT,
      wastePercent: DataTypes.FLOAT,

      lToC: DataTypes.STRING,
      cToD: DataTypes.STRING,
      tensionDraft: DataTypes.FLOAT,

      // Right Section
      cvPercent: DataTypes.FLOAT,
      cp: DataTypes.FLOAT,
      cylinder: DataTypes.FLOAT,
      flats: DataTypes.STRING,
      setting: DataTypes.STRING,
      cToF: DataTypes.STRING,
      feedToL: DataTypes.STRING,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "qc_carding",
      timestamps: true,
    }
  );

  return QcCarding;
};
