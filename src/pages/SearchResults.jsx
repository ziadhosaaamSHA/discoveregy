import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ArrowRight } from "lucide-react";
import { DESTINATIONS } from "../data/destinations";
import { useLanguage } from "../context/LanguageContext";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { t, language, isRTL } = useLanguage();

  const filteredDestinations = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return DESTINATIONS;
    
    return DESTINATIONS.filter((dest) => {
      const en = dest.copy.en;
      const ar = dest.copy.ar;
      
      return en.name.toLowerCase().includes(lowerQuery) || 
             en.location.toLowerCase().includes(lowerQuery) || 
             ar.name.toLowerCase().includes(lowerQuery) || 
             ar.location.toLowerCase().includes(lowerQuery);
    });
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("common.close")}
          >
            {isRTL ? <ArrowRight size={20} className="text-secondary" /> : <ArrowLeft size={20} className="text-secondary" />}
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className={`flex items-center bg-gray-100 rounded-full px-4 py-3 gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search size={20} className="text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className={`bg-transparent border-none outline-none text-base flex-1 text-gray-800 placeholder:text-muted ${isRTL ? 'text-right' : 'text-left'}`}
                aria-label={t("search.ariaLabel")}
                autoFocus
              />
            </div>
          </form>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <p className="text-muted text-sm mb-6">
          {t("search.resultsFound", { 
            count: filteredDestinations.length, 
            suffix: filteredDestinations.length !== 1 ? (language === 'ar' ? 'ات' : 's') : "",
            query: query ? ` ${isRTL ? 'لـ' : 'for'} "${query}"` : ""
          })}
        </p>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredDestinations.map((dest, i) => {
              const data = dest.copy[language] || dest.copy.en;
              return (
                <motion.div
                  key={dest.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                >
                  <Link
                    to={`/destination/${dest.id}`}
                    className="group block"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100">
                      <img
                        src={dest.image}
                        alt={data.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        width={200}
                        height={200}
                      />
                    </div>
                    <p className="text-sm font-medium text-secondary truncate">
                      {data.name}
                    </p>
                    <p className="text-xs text-muted truncate">{data.location}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted text-lg mb-2">{t("search.noResultsTitle")}</p>
            <p className="text-muted text-sm">
              {t("search.noResultsHint")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
