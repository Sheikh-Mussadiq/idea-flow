import { useMemo, useEffect, useRef } from "react";
import { useReactFlow, useNodesState } from "reactflow";
import { InputNode } from "../Flow/InputNode.jsx";
import { IdeaNode } from "../Flow/IdeaNode.jsx";

export const useIdeaFlowLayout = (
  ideas,
  inputNodeData,
  handleOpenComments,
  handleDeleteIdea,
  handleAddSubIdea,
  handleSendToKanban,
  handleOpenTask,
  handleToggleLike,
  handleToggleDislike,
  canEdit,
  isOwner
) => {
  const { fitView } = useReactFlow();
  const nodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      ideaNode: IdeaNode,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const draggedNodesRef = useRef(new Set());

  useEffect(() => {
    const flowIdeas = ideas.filter((idea) => idea.flowId);
    const currentIdeaIds = new Set(flowIdeas.map((idea) => idea.id));
    draggedNodesRef.current.forEach((id) => {
      if (!currentIdeaIds.has(id)) {
        draggedNodesRef.current.delete(id);
      }
    });

    setNodes((prevNodes) => {
      const previousPositions = new Map(
        prevNodes.map((node) => [node.id, node.position])
      );
      const horizontalSpacing = 420;
      const verticalOffset = 260;
      const totalIdeas = flowIdeas.length;
      const startX =
        totalIdeas > 0 ? -((totalIdeas - 1) * horizontalSpacing) / 2 : 0;

      const inputNode = {
        id: "input",
        type: "inputNode",
        position: { x: 0, y: 0 },
        data: inputNodeData,
        draggable: false,
      };

      const ideaNodes = flowIdeas.map((idea, index) => {
        const fallbackPosition = {
          x: startX + index * horizontalSpacing,
          y: verticalOffset,
        };

        const shouldPreservePosition = draggedNodesRef.current.has(idea.id);
        const preservedPosition = previousPositions.get(idea.id);

        // Get comments from the idea data
        const ideaComments = idea.idea_comments || [];
        const hasComments = ideaComments.length > 0;
        // Extract unique commenters from the comments
        const commenters = hasComments
          ? Array.from(
              new Map(
                ideaComments.map((comment) => [comment.user.id, comment.user])
              ).values()
            ).slice(0, 2)
          : [];

        return {
          id: idea.id,
          type: "ideaNode",
          position:
            shouldPreservePosition && preservedPosition
              ? preservedPosition
              : fallbackPosition,
          data: {
            ...idea,
            comments: ideaComments,
            commenters: commenters,
            hasUnreadComments: false, // TODO: Implement unread logic
            onOpenComments: handleOpenComments,
            onDelete:
              canEdit && idea.type === "manual" ? handleDeleteIdea : undefined,
            onAddSubIdea: canEdit ? handleAddSubIdea : undefined,
            onSendToKanban: canEdit ? handleSendToKanban : undefined,
            onOpenTask: handleOpenTask,
            onToggleLike: isOwner && idea.type === "ai" ? handleToggleLike : undefined,
            onToggleDislike: isOwner && idea.type === "ai" ? handleToggleDislike : undefined,
          },
          draggable: canEdit,
        };
      });

      return [inputNode, ...ideaNodes];
    });
  }, [
    handleAddSubIdea,
    handleDeleteIdea,
    handleOpenComments,
    handleSendToKanban,
    handleOpenTask,
    handleToggleLike,
    handleToggleDislike,
    canEdit,
    isOwner,
    ideas,
    inputNodeData,
    setNodes,
  ]);

  const handleNodesChange = (changes) => {
    changes.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        draggedNodesRef.current.add(change.id);
      }
    });

    onNodesChange(changes);
  };

  const edges = useMemo(
    () =>
      ideas.map((idea) => ({
        id: `${idea.parentId ?? "input"}-${idea.id}`,
        source: idea.parentId ?? "input",
        target: idea.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#5865FF",
          strokeWidth: 2,
          strokeOpacity: 0.9,
        },
      })),
    [ideas]
  );

  return {
    nodeTypes,
    nodes,
    edges,
    handleNodesChange,
  };
};
