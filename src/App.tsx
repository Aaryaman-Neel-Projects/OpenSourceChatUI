import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dropdown from "./components/Dropdown";
import TaskInput from "./components/TaskInput";
import PromptEditor from "./components/PromptEditor";
import ChatMessage from "./components/ChatMessage";

// --- MODIFIED: Added model property ---
type Message = { id: string; role: "user" | "assistant"; content: string; model?: string };

const promptTemplates: Record<string, (task: string) => string> = {
  Freeform: (task) => task || "",
  JSON: (task) =>
    `{\n  "instruction": "Analyze the following input and provide a concise response.",\n  "input": "${task}",\n  "output_format": "text"\n}`,
  XML: (task) =>
    `<prompt>\n  <instruction>Analyze the following input and provide a concise response.</instruction>\n  <input>${task}</input>\n  <format>text</format>\n</prompt>`,
  Markdown: (task) => `# Input\n${task}\n\n**Task:** Respond to the input above.`,
  YAML: (task) => `instruction: "Respond to the input data"\ndata: "${task}"\noutput_format: "text"`,
};

const models = [
  "Llama3:latest",     
  "Mistral:latest",    
  "Phi3:latest",       
  "Gemma:2b",          
  "Codellama:7b"      
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [task, setTask] = useState(localStorage.getItem("task") || "");
  const [promptType, setPromptType] = useState(
    localStorage.getItem("promptType") || "Freeform"
  );
  const [input, setInput] = useState(
    localStorage.getItem("promptContent") || ""
  );
  const [model, setModel] = useState(
    localStorage.getItem("model") || models[0]
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("task", task);
    localStorage.setItem("promptType", promptType);
    localStorage.setItem("promptContent", input);
    localStorage.setItem("model", model);
  }, [task, promptType, input, model]);

  const generateTemplate = () => {
    const templateFn = promptTemplates[promptType];
    setInput(templateFn(task));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: uid(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    const assistantId = uid();
    
    // --- MODIFIED: Pass the model name to the message object ---
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "", model: model }]);
    
    setLoading(true);

    try {
      let url = "/api/ollama";
      const parts = model.split(":"); 
      const modelNameWithTag = parts.slice(1).join(':').toLowerCase(); 
      const body = { model: modelNameWithTag, prompt: input };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.body) {
        const text = await res.text();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: text } : msg
          )
        );
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value);
          // This .map preserves the 'model' property on the message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: acc } : msg
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "⚠️ Error fetching response." }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-semibold">
      <Header />
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="md:w-1/3 flex flex-col gap-4">
          
          <Dropdown
            label="Prompt Type"
            options={Object.keys(promptTemplates)}
            selected={promptType}
            onChange={(v) => {
              setPromptType(v);
              setInput(promptTemplates[v](task));
            }}
          />
          <Dropdown
            label="Model"
            options={models}
            selected={model}
            onChange={setModel}
          />
          <TaskInput
            value={task}
            onChange={setTask}
            onGenerate={generateTemplate}
          />
          <PromptEditor value={input} onChange={setInput} />
          
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`mt-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generating..." : "Send"}
          </button>
        </div>

        <div className="flex-1 bg-zinc-900 rounded-xl p-4 overflow-y-auto border border-zinc-800">
          <h2 className="text-lg font-bold mb-3 text-red-400">
            Chat Transcript
          </h2>
          <div className="space-y-3">
            {/* --- MODIFIED: Pass model prop to ChatMessage --- */}
            {messages.map((m) => (
              <ChatMessage key={m.id} role={m.role} content={m.content} model={m.model} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}