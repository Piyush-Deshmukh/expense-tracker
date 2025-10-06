import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";
import { Transaction } from "../models";

/**
 * POST /api/transactions
 */
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, category, source, merchant, description, date, tags } = req.body;

    if (!type || !["expense", "income"].includes(type)) {
      return res.status(400).json({
        message: 'type is required and must be "expense" or "income"',
      });
    }

    if (typeof amount !== "number") {
      return res.status(400).json({ message: "amount (number) is required" });
    }

    const tx = await Transaction.create({
      userId: req.user!._id,
      type,
      amount,
      category,
      source,
      merchant,
      description,
      date: date ? new Date(date) : new Date(),
      tags,
    });

    res.status(201).json(tx);
  } catch (err: any) {
    console.error("createTransaction error:", err);
    res
      .status(500)
      .json({ message: "Failed to create transaction", error: err.message });
  }
};

/**
 * GET /api/transactions
 * Supports query params:
 *  - type=expense|income
 *  - month (1-12) and year (e.g. 2025)  OR start=YYYY-MM-DD & end=YYYY-MM-DD
 *  - category, source, search (searches description/merchant)
 *  - page (default 1), limit (default 50)
 */
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      month,
      year,
      category,
      source,
      search,
      page = "1",
      limit = "50",
      start,
      end,
    } = req.query;

    const query: any = { userId: req.user?._id };

    if (type && (type === "expense" || type === "income")) query.type = type;
    if (category) query.category = String(category);
    if (source) query.source = String(source);

    if (search) {
      const s = String(search);
      query.$or = [
        { description: { $regex: s, $options: "i" } },
        { merchant: { $regex: s, $options: "i" } },
      ];
    }

    // Date filtering: month+year preferred
    if (month && year) {
      const m = Number(month) - 1; // JS months 0-11
      const y = Number(year);
      const startDate = new Date(y, m, 1);
      const endDate = new Date(y, m + 1, 1);
      query.date = { $gte: startDate, $lt: endDate };
    } else if (start || end) {
      const startDate = start ? new Date(String(start)) : new Date(0);
      const endDate = end ? new Date(String(end)) : new Date();
      // make end cover the full day
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const p = Math.max(1, Number(page));
    const l = Math.min(500, Number(limit));

    const total = await Transaction.countDocuments(query);
    const data = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    return res.json({ total, page: p, limit: l, data });
  } catch (err: any) {
    console.error("getTransactions error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: err.message });
  }
};

/**
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const tx = await Transaction.findOne({
      _id: id,
      userId: req.user?._id,
    }).lean();
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    return res.json(tx);
  } catch (err: any) {
    console.error("getTransactionById error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch transaction", error: err.message });
  }
};

/**
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const allowed = [
      "type",
      "amount",
      "category",
      "source",
      "merchant",
      "description",
      "date",
      "tags",
    ];

    const payload: any = {};
    for (const key of allowed) {
      if (key in req.body) payload[key] = req.body[key];
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { $set: payload },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Transaction not found" });
    
    return res.json(updated);
  } catch (err: any) {
    console.error("updateTransaction error:", err);
    res
      .status(500)
      .json({ message: "Failed to update transaction", error: err.message });
  }
};

/**
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });
    if (!deleted)
      return res.status(404).json({ message: "Transaction not found" });

    return res.json({ message: "Transaction deleted" });
  } catch (err: any) {
    console.error("deleteTransaction error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete transaction", error: err.message });
  }
};
