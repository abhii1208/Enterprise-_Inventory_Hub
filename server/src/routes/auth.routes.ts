import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  bootstrapStatus,
  changePassword,
  login,
  logout,
  me,
  registerBootstrapAdmin,
  requestChangePasswordOtp,
  requestForgotPasswordOtp,
  requestPasswordHelpController,
  resetForgotPassword,
  verifyForgotPasswordOtpController
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes."
  }
});

router.post("/login", loginLimiter, asyncHandler(login));
router.post("/signin", loginLimiter, asyncHandler(login));
router.get("/bootstrap-status", asyncHandler(bootstrapStatus));
router.post("/register-first-admin", asyncHandler(registerBootstrapAdmin));
router.post("/register-admin", asyncHandler(registerBootstrapAdmin));
router.post("/signup", asyncHandler(registerBootstrapAdmin));
router.post("/request-password-help", asyncHandler(requestPasswordHelpController));
router.post("/forgot-password/request-otp", asyncHandler(requestForgotPasswordOtp));
router.post("/forgot-password/request", asyncHandler(requestForgotPasswordOtp));
router.post("/forgot-password/verify-otp", asyncHandler(verifyForgotPasswordOtpController));
router.post("/forgot-password/verify", asyncHandler(verifyForgotPasswordOtpController));
router.post("/forgot-password/reset", asyncHandler(resetForgotPassword));
router.post("/logout", requireAuth, asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/change-password/request-otp", requireAuth, asyncHandler(requestChangePasswordOtp));
router.post("/change-password", requireAuth, asyncHandler(changePassword));

export default router;
