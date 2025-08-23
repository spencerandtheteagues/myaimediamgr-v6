import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import passport from "passport";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";

import { authRouter, replitAuth } from "./replitAuth";
import { registerRoutes } from "./routes";
import { initializeStorage } from "./gcloud-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const MemoryStoreInstance = MemoryStore(session);

// --- MIDDLEWARE ---
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

// --- STATIC & API ROUTES ---
const publicDir = path.resolve(__dirname, "..", "dist", "public");
app.use(express.static(publicDir));

registerRoutes(app);

// --- SPA FALLBACK ---
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// --- SERVER STARTUP ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
