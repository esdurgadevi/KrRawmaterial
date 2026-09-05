import { DataTypes } from "sequelize";

const QCEntryModel = (sequelize) => {
  const QCEntry = sequelize.define(
    "QCEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      inwardLotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "inward_lot_id",
        comment: "Reference to InwardLot (where lotNo is the main identifier)",
      },
      lotNo: {  // stored for quick search / display (denormalized)
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "lot_no",
      },
      testDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "test_date",
      },
      // Strength mode (ICC or HVI)
      strMode: {
        type: DataTypes.ENUM("ICC", "HVI"),
        allowNull: false,
        defaultValue: "HVI",
        field: "str_mode",
      },

      // Core test values
      rd: { type: DataTypes.DECIMAL(5, 2), allowNull: true },           // RD
      staple: { type: DataTypes.DECIMAL(4, 1), allowNull: true },       // Staple (mm)
      plusB: { type: DataTypes.DECIMAL(4, 1), allowNull: true, field: "plus_b" },  // +B
      moist: { type: DataTypes.DECIMAL(4, 1), allowNull: true },        // Moist (%)
      mr: { type: DataTypes.DECIMAL(5, 2), allowNull: true },           // MR
      ui: { type: DataTypes.DECIMAL(5, 1), allowNull: true },           // UI
      eLog: { type: DataTypes.DECIMAL(4, 1), allowNull: true, field: "e_log" },
      strength: { type: DataTypes.DECIMAL(5, 1), allowNull: true },     // Strength (g/tex)
      mic: { type: DataTypes.DECIMAL(5, 2), allowNull: true },          // Mic
      sfcN: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "sfc_n" },
      tsfN: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "tsf_n" },
      neps: { type: DataTypes.INTEGER, allowNull: true },
      sci: { type: DataTypes.INTEGER, allowNull: true },
      grade: { type: DataTypes.STRING(10), allowNull: true },
      ml50: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: "ml_50" },  // ML 50%
      conStaple: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "con_staple" },
      sfcStaple: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "sfc_staple" },
      sfcCW: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "sfc_cw" },
      tsfW: { type: DataTypes.DECIMAL(5, 1), allowNull: true, field: "tsf_w" },
      fqi: { type: DataTypes.DECIMAL(6, 1), allowNull: true },          // FQI

      // Optional / calculated / display fields
      twoPointFiveMm: { type: DataTypes.DECIMAL(6, 2), allowNull: true, field: "2_5_mm" },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      updatedBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "qc_entries",
      timestamps: true,
      indexes: [
        { fields: ["inward_lot_id"] },
        { fields: ["lot_no"] },
      ],
    }
  );

  return QCEntry;
};

export default QCEntryModel;
