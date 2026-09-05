import purchaseOrderReport from "./purchaseOrderReport";
import gateInwardReport from "./gateInwardReport";
import inwardLotReport from "./inwardLotReport";
import issueReport from "./issueReport";
import lotTestResultReport from "./lotTestResultReport";
import locationTransferReport from "./locationTransferReport";
import lotAllowanceReport from "./lotAllowanceReport";
import lotRejectedReport from "./lotRejectedReport";
import finalInvoiceReport from "./finalInvoiceReport";

export const reportDefinitions = {
  "purchase-order": purchaseOrderReport,
  "gate-inward": gateInwardReport,
  "inward-lot": inwardLotReport,
  issue: issueReport,
  "lot-test-result": lotTestResultReport,
  "location-transfer": locationTransferReport,
  "lot-allowance": lotAllowanceReport,
  "lot-rejection": lotRejectedReport,
  "final-invoice": finalInvoiceReport,
};
