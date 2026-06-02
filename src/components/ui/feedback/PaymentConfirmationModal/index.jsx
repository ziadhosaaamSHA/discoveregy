import { CreditCard } from "lucide-react";
import { Modal } from "../../../common/Modal";
import { Button } from "../../actions/AppButton";

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  title,
  itemTitle,
  subtitle,
  amountLabel,
  amount,
  details = [],
  message,
  cancelLabel,
  confirmLabel,
  loadingLabel,
  isLoading = false,
  onConfirm,
  isRTL = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onClose} title={title} maxWidth="max-w-md">
      {isOpen && (
        <div className="space-y-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#e67e22]/10 rounded-full flex items-center justify-center mb-3">
              <CreditCard size={30} className="text-[#e67e22]" />
            </div>
            <h3 className="text-xl font-black text-gray-800">{itemTitle}</h3>
            {subtitle && <p className="text-sm font-semibold text-gray-500 mt-1">{subtitle}</p>}
          </div>

          <div className="rounded-3xl bg-[#f7eadb]/80 border border-[#8a4b10]/10 p-6 shadow-inner">
            <p className="text-xs font-black uppercase tracking-wider text-[#8a4b10]/80">{amountLabel}</p>
            <p className="mt-2 text-4xl font-black text-[#d43e0b]">{amount}</p>
          </div>

          {details.length > 0 && (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm font-bold text-gray-600 space-y-2 text-left">
              {details.map(({ label, value }) => (
                <div className="flex justify-between gap-4" key={label}>
                  <span className="text-gray-400">{label}:</span>
                  <span className="text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {message && <p className="text-sm font-medium text-gray-500 px-2 leading-relaxed">{message}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="muted" fullWidth onClick={onClose} disabled={isLoading} className="py-3.5">
              {cancelLabel}
            </Button>
            <Button type="button" fullWidth onClick={onConfirm} disabled={isLoading} className="py-3.5">
              {isLoading ? loadingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
