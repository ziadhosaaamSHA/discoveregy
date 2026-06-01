import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../../context/LanguageContext";
import { resolveApiAssetUrl } from "../../../../../services/api-client";
import { fadeUp, TOURISM_BASE_URL } from "./homeCards";

// ActivityCard presents one featured destination with alternating image placement.
export function ActivityCard({ dest, index }) {
  const { language, t, isRTL } = useLanguage();
  const data = dest.copy[language] || dest.copy.en;
  const isLeft = index % 2 === 0;
  const cardRadius = isLeft
    ? index === 0 ? "0 90px 0 90px" : "90px 0 90px 0"
    : index === 1 ? "90px 0 90px 0" : "0 90px 0 90px";
  const imgRadius = isLeft
    ? index === 0 ? "0 90px 0 0" : "90px 0 0 0"
    : index === 1 ? "0px 0 0px 0" : "0 0px 0 0px";

  return (
    <motion.article
      {...fadeUp(index)}
      className="overflow-hidden flex h-[240px]"
      style={{
        borderRadius: cardRadius,
        border: "1px solid #211C1C",
        boxShadow: "4px 0 50px 0 rgba(0, 0, 0, 0.25)",
        direction: isRTL ? "rtl" : "ltr",
        backgroundColor: "#F2E0CA",
      }}
    >
      <div className={`flex flex-col justify-between p-6 flex-1 min-w-0 ${isLeft ? "order-1" : "order-2"}`}>
        <div>
          <h3 className="text-[17px] font-bold text-black mb-2 leading-snug">{data.name}</h3>
          <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-5">{data.description}</p>
        </div>
        <div className="flex justify-center">
          <Link
            to={`/tourist/destination/${dest.id}`}
            className="inline-flex items-center justify-center px-5 py-2 bg-[#E8A020] text-white text-[13px] font-semibold rounded-xl hover:brightness-110 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            {t("destination.details")}
          </Link>
        </div>
      </div>

      <div className={`w-[210px] shrink-0 ${isLeft ? "order-2" : "order-1"}`}>
        <img
          src={resolveApiAssetUrl(dest.image)}
          alt={data.name}
          className="w-full h-full object-cover"
          style={{ borderRadius: imgRadius }}
          loading="lazy"
        />
      </div>
    </motion.article>
  );
}
