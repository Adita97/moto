const { db } = require("../config/db");
const { processImage, deleteThumbnail } = require("../services/upload.service");
const { v4: uuidv4 } = require("uuid");

function extractYoutubeId(url) {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match ? match[1] : null;
}

function getAll(req, res) {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = Math.min(parseInt(req.query.limit, 10) || 9, 50);

  const videos = db
    .prepare("SELECT * FROM videos ORDER BY published_at DESC LIMIT ? OFFSET ?")
    .all(limit + 1, offset);

  const hasMore = videos.length > limit;
  if (hasMore) videos.pop();

  const total = db.prepare("SELECT COUNT(*) as count FROM videos").get().count;

  res.json({ videos, total, hasMore });
}

function getOne(req, res) {
  const video = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }
  res.json(video);
}

async function create(req, res) {
  const {
    youtube_url,
    title_en,
    title_fr,
    title_ro,
    desc_en,
    desc_fr,
    desc_ro,
  } = req.body;

  const youtube_id = extractYoutubeId(youtube_url);
  if (!youtube_id) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  let thumbnail = null;
  if (req.file) {
    thumbnail = await processImage(req.file.buffer);
  }

  const id = uuidv4().replace(/-/g, "");
  db.prepare(
    `
    INSERT INTO videos (id, youtube_url, youtube_id, title_en, title_fr, title_ro, desc_en, desc_fr, desc_ro, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    youtube_url,
    youtube_id,
    title_en,
    title_fr,
    title_ro,
    desc_en || null,
    desc_fr || null,
    desc_ro || null,
    thumbnail,
  );

  const video = db.prepare("SELECT * FROM videos WHERE id = ?").get(id);
  res.status(201).json(video);
}

async function update(req, res) {
  const existing = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Video not found" });
  }

  const {
    youtube_url,
    title_en,
    title_fr,
    title_ro,
    desc_en,
    desc_fr,
    desc_ro,
  } = req.body;

  const youtube_id = extractYoutubeId(youtube_url || existing.youtube_url);

  let thumbnail = existing.thumbnail;
  if (req.file) {
    deleteThumbnail(existing.thumbnail);
    thumbnail = await processImage(req.file.buffer);
  }

  db.prepare(
    `
    UPDATE videos SET
      youtube_url = ?, youtube_id = ?,
      title_en = ?, title_fr = ?, title_ro = ?,
      desc_en = ?, desc_fr = ?, desc_ro = ?,
      thumbnail = ?, updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(
    youtube_url || existing.youtube_url,
    youtube_id,
    title_en || existing.title_en,
    title_fr || existing.title_fr,
    title_ro || existing.title_ro,
    desc_en !== undefined ? desc_en : existing.desc_en,
    desc_fr !== undefined ? desc_fr : existing.desc_fr,
    desc_ro !== undefined ? desc_ro : existing.desc_ro,
    thumbnail,
    req.params.id,
  );

  const video = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(req.params.id);
  res.json(video);
}

function remove(req, res) {
  const video = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  deleteThumbnail(video.thumbnail);
  db.prepare("DELETE FROM videos WHERE id = ?").run(req.params.id);

  res.json({ message: "Deleted" });
}

module.exports = { getAll, getOne, create, update, remove };
