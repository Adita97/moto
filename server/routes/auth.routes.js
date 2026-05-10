const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/login",
  authLimiter,
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("password").isLength({ min: 1, max: 128 }),
  ],
  validate,
  authController.login,
);

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
