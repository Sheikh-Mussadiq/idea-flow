import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Plus, ChevronDown, Check, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { TruncatedText } from "../../ui/TruncatedText";
import { useBoard } from "../../../context/BoardContext";

export const FlowSelector = ({ flows = [], activeFlowId, boardId }) => {
  const navigate = useNavigate();
  const { createFlow } = useBoard();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const activeFlow = flows.find((f) => f.id === activeFlowId) || flows[0];
  const hasMultipleFlows = flows.length > 1;

  const handleSelectFlow = (flowId) => {
    navigate(`/boards/${boardId}/flow/${flowId}`);
    setIsOpen(false);
  };

  const handleOpenCreateModal = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
    setNewFlowName("");
    setNewFlowDescription("");
  };

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    setIsCreating(true);
    try {
      const newFlow = await createFlow(
        boardId,
        newFlowName.trim(),
        newFlowDescription.trim()
      );
      setIsCreateModalOpen(false);
      // Navigate to the new flow
      navigate(`/boards/${boardId}/flow/${newFlow.id}`);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsCreating(false);
    }
  };

  if (!flows.length) {
    return (
      <>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Create First Flow
          </span>
        </button>

        {/* Create Flow Modal */}
        <CreateFlowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          flowName={newFlowName}
          setFlowName={setNewFlowName}
          flowDescription={newFlowDescription}
          setFlowDescription={setNewFlowDescription}
          onSubmit={handleCreateFlow}
          isCreating={isCreating}
        />
      </>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="h-4 w-4 text-primary-500 shrink-0" />
            <TruncatedText
              as="span"
              className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[150px]"
              title={activeFlow?.name}
            >
              {activeFlow?.name || "Select Flow"}
            </TruncatedText>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {hasMultipleFlows
              ? `Switch Flow (${flows.length})`
              : "Flow options"}
          </p>
        </div>
        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />

        <div className="max-h-64 overflow-y-auto py-1">
          {flows.map((flow) => {
            const isActive = flow.id === activeFlowId;
            const ideasCount = flow.ideas?.length || flow.ideasCount || 0;

            return (
              <DropdownMenuItem
                key={flow.id}
                onClick={() => handleSelectFlow(flow.id)}
                className={`flex items-center justify-between gap-2 px-2 py-2 cursor-pointer ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Zap
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? "text-primary-500"
                        : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  />
                  <TruncatedText
                    as="span"
                    className={`text-sm truncate ${
                      isActive
                        ? "font-medium text-primary-600 dark:text-primary-400"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                    title={flow.name}
                  >
                    {flow.name}
                  </TruncatedText>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-neutral-400">
                    {ideasCount} ideas
                  </span>
                  {isActive && <Check className="h-4 w-4 text-primary-500" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />

        <DropdownMenuItem
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-2 py-2 cursor-pointer text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Create New Flow</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Create Flow Modal */}
      <CreateFlowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        flowName={newFlowName}
        setFlowName={setNewFlowName}
        flowDescription={newFlowDescription}
        setFlowDescription={setNewFlowDescription}
        onSubmit={handleCreateFlow}
        isCreating={isCreating}
      />
    </DropdownMenu>
  );
};

// Create Flow Modal Component
const CreateFlowModal = ({
  isOpen,
  onClose,
  flowName,
  setFlowName,
  flowDescription,
  setFlowDescription,
  onSubmit,
  isCreating,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && flowName.trim()) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Create New Flow
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Flow Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Marketing Ideas, Product Features..."
              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What is this flow about?"
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isCreating}
            className="dark:hover:bg-neutral-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!flowName.trim() || isCreating}
            className="bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Flow"}
          </Button>
        </div>
      </div>
    </div>
  );
};
