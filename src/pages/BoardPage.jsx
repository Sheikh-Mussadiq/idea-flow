import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { IdeaBoardLayout } from "../components/BoardPage/IdeaBoardLayout.jsx";

const BoardPage = () => {
  return (
    <AppLayout>
      <ReactFlowProvider>
        <IdeaBoardLayout />
      </ReactFlowProvider>
    </AppLayout>
  );
};

export default BoardPage;
