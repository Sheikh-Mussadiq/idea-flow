export const Card = ({ className = "", ...props }) => {
  const base =
    "rounded-2xl border border-border/60 bg-card text-foreground shadow-soft";
  return <div className={`${base} ${className}`} {...props} />;
};
