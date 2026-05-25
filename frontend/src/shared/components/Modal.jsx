import { createPortal } from "react-dom";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border-4 border-black/90 bg-[#fff9f1] p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="mb-4 font-mono text-base font-bold sm:text-lg">
            {title}
          </h3>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
};
