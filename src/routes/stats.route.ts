import { Router } from "express";
import {
  getCategoryStats,
  getMonthlyStats,
  getNetSavings,
  getTopMerchants,
} from "../controllers/stats.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
router.use(protect);

router.get("/category", getCategoryStats);
router.get("/monthly", getMonthlyStats);
router.get("/net", getNetSavings);
router.get("/top-merchants", getTopMerchants);

export default router;
