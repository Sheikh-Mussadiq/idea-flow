import { Plus, Calendar, User, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const ListView = ({ ideas = [], onAddTask, onOpenTask }) => {
  const tasks = ideas.filter(idea => idea.kanbanStatus);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
        <h2 className="font-semibold text-neutral-900">All Tasks</h2>
        <Button 
          size="sm" 
          onClick={() => onAddTask("Backlog")}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-[1fr_120px_160px_120px] gap-4 px-6 py-3 border-b border-neutral-100 bg-neutral-50/50 text-xs font-medium text-neutral-500 uppercase tracking-wider">
        <div>Title</div>
        <div>Status</div>
        <div>Assignee</div>
        <div>Due Date</div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400">
            <p>No tasks found. Create one to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => onOpenTask(task.id)}
                className="grid grid-cols-[1fr_120px_160px_120px] gap-4 px-6 py-3 hover:bg-neutral-50 cursor-pointer transition-colors group items-center"
              >
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    task.priority === 'High' ? 'bg-red-500' :
                    task.priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-neutral-300'
                  }`} />
                  <span className="font-medium text-sm text-neutral-900 truncate">
                    {task.title}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    task.kanbanStatus === 'Done' ? 'bg-green-50 text-green-700' :
                    task.kanbanStatus === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                    task.kanbanStatus === 'Review' ? 'bg-purple-50 text-purple-700' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {task.kanbanStatus}
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-2">
                  {task.assignedTo ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignedTo.avatarUrl} />
                        <AvatarFallback className="text-[10px] bg-primary-100 text-primary-600">
                          {task.assignedTo.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-600 truncate">
                        {task.assignedTo.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-400 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  {task.dueDate ? (
                    <>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </>
                  ) : (
                    <span className="text-neutral-300">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
