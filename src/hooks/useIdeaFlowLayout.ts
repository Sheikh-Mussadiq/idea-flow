import { useMemo, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useReactFlow,
  useNodesState,
  type NodeChange,
} from "reactflow";
import { InputNode } from "@/components/InputNode";
import { IdeaNode } from "@/components/IdeaNode";
import type { Idea } from "@/components/FlowContent";

export interface InputNodeData {
  mode: "ai" | "manual";
  onModeChange: (mode: "ai" | "manual") => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  manualIdea: string;
  onManualIdeaChange: (value: string) => void;
  onGenerate: () => void;
  onAddManual: () => void;
  onRegenerate: () => void;
  onClearManual: () => void;
  isGenerating: boolean;
  hasIdeas: boolean;
}

export interface IdeaFlowLayoutResult {
  nodeTypes: NodeTypes;
  nodes: Node[];
  edges: Edge[];
  handleNodesChange: (changes: NodeChange[]) => void;
}

export const useIdeaFlowLayout = (
  ideas: Idea[],
  inputNodeData: InputNodeData,
  handleOpenComments: (id: string) => void,
  handleDeleteIdea: (id: string) => void,
  handleAddSubIdea: (parentId: string) => void,
  handleSendToKanban: (id: string) => void,
  handleOpenTask: (id: string) => void
): IdeaFlowLayoutResult => {
  const { fitView } = useReactFlow();
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      ideaNode: IdeaNode,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const draggedNodesRef = useRef(new Set<string>());

  useEffect(() => {
    const currentIdeaIds = new Set(ideas.map((idea) => idea.id));
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
      const totalIdeas = ideas.length;
      const startX =
        totalIdeas > 0 ? -((totalIdeas - 1) * horizontalSpacing) / 2 : 0;

      const inputNode: Node = {
        id: "input",
        type: "inputNode",
        position: { x: 0, y: 0 },
        data: inputNodeData,
        draggable: false,
      };

      const ideaNodes: Node[] = ideas.map((idea, index) => {
        const fallbackPosition = {
          x: startX + index * horizontalSpacing,
          y: verticalOffset,
        };

        const shouldPreservePosition = draggedNodesRef.current.has(idea.id);
        const preservedPosition = previousPositions.get(idea.id);

        return {
          id: idea.id,
          type: "ideaNode",
          position:
            shouldPreservePosition && preservedPosition
              ? preservedPosition
              : fallbackPosition,
          data: {
            ...idea,
            onOpenComments: handleOpenComments,
            onDelete: idea.type === "manual" ? handleDeleteIdea : undefined,
            onAddSubIdea: handleAddSubIdea,
            onSendToKanban: handleSendToKanban,
            onOpenTask: handleOpenTask,
          },
          draggable: true,
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
    ideas,
    inputNodeData,
    setNodes,
  ]);

  const handleNodesChange = (changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        draggedNodesRef.current.add(change.id);
      }
    });

    onNodesChange(changes);
  };

  const edges: Edge[] = useMemo(() => {
    return ideas.map((idea) => ({
      id: `${idea.parentId ?? "input"}-${idea.id}`,
      source: idea.parentId ?? "input",
      target: idea.id,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "hsl(var(--primary))",
        strokeWidth: 2,
        strokeOpacity: 0.6,
      },
    }));
  }, [ideas]);

  return {
    nodeTypes,
    nodes,
    edges,
    handleNodesChange,
  };
};
