import { useMemo, useEffect, useRef } from "react";
import { useReactFlow, useNodesState } from "reactflow";
import { InputNode } from "../Flow/InputNode.jsx";
import { IdeaNode } from "../Flow/IdeaNode.jsx";

// Layout constants
const NODE_WIDTH = 320;
const NODE_HEIGHT = 200; // Approximate height including content
const HORIZONTAL_SPACING = 100; // Gap between sibling nodes
const VERTICAL_SPACING = 150; // Gap between parent and child levels

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
  isOwner,
  onNodeDragStop // New parameter
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

  // Helper to build tree structure
  const buildTree = (items) => {
    const itemMap = new Map(
      items.map((item) => [item.id, { ...item, children: [] }])
    );
    const roots = [];

    items.forEach((item) => {
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId).children.push(itemMap.get(item.id));
      } else {
        roots.push(itemMap.get(item.id));
      }
    });

    return roots;
  };

  // Helper to calculate subtree width
  const calculateSubtreeWidth = (node) => {
    if (!node.children || node.children.length === 0) {
      return NODE_WIDTH;
    }

    let width = 0;
    node.children.forEach((child, index) => {
      width += calculateSubtreeWidth(child);
      if (index < node.children.length - 1) {
        width += HORIZONTAL_SPACING;
      }
    });

    return Math.max(NODE_WIDTH, width);
  };

  // Helper to assign positions recursively
  const assignPositions = (node, x, y, positions) => {
    // Store calculated position
    positions.set(node.id, { x, y });

    if (!node.children || node.children.length === 0) return;

    const totalWidth = calculateSubtreeWidth(node);
    let currentX = x - totalWidth / 2;

    node.children.forEach((child) => {
      const childWidth = calculateSubtreeWidth(child);
      // Center the child within its allocated space
      const childX = currentX + childWidth / 2;
      assignPositions(
        child,
        childX,
        y + NODE_HEIGHT + VERTICAL_SPACING,
        positions
      );
      currentX += childWidth + HORIZONTAL_SPACING;
    });
  };

  useEffect(() => {
    const flowIdeas = ideas.filter((idea) => idea.flowId);
    const currentIdeaIds = new Set(flowIdeas.map((idea) => idea.id));

    // Clean up dragged nodes that no longer exist
    draggedNodesRef.current.forEach((id) => {
      if (!currentIdeaIds.has(id)) {
        draggedNodesRef.current.delete(id);
      }
    });

    setNodes((prevNodes) => {
      const previousPositions = new Map(
        prevNodes.map((node) => [node.id, node.position])
      );

      // Build tree and calculate positions
      const roots = buildTree(flowIdeas);
      const calculatedPositions = new Map();

      let currentRootX = 0;
      roots.forEach((root, index) => {
        const rootWidth = calculateSubtreeWidth(root);
        // Center the root in its subtree's width
        const rootX = currentRootX + rootWidth / 2;
        assignPositions(root, rootX, 260, calculatedPositions); // Start Y at 260 (below input node)
        currentRootX += rootWidth + HORIZONTAL_SPACING;
      });

      // Center the entire tree structure relative to 0
      const totalTreeWidth = currentRootX - HORIZONTAL_SPACING;
      const xOffset = -totalTreeWidth / 2;

      // Adjust all positions by the offset
      calculatedPositions.forEach((pos) => {
        pos.x += xOffset;
      });

      const inputNode = {
        id: "input",
        type: "inputNode",
        position: { x: 0, y: 0 },
        data: inputNodeData,
        draggable: false,
      };

      // Create a set of parent IDs to check which ideas have sub-ideas
      const parentIds = new Set(
        flowIdeas.map((idea) => idea.parentId).filter(Boolean)
      );

      const ideaNodes = flowIdeas.map((idea) => {
        const calculatedPos = calculatedPositions.get(idea.id) || {
          x: 0,
          y: 0,
        };

        const shouldPreservePosition = draggedNodesRef.current.has(idea.id);
        const preservedPosition = previousPositions.get(idea.id);

        // Check if we have a persisted position from the DB (idea.position)
        // OR if the user is currently dragging it (draggedNodesRef)
        // OR if we have a previous local position

        const dbPosition = idea.position; // Assuming 'position' comes from DB
        const isDragged = draggedNodesRef.current.has(idea.id);

        let finalPosition = calculatedPos;

        if (
          dbPosition &&
          typeof dbPosition === "object" &&
          "x" in dbPosition &&
          "y" in dbPosition
        ) {
          finalPosition = dbPosition;
        } else if (isDragged && preservedPosition) {
          finalPosition = preservedPosition;
        } else if (shouldPreservePosition && preservedPosition) {
          finalPosition = preservedPosition;
        }

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

        // Check if this idea has any sub-ideas
        const hasSubIdeas = parentIds.has(idea.id);

        return {
          id: idea.id,
          type: "ideaNode",
          position: finalPosition,
          data: {
            ...idea,
            comments: ideaComments,
            commenters: commenters,
            hasUnreadComments: false, // TODO: Implement unread logic
            hasSubIdeas: hasSubIdeas,
            onOpenComments: handleOpenComments,
            onDelete:
              canEdit && idea.type === "manual" ? handleDeleteIdea : undefined,
            onAddSubIdea: canEdit ? handleAddSubIdea : undefined,
            onSendToKanban: canEdit ? handleSendToKanban : undefined,
            onOpenTask: handleOpenTask,
            onToggleLike:
              isOwner && idea.type === "ai" ? handleToggleLike : undefined,
            onToggleDislike:
              isOwner && idea.type === "ai" ? handleToggleDislike : undefined,
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

  const handleNodeDragStop = (event, node) => {
    if (onNodeDragStop) {
      console.log(node.id, node.position);
      onNodeDragStop(node.id, node.position);
    }
  };

  const edges = useMemo(
    () =>
      ideas.map((idea) => ({
        id: `${idea.parentId ?? "input"}-${idea.id}`,
        source: idea.parentId ?? "input",
        target: idea.id,
        type: "bezier",
        animated: false,
        style: {
          stroke: "#6b7280", // neutral-500 for a minimal, modern line
          strokeWidth: 1.75,
          strokeOpacity: 0.65,
          strokeLinecap: "round",
          animationDuration: "4s", // slower, smoother motion
        },
      })),
    [ideas]
  );

  return {
    nodeTypes,
    nodes,
    edges,
    handleNodesChange,
    handleNodeDragStop,
  };
};
