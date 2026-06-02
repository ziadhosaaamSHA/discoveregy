export function LoadingState({ children = "Loading...", className = "", variant = "card" }) {
  if (variant === "page") {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#f8f3ea] px-6 ${className}`}>
        <p className="text-gray-600 font-bold italic">{children}</p>
      </div>
    );
  }

  return (
    <div className={`col-span-full py-14 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10 ${className}`}>
      <p className="text-gray-600 font-bold italic">{children}</p>
    </div>
  );
}
