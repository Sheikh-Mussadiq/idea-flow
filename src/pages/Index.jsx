import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { IdeaBoardLayout } from "../layouts/IdeaBoardLayout.jsx";

const Index = () => {
  return (
    <AppLayout>
      <ReactFlowProvider>
        <IdeaBoardLayout />
      </ReactFlowProvider>
    </AppLayout>
  );
};

export default Index;
