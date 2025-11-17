import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { IdeaBoardLayout } from "@/layouts/IdeaBoardLayout";

const Index = () => {
  return (
    <div className="h-screen w-full bg-background">
      <ReactFlowProvider>
        <IdeaBoardLayout />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
