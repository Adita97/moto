const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/db");
const logger = require("../config/logger");
const tokenService = require("../services/token.service");

async function login(req, res) {
  const { username, password } = req.body;
  const ip = req.ip;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) {
    logger.info("login_failure", { ip, username });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    logger.info("login_failure", { ip, username });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const family = uuidv4();
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user, family);

  tokenService.storeRefreshToken(user.id, refreshToken, family);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  logger.info("login_success", { ip, username });

  res.json({
    accessToken,
    user: { id: user.id, username: user.username },
  });
}

async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  const decoded = tokenService.verifyRefreshToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const storedToken = tokenService.findRefreshToken(token);
  if (!storedToken) {
    return res.status(401).json({ error: "Refresh token not found" });
  }

  // Reuse detection
  if (storedToken.used === 1) {
    logger.warn("refresh_token_reuse_detected", {
      family: storedToken.family,
      userId: storedToken.user_id,
    });
    tokenService.invalidateFamily(storedToken.family);
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(401).json({ error: "Token reuse detected" });
  }

  // Check expiry
  if (new Date(storedToken.expires_at) < new Date()) {
    return res.status(401).json({ error: "Refresh token expired" });
  }

  // Mark old token as used
  tokenService.markTokenUsed(storedToken.token_hash);

  // Get user
  const user = db
    .prepare("SELECT id, username FROM users WHERE id = ?")
    .get(decoded.sub);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Generate new tokens (rotation)
  const newAccessToken = tokenService.generateAccessToken(user);
  const newRefreshToken = tokenService.generateRefreshToken(
    user,
    storedToken.family,
  );
  tokenService.storeRefreshToken(user.id, newRefreshToken, storedToken.family);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  res.json({
    accessToken: newAccessToken,
    user: { id: user.id, username: user.username },
  });
}

async function logout(req, res) {
  const token = req.cookies?.refreshToken;
  if (token) {
    tokenService.invalidateToken(token);
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  logger.info("logout", { ip: req.ip });
  res.json({ message: "Logged out" });
}

module.exports = { login, refresh, logout };
