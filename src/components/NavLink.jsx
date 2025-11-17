import { forwardRef } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";

export const NavLink = forwardRef(
  (
    {
      className = "",
      activeClassName = "",
      pendingClassName = "",
      to,
      ...props
    },
    ref
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          [
            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          ]
            .filter(Boolean)
            .join(" ")
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";
