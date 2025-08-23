import express from "express";
import path from "path";

const app = express();
const cwd = process.cwd(); // ✅ not import.meta.url

const publicDir = path.join(cwd, "dist", "public");

// static files (app.css, assets/*, etc.)
app.use(express.static(publicDir, { maxAge: "1y", index: false }));

// SPA fallback → always send the built index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("listening on", port));
