// backend/src/routes/reports.routes.ts
import { Router, RequestHandler } from "express";
import {
  getDailyReport, getMonthlyReport, getTopProductsReport,
  getProfitReport, getRangeReport, getCashierReport,
} from "../controllers/reports.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router:Router = Router();
router.use(verifyToken as RequestHandler);
router.use(requireAdmin as RequestHandler);

router.get("/daily", getDailyReport as RequestHandler);
router.get("/monthly", getMonthlyReport as RequestHandler);
router.get("/top-products", getTopProductsReport as RequestHandler);
router.get("/profit", getProfitReport as RequestHandler);
router.get("/range", getRangeReport as RequestHandler);
router.get("/cashier", getCashierReport as RequestHandler);

export default router;