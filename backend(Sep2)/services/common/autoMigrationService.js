// backend/services/common/autoMigrationService.js

/**
 * Automatically checks and adds missing columns to existing MySQL tables on backend startup.
 * @param {import('sequelize').Sequelize} sequelize 
 */
export const autoMigrateQCColumns = async (sequelize) => {
  const addColumnSafely = async (tableName, columnName, columnDef) => {
    try {
      await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDef};`);
      console.log(`✅ Auto-migration: Added '${columnName}' column to table '${tableName}'.`);
    } catch (err) {
      // Ignore duplicate column error (MySQL Error 1060 / ER_DUP_FIELDNAME)
      if (err.original?.errno !== 1060 && !err.message?.includes("duplicate column")) {
        console.warn(`⚠️ Auto-migration note for ${tableName}.${columnName}: ${err.message}`);
      }
    }
  };

  try {
    // 1. Breaker Drawing Table
    await addColumnSafely("breakerDrawings", "rollerSetting", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "feedChangeGear", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "draftChangeGear", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "draftCChangeGear", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "webTensionChangeGear", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "breakDraftChangeGearA", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "breakDraftChangeGearB", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "coilerChangeGearC", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "coilerChangeGearD", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "canChangeGearE", "FLOAT NULL");
    await addColumnSafely("breakerDrawings", "canChangeGearF", "FLOAT NULL");

    // 2. Comber Entry Table
    await addColumnSafely("comber_entries", "noilsPercent", "FLOAT NULL");

    // 3. Lap Former Table
    await addColumnSafely("lap_formers", "avgLapWeight", "FLOAT NULL");
    await addColumnSafely("lap_formers", "withinCVPer", "FLOAT NULL");
    await addColumnSafely("lap_formers", "lrdC", "FLOAT NULL");
    await addColumnSafely("lap_formers", "lrdD", "FLOAT NULL");

    console.log("✅ Auto-migration check completed cleanly.");
  } catch (error) {
    console.error("❌ Error during auto-migration:", error.message);
  }
};
