import { useState, useCallback, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { FlowView } from "./FlowView.jsx";
import { useIdeaFlowLayout } from "../hooks/useIdeaFlowLayout.js";
import { toast } from "sonner";
import { mockAIIdeas } from "../../../data/mockData.js";
import { useBoard } from "../../../context/BoardContext";

export const FlowContent = ({
  ideas,
  onUpdateIdeas,
  isViewer,
  currentBoard,
  onOpenComments,
  onOpenTask,
}) => {
  const [mode, setMode] = useState("ai");
  const [isGenerating, setIsGenerating] = useState(false);
  const { createFlowIdea, deleteFlowIdea } = useBoard();

  const { fitView } = useReactFlow();

  const handleGenerate = useCallback(
    async (promptValue) => {
      if (isViewer) return;
      if (!promptValue || !promptValue.trim()) return;

      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
        ...idea,
        id: Date.now().toString() + index,
        type: "ai",
        kanbanStatus: undefined,
        assignedTo: undefined,
        dueDate: undefined,
        priority: null,
        subtasks: [],
        attachments: [],
        labels: [],
        activity: [],
        parentId: undefined,
        showInFlow: true,
      }));

      onUpdateIdeas(() => newIdeas);
      setIsGenerating(false);
      toast.success("Ideas generated successfully!");

      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    },
    [fitView, isViewer, onUpdateIdeas]
  );

  const handleRegenerate = useCallback(async () => {
    if (isViewer) return;
    const aiIdeas = ideas.filter((idea) => idea.type === "ai");
    if (aiIdeas.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAIIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai",
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
      showInFlow: true,
    }));

    const manualIdeas = ideas.filter((idea) => idea.type === "manual");
    onUpdateIdeas(() => [...newAIIdeas, ...manualIdeas]);
    setIsGenerating(false);
    toast.success("AI ideas regenerated!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, ideas, isViewer, onUpdateIdeas]);

  const handleAddManualIdea = useCallback(
    async (manualIdeaValue) => {
      if (isViewer || !currentBoard) return;
      if (!manualIdeaValue || !manualIdeaValue.trim()) return;

      const title = manualIdeaValue.split(" ").slice(0, 8).join(" ");
      const description = manualIdeaValue;

      let flowId = currentBoard.ai_flows?.[0]?.id;

      if (!flowId) {
        if (currentBoard.ai_flows && currentBoard.ai_flows.length > 0) {
          flowId = currentBoard.ai_flows[0].id;
        } else {
          toast.error(
            "No AI Flow found for this board. Please generate ideas first."
          );
          return;
        }
      }

      try {
        await createFlowIdea(flowId, title, description);
        toast.success("Idea added to flow!");
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      } catch (error) {
        // Error handled in context
      }
    },
    [fitView, isViewer, currentBoard, createFlowIdea]
  );

  const handleClearManualIdeas = useCallback(() => {
    if (isViewer) return;
    onUpdateIdeas((prevIdeas) =>
      prevIdeas.filter((idea) => idea.type === "ai")
    );
    toast.success("Manual ideas cleared!");
  }, [isViewer, onUpdateIdeas]);

  const handleDeleteIdea = useCallback(
    async (id) => {
      if (isViewer) return;
      try {
        await deleteFlowIdea(id);
        toast.success("Idea deleted!");
      } catch (error) {
        // Error handled in context
      }
    },
    [deleteFlowIdea, isViewer]
  );

  const handleSendToKanban = useCallback(
    (id) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;
          if (idea.kanbanStatus) return idea;
          return { ...idea, kanbanStatus: "Backlog" };
        })
      );
    },
    [onUpdateIdeas, isViewer]
  );

  const handleAddSubIdea = useCallback(
    (parentId) => {
      if (isViewer) return;
      const description = window.prompt("Describe your sub-idea:");
      if (!description || !description.trim()) return;

      const title = description.split(" ").slice(0, 8).join(" ");
      const newIdea = {
        id: Date.now().toString(),
        title: title.length < description.length ? title + "..." : title,
        description,
        type: "manual",
        kanbanStatus: undefined,
        assignedTo: undefined,
        dueDate: undefined,
        priority: null,
        subtasks: [],
        attachments: [],
        labels: [],
        activity: [],
        parentId,
        isArchived: false,
      };

      onUpdateIdeas((prevIdeas) => [...prevIdeas, newIdea]);
      toast.success("Sub-idea added!");
    },
    [onUpdateIdeas, isViewer]
  );

  const inputNodeData = useMemo(
    () => ({
      mode,
      onModeChange: setMode,
      onGenerate: handleGenerate,
      onAddManual: handleAddManualIdea,
      onRegenerate: handleRegenerate,
      onClearManual: handleClearManualIdeas,
      isGenerating,
      hasIdeas: ideas.length > 0,
      canEdit: !isViewer,
    }),
    [
      handleAddManualIdea,
      handleClearManualIdeas,
      handleGenerate,
      handleRegenerate,
      ideas.length,
      isGenerating,
      mode,
      isViewer,
    ]
  );

  const { nodeTypes, nodes, edges, handleNodesChange } = useIdeaFlowLayout(
    ideas,
    inputNodeData,
    onOpenComments,
    handleDeleteIdea,
    handleAddSubIdea,
    handleSendToKanban,
    onOpenTask,
    !isViewer
  );

  return (
    <FlowView
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      canEdit={!isViewer}
    />
  );
};
