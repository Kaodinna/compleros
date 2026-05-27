interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-white rounded-[18px] p-8 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
        <h2 className="font-heading text-[20px] font-semibold text-navy mb-2">{title}</h2>
        <p className="text-[13px] text-muted mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#E2DFD8] rounded-[9px] py-3 text-[14px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-[9px] py-3 text-[14px] font-semibold transition-colors text-white ${
              danger ? "bg-[#C0392B] hover:bg-[#A93226]" : "bg-navy hover:bg-[#143A52]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
