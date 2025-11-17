export const Button = ({ type = "button", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  return <button type={type} className={`${base} ${className}`} {...props} />;
};
