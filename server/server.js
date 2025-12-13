import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/tmsind", async (req, res) => {
  try {
    const response = await fetch("https://industry.sports.gov.taipei/opendata/tmsind.json");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy抓取資料失敗" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));


// npm install express
// node server/server.js
// npm install node-fetch
// npm install cors



