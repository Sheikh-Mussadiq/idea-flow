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
  activeFlowId,
}) => {
  const [mode, setMode] = useState("ai");

  // Filter ideas to only show ideas from the active flow
  const filteredIdeas = useMemo(() => {
    if (!ideas || !activeFlowId) return ideas || [];
    return ideas.filter(
      (idea) => idea.flowId === activeFlowId || idea.flow_id === activeFlowId
    );
  }, [ideas, activeFlowId]);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    createFlowIdea,
    deleteFlowIdea,
    createCard,
    updateCard,
    updateFlowIdea,
  } = useBoard();

  const { fitView } = useReactFlow();

  const handleGenerate = useCallback(
    async (promptValue) => {
      if (isViewer || !currentBoard) return;
      if (!promptValue || !promptValue.trim()) return;

      // Use activeFlowId prop or fallback to first flow
      const flowId = activeFlowId || currentBoard?.ai_flows?.[0]?.id;
      if (!flowId) {
        toast.error("No AI Flow found for this board.");
        return;
      }

      setIsGenerating(true);

      try {
        // Simulate AI generation delay (replace with real AI call later)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate mock ideas (will be replaced with real AI backend later)
        const mockIdeas = mockAIIdeas.slice(0, 3);

        // Save each idea to database using context method
        for (const mockIdea of mockIdeas) {
          const title = mockIdea.title;
          const description = mockIdea.description || promptValue;

          await createFlowIdea(flowId, title, description);
        }

        toast.success("Ideas generated successfully!");
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      } catch (error) {
        console.error("Error generating ideas:", error);
        toast.error("Failed to generate ideas");
      } finally {
        setIsGenerating(false);
      }
    },
    [fitView, isViewer, currentBoard, createFlowIdea, activeFlowId]
  );

  const handleRegenerate = useCallback(async () => {
    if (isViewer || !currentBoard) return;

    const aiIdeas = filteredIdeas.filter(
      (idea) => idea.type === "ai" || !idea.parent_id
    );
    if (aiIdeas.length === 0) return;

    // Use activeFlowId prop or fallback to first flow
    const flowId = activeFlowId || currentBoard?.ai_flows?.[0]?.id;
    if (!flowId) {
      toast.error("No AI Flow found for this board.");
      return;
    }

    setIsGenerating(true);

    try {
      // Delete existing AI ideas
      for (const idea of aiIdeas) {
        await deleteFlowIdea(idea.id);
      }

      // Simulate AI generation delay (replace with real AI call later)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate new mock ideas (will be replaced with real AI backend later)
      const mockIdeas = mockAIIdeas.slice(0, 3);

      // Save each new idea to database
      for (const mockIdea of mockIdeas) {
        const title = mockIdea.title;
        const description = mockIdea.description || "Regenerated idea";

        await createFlowIdea(flowId, title, description);
      }

      toast.success("AI ideas regenerated!");
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    } catch (error) {
      console.error("Error regenerating ideas:", error);
      toast.error("Failed to regenerate ideas");
    } finally {
      setIsGenerating(false);
    }
  }, [
    fitView,
    filteredIdeas,
    isViewer,
    currentBoard,
    createFlowIdea,
    deleteFlowIdea,
    activeFlowId,
  ]);

  const handleAddManualIdea = useCallback(
    async (manualIdeaValue) => {
      if (isViewer || !currentBoard) return;
      if (!manualIdeaValue || !manualIdeaValue.trim()) return;

      const title = manualIdeaValue.split(" ").slice(0, 8).join(" ");
      const description = manualIdeaValue;

      // Use activeFlowId prop or fallback to first flow
      let flowId = activeFlowId || currentBoard?.ai_flows?.[0]?.id;

      if (!flowId) {
        toast.error(
          "No AI Flow found for this board. Please generate ideas first."
        );
        return;
      }

      try {
        await createFlowIdea(flowId, title, description);
        toast.success("Idea added to flow!");
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      } catch (error) {
        // Error handled in context
      }
    },
    [fitView, isViewer, currentBoard, createFlowIdea, activeFlowId]
  );

  const handleClearManualIdeas = useCallback(() => {
    if (isViewer) return;
    onUpdateIdeas((prevIdeas) => {
      // Filter to keep only AI-generated ideas (those without parent_id or with specific type)
      return prevIdeas.filter((idea) => idea.type === "ai" || !idea.parent_id);
    });
    toast.success("Manual ideas cleared!");
  }, [isViewer, onUpdateIdeas]);

  const handleDeleteIdea = useCallback(
    async (id) => {
      if (isViewer) return;
      try {
        await deleteFlowIdea(id);
        toast.success("Idea deleted!");
        // Optionally fit view after deletion
        setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
      } catch (error) {
        // Error handled in context
      }
    },
    [deleteFlowIdea, isViewer, fitView]
  );

  const handleSendToKanban = useCallback(
    async (id) => {
      if (isViewer || !currentBoard) return;

      // Find the idea to send
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return;

      try {
        // Get the first column (usually Backlog)
        const firstColumn = currentBoard.columns?.[0];
        if (!firstColumn) {
          toast.error("No columns found in Kanban board");
          return;
        }

        // Get the highest position in the column to add at the end
        const cardsInColumn = firstColumn.cards || [];
        const maxPosition =
          cardsInColumn.length > 0
            ? Math.max(...cardsInColumn.map((c) => c.position || 0))
            : -1;

        // Create a card in Kanban with the idea's content
        const newCard = await createCard(
          currentBoard.id,
          firstColumn.id,
          idea.title,
          maxPosition + 1
        );

        // Update the card with description if it exists
        if (idea.description && newCard) {
          await updateCard(newCard.id, { description: idea.description });
        }

        toast.success(`Sent to ${firstColumn.title}!`);
      } catch (error) {
        console.error("Error sending to Kanban:", error);
        toast.error("Failed to send to Kanban");
      }
    },
    [isViewer, currentBoard, ideas, createCard, updateCard]
  );

  const handleAddSubIdea = useCallback(
    (parentId) => {
      if (isViewer) return;
      const description = window.prompt("Describe your sub-idea:");
      if (!description || !description.trim()) return;

      const title = description.split(" ").slice(0, 8).join(" ");

      // Use activeFlowId prop or fallback to first flow
      const flowId = activeFlowId || currentBoard?.ai_flows?.[0]?.id;
      if (!flowId) {
        toast.error("No AI Flow found");
        return;
      }

      createFlowIdea(flowId, title, description, parentId)
        .then(() => {
          toast.success("Sub-idea added!");
          setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
        })
        .catch(() => {
          // Error handled in context
        });
    },
    [isViewer, currentBoard, createFlowIdea, fitView, activeFlowId]
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
      hasIdeas: filteredIdeas && filteredIdeas.length > 0,
      canEdit: !isViewer,
    }),
    [
      handleAddManualIdea,
      handleClearManualIdeas,
      handleGenerate,
      handleRegenerate,
      filteredIdeas?.length || 0,
      isGenerating,
      mode,
      isViewer,
    ]
  );

  const { nodeTypes, nodes, edges, handleNodesChange } = useIdeaFlowLayout(
    filteredIdeas || [],
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
