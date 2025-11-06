type Props = {
  label: string;
  options: string[];
  selected: string;
  onChange: (val: string) => void;
};

export default function Dropdown({ label, options, selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-bold text-red-400 text-sm">{label}</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900 border border-red-700 text-white font-bold rounded-lg px-3 py-2 
                   focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none transition
                   hover:bg-zinc-800 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-900 text-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}