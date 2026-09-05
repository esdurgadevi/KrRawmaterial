import * as purchaseOrderService from "../../../services/admin1/transaction-cotton/purchaseOrderService.js";
import { getNextPurchaseOrderNo } from "../../../utils/helpers.js";

export const createPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.createPurchaseOrder(req.body);
    res.status(201).json({
      message: "Purchase order created successfully",
      purchaseOrder: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await purchaseOrderService.getAllPurchaseOrders();
    res.status(200).json({
      message: "Purchase orders retrieved successfully",
      purchaseOrders: orders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await purchaseOrderService.getPurchaseOrderById(req.params.id);
    res.status(200).json({
      message: "Purchase order retrieved successfully",
      purchaseOrder: order,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
    res.status(200).json({
      message: "Purchase order updated successfully",
      purchaseOrder: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    await purchaseOrderService.deletePurchaseOrder(req.params.id);
    res.status(200).json({
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getNextOrderNo = async (req, res) => {
  try {
    const nextOrderNo = await getNextPurchaseOrderNo();
    res.status(200).json({
      message: "Next order number generated",
      nextOrderNo,
    });
  } catch (error) {
    console.error("Error generating next order no:", error);
    res.status(500).json({ message: "Failed to generate next order number" });
  }
};