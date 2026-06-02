import { Check, XCircle } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../Button";

export function StatusModal({ isOpen, isSuccess, title, message, actionLabel, onClose }) {
  const Icon = isSuccess ? Check : XCircle;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 ${
          isSuccess ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
        }`}>
          <Icon size={40} className={isSuccess ? "text-green-600" : "text-red-600"} strokeWidth={isSuccess ? 3 : 2} />
        </div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">{title}</h3>
        <p className={`text-sm font-semibold mb-8 leading-relaxed max-w-[280px] ${
          isSuccess ? "text-gray-500" : "text-red-600"
        }`}>
          {message}
        </p>
        <Button type="button" fullWidth onClick={onClose}>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}
