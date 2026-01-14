import { Layout } from "@/components/Layout";
import { useParams } from "react-router-dom";
import PipelineIndication from "./PipelineIndication";

const ScenarioDetail = () => {
  const { id } = useParams();
  
  // Render the PipelineIndication page for this scenario
  return <PipelineIndication />;
};

export default ScenarioDetail;
