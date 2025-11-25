import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dropdown from "./components/Dropdown";
import TaskInput from "./components/TaskInput";
import PromptEditor from "./components/PromptEditor";
import ChatMessage from "./components/ChatMessage";

// --- MODIFIED: Added model property ---
type Message = { id: string; role: "user" | "assistant"; content: string; model?: string };

// --- NEW: Role Definitions (from prompts.chat) ---
const roles: Record<string, string> = {
  "None": "",
  "Linux Terminal": "I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations.",
  "English Translator": "I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English.",
  "Interviewer": "I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the position. I want you to only reply as the interviewer. Do not write all the conversation at once. Ask me the questions and wait for my answers.",
  "Travel Guide": "I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location. In some cases, I will also give you the type of places I will visit.",
  "Storyteller": "I want you to act as a storyteller. You will come up with entertaining stories that are engaging, imaginative and captivating for the audience.",
  "JavaScript Console": "I want you to act as a javascript console. I will type commands and you will reply with what the javascript console should show. I want you to only reply with the terminal output inside one unique code block, and nothing else."
};

// --- MODIFIED: Added One-Shot and Few-Shot templates ---
const promptTemplates: Record<string, (task: string) => string> = {
  Freeform: (task) => task || "",
  JSON: (task) =>
    `{\n  "instruction": "Analyze the following input and provide a concise response.",\n  "input": "${task}",\n  "output_format": "text"\n}`,
  XML: (task) =>
    `<prompt>\n  <instruction>Analyze the following input and provide a concise response.</instruction>\n  <input>${task}</input>\n  <format>text</format>\n</prompt>`,
  Markdown: (task) => `# Input\n${task}\n\n**Task:** Respond to the input above.`,
  YAML: (task) => `instruction: "Respond to the input data"\ndata: "${task}"\noutput_format: "text"`,
  
  // New Techniques
  "One-Shot": (task) => 
    `Instruction: Follow the pattern of the example below.\n\nInput: [Example Input]\nOutput: [Example Output]\n\nInput: "${task}"\nOutput:`,
  "Few-Shot": (task) => 
    `Instruction: Follow the pattern of the examples below.\n\nInput: [Example 1]\nOutput: [Result 1]\n\nInput: [Example 2]\nOutput: [Result 2]\n\nInput: [Example 3]\nOutput: [Result 3]\n\nInput: "${task}"\nOutput:`
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
  // --- NEW: Role State ---
  const [role, setRole] = useState(localStorage.getItem("role") || "None");
  
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
    localStorage.setItem("role", role); // Save role to local storage
  }, [task, promptType, input, model, role]);

  // --- MODIFIED: Combine Role + Template ---
  const generateTemplate = () => {
    const roleContent = roles[role] ? `Role: ${roles[role]}\n\n` : "";
    const templateFn = promptTemplates[promptType];
    const templateContent = templateFn(task);
    setInput(roleContent + templateContent);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: uid(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    const assistantId = uid();
    
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
          
          {/* --- NEW: Role Dropdown --- */}
          <Dropdown
            label="Act As (Role)"
            options={Object.keys(roles)}
            selected={role}
            onChange={(v) => {
              setRole(v);
              // Auto-regenerate if desired, or let user click generate
            }}
          />

          <Dropdown
            label="Prompt Structure"
            options={Object.keys(promptTemplates)}
            selected={promptType}
            onChange={(v) => {
              setPromptType(v);
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
            {messages.map((m) => (
              <ChatMessage key={m.id} role={m.role} content={m.content} model={m.model} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}