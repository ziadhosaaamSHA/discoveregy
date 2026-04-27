import { useNavigate } from "react-router-dom";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Plans() {
  const navigate = useNavigate();
  const { isRTL, t } = useLanguage();

  const plans = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800",
      text: "Lorem ipsum dolor sit amet,\nAenean et Lorem ipsum dolor sit\namet,..."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&q=80&w=800",
      text: "Lorem ipsum dolor sit amet,\nAenean et Lorem ipsum dolor sit\namet,..."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=800",
      text: "Lorem ipsum dolor sit amet,\nAenean et Lorem ipsum dolor sit\namet,..."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&q=80&w=800",
      text: "Lorem ipsum dolor sit amet,\nAenean et Lorem ipsum dolor sit\namet,..."
    }
  ];

  return (
    <div className="min-h-screen bg-[#ead9c5] px-4 py-5 text-black font-sans" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto relative px-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
            {isRTL ? <ChevronLeft size={28} strokeWidth={1.5} className="rotate-180" /> : <ChevronLeft size={28} strokeWidth={1.5} />}
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{t("plans.title")}</h1>
        </div>
        <button onClick={() => navigate("/create-plan")} className="hover:opacity-70 transition-opacity">
          <PlusCircle size={32} strokeWidth={1.5} />
        </button>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 px-2">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3">
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg border-2 border-black/5">
              <img 
                src={plan.image} 
                alt="Plan" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <p className="text-[15px] leading-snug font-medium whitespace-pre-line text-black px-1 mt-1">
              {plan.text} <span className="font-black cursor-pointer hover:underline text-black">{t("plans.seeMore")}</span>
            </p>
          </div>
        ))}
      </main>
    </div>
  );
}
