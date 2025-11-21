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
      <div className="flex-shrink-0 border-b border-neutral-200 px-6">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
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
