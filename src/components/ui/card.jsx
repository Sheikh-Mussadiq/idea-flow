export const Card = ({ className = "", ...props }) => {
  const base =
    "rounded-2xl border border-neutral-200/60 bg-white text-neutral-900 shadow-sm";
  return <div className={`${base} ${className}`} {...props} />;
};
