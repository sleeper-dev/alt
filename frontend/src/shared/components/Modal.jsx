export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border-4 border-black/90 bg-[#fff9f1] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 font-mono text-lg font-bold">{title}</h3>}
        {children}
      </div>
    </div>
  );
};
