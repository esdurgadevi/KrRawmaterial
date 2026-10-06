import db from "../../../models/index.js";


const {
  sequelize,
  Issue,
  IssueItem,
  MixingGroup,
  InwardLotWeightment,
  InwardLot,
  InwardEntry,
  PurchaseOrder,
  Supplier,
  Variety,
  Godown,
} = db;

import { Op } from "sequelize";

/* CREATE ISSUE + ITEMS */
export const create = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      issueNumber,
      issueDate,
      mixingNo,
      mixingGroupId,
      toMixingGroupId,
      items,
    } = data;

    if (
      !issueNumber ||
      !issueDate ||
      !mixingNo ||
      !mixingGroupId ||
      !toMixingGroupId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    const issue = await Issue.create(
      {
        issueNumber,
        issueDate,
        mixingNo,
        mixingGroupId,
        toMixingGroupId,
        issueQty: items.length,
      },
      { transaction }
    );

    for (const item of items) {
      const weightment = await InwardLotWeightment.findByPk(
        item.weightmentId,
        { transaction }
      );

      if (!weightment) {
        throw new Error("Invalid weightmentId");
      }

      if (weightment.isIssued) {
        throw new Error(`Weightment ${item.weightmentId} already issued`);
      }

      await IssueItem.create(
        {
          issueId: issue.id,
          weightmentId: item.weightmentId,
          issueWeight: item.issueWeight,
        },
        { transaction }
      );

      // 🔴 Mark weightment as issued
      await weightment.update(
        { isIssued: true },
        { transaction }
      );
    }

    await transaction.commit();
    return issue;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* GET ALL */
export const getAll = async (page = 1, limit = 10, search = "") => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  const whereClause = {};

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;

    // 1️⃣ Find weightment IDs matching lotNo or baleNo
    const matchingWeightments = await InwardLotWeightment.findAll({
      where: {
        [Op.or]: [
          { lotNo: { [Op.like]: q } },
          { baleNo: { [Op.like]: q } },
        ],
      },
      attributes: ["id"],
      raw: true,
    });

    const weightmentIds = matchingWeightments.map((w) => w.id);
    let matchingIssueIds = [];

    if (weightmentIds.length > 0) {
      const matchingItems = await IssueItem.findAll({
        where: { weightmentId: { [Op.in]: weightmentIds } },
        attributes: ["issueId"],
        raw: true,
      });
      matchingIssueIds = matchingItems.map((i) => i.issueId);
    }

    const orConditions = [
      { issueNumber: { [Op.like]: q } },
      { mixingNo: { [Op.like]: q } },
    ];

    if (matchingIssueIds.length > 0) {
      orConditions.push({ id: { [Op.in]: matchingIssueIds } });
    }

    whereClause[Op.or] = orConditions;
  }

  const { count, rows } = await Issue.findAndCountAll({
    where: whereClause,
    limit: limitNum,
    offset: offset,
    distinct: true,
    attributes: [
      "id",
      "issueNumber",
      "issueDate",
      "mixingNo",
      "mixingGroupId",
      "toMixingGroupId",
      "issueQty",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: IssueItem,
        attributes: ["weightmentId", "issueWeight"],
        include: [
          {
            model: InwardLotWeightment,
            attributes: ["lotNo", "baleNo", "baleWeight", "baleValue"],
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });

  return {
    issues: rows,
    totalItems: count,
    totalPages: Math.ceil(count / limitNum) || 1,
    currentPage: pageNum,
    pageSize: limitNum,
  };
};

/* GET BY ID */
export const getById = async (id) => {
  const issue = await Issue.findByPk(id, {
    include: [
      {
        model: IssueItem,
        include: [InwardLotWeightment],
      },
    ],
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  return issue;
};

/* DELETE */
export const remove = async (id) => {
  const issue = await Issue.findByPk(id);
  if (!issue) {
    throw new Error("Issue not found");
  }

  await issue.destroy();
};

/* UPDATE ISSUE + ITEMS */
export const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      issueNumber,
      issueDate,
      mixingNo,
      mixingGroupId,
      toMixingGroupId,
      items,
    } = data;

    if (
      !issueNumber ||
      !issueDate ||
      !mixingNo ||
      !mixingGroupId ||
      !toMixingGroupId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    const issue = await Issue.findByPk(id, { transaction });
    if (!issue) {
      throw new Error("Issue not found");
    }

    // 1. Revert previous items
    const existingItems = await IssueItem.findAll({ where: { issueId: id }, transaction });
    for (const exItem of existingItems) {
      const weightment = await InwardLotWeightment.findByPk(exItem.weightmentId, { transaction });
      if (weightment) {
        await weightment.update({ isIssued: false }, { transaction });
      }
      await exItem.destroy({ transaction });
    }

    // 2. Update issue details
    await issue.update(
      {
        issueNumber,
        issueDate,
        mixingNo,
        mixingGroupId,
        toMixingGroupId,
        issueQty: items.length,
      },
      { transaction }
    );

    // 3. Add new items
    for (const item of items) {
      const weightment = await InwardLotWeightment.findByPk(
        item.weightmentId,
        { transaction }
      );

      if (!weightment) {
        throw new Error("Invalid weightmentId");
      }

      if (weightment.isIssued) {
        throw new Error(`Weightment ${item.weightmentId} already issued`);
      }

      await IssueItem.create(
        {
          issueId: issue.id,
          weightmentId: item.weightmentId,
          issueWeight: item.issueWeight,
        },
        { transaction }
      );

      // Mark weightment as issued
      await weightment.update(
        { isIssued: true },
        { transaction }
      );
    }

    await transaction.commit();
    return issue;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* GET DAILY ISSUE REPORT */
export const getDailyIssueReport = async (startDate, endDate) => {
  const issues = await Issue.findAll({
    where: {
      issueDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: IssueItem,
        include: [
          {
            model: InwardLotWeightment,
            include: [
              {
                model: InwardLot,
                as: "inwardLot",
                include: [
                  { model: Godown, as: "godown" },
                  {
                    model: InwardEntry,
                    include: [
                      {
                        model: PurchaseOrder,
                        as: "purchaseOrder",
                        include: [
                          { model: Supplier, as: "supplier" },
                          { model: Variety, as: "variety" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { model: MixingGroup, as: "mixingGroup" },
    ],
    order: [["id", "ASC"]],
  });

  return issues;
};
