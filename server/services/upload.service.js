const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");

const uploadsDir = path.resolve(__dirname, "../uploads/thumbnails");
fs.mkdirSync(uploadsDir, { recursive: true });

const bikePhotosDir = path.resolve(__dirname, "../uploads/bike-photos");
fs.mkdirSync(bikePhotosDir, { recursive: true });

// Store in memory for processing with sharp
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (env.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

async function processImage(buffer) {
  // Verify the image is valid by reading metadata (checks magic bytes)
  const metadata = await sharp(buffer).metadata();
  const allowedFormats = ["jpeg", "png", "webp"];
  if (!allowedFormats.includes(metadata.format)) {
    throw new Error("Invalid image format detected");
  }

  const filename = `${uuidv4()}.webp`;
  const outputPath = path.join(uploadsDir, filename);

  await sharp(buffer)
    .resize(1280, 720, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outputPath);

  return filename;
}

function deleteThumbnail(filename) {
  if (!filename) return;
  const filepath = path.join(uploadsDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

async function processBikePhoto(buffer) {
  const metadata = await sharp(buffer).metadata();
  const allowedFormats = ["jpeg", "png", "webp"];
  if (!allowedFormats.includes(metadata.format)) {
    throw new Error("Invalid image format detected");
  }

  const filename = `${uuidv4()}.webp`;
  const outputPath = path.join(bikePhotosDir, filename);

  await sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);

  return filename;
}

function deleteBikePhoto(filename) {
  if (!filename) return;
  const filepath = path.join(bikePhotosDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

module.exports = { upload, processImage, deleteThumbnail, uploadsDir, processBikePhoto, deleteBikePhoto, bikePhotosDir };
