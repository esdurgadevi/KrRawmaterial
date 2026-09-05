import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LapFormer = sequelize.define(
    "LapFormer",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      shift: DataTypes.INTEGER,

      remarks: DataTypes.STRING,

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

      // MACHINE NAME (text)
      lapMachine: DataTypes.STRING,

      noilsPercent: DataTypes.FLOAT,
      noOfEnds: DataTypes.FLOAT,
      rollerSettings: DataTypes.STRING,

      lapWeight: DataTypes.FLOAT,
      avgLapWeight: DataTypes.FLOAT,

      betweenCV: DataTypes.FLOAT,
      withinCVPer: DataTypes.FLOAT,

      mcdA: DataTypes.FLOAT,
      mcdB: DataTypes.FLOAT,
      mcdDraft: DataTypes.FLOAT,

      lrdC: DataTypes.FLOAT,
      lrdD: DataTypes.FLOAT,

      fdPulley: DataTypes.FLOAT,
      fdDraft: DataTypes.FLOAT,

      cdPulley: DataTypes.FLOAT,
      cdDraft: DataTypes.FLOAT,

      ddPulley: DataTypes.FLOAT,
      ddDraft: DataTypes.FLOAT,

      tcdPulley: DataTypes.FLOAT,
      tcdDraft: DataTypes.FLOAT,

      bdPulley: DataTypes.FLOAT,
      bdDraft: DataTypes.FLOAT,

      idPulley: DataTypes.FLOAT,
      idDraft: DataTypes.FLOAT,

      g: DataTypes.FLOAT,
      h: DataTypes.FLOAT,

      draft: DataTypes.FLOAT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "lap_formers",
      timestamps: true,
    }
  );

  return LapFormer;
};
