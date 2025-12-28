import ReactFlow, { Background, MiniMap, useReactFlow } from "reactflow";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

/**
 * A modern, minimal button for flow controls
 */
const ControlButton = ({ onClick, icon, tooltip }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 rounded-xl transition-all duration-200 active:scale-90 flex items-center justify-center"
  >
    {icon}
  </button>
);

/**
 * Custom centered flow controls with a glassmorphic look
 */
const CustomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <ControlButton
        onClick={() => zoomIn()}
        icon={<ZoomIn size={18} strokeWidth={2.5} />}
        tooltip="Zoom In"
      />
      <ControlButton
        onClick={() => zoomOut()}
        icon={<ZoomOut size={18} strokeWidth={2.5} />}
        tooltip="Zoom Out"
      />
      <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
      <ControlButton
        onClick={() => fitView({ padding: 0.2, duration: 800 })}
        icon={<Maximize2 size={18} strokeWidth={2.5} />}
        tooltip="Fit View"
      />
    </div>
  );
};

export const FlowView = ({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  canEdit,
  onNodeDragStop,
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
      onNodeDragStop={canEdit ? onNodeDragStop : undefined}
      nodeOrigin={[0.5, 0]}
      className="transition-all duration-500 bg-white dark:bg-neutral-950"
    >
      <Background
        color="#e4e4e7"
        className="dark:[--xy-background-color-props:#27272a]"
        gap={16}
      />

      {/* Custom centered controls */}
      <CustomControls />

      <MiniMap
        nodeColor={(node) => {
          if (node.type === "inputNode") return "#5865FF"; // primary-500
          if (node.data?.type === "ai") return "#A9BAFF"; // primary-300
          return "#A1A1AA"; // neutral-400 for manual and other nodes
        }}
        className="!bg-white/80 dark:!bg-neutral-900/80 !backdrop-blur-md !border-neutral-200 dark:!border-neutral-700 !rounded-xl !shadow-lg !m-4"
        maskColor="rgba(0, 0, 0, 0.05)"
      />
    </ReactFlow>
  );
};
