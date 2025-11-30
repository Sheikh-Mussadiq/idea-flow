import { useState, useRef, useLayoutEffect } from "react";

export const TruncatedText = ({
  as: Component = "div",
  children,
  className,
  ...props
}) => {
  const ref = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (ref.current) {
        setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [children]);

  return (
    <Component
      ref={ref}
      className={`${className} ${
        isTruncated
          ? "[mask-image:linear-gradient(to_right,black_90%,transparent)]"
          : ""
      }`}
      {...props}
    >
      {children}
    </Component>
  );
};
