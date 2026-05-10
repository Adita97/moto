const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { apiLimiter, uploadLimiter } = require("../middleware/rateLimiter");
const { verifyToken } = require("../middleware/auth.middleware");
const { upload } = require("../services/upload.service");
const bikesController = require("../controllers/bikes.controller");

const router = Router();

const bikeValidation = [
  body("brand").trim().isLength({ min: 1, max: 100 }).escape(),
  body("model").trim().isLength({ min: 1, max: 100 }).escape(),
  body("year").isInt({ min: 1900, max: 2100 }),
  body("color").optional().trim().isLength({ max: 100 }).escape(),
  body("engine").optional().trim().isLength({ max: 100 }).escape(),
  body("power").optional().trim().isLength({ max: 100 }).escape(),
  body("torque").optional().trim().isLength({ max: 100 }).escape(),
  body("weight").optional().trim().isLength({ max: 100 }).escape(),
  body("top_speed").optional().trim().isLength({ max: 100 }).escape(),
  body("mileage").optional().trim().isLength({ max: 100 }).escape(),
  body("hero_video").optional().trim().isLength({ max: 500 }),
  body("story_en").optional().trim().isLength({ max: 5000 }),
  body("story_fr").optional().trim().isLength({ max: 5000 }),
  body("story_ro").optional().trim().isLength({ max: 5000 }),
  body("photos").optional().isArray(),
  body("photos.*")
    .optional()
    .trim()
    .custom((val) => {
      // Accept full URLs (http/https) or local upload paths
      if (/^https?:\/\//i.test(val)) return true;
      if (/^\/uploads\//i.test(val)) return true;
      throw new Error("Each photo must be a valid URL or an uploaded file path");
    }),
];

// Public — get active bike
router.get("/active", apiLimiter, bikesController.getActive);

// Admin only
router.get("/", apiLimiter, verifyToken, bikesController.getAll);
router.get("/:id", apiLimiter, verifyToken, bikesController.getOne);

// Photo upload — accepts a single image file, returns { url }
router.post(
  "/upload-photo",
  apiLimiter,
  uploadLimiter,
  verifyToken,
  upload.single("photo"),
  bikesController.uploadPhoto,
);

router.post(
  "/",
  apiLimiter,
  verifyToken,
  bikeValidation,
  validate,
  bikesController.create,
);

router.put(
  "/:id",
  apiLimiter,
  verifyToken,
  bikeValidation,
  validate,
  bikesController.update,
);

router.patch(
  "/:id/activate",
  apiLimiter,
  verifyToken,
  bikesController.setActive,
);
router.delete("/:id", apiLimiter, verifyToken, bikesController.remove);

module.exports = router;
