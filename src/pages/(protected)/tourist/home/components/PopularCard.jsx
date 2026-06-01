import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../../context/LanguageContext";
import { resolveApiAssetUrl } from "../../../../../services/api-client";
import { fadeUp, TOURISM_BASE_URL } from "./homeCards";

// PopularCard renders one horizontally scrolling popular destination tile.
export function PopularCard({ dest, index }) {
  const { language } = useLanguage();
  const data = dest.copy[language] || dest.copy.en;

  return (
    <motion.div {...fadeUp(index * 0.7)} className="snap-start shrink-0 w-[260px] sm:w-[300px]">
      <Link to={`/tourist/destination/${dest.id}`} className="block group">
        <div className="relative h-[155px] rounded-[16px] overflow-hidden">
          <img
            src={resolveApiAssetUrl(TOURISM_BASE_URL + dest.image)}
            alt={data.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <p className="absolute bottom-2.5 left-3 right-3 text-white text-[13px] font-semibold line-clamp-1">
            {data.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
