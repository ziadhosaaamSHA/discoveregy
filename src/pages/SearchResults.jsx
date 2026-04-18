import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { DESTINATIONS } from "../data/destinations";

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

  const filteredDestinations = useMemo(() => {
    if (!query.trim()) return DESTINATIONS;
    const lowerQuery = query.toLowerCase();
    return DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(lowerQuery) ||
        dest.location.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 gap-3">
              <Search size={20} className="text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations..."
                className="bg-transparent border-none outline-none text-base flex-1 text-gray-800 placeholder:text-muted"
                aria-label="Search destinations"
                autoFocus
              />
            </div>
          </form>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <p className="text-muted text-sm mb-6">
          {filteredDestinations.length} destination
          {filteredDestinations.length !== 1 ? "s" : ""} found
          {query && ` for "${query}"`}
        </p>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredDestinations.map((dest, i) => (
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
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="text-sm font-medium text-secondary truncate">
                    {dest.name}
                  </p>
                  <p className="text-xs text-muted truncate">{dest.location}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted text-lg mb-2">No destinations found</p>
            <p className="text-muted text-sm">
              Try searching for "Luxor", "Cairo", or "Pyramids"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
