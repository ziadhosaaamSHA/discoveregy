import { Button, Modal } from "../../../../../components/ui";
import { Check, XCircle } from "lucide-react";
import { motion } from "framer-motion";

// BookingStatusModal centralizes success/failure messaging after booking submit.
export function BookingStatusModal({ bookingStatus, t, onClose }) {
  return (
    <Modal
      isOpen={bookingStatus.isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center p-4">
        {bookingStatus.isSuccess ? (
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
          {bookingStatus.isSuccess 
            ? (t("booking.confirmedTitle") || "Booking Confirmed!") 
            : (t("booking.failedTitle") || "Booking Failed")}
        </h3>

        <p className={`text-sm font-semibold mb-8 leading-relaxed max-w-[280px] ${bookingStatus.isSuccess ? "text-gray-500" : "text-red-600"}`}>
          {bookingStatus.message}
        </p>

        <Button
          type="button"
          onClick={onClose}
          fullWidth
          className="py-4"
        >
          {t("booking.done") || "Done"}
        </Button>
      </div>
    </Modal>
  );
}
