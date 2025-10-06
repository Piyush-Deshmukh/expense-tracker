import { Response } from "express";
import { Transaction } from "../models";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * GET /api/stats/category?month=&year=
 * Returns total expense per category
 */
export const getCategoryStats = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;

    const match: any = { userId: req.user!._id, type: "expense" };

    if (month && year) {
      const m = Number(month) - 1;
      const y = Number(year);
      match.date = { $gte: new Date(y, m, 1), $lt: new Date(y, m + 1, 1) };
    }

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $project: { category: "$_id", total: 1, _id: 0 } },
    ]);

    res.json(result);
  } catch (err: any) {
    console.error("getCategoryStats error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/stats/monthly?months=12
 * Returns income & expense totals for last N months
 */
export const getMonthlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const months = Number(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      { $match: { userId: req.user!._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          totals: { $push: { type: "$_id.type", total: "$total" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Transform to { month: 'Oct 2025', income: X, expense: Y }
    const data = result.map((r) => {
      const monthName = new Date(r._id.year, r._id.month - 1).toLocaleString(
        "default",
        {
          month: "short",
        }
      );
      const totalsObj: any = {};
      r.totals.forEach((t: any) => {
        totalsObj[t.type] = t.total;
      });
      return {
        month: `${monthName} ${r._id.year}`,
        income: totalsObj["income"] || 0,
        expense: totalsObj["expense"] || 0,
      };
    });

    res.json(data);
  } catch (err: any) {
    console.error("getMonthlyStats error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/stats/net?start=&end=
 * Returns net savings (income - expense) time series by day
 */
export const getNetSavings = async (req: AuthRequest, res: Response) => {
  try {
    const start = req.query.start
      ? new Date(String(req.query.start))
      : new Date("2000-01-01");
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();

    const result = await Transaction.aggregate([
      { $match: { userId: req.user!._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totals: { $push: { type: "$_id.type", total: "$total" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = result.map((r) => {
      const totalsObj: any = {};
      r.totals.forEach((t: any) => (totalsObj[t.type] = t.total));
      return {
        date: r._id,
        net: (totalsObj["income"] || 0) - (totalsObj["expense"] || 0),
      };
    });

    res.json(data);
  } catch (err: any) {
    console.error("getNetSavings error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/stats/top-merchants?month=1&year=2023&limit=10&type=expense
 */
export const getTopMerchants = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const type = req.query.type === "income" ? "income" : "expense";

    // Optional month/year filtering
    const match: any = { userId: req.user!._id, type };
    const month = req.query.month ? Number(req.query.month) - 1 : null; // JS months are 0-indexed
    const year = req.query.year ? Number(req.query.year) : null;

    if (month !== null && year !== null) {
      match.date = {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1),
      };
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: type === "expense" ? "$merchant" : "$source",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
      { $project: { name: "$_id", total: 1, _id: 0 } },
    ]);

    res.json(result);
  } catch (err: any) {
    console.error("getTopMerchants error:", err);
    res.status(500).json({ message: err.message });
  }
};

