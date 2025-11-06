type Props = {
  value: string;
  onChange: (val: string) => void;
  onGenerate: () => void;
};

export default function TaskInput({ value, onChange, onGenerate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-red-400 text-sm">Task / Prompt</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900 border border-red-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-20"
        placeholder="Describe what you want the model to do..."
      />
      <button
        onClick={onGenerate}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 rounded-lg transition"
      >
        Generate Template
      </button>
    </div>
  );
}