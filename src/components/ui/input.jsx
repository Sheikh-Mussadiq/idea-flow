export const Input = ({ className = "", ...props }) => {
  const base =
    "flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  return <input className={`${base} ${className}`} {...props} />;
};
