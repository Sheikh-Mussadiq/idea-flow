import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  cloneElement,
} from "react";
import { createPortal } from "react-dom";

const DropdownMenuContext = createContext(null);

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [triggerEl, setTriggerEl] = useState(null);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerEl, setTriggerEl }}
    >
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ asChild, children }) => {
  const ctx = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    // Stop propagation to prevent immediate closing by window listener
    e.stopPropagation();

    if (ctx) {
      ctx.setTriggerEl(e.currentTarget);
      ctx.setOpen(!ctx.open);
    }

    if (children.props.onClick) children.props.onClick(e);
  };

  if (asChild && children) {
    return cloneElement(children, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({
  className = "",
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}) => {
  const ctx = useContext(DropdownMenuContext);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!ctx?.open) return;

    const handleMouseDown = (e) => {
      // Close if click is outside content AND outside trigger
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target) &&
        (!ctx.triggerEl || !ctx.triggerEl.contains(e.target))
      ) {
        ctx.setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, [ctx?.open, ctx?.triggerEl]);

  if (!ctx || !ctx.open || !ctx.triggerEl) return null;

  const rect = ctx.triggerEl.getBoundingClientRect();
  const style = {
    position: "fixed",
    zIndex: 9999, // High z-index to ensure it is on top
  };

  if (side === "right") {
    style.top = rect.top;
    style.left = rect.right + sideOffset;
  } else if (side === "left") {
    style.top = rect.top;
    // We don't have width yet, so this might be tricky without ref measurement
    // For simplicity, we assume right placement is primary need.
    // For left, we'd need layout effect to measure content.
    // Putting simplistic logic for now or stick to standard flow.
    style.left = rect.left - 200; // Rough guess or use transform?
  } else {
    // bottom (default)
    style.top = rect.bottom + sideOffset;
    if (align === "end") {
      style.right = window.innerWidth - rect.right;
    } else if (align === "start") {
      style.left = rect.left;
    } else {
      // center
      style.left = rect.left + rect.width / 2;
      style.transform = "translateX(-50%)"; // Center horizontally
    }
  }

  return createPortal(
    <div
      ref={contentRef}
      style={style}
      className={`rounded-xl border border-neutral-200/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 shadow-md animate-in fade-in zoom-in-95 duration-100 ${className}`}
      {...props}
    />,
    document.body
  );
};

export const DropdownMenuItem = ({ className = "", onClick, ...props }) => {
  const ctx = useContext(DropdownMenuContext);
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent bubbling to window listener
    onClick?.(e);
    ctx?.setOpen(false);
  };
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
      onClick={handleClick}
      {...props}
    />
  );
};

export const DropdownMenuLabel = ({ className = "", ...props }) => (
  <div
    className={`px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 ${className}`}
    {...props}
  />
);

export const DropdownMenuSeparator = ({ className = "", ...props }) => (
  <div
    className={`my-1 h-px bg-neutral-200/60 dark:bg-neutral-800 ${className}`}
    {...props}
  />
);
