import { useState } from "react";
import { useBoard } from "../../context/BoardContext";
import { 
  Calendar, 
  User, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Clock,
  MoreHorizontal,
  ArrowUpDown,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export const TableView = () => {
  const { activeBoard } = useBoard();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState("");

  if (!activeBoard) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'review': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-100';
    }
  };

  const sortedIdeas = [...(activeBoard.ideas || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle nested or special cases
    if (sortConfig.key === 'assignedTo') aValue = a.assignedTo?.name || '';
    if (sortConfig.key === 'assignedTo') bValue = b.assignedTo?.name || '';

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }).filter(idea => 
    idea.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 opacity-20" />;
    return <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'asc' ? 'text-primary-600' : 'text-primary-600 rotate-180'}`} />;
  };

  return (
    <div className="h-full flex flex-col bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input 
            type="text" 
            placeholder="Filter tasks..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-64"
          />
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {sortedIdeas.length} tasks
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-4 px-6 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={() => handleSort('title')}
        >
          Title <SortIcon column="title" />
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={() => handleSort('kanbanStatus')}
        >
          Status <SortIcon column="kanbanStatus" />
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={() => handleSort('priority')}
        >
          Priority <SortIcon column="priority" />
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={() => handleSort('assignedTo')}
        >
          Assignee <SortIcon column="assignedTo" />
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={() => handleSort('dueDate')}
        >
          Due Date <SortIcon column="dueDate" />
        </div>
        <div className="flex items-center gap-2">
          Labels
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sortedIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              whileHover={{ 
                scale: 1.005, 
                backgroundColor: "rgba(var(--bg-hover-rgb), 0.8)",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 10
              }}
              className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-4 px-6 py-3 items-center border-b border-neutral-100 dark:border-neutral-800 group cursor-pointer relative hover:bg-white dark:hover:bg-neutral-800/50 transition-colors"
            >
              {/* Title */}
              <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate pr-4">
                {idea.title}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(idea.kanbanStatus)}`}>
                  {idea.kanbanStatus || 'No Status'}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-1.5">
                {idea.priority && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getPriorityColor(idea.priority)}`}>
                    {idea.priority}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-2">
                {idea.assignedTo ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-medium ring-2 ring-white dark:ring-neutral-800">
                      {idea.assignedTo.avatar || idea.assignedTo.name[0]}
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{idea.assignedTo.name}</span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">Unassigned</span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                {idea.dueDate ? (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                    <span>{format(new Date(idea.dueDate), 'MMM d')}</span>
                  </>
                ) : (
                  <span className="text-neutral-400 dark:text-neutral-600">-</span>
                )}
              </div>

              {/* Labels */}
              <div className="flex flex-wrap gap-1.5">
                {idea.labels?.slice(0, 2).map((label, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    style={{ 
                      backgroundColor: `${label.color}15`, 
                      color: label.color,
                      borderColor: `${label.color}30`
                    }}
                  >
                    {label.name}
                  </span>
                ))}
                {idea.labels?.length > 2 && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">+{idea.labels.length - 2}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sortedIdeas.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400 dark:text-neutral-500">
            <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
            </div>
            <p className="text-sm">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
