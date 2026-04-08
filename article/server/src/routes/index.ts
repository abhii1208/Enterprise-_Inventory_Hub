import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import inventoryRoutes from "./inventory.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/inventory", inventoryRoutes);

export default router;

