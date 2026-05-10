const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { apiLimiter, uploadLimiter } = require("../middleware/rateLimiter");
const { verifyToken } = require("../middleware/auth.middleware");
const { upload } = require("../services/upload.service");
const videosController = require("../controllers/videos.controller");

const router = Router();

const videoValidation = [
  body("youtube_url")
    .trim()
    .isURL()
    .custom((url) => {
      const valid =
        /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url) ||
        /^https:\/\/youtu\.be\//.test(url);
      if (!valid) throw new Error("Must be a valid YouTube URL");
      return true;
    }),
  body("title_en").trim().isLength({ min: 3, max: 150 }).escape(),
  body("title_fr").trim().isLength({ min: 3, max: 150 }).escape(),
  body("title_ro").trim().isLength({ min: 3, max: 150 }).escape(),
  body("desc_en").optional().trim().isLength({ max: 2000 }).escape(),
  body("desc_fr").optional().trim().isLength({ max: 2000 }).escape(),
  body("desc_ro").optional().trim().isLength({ max: 2000 }).escape(),
];

// Public
router.get("/", apiLimiter, videosController.getAll);
router.get("/:id", apiLimiter, videosController.getOne);

// Admin only
router.post(
  "/",
  apiLimiter,
  uploadLimiter,
  verifyToken,
  upload.single("thumbnail"),
  videoValidation,
  validate,
  videosController.create,
);

router.put(
  "/:id",
  apiLimiter,
  verifyToken,
  upload.single("thumbnail"),
  videoValidation,
  validate,
  videosController.update,
);

router.delete("/:id", apiLimiter, verifyToken, videosController.remove);

module.exports = router;
