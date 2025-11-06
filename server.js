// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- OLLAMA Proxy (Handles Streaming) ---
app.post("/api/ollama", async (req, res) => {
  const { model, prompt } = req.body;
  
  // Note: The 'model' variable here will contain the full model tag 
  // (e.g., "codellama:7b-instruct"), which Ollama expects.
  
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: true }),
    });

    if (!response.ok || !response.body) {
        const errorText = await response.text();
        // Propagate Ollama error status and message
        throw new Error(`Ollama API Error: ${response.status} - ${errorText}`);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    for await (const chunk of response.body) {
      const text = chunk.toString();
      try {
        // Ollama returns newline-separated JSON objects
        const json = JSON.parse(text);
        if (json.response) res.write(json.response);
      } catch {
        // In case of non-JSON data or incomplete chunk
        res.write(text);
      }
    }
    res.end();
  } catch (error) {
    console.error("Ollama Proxy Error:", error.message);
    // Send a helpful error message back to the client
    res.status(500).send(`⚠️ Server Error: Failed to generate response from Ollama. Ensure model '${model}' is installed and Ollama is running on port 11434. Details: ${error.message}`);
    return;
  }
});

app.listen(3001, () => console.log("🚀 Server running on http://localhost:3001"));