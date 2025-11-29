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
      className="transition-all duration-500 bg-white dark:bg-neutral-950"
    >
      <Background 
        color="#e4e4e7" 
        className="dark:[--xy-background-color-props:#27272a]"
        gap={16} 
      />
      <Controls className="dark:[&_button]:bg-neutral-800 dark:[&_button]:border-neutral-700 dark:[&_button]:text-neutral-300" />
      <MiniMap
        nodeColor={(node) => {
          if (node.type === "inputNode") return "#5865FF"; // primary-500
          if (node.data?.type === "ai") return "#A9BAFF"; // primary-300
          return "#A1A1AA"; // neutral-400 for manual and other nodes
        }}
        className="!bg-white dark:!bg-neutral-800 !border-neutral-200 dark:!border-neutral-700"
      />
    </ReactFlow>
  );
};
