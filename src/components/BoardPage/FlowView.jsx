import ReactFlow, { Background, Controls, MiniMap } from "reactflow";

export const FlowView = ({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  canEdit,
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.4}
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      nodesDraggable={canEdit}
      onNodesChange={canEdit ? onNodesChange : undefined}
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
  );
};
