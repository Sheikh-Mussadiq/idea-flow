export const Button = ({ type = "button", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  return <button type={type} className={`${base} ${className}`} {...props} />;
};
