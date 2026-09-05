import * as mixingGroupService from "../../../services/admin1/master/mixingGroupService.js";
import { getNextMixingCode1 } from "../../../utils/helpers.js";

export const getNextMixingCodeController = async (req, res) => {
  try {
    const nextCode = await getNextMixingCode1();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate mixing code",
      error: error.message,
    });
  }
};
export const createMixingGroup = async (req, res) => {
  try {
    const group = await mixingGroupService.createMixingGroup(req.body);
    res.status(201).json({
      message: "Mixing group created successfully",
      mixingGroup: group,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllMixingGroups = async (req, res) => {
  try {
    const groups = await mixingGroupService.getAllMixingGroups();
    res.status(200).json({
      message: "Mixing groups retrieved successfully",
      mixingGroups: groups,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMixingGroupById = async (req, res) => {
  try {
    const group = await mixingGroupService.getMixingGroupById(req.params.id);
    res.status(200).json({
      message: "Mixing group retrieved successfully",
      mixingGroup: group,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateMixingGroup = async (req, res) => {
  try {
    const group = await mixingGroupService.updateMixingGroup(req.params.id, req.body);
    res.status(200).json({
      message: "Mixing group updated successfully",
      mixingGroup: group,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMixingGroup = async (req, res) => {
  try {
    await mixingGroupService.deleteMixingGroup(req.params.id);
    res.status(200).json({
      message: "Mixing group deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};