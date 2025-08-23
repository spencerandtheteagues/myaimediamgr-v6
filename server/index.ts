import express from "express";
import session from "express-session";
import passport from "passport";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authRouter, replitAuth } from "./replitAuth";
import { registerRoutes } from "./routes";
import { initializeStorage } from "./gcloud-ai";
import { viteMiddleware } from "./vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const MemoryStoreInstance = MemoryStore(session);

// --- MIDDLEWARE SETUP (Preserved from original) ---
app.use(express.json());
initializeStorage();

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: process.env.DATABASE_URL
      ? new (connectPgSimple(session))({ conString: process.env.DATABASE_URL })
      : new MemoryStoreInstance({ checkPeriod: 86400000 }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRouter);
app.use(replitAuth);

// --- API ROUTES (Preserved from original) ---
registerRoutes(app);

// --- STATIC FILE SERVING (Corrected logic from fix pack) ---
const publicDir = path.resolve(__dirname, "..", "dist", "public");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(publicDir));
}

// --- SPA FALLBACK (Corrected logic from fix pack) ---
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// --- SERVER STARTUP ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
