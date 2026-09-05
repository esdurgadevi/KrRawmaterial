import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoute.js";
const app = express();

app.use(cors());
//app.use(express.json());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


//master
import stationRoutes from './routes/admin1/master/stationRoutes.js';
import mixingGroupRoutes from './routes/admin1/master/mixingGroupRoutes.js';
import mixingRoutes from './routes/admin1/master/mixingRoutes.js';
import varietyRoutes from './routes/admin1/master/varietyRoutes.js';
import stateRoutes from './routes/admin1/master/stateRoutes.js';
import brokerRoutes from './routes/admin1/master/brokerRoutes.js';
import commodityRoutes from './routes/admin1/master/commodityRoutes.js';
import transportRoutes from './routes/admin1/master/transportRoutes.js';
import godownRoutes from './routes/admin1/master/godownRoutes.js';
import companyBrokerRoutes from './routes/admin1/master/companyBrokerRoutes.js';
import wcInvoiceRoutes from "./routes/admin1/master/wcInvoiceRoutes.js";
import supplierRoutes from './routes/admin1/master/supplierRoutes.js';
import fibreRoutes from './routes/admin1/master/fibreRoutes.js';
import packingTypeRoutes from './routes/admin1/master/packingTypeRoutes.js';
import wasteMasterRoutes from './routes/admin1/master/wasteMasterRoutes.js';
import wasteRateRoutes from './routes/admin1/master/wasteRateRoutes.js';
import wasteLotRoutes from './routes/admin1/master/wasteLotRoutes.js';
import costMasterRoutes from './routes/admin1/master/costMasterRoutes.js';
app.use("/krerm/auth", authRoutes);
app.use("/krerm/stations", stationRoutes);
app.use("/krerm/mixing-groups", mixingGroupRoutes);
app.use("/krerm/mixings", mixingRoutes);
app.use("/krerm/varieties", varietyRoutes);
app.use("/krerm/states", stateRoutes);
app.use("/krerm/brokers", brokerRoutes);
app.use("/krerm/commodities", commodityRoutes);
app.use("/krerm/transports", transportRoutes);
app.use("/krerm/godowns", godownRoutes);
app.use("/krerm/company-brokers", companyBrokerRoutes);
app.use("/krerm/wc-invoices", wcInvoiceRoutes);
app.use("/krerm/suppliers", supplierRoutes);
app.use("/krerm/fibres", fibreRoutes);
app.use("/krerm/packing-types", packingTypeRoutes);
app.use("/krerm/waste-masters", wasteMasterRoutes);
app.use("/krerm/waste-rates", wasteRateRoutes);
app.use("/krerm/waste-lots", wasteLotRoutes);
app.use("/krerm/cost-masters", costMasterRoutes);



//transaction-cotton
import purchaseOrderRoutes from './routes/admin1/transaction-cotton/purchaseOrderRoutes.js';
import inwardEntryRoutes from './routes/admin1/transaction-cotton/inwardEntryRoutes.js';
import inwardLotsRoutes from './routes/admin1/transaction-cotton/inwardLotRoutes.js';
import issueRoutes from "./routes/admin1/transaction-cotton/issueRoutes.js";
import LotTestResultRoutes from "./routes/admin1/transaction-cotton/lotTestResultRoutes.js";
import LocationTransferRoutes from "./routes/admin1/transaction-cotton/locationTransferRoutes.js";
import lotAllowanceRoutes from "./routes/admin1/transaction-cotton/lotAllowanceRoutes.js";
import lotRejectedRoutes from "./routes/admin1/transaction-cotton/lotRejectedRoutes.js";
import finalInvoiceRoutes from "./routes/admin1/transaction-cotton/finalInvoiceRoutes.js";
import cottonReportCatalogRoutes from "./routes/admin1/transaction-cotton/cottonReportCatalogRoutes.js";
app.use("/krerm/purchase-orders", purchaseOrderRoutes);
app.use("/krerm/inward-entries", inwardEntryRoutes);
app.use("/krerm/inward-lots",inwardLotsRoutes);
app.use("/krerm/issues",issueRoutes);
app.use("/krerm/lot-entries",LotTestResultRoutes);
app.use("/krerm/location-transfer",LocationTransferRoutes);
app.use("/krerm/lot-allowances", lotAllowanceRoutes);
app.use("/krerm/lot-rejecteds", lotRejectedRoutes);
app.use("/krerm/final-invoices", finalInvoiceRoutes);
app.get("/krerm/transaction-cotton/report-route-check", (req, res) => {
  res.json({ ok: true, app: "transaction-cotton backend" });
});
app.use("/krerm/transaction-cotton/report-catalog", cottonReportCatalogRoutes);

//transaction-waste
import salesOrderRoutes from "./routes/admin1/transaction-waste/salesOrderRoutes.js";
import wastePackingRoutes from "./routes/admin1/transaction-waste/wastePackingRoutes.js"
import invoiceRoutes from "./routes/admin1/transaction-waste/invoiceRoutes.js";
import wasteEntryRoutes from "./routes/admin1/transaction-waste/wasteEntryRoutes.js";
app.use("/krerm/waste-packings",wastePackingRoutes);
app.use("/krerm/waste-sales",salesOrderRoutes);
app.use("/krerm/invoices",invoiceRoutes);
app.use("/krerm/waste-entries",wasteEntryRoutes);


//transaction-process-stock
import wasteIssueRoutes from "./routes/admin1/transaction-process-stock/wasteIssueRoute.js";
app.use("/krerm/waste-issue", wasteIssueRoutes);
import departmentKgRoutes from "./routes/admin1/transaction-process-stock/departmentKgRoutes.js";
app.use("/krerm/department-kgs", departmentKgRoutes);
import countwiseClosingRoutes from "./routes/admin1/transaction-process-stock/countwiseClosingRoutes.js";
app.use("/krerm/countwise-closing", countwiseClosingRoutes);
import productRoute from "./routes/admin1/transaction-process-stock/productRoute.js";
app.use("/krerm/products", productRoute);



//transaction-qc
import spinningRoutes from "./routes/admin2/master/spinningCountRoutes.js";
import simplexMachineRoutes from "./routes/admin2/master/simplexMachineRoutes.js";
import qcEntryRoutes from "./routes/admin2/transaction-qc/qcEntryRoutes.js";
import spinningLongFrame from "./routes/admin2/transaction-qc/spinningLongFrameRoutes.js";
import breakerDrawingRoutes from "./routes/admin2/transaction-qc/breakerDrawingRoutes.js";
import finisherDrawingRoutes from "./routes/admin2/transaction-qc/finisherDrawingRoutes.js";
import comberEntryRoutes from "./routes/admin2/transaction-qc/comberEntryRoutes.js";
import lapFormerRoutes from "./routes/admin2/transaction-qc/lapFormerRoutes.js";
import autoConerRoutes from "./routes/admin2/transaction-qc/autoConerRoutes.js";
import qcSimplexRoutes from "./routes/admin2/transaction-qc/qcSimplexRoutes.js";
import qcCardingRoutes from "./routes/admin2/transaction-qc/qcCardingRoutes.js";
import qcBlowRoomRoutes from "./routes/admin2/transaction-qc/qcBlowRoomRoutes.js";
import qcReportCatalogRoutes from "./routes/admin2/transaction-qc/qcReportCatalogRoutes.js";
app.use("/krerm/admin2/master/spinning-counts",spinningRoutes);
app.use("/krerm/admin2/master/simplex-machines", simplexMachineRoutes);
app.use("/krerm/admin2/transaction-qc/qc-entries", qcEntryRoutes);
app.use("/krerm/admin2/transaction-qc/spinning-long-frame", spinningLongFrame);
app.use("/krerm/admin2/transaction-qc/breaker-drawing",breakerDrawingRoutes);
app.use("/krerm/admin2/transaction-qc/finisher-drawing",finisherDrawingRoutes);
app.use("/krerm/admin2/transaction-qc/comber-entry",comberEntryRoutes);
app.use("/krerm/admin2/transaction-qc/lap-former",lapFormerRoutes);
app.use("/krerm/admin2/transaction-qc/auto-coner",autoConerRoutes);
app.use("/krerm/admin2/transaction-qc/qc-simplex",qcSimplexRoutes);
app.use("/krerm/admin2/transaction-qc/qc-carding",qcCardingRoutes);
app.use("/krerm/admin2/transaction-qc/qc-blowroom",qcBlowRoomRoutes);
app.use("/krerm/admin2/transaction-qc/qc-reports", qcReportCatalogRoutes);


export default app;
