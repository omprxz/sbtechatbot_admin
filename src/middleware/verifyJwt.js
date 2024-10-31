// src/middleware/verifyJwt.js

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyJwt(req) {
  const token = req.cookies.get("token")?.value || req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return { isValid: false, message: "Authentication token is required" };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { isValid: true, user: decoded };
  } catch (error) {
    return { isValid: false, message: "Invalid or expired token" };
  }
}
