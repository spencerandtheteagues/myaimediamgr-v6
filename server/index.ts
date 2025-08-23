import express from "express";
import path from "node:path";

const app = express();

// process.cwd() is /app, as defined in the Dockerfile.
// The server serves files from /app/dist/public.
const publicDir = path.join(process.cwd(), "dist", "public");

app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(process.env.PORT || 8080, () => console.log("Server listening"));