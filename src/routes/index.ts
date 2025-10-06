import { Router, type Router as ExpressRouter } from "express";
import AuthRoutes from "./auth.route";
import TransactionRoutes from "./transaction.route";
import StatsRoutes from "./stats.route";

const router: ExpressRouter = Router();

router.use("/auth", AuthRoutes);
router.use("/transactions", TransactionRoutes);
router.use("/stats", StatsRoutes);

export default router;
