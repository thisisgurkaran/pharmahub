import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = Number(process.env.DATABRICKS_APP_PORT || 8000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If you use CRA, change "dist" -> "build"
const staticDir = path.join(__dirname, "dist");

app.use(express.static(staticDir));
app.get("*", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Web server listening on 0.0.0.0:${port}`);
});
