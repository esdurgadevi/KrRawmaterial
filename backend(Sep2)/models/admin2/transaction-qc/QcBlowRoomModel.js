import { DataTypes } from "sequelize";

export default (sequelize) => {
  const QcBlowRoom = sequelize.define(
    "QcBlowRoom",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      mixNo: DataTypes.INTEGER,
      remarks: DataTypes.STRING,

      /* ---------------- Bale Plucker / Vario Cleaner ---------------- */

      bpmPulley: DataTypes.STRING,
      bpfPulley: DataTypes.STRING,
      bpSpeed: DataTypes.STRING,
      vcSpeed: DataTypes.STRING,
      vcGrid: DataTypes.STRING,

      /* ---------------- Unimix ---------------- */

      u1Lattice: DataTypes.STRING,
      u2Lattice: DataTypes.STRING,

      u1Conveyer: DataTypes.STRING,
      u2Conveyer: DataTypes.STRING,

      u1Beater: DataTypes.STRING,
      u2Beater: DataTypes.STRING,

      u1MPulley: DataTypes.STRING,
      u2MPulley: DataTypes.STRING,

      u1FPulley: DataTypes.STRING,
      u2FPulley: DataTypes.STRING,

      /* ---------------- Flexi ---------------- */

      f1Beater: DataTypes.STRING,
      f2Beater: DataTypes.STRING,

      f1GridBar: DataTypes.STRING,
      f2GridBar: DataTypes.STRING,

      f1Waste: DataTypes.STRING,
      f2Waste: DataTypes.STRING,

      f1TtoF: DataTypes.STRING,
      f2TtoF: DataTypes.STRING,

      f1RtoB: DataTypes.STRING,
      f2RtoB: DataTypes.STRING,

      f1FtoF: DataTypes.STRING,
      f2FtoF: DataTypes.STRING,

      f1MPulley: DataTypes.STRING,
      f2MPulley: DataTypes.STRING,

      f1FPulley: DataTypes.STRING,
      f2FPulley: DataTypes.STRING,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "qc_blowroom",
      timestamps: true,
    }
  );

  return QcBlowRoom;
};
