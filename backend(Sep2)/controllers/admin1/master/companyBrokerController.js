import * as companyBrokerService from "../../../services/admin1/master/companyBrokerService.js";
import { getNextCompanyBrokerCode } from "../../../utils/helpers.js";

export const getNextCompanyBrokerCodeController = async (req, res) => {
  try {
    const nextCode = await getNextCompanyBrokerCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate company broker code",
      error: error.message,
    });
  }
};
export const createCompanyBroker = async (req, res) => {
  try {
    const broker = await companyBrokerService.createCompanyBroker(req.body);
    res.status(201).json({
      message: "Company broker created successfully",
      companyBroker: broker,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCompanyBrokers = async (req, res) => {
  try {
    const brokers = await companyBrokerService.getAllCompanyBrokers();
    res.status(200).json({
      message: "Company brokers retrieved successfully",
      companyBrokers: brokers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyBrokerById = async (req, res) => {
  try {
    const broker = await companyBrokerService.getCompanyBrokerById(req.params.id);
    res.status(200).json({
      message: "Company broker retrieved successfully",
      companyBroker: broker,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCompanyBroker = async (req, res) => {
  try {
    const broker = await companyBrokerService.updateCompanyBroker(req.params.id, req.body);
    res.status(200).json({
      message: "Company broker updated successfully",
      companyBroker: broker,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCompanyBroker = async (req, res) => {
  try {
    await companyBrokerService.deleteCompanyBroker(req.params.id);
    res.status(200).json({
      message: "Company broker deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};