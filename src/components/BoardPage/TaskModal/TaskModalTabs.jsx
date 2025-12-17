import { useState } from "react";

export const TaskModalTabs = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: "subtasks", label: "Subtasks" },
    { id: "comments", label: "Comments" },
    { id: "activities", label: "Activities" },
    { id: "team", label: "Team" },
  ];

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700 px-6">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800 rounded-t-md px-4 ${
                activeTab === tab.id
                  ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-6">{children}</div>
    </div>
  );
};
