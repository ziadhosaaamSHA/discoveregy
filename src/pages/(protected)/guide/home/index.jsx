import { Link } from "react-router-dom";
import { MessageCircle, ClipboardList, Bell } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";

// GuideHome is the guide role landing page and links to active guide workflows.
export default function GuideHome() {
  const { t, isRTL } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f2e0ca] px-6 py-28 text-black" dir={isRTL ? "rtl" : "ltr"}>
      <section className="max-w-6xl mx-auto">
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-sm font-black uppercase tracking-widest text-[#d4800b]">
            {t("auth.guide") || "Guide"}
          </p>
          <h1 className="mt-3 text-4xl lg:text-5xl font-black">
            {t("common.home") || "Home"}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold text-black/60">
            {t("guide.home.description")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/requests"
            className="group rounded-[28px] bg-[#154d7d] p-6 shadow-xl border border-white/10 hover:brightness-110 transition-all"
          >
            <ClipboardList className="text-[#f2e0ca]" size={34} />
            <h2 className="mt-6 text-2xl font-black text-[#f2e0ca]">{t("requests.title")}</h2>
            <p className="mt-2 text-sm font-medium text-[#f2e0ca]/70">
              Review pending tourist requests and accepted trips.
            </p>
          </Link>

          <Link
            to="/chats"
            className="group rounded-[28px] bg-white/70 p-6 shadow-xl border border-black/5 hover:bg-white transition-all"
          >
            <MessageCircle className="text-[#154d7d]" size={34} />
            <h2 className="mt-6 text-2xl font-black text-[#154d7d]">{t("guide.chats.title")}</h2>
            <p className="mt-2 text-sm font-medium text-black/60">
              {t("guide.chats.description")}
            </p>
          </Link>

          <Link
            to="/notifications"
            className="group rounded-[28px] bg-white/70 p-6 shadow-xl border border-black/5 hover:bg-white transition-all"
          >
            <Bell className="text-[#d4800b]" size={34} />
            <h2 className="mt-6 text-2xl font-black text-[#154d7d]">{t("guide.notifications.title")}</h2>
            <p className="mt-2 text-sm font-medium text-black/60">
              {t("guide.notifications.description")}
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
