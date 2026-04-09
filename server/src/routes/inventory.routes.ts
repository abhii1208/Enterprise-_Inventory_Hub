import { Router } from "express";
import { commitImport, getCurrentInventory, importAndCommit, previewImport, searchItems } from "../controllers/inventory.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(requireAuth);
router.get("/current", asyncHandler(getCurrentInventory));
router.get("/search", asyncHandler(searchItems));
router.post("/import", upload.single("file"), asyncHandler(importAndCommit));
router.post("/import/preview", upload.single("file"), asyncHandler(previewImport));
router.post("/import/commit", asyncHandler(commitImport));

export default router;
