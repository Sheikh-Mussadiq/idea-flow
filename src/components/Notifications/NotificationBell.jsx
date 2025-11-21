import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";
import { NotificationsDropdown } from "./NotificationsDropdown";

export const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef(null);

  // Shake animation when unread count increases
  useEffect(() => {
    if (unreadCount > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="sr-only">{unreadCount} unread notifications</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <NotificationsDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};
