export const Avatar = ({ className = "", children }) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 ${className}`}
  >
    {children}
  </div>
);

export const AvatarFallback = ({ className = "", children }) => (
  <div
    className={`flex h-full w-full items-center justify-center text-xs font-medium ${className}`}
  >
    {children}
  </div>
);
