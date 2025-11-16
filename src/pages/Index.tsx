import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  type NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { CommentPanel } from "@/components/CommentPanel";
import { InputNode } from "@/components/InputNode";
import { IdeaNode } from "@/components/IdeaNode";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  description: string;
  type: "ai" | "manual";
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions?: { thumbsUp: number; heart: number };
}

const mockAIIdeas: Omit<Idea, "id" | "type">[] = [
  {
    title: "Interactive Product Demos",
    description:
      "Create engaging video demonstrations showing product features in real-world scenarios. Focus on problem-solving aspects and user benefits.",
  },
  {
    title: "Customer Success Stories",
    description:
      "Share authentic testimonials and case studies from satisfied customers. Include metrics and specific outcomes achieved.",
  },
  {
    title: "Educational Content Series",
    description:
      "Develop a series of tutorial-style posts teaching valuable skills related to your product. Build authority and trust.",
  },
  {
    title: "Behind-the-Scenes Content",
    description:
      "Give followers a peek into your company culture, team members, and day-to-day operations. Humanize your brand.",
  },
  {
    title: "Industry Trend Analysis",
    description:
      "Share insights on current trends affecting your industry. Position your brand as a thought leader.",
  },
  {
    title: "User-Generated Content Campaigns",
    description:
      "Encourage customers to share their experiences. Feature their content to build community and social proof.",
  },
];

const mockComments: { [key: string]: Comment[] } = {
  "1": [
    {
      id: "c1",
      author: "Maria Chen",
      avatar: "MC",
      text: "This is a great direction! We should focus on mobile-first demos.",
      timestamp: "2 hours ago",
      reactions: { thumbsUp: 5, heart: 2 },
    },
    {
      id: "c2",
      author: "Tom Wilson",
      avatar: "TW",
      text: "Agreed! Can we also add some metrics about engagement?",
      timestamp: "1 hour ago",
      reactions: { thumbsUp: 3, heart: 1 },
    },
  ],
};

const FlowContent = () => {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [prompt, setPrompt] = useState("");
  const [manualIdea, setManualIdea] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>(
    mockComments
  );

  const { fitView } = useReactFlow();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai" as const,
    }));

    setIdeas(newIdeas);
    setIsGenerating(false);
    toast.success("Ideas generated successfully!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, prompt]);

  const handleRegenerate = useCallback(async () => {
    const aiIdeas = ideas.filter((idea) => idea.type === "ai");
    if (aiIdeas.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAIIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai" as const,
    }));

    const manualIdeas = ideas.filter((idea) => idea.type === "manual");
    setIdeas([...newAIIdeas, ...manualIdeas]);
    setIsGenerating(false);
    toast.success("AI ideas regenerated!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, ideas]);

  const handleAddManualIdea = useCallback(() => {
    if (!manualIdea.trim()) return;

    const title = manualIdea.split(" ").slice(0, 8).join(" ");
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: title.length < manualIdea.length ? title + "..." : title,
      description: manualIdea,
      type: "manual",
    };

    setIdeas((prevIdeas) => [...prevIdeas, newIdea]);
    setManualIdea("");
    toast.success("Idea added!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, manualIdea]);

  const handleClearManualIdeas = useCallback(() => {
    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.type === "ai"));
    setManualIdea("");
    toast.success("Manual ideas cleared!");
  }, []);

  const handleDeleteIdea = useCallback((id: string) => {
    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== id));
    toast.success("Idea deleted!");
  }, []);

  const handleOpenComments = useCallback((ideaId: string) => {
    setSelectedIdeaId(ideaId);
  }, []);

  const handleAddComment = useCallback(
    (text: string) => {
      if (!selectedIdeaId) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        author: "You",
        avatar: "YO",
        text,
        timestamp: "Just now",
        reactions: { thumbsUp: 0, heart: 0 },
      };

      setComments((prevComments) => ({
        ...prevComments,
        [selectedIdeaId]: [...(prevComments[selectedIdeaId] || []), newComment],
      }));
    },
    [selectedIdeaId]
  );

  // React Flow nodes and edges
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      ideaNode: IdeaNode,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const draggedNodesRef = useRef(new Set<string>());

  const inputNodeData = useMemo(
    () => ({
      mode,
      onModeChange: setMode,
      prompt,
      onPromptChange: setPrompt,
      manualIdea,
      onManualIdeaChange: setManualIdea,
      onGenerate: handleGenerate,
      onAddManual: handleAddManualIdea,
      onRegenerate: handleRegenerate,
      onClearManual: handleClearManualIdeas,
      isGenerating,
      hasIdeas: ideas.length > 0,
    }),
    [
      handleAddManualIdea,
      handleClearManualIdeas,
      handleGenerate,
      handleRegenerate,
      ideas.length,
      isGenerating,
      manualIdea,
      mode,
      prompt,
    ]
  );

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
          },
          draggable: true,
        };
      });

      return [inputNode, ...ideaNodes];
    });
  }, [handleDeleteIdea, handleOpenComments, ideas, inputNodeData, setNodes]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging) {
          draggedNodesRef.current.add(change.id);
        }
      });

      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const edges: Edge[] = useMemo(() => {
    return ideas.map((idea) => ({
      id: `input-${idea.id}`,
      source: "input",
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

  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        nodesDraggable={true}
        onNodesChange={handleNodesChange}
        nodeOrigin={[0.5, 0]}
        className="transition-all duration-500"
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "inputNode") return "hsl(var(--primary))";
            return "hsl(var(--card))";
          }}
          className="!bg-card !border-border"
        />
      </ReactFlow>

      <CommentPanel
        isOpen={!!selectedIdeaId}
        onClose={() => setSelectedIdeaId(null)}
        ideaTitle={selectedIdea?.title || ""}
        comments={selectedIdeaId ? comments[selectedIdeaId] || [] : []}
        onAddComment={handleAddComment}
      />
    </>
  );
};

const Index = () => {
  return (
    <div className="h-screen w-full bg-background">
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
