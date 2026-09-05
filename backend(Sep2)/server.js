import app from "./app.js";
import sequelize, { connectDB } from "./config/db.js";
import { backfillAllLotTestResultsToQC } from "./services/admin2/transaction-qc/lotTestResultSyncService.js";
import { autoMigrateQCColumns } from "./services/common/autoMigrationService.js";

const PORT = process.env.PORT || 5400;

const startServer = async () => {
  try {
    // connect to DB
    await connectDB();

    // sync models
    await sequelize.sync();
    console.log("✅ Database synced");

    // Auto-migrate missing columns
    await autoMigrateQCColumns(sequelize);

    // Auto-backfill existing Lot Test Results to QC Entries
    await backfillAllLotTestResultsToQC();

    // start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
