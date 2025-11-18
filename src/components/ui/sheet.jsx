import { createPortal } from "react-dom";

export const Sheet = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex justify-end bg-neutral-900/40 backdrop-blur-sm"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="h-full w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const SheetContent = ({ className = "", side = "right", ...props }) => (
  <div
    className={`h-full w-full bg-white border-l border-neutral-200/60 shadow-xl p-6 ${className}`}
    {...props}
  />
);

export const SheetHeader = ({ className = "", ...props }) => (
  <div className={`space-y-1 ${className}`} {...props} />
);

export const SheetTitle = ({ className = "", ...props }) => (
  <h2 className={`text-base font-semibold ${className}`} {...props} />
);

export const SheetDescription = ({ className = "", ...props }) => (
  <p className={`text-xs text-neutral-500 ${className}`} {...props} />
);
