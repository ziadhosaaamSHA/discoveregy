import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { Button, EmptyState, LoadingState, Modal, PageBackButton } from "../../../../components/ui";
import { GuideCard } from "./components/GuideCard";
import { useAvailableGuides } from "./hooks/useAvailableGuides";

// AvailableGuides lists bookable guides and starts guide chat or booking actions.
export default function AvailableGuides() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const handleSuccessClose = () => {
    closeSuccessModal();
    navigate("/tourist/home");
  };
  const {
    guides,
    selectedGuide,
    isSuccessModalOpen,
    isLoadingGuides,
    isBookingGuide,
    guidesError,
    bookGuide,
    chatWithGuide,
    closeSuccessModal,
  } = useAvailableGuides({
    language,
    onChatReady: (conversationId) => navigate(`/chats/${conversationId}`),
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto py-10">
          <div className="flex items-center gap-6 mb-12">
            <PageBackButton onClick={() => navigate(-1)} />
            <h1 className="text-5xl font-black text-black tracking-tight">
              {t("availableGuides.title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {isLoadingGuides ? (
              <LoadingState>{t("common.loading") || "Loading..."}</LoadingState>
            ) : guidesError ? (
              <EmptyState tone="error">{t("availableGuides.errorLoading")}</EmptyState>
            ) : guides.length === 0 ? (
              <EmptyState>{t("availableGuides.noGuides")}</EmptyState>
            ) : (
              guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onBook={bookGuide}
                  onChat={chatWithGuide}
                  language={language}
                  isBooking={isBookingGuide && selectedGuide?.id === guide.id}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isSuccessModalOpen} 
        onClose={handleSuccessClose}
        title={t("availableGuides.successTitle")}
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-green-600" strokeWidth={3} />
        </div>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {t("availableGuides.successBody", { name: selectedGuide?.name[language] || selectedGuide?.name.en })}
        </p>
        <Button type="button" size="lg" fullWidth onClick={handleSuccessClose}>
          {t("availableGuides.goTrips")}
        </Button>
      </Modal>

    </div>
  );
}
