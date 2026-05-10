const { db } = require("../config/db");
const { processImage, deleteThumbnail, processBikePhoto } = require("../services/upload.service");
const { v4: uuidv4 } = require("uuid");

function getActive(req, res) {
  const bike = db
    .prepare("SELECT * FROM bikes WHERE is_active = 1 LIMIT 1")
    .get();
  if (!bike) {
    return res.status(404).json({ error: "No active bike found" });
  }
  bike.photos = JSON.parse(bike.photos || "[]");
  res.json(bike);
}

function getAll(req, res) {
  const bikes = db
    .prepare("SELECT * FROM bikes ORDER BY created_at DESC")
    .all();
  bikes.forEach((b) => (b.photos = JSON.parse(b.photos || "[]")));
  res.json(bikes);
}

function getOne(req, res) {
  const bike = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }
  bike.photos = JSON.parse(bike.photos || "[]");
  res.json(bike);
}

async function create(req, res) {
  const {
    brand,
    model,
    year,
    color,
    engine,
    power,
    torque,
    weight,
    top_speed,
    mileage,
    hero_video,
    story_en,
    story_fr,
    story_ro,
    photos,
  } = req.body;

  const id = uuidv4().replace(/-/g, "");
  const photosJson = JSON.stringify(photos || []);

  db.prepare(
    `
    INSERT INTO bikes (id, brand, model, year, color, engine, power, torque, weight, top_speed, mileage, hero_video, story_en, story_fr, story_ro, photos, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `,
  ).run(
    id,
    brand,
    model,
    parseInt(year, 10),
    color || null,
    engine || null,
    power || null,
    torque || null,
    weight || null,
    top_speed || null,
    mileage || null,
    hero_video || null,
    story_en || null,
    story_fr || null,
    story_ro || null,
    photosJson,
  );

  const bike = db.prepare("SELECT * FROM bikes WHERE id = ?").get(id);
  bike.photos = JSON.parse(bike.photos || "[]");
  res.status(201).json(bike);
}

async function update(req, res) {
  const existing = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Bike not found" });
  }

  const {
    brand,
    model,
    year,
    color,
    engine,
    power,
    torque,
    weight,
    top_speed,
    mileage,
    hero_video,
    story_en,
    story_fr,
    story_ro,
    photos,
  } = req.body;

  const photosJson = photos ? JSON.stringify(photos) : existing.photos;

  db.prepare(
    `
    UPDATE bikes SET
      brand = ?, model = ?, year = ?, color = ?,
      engine = ?, power = ?, torque = ?, weight = ?,
      top_speed = ?, mileage = ?, hero_video = ?,
      story_en = ?, story_fr = ?, story_ro = ?,
      photos = ?, updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(
    brand || existing.brand,
    model || existing.model,
    year ? parseInt(year, 10) : existing.year,
    color !== undefined ? color : existing.color,
    engine !== undefined ? engine : existing.engine,
    power !== undefined ? power : existing.power,
    torque !== undefined ? torque : existing.torque,
    weight !== undefined ? weight : existing.weight,
    top_speed !== undefined ? top_speed : existing.top_speed,
    mileage !== undefined ? mileage : existing.mileage,
    hero_video !== undefined ? hero_video : existing.hero_video,
    story_en !== undefined ? story_en : existing.story_en,
    story_fr !== undefined ? story_fr : existing.story_fr,
    story_ro !== undefined ? story_ro : existing.story_ro,
    photosJson,
    req.params.id,
  );

  const bike = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  bike.photos = JSON.parse(bike.photos || "[]");
  res.json(bike);
}

function setActive(req, res) {
  const bike = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  // Deactivate all, then activate the selected one
  db.exec("UPDATE bikes SET is_active = 0");
  db.prepare("UPDATE bikes SET is_active = 1 WHERE id = ?").run(req.params.id);

  const updated = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  updated.photos = JSON.parse(updated.photos || "[]");
  res.json(updated);
}

function remove(req, res) {
  const bike = db
    .prepare("SELECT * FROM bikes WHERE id = ?")
    .get(req.params.id);
  if (!bike) {
    return res.status(404).json({ error: "Bike not found" });
  }

  db.prepare("DELETE FROM bikes WHERE id = ?").run(req.params.id);
  res.json({ message: "Deleted" });
}

module.exports = {
  getActive,
  getAll,
  getOne,
  create,
  update,
  setActive,
  remove,
  uploadPhoto,
};

async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const filename = await processBikePhoto(req.file.buffer);
    // Return a URL the frontend can store directly as a photo entry
    res.json({ url: `/uploads/bike-photos/${filename}` });
  } catch (err) {
    res.status(400).json({ error: err.message || "Upload failed" });
  }
}
