import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (Only server-side)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

interface EntryLog {
  id: string;
  day: number;
  action: "create" | "update" | "delete";
  timestamp: string; // Server time
  clientTimestamp: string;
}

// In-memory backend time logs store
const backendTimeLogs: EntryLog[] = [];

// Route to record a secure backend time log
app.post("/api/logs", (req, res) => {
  try {
    const { day, action, clientTimestamp } = req.body;
    if (day === undefined || !action) {
      return res.status(400).json({ error: "Missing day or action parameters" });
    }
    
    const log: EntryLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      day: Number(day),
      action,
      timestamp: new Date().toISOString(), // Accurate server-side timestamp
      clientTimestamp: clientTimestamp || new Date().toISOString()
    };
    
    backendTimeLogs.unshift(log); // Store most recent first
    console.log(`[BACKEND TIME LOG] Day ${day} was logged with action '${action}' at server-time: ${log.timestamp}`);
    res.json({ success: true, log });
  } catch (err: any) {
    console.error("Failed to write backend time log:", err);
    res.status(500).json({ error: err.message || "Failed to log action" });
  }
});

// Route to fetch backend logs
app.get("/api/logs", (req, res) => {
  res.json({ logs: backendTimeLogs });
});

// Soulful reflection API route for Finding Khushboo Sanctum
app.post("/api/soulful-prompt", async (req, res) => {
  try {
    const { day, dietExceptionsUsed, workFocus, creativeOutput, writeDuration, readPages, earnings } = req.body;
    
    const prompt = `You are a warm, soulful, introspective mindfulness coach guiding a woman named Khushboo through her 100-day self-cultivation journey. 
She is currently on Day ${day || 14} / 100.
Here are her tracking metrics for today:
- Diet Exceptions Used today: ${dietExceptionsUsed ?? 2} (Remaining exceptions out of 9 total capacity are ${9 - (dietExceptionsUsed ?? 2)})
- Work Focus: ${workFocus || "Case Study: UX Audits"}
- Creative Output: "${creativeOutput || "Keep painting, let it flow."}"
- Writing Duration: ${writeDuration || 45} mins
- Pages read today: ${readPages || 10}
- Earnings added today: ₹${earnings || 500}

Write a short, soulful, lyrical reflection (max 3-4 sentences/150 words) addressing her as Khushboo. Speak of her daily essence (themed around scent/blossoming/inner flow of 'Khushboo', which means fragrance/essence in Hindi). Encourage her to keep writing, creating, or resting. Give her a mindful quote of the day. 
Adopt a calm, minimalist aesthetic tone. Do not use markdown bullet lists, keep it as two elegant paragaraphs. No hype.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 1.0,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate soulful reflection" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static server mapped.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
