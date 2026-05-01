import express from "express";
import path from "path";
import { runAgent } from "./llm";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API endpoint the frontend will call
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    const answer = await runAgent(message);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});