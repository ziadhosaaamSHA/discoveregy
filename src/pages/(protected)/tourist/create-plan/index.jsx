import { useNavigate } from "react-router-dom";
import { Search, Loader2, Plus, Check, XCircle } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { motion } from "framer-motion";
import GeneratedPlans from "./components/GeneratedPlans";
import EditPlan from "./components/EditPlan";
import { formatAmount } from "../../../../shared/utils/money";
import { Button, Modal, PageBackButton, PaymentConfirmationModal } from "../../../../components/ui";
import { TIME_OPTIONS, useCreatePlan } from "./hooks/useCreatePlan";

// CreatePlan builds a custom travel plan from selected destinations and trip timing.
export default function CreatePlan() {
  const navigate = useNavigate();
  const { isRTL, language, t } = useLanguage();
  const {
    bookingDate,
    bookingToConfirm,
    customDestinations,
    customPlanAmount,
    durationHours,
    filteredAvailableDestinations,
    generatedPlans,
    hasValidBookingDetails,
    isDurationFilled,
    isEditMode,
    isGenerating,
    isSubmittingPlan,
    prompt,
    saveStatus,
    searchQuery,
    selectedPlan,
    showAddDestinations,
    startTime,
    parsedDurationHours,
    addDestination,
    closeSaveStatus,
    confirmCustomPlan,
    generatePlans,
    removeDestination,
    selectPlan,
    setBookingToConfirm,
    setDurationHours,
    setIsEditMode,
    setPrompt,
    setSearchQuery,
    setShowAddDestinations,
    setStartTime,
    submitCustomPlan,
  } = useCreatePlan({ language, navigate, t });
  return (
    <div className="min-h-screen bg-[#ead9c5] text-black font-sans pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <header className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PageBackButton onClick={() => navigate(-1)} className="bg-transparent shadow-none hover:bg-black/5" />
            <h1 className="text-3xl font-black tracking-tight">{t("createPlan.title") || "Create Plan"}</h1>
          </div>
          <img src="/images/DiscoverEgyptLogo.png" alt="Discover Egypt" className="h-16 w-auto" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="relative mb-12">
          <div className="bg-[#dcd0bf] rounded-3xl flex items-center px-6 py-5 shadow-inner border border-black/5 group focus-within:ring-2 ring-[#e67e22]/30 transition-all">
            <Search className={isRTL ? "ml-4" : "mr-4"} size={26} style={{ color: "#5d4037" }} />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generatePlans()}
              placeholder={t("createPlan.placeholder")}
              className="bg-transparent border-none outline-none text-2xl text-gray-800 w-full font-black placeholder-gray-500"
            />
            <Button
              type="button"
              onClick={generatePlans}
              disabled={isGenerating}
              className={`${isRTL ? "mr-4" : "ml-4"} min-w-[140px]`}
            >
              {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : t("createPlan.generate")}
            </Button>
          </div>
        </div>

        {generatedPlans.length > 0 && !isEditMode && (
          <GeneratedPlans generatedPlans={generatedPlans} onSelectPlan={selectPlan} isRTL={isRTL} prompt={prompt} t={t} />
        )}

        {isEditMode && selectedPlan && (
          <EditPlan
            selectedPlan={selectedPlan}
            setIsEditMode={setIsEditMode}
            isRTL={isRTL}
            language={language}
            t={t}
            customDestinations={customDestinations}
            handleRemoveDest={removeDestination}
            setShowAddDestinations={setShowAddDestinations}
            showAddDestinations={showAddDestinations}
            filteredAvailableDestinations={filteredAvailableDestinations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleAddDest={addDestination}
            bookingDate={bookingDate}
            TIME_OPTIONS={TIME_OPTIONS}
            startTime={startTime}
            setStartTime={setStartTime}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            isDurationFilled={isDurationFilled}
            navigate={navigate}
            handleSubmit={submitCustomPlan}
            isSubmittingPlan={isSubmittingPlan}
            hasValidBookingDetails={hasValidBookingDetails}
            customPlanAmount={customPlanAmount}
          />
        )}

        {!generatedPlans.length && (
          <div className="py-32 text-center animate-in fade-in duration-1000">
            <div className="mb-8 flex justify-center">
               <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center border-4 border-white/50">
                  <Plus size={64} className="text-white opacity-50" />
               </div>
            </div>
            <p className="text-3xl font-black text-white/50 italic max-w-2xl mx-auto leading-relaxed">
              {t("createPlan.emptyState")}
            </p>
          </div>
        )}
      </main>
      <PaymentConfirmationModal
        isOpen={!!bookingToConfirm}
        onClose={() => setBookingToConfirm(null)}
        title={t("booking.confirmPaymentTitle") || "Confirm Payment"}
        itemTitle={bookingToConfirm?.selectedPlan.title || ""}
        subtitle={`${customDestinations.length} ${language === "ar" ? "أماكن" : "places"}`}
        amountLabel={t("booking.amountDue")}
        amount={bookingToConfirm ? formatAmount(bookingToConfirm.amount, language) : ""}
        details={[
          { label: t("createPlan.dateLabel") || "Date", value: bookingDate },
          { label: t("createPlan.startTimeLabel") || "Time", value: startTime },
          { label: t("createPlan.durationLabel") || "Duration", value: `${parsedDurationHours} ${t("createPlan.hours")}` },
        ]}
        message={
          bookingToConfirm
            ? t("booking.confirmPaymentBody", { amount: formatAmount(bookingToConfirm.amount, language) })
            : ""
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("booking.confirmAndPay")}
        loadingLabel={t("booking.submitting")}
        isLoading={isSubmittingPlan}
        isRTL={isRTL}
        onConfirm={confirmCustomPlan}
      />
      <Modal
        isOpen={saveStatus.isOpen}
        onClose={closeSaveStatus}
        title=""
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center p-4">
          {saveStatus.isSuccess ? (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100"
            >
              <Check size={40} className="text-green-600" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100"
            >
              <XCircle size={40} className="text-red-600" strokeWidth={2} />
            </motion.div>
          )}

          <h3 className="text-2xl font-black text-gray-800 mb-2">
            {saveStatus.isSuccess 
              ? (t("createPlan.planSavedTitle") || "Plan Saved!") 
              : (t("createPlan.planSaveFailed") || "Plan Save Failed")}
          </h3>

          <p className={`text-sm font-semibold mb-8 leading-relaxed max-w-[280px] ${saveStatus.isSuccess ? "text-gray-500" : "text-red-600"}`}>
            {saveStatus.message}
          </p>

          <Button
            type="button"
            onClick={closeSaveStatus}
            fullWidth
            className="py-4"
          >
            {saveStatus.isSuccess ? (t("availableGuides.title") || "Available Tour Guides") : (t("booking.done") || "Done")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
