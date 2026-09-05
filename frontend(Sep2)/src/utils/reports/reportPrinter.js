import { buildReportHtml } from "./baseReportTemplate";

export const printReport = (report) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Please allow pop-ups to generate the report");
  }

  printWindow.document.write(buildReportHtml(report));
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
};
