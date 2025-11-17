import { createPortal } from "react-dom";
import { Button } from "./button.jsx";

export const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className="w-full max-w-md px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const AlertDialogContent = ({ className = "", ...props }) => (
  <div
    className={`rounded-2xl border border-border/60 bg-card text-foreground shadow-float ${className}`}
    {...props}
  />
);

export const AlertDialogHeader = ({ className = "", ...props }) => (
  <div className={`space-y-2 ${className}`} {...props} />
);

export const AlertDialogFooter = ({ className = "", ...props }) => (
  <div className={`mt-4 flex justify-end gap-2 ${className}`} {...props} />
);

export const AlertDialogTitle = ({ className = "", ...props }) => (
  <h2 className={`text-lg font-semibold ${className}`} {...props} />
);

export const AlertDialogDescription = ({ className = "", ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);

export const AlertDialogCancel = ({ className = "", ...props }) => (
  <Button variant="outline" size="sm" className={className} {...props} />
);

export const AlertDialogAction = ({ className = "", ...props }) => (
  <Button size="sm" className={className} {...props} />
);
