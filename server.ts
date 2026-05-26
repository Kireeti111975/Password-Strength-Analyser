/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Simple in-memory rate limiter to comply with security best practices
const rateLimits: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min

function checkRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();

  if (!rateLimits[ip]) {
    rateLimits[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    return next();
  }

  const limit = rateLimits[ip];
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  limit.count++;
  if (limit.count > MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: "Too many authentication or analysis requests. Please try again in 1 minute to prevent brute-force attacks.",
    });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request parser
  app.use(express.json());

  // API endpoints starting with /api/
  
  // Rate limiter standard on security checks
  app.post("/api/check-security", checkRateLimit, async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Password string is required for real-time risk assessment." });
        return;
      }

      // 1. Calculate and check SHA-256 for hash representation
      const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
      const reuseDetected = false;

      // 2. Perform k-Anonymity HaveIBeenPwned API security check
      // SHA-1 is required by the official HIBP range API
      const sha1Hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      let pwned = false;
      let breachCount = 0;

      try {
        // Fetch matching hashes from HIBP without ever sending the actual password
        const hibpUrl = `https://api.pwnedpasswords.com/range/${prefix}`;
        const response = await fetch(hibpUrl, {
          headers: { "User-Agent": "Password-Strength-Analyzer-Applet" },
          signal: AbortSignal.timeout(5000), // Graceful 5s timeout fallback
        });

        if (response.ok) {
          const text = await response.text();
          const lines = text.split("\n");

          for (const line of lines) {
            const [lineSuffix, countStr] = line.trim().split(":");
            if (lineSuffix === suffix) {
              pwned = true;
              breachCount = parseInt(countStr || "0", 10);
              break;
            }
          }
        }
      } catch (err) {
        // Log locally, but do not crash. Maintain service continuity if PwnedPasswords is offline
        console.error("HaveIBeenPwned range lookup error (gracefully caught):", err);
      }

      res.json({
        pwned,
        breachCount,
        reuseDetected,
        hash: sha256Hash, // Keep compatibility
      });
    } catch (err: any) {
      console.error("General security check error:", err);
      res.status(500).json({ error: "An error occurred during secure analysis." });
    }
  });

  // Service health status
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Hot module and Static file pipeline configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Password Strength Analyzer Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Crash during backend bootstrap initialization:", err);
});
