import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { TOKEN_SECRET } from "./config";

// auth middleware
export const authRequest = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];
  if (!signature) {
    return res.status(401).json({ error: "Missing HMAC signature" });
  }
  const hmac = createSignature(timestamp as string);
  if (signature !== hmac) {
    return res.status(401).json({ error: "Invalid HMAC signature" });
  }
  next();
};

// create HMAC
const createSignature = (payload: string) => {
  return crypto
    .createHmac("sha256", TOKEN_SECRET as string)
    .update(payload)
    .digest("hex");
};
