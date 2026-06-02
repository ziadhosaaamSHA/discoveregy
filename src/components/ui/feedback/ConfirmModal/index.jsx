import { Modal } from "../../../common/Modal";
import { Button } from "../../actions/AppButton";

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  error,
  isLoading = false,
  tone = "danger",
}) {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onCancel} title={title} maxWidth="max-w-md">
      <p className="text-gray-600 text-lg mb-8 leading-relaxed">{message}</p>
      {error && <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="flex items-center justify-center gap-3">
        <Button type="button" variant="muted" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button type="button" variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} disabled={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
