const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/db");
const env = require("../config/env");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, role: "admin" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

function generateRefreshToken(user, family) {
  const token = jwt.sign({ sub: user.id, family }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
  return token;
}

function storeRefreshToken(userId, token, family) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const id = uuidv4().replace(/-/g, "");

  db.prepare(
    `
    INSERT INTO refresh_tokens (id, user_id, token_hash, family, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(id, userId, tokenHash, family, expiresAt);
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

function findRefreshToken(token) {
  const tokenHash = hashToken(token);
  return db
    .prepare("SELECT * FROM refresh_tokens WHERE token_hash = ?")
    .get(tokenHash);
}

function markTokenUsed(tokenHash) {
  db.prepare("UPDATE refresh_tokens SET used = 1 WHERE token_hash = ?").run(
    tokenHash,
  );
}

function invalidateFamily(family) {
  db.prepare("DELETE FROM refresh_tokens WHERE family = ?").run(family);
}

function invalidateToken(token) {
  const tokenHash = hashToken(token);
  db.prepare("UPDATE refresh_tokens SET used = 1 WHERE token_hash = ?").run(
    tokenHash,
  );
}

function cleanExpiredTokens() {
  db.prepare(
    "DELETE FROM refresh_tokens WHERE expires_at < datetime('now')",
  ).run();
}

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  findRefreshToken,
  markTokenUsed,
  invalidateFamily,
  invalidateToken,
  cleanExpiredTokens,
};
