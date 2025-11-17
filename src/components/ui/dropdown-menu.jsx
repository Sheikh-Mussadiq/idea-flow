import { createContext, useContext, useState, cloneElement } from "react";

const DropdownMenuContext = createContext(null);

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ asChild, children }) => {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) return children;
  const { open, setOpen } = ctx;

  const handleClick = (e) => {
    if (children.props.onClick) children.props.onClick(e);
    setOpen(!open);
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
  align = "start",
  ...props
}) => {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div
      className={`absolute z-50 mt-1 min-w-[10rem] rounded-md border border-border/60 bg-card p-1 shadow-float ${className}`}
      {...props}
    />
  );
};

export const DropdownMenuItem = ({ className = "", onClick, ...props }) => {
  const ctx = useContext(DropdownMenuContext);
  const handleClick = (e) => {
    onClick?.(e);
    ctx?.setOpen(false);
  };
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs text-foreground hover:bg-muted ${className}`}
      onClick={handleClick}
      {...props}
    />
  );
};

export const DropdownMenuLabel = ({ className = "", ...props }) => (
  <div
    className={`px-2 py-1.5 text-xs font-semibold text-muted-foreground ${className}`}
    {...props}
  />
);

export const DropdownMenuSeparator = ({ className = "", ...props }) => (
  <div className={`my-1 h-px bg-border/60 ${className}`} {...props} />
);
