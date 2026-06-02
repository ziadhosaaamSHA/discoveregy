import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { BookingSettings } from "./components/BookingSettings";
import { BookingStatusModal } from "./components/BookingStatusModal";
import { PlansGrid } from "./components/PlansGrid";
import { PlansHeader } from "./components/PlansHeader";
import { RecommendedDestinationBanner } from "./components/RecommendedDestinationBanner";
import { Button, Modal, PaymentConfirmationModal } from "../../../../components/ui";
import {
  formatAmount,
} from "./components/planUtils";
import { usePlans } from "./hooks/usePlans";

// Plans lets the user choose a generated or custom travel plan before booking.
export default function Plans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, language, t } = useLanguage();

  const queryParams = new URLSearchParams(location.search);
  const destId = queryParams.get("destId") ? Number(queryParams.get("destId")) : null;
  const {
    activeTab,
    setActiveTab,
    activePlan,
    activePlanId,
    bookingDate,
    bookingStatus,
    bookingToConfirm,
    contextDest,
    deleteError,
    deletingPlanId,
    destinationMap,
    displayedPlans,
    durationHours,
    hasValidBookingDetails,
    isPlansLoading,
    isSubmittingBooking,
    parsedDurationHours,
    planToDelete,
    plansError,
    startTime,
    confirmBooking,
    confirmDeletePlan,
    closeBookingStatus,
    requestDeletePlan,
    setBookingToConfirm,
    setDurationHours,
    setPlanToDelete,
    setSelectedPlanId,
    setStartTime,
    submitBooking,
    tripDetailsById,
  } = usePlans({ destId, language, navigate, t });

  return (
    <div className="min-h-screen bg-[#ead9c5] px-4 py-5 text-black font-sans pb-36" dir={isRTL ? "rtl" : "ltr"}>
      <PlansHeader
        isRTL={isRTL}
        navigate={navigate}
        title={t("plans.title")}
        createLabel={t("createPlan.title")}
        destId={destId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        t={t}
        language={language}
      />

      <RecommendedDestinationBanner destination={contextDest} language={language} isRTL={isRTL} t={t} />
      <div className="max-w-6xl mx-auto px-2">
        <main
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 overflow-y-auto max-h-[calc(100vh-360px)] pr-2 pb-8 scrollbar-thin"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#c59d75 transparent'
          }}
        >
          <PlansGrid
            plans={displayedPlans}
            destId={activeTab === "matching" ? destId : null}
            navigate={navigate}
            isLoading={isPlansLoading}
            plansError={plansError}
            activePlanId={activePlanId}
            tripDetailsById={tripDetailsById}
            destinationMap={destinationMap}
            deletingPlanId={deletingPlanId}
            isRTL={isRTL}
            language={language}
            t={t}
            onSelectPlan={setSelectedPlanId}
            onDeletePlan={requestDeletePlan}
          />
        </main>
      </div>

      <BookingSettings
        bookingDate={bookingDate}
        durationHours={durationHours}
        startTime={startTime}
        isSubmittingBooking={isSubmittingBooking}
        hasValidBookingDetails={hasValidBookingDetails}
        destId={destId}
        navigate={navigate}
        t={t}
        onDurationChange={setDurationHours}
        onStartTimeChange={setStartTime}
        onSubmit={submitBooking}
        activePlan={activePlan}
        language={language}
      />

      <BookingStatusModal bookingStatus={bookingStatus} t={t} onClose={closeBookingStatus} />

      <PaymentConfirmationModal
        isOpen={!!bookingToConfirm}
        onClose={() => setBookingToConfirm(null)}
        title={t("booking.confirmPaymentTitle") || "Confirm Payment"}
        itemTitle={bookingToConfirm?.planData.title || ""}
        subtitle={
          bookingToConfirm?.selectedPlan.guideName
            ? `${t("booking.withGuide") || "With Guide"}: ${bookingToConfirm.selectedPlan.guideName}`
            : ""
        }
        amountLabel={t("booking.amountDue")}
        amount={bookingToConfirm ? formatAmount(bookingToConfirm.selectedPlan.price, language) : ""}
        details={[
          { label: t("createPlan.dateLabel") || "Date", value: bookingDate },
          { label: t("createPlan.startTimeLabel") || "Time", value: startTime },
          { label: t("createPlan.durationLabel") || "Duration", value: `${parsedDurationHours} ${t("createPlan.hours")}` },
        ]}
        message={
          bookingToConfirm
            ? t("booking.confirmPaymentBody", { amount: formatAmount(bookingToConfirm.selectedPlan.price, language) })
            : ""
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("booking.confirmAndPay")}
        loadingLabel={t("booking.submitting")}
        isLoading={isSubmittingBooking}
        isRTL={isRTL}
        onConfirm={confirmBooking}
      />


      <Modal
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        title={t("plans.deleteTrip") || "Delete Trip"}
        maxWidth="max-w-md"
      >
        <p className="text-gray-600 text-lg mb-8">{t("plans.deleteTripConfirm") || "Are you sure you want to delete this trip?"}</p>
        {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => setPlanToDelete(null)}
            variant="muted"
          >
            {t("common.close") || "Close"}
          </Button>
          <Button
            type="button"
            onClick={confirmDeletePlan}
            disabled={!planToDelete || deletingPlanId === planToDelete?.id}
            variant="danger"
          >
            {deletingPlanId === planToDelete?.id ? (t("common.loading") || "Loading...") : (t("plans.deleteTrip") || "Delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
