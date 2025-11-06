type Props = { value: string; onChange: (val: string) => void };

export default function PromptEditor({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-bold text-red-400 text-sm">Prompt Editor</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900 border border-red-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-40"
      />
    </div>
  );
}