import { createPortal } from "react-dom";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="w-full max-w-lg px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const DialogContent = ({ className = "", ...props }) => (
  <div
    className={`rounded-2xl border border-border/60 bg-card text-foreground shadow-float ${className}`}
    {...props}
  />
);

export const DialogHeader = ({ className = "", ...props }) => (
  <div className={`space-y-2 ${className}`} {...props} />
);

export const DialogFooter = ({ className = "", ...props }) => (
  <div className={`mt-4 flex flex-row-reverse gap-2 ${className}`} {...props} />
);

export const DialogTitle = ({ className = "", ...props }) => (
  <h2 className={`text-lg font-semibold ${className}`} {...props} />
);

export const DialogDescription = ({ className = "", ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);
