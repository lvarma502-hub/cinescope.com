import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🗂️ Public folder serve करो
app.use(express.static(path.join(__dirname, "public")));

// 🧭 Sitemap और Robots routes manually add करो
app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "robots.txt"));
});

// 🌐 Default route (home page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🚀 Local server run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
