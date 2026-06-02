import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder, dir, className = "" }) {
  return (
    <div className={`flex items-center bg-[#e8cfb0] rounded-2xl px-6 py-4 shadow-sm border border-black/5 focus-within:border-black/20 transition-all ${className}`} dir={dir}>
      <Search size={22} className="text-black/50" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-lg outline-none text-black placeholder-black/30 px-4 font-medium"
      />
    </div>
  );
}
