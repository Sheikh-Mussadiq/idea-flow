import {
  Bell,
  ChevronDown,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Star,
  LayoutTemplate,
  Table2,
  List,
  GitFork,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function BoardHeader({
  activeBoard,
  onOpenMembers,
  currentUser,
  searchQuery,
  onChangeSearch,
  viewMode,
  onChangeViewMode,
}) {
  if (!activeBoard) return null;

  const viewTabs = [
    { label: "Flow", value: "flow", icon: GitFork },
    { label: "Kanban", value: "kanban", icon: LayoutTemplate },
    { label: "Table", value: "table", icon: Table2 },
    { label: "List", value: "list", icon: List },
  ];

  return (
    <div className="w-full bg-white border-b border-neutral-200 px-6 py-4">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Title Area */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
            {activeBoard.icon || "🐳"}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {activeBoard.name}
          </h1>
          <button className="text-neutral-400 hover:text-yellow-400 transition-colors">
            <Star className="h-5 w-5" />
          </button>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" />
          </Button>

          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-white ring-1 ring-neutral-100">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          <div className="h-6 w-px bg-neutral-200 mx-1" />

          <button className="text-neutral-400 hover:text-neutral-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <button className="text-neutral-400 hover:text-neutral-600">
            <Search className="h-5 w-5" />
          </button>

          <button className="text-neutral-400 hover:text-neutral-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Row (Tabs & Filter) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {viewTabs.map((tab) => {
            const isActive = viewMode === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onChangeViewMode?.(tab.value)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-500 hover:text-neutral-900 gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  );
}
