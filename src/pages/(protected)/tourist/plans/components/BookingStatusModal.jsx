import { Modal } from "../../../../../components/common/Modal";

// BookingStatusModal centralizes success/failure messaging after booking submit.
export function BookingStatusModal({ bookingStatus, t, onClose }) {
  return (
    <Modal
      isOpen={bookingStatus.isOpen}
      onClose={onClose}
      title={bookingStatus.isSuccess ? (t("booking.confirmedTitle") || "Booking confirmed") : "Booking failed"}
      maxWidth="max-w-md"
    >
      <p className={`text-lg mb-8 ${bookingStatus.isSuccess ? "text-gray-700" : "text-red-700"}`}>
        {bookingStatus.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-[#e67e22] text-white font-bold hover:brightness-110 transition-all"
      >
        {t("booking.done") || "Done"}
      </button>
    </Modal>
  );
}
