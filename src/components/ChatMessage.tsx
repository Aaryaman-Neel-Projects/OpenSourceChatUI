// --- MODIFIED: Add model to Props ---
type Props = { role: "user" | "assistant"; content: string; model?: string };

export default function ChatMessage({ role, content, model }: Props) {
  
  // --- MODIFIED: Logic to determine the display name ---
  let displayName = "You";
  if (role === "assistant") {
    if (model) {
      // model string is like "Ollama:llama3:latest"
      const parts = model.split(":"); // ["Ollama", "llama3", "latest"]
      const name = parts[1]; // "llama3"
      // Capitalize the first letter
      displayName = name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      displayName = "Assistant"; // Fallback
    }
  }

  return (
    <div
      className={`p-3 rounded-lg ${
        role === "user" ? "bg-red-900/40 text-red-300" : "bg-zinc-800 text-white"
      }`}
    >
      {/* --- MODIFIED: Use displayName --- */}
      <strong>{displayName}:</strong> {content}
    </div>
  );
}