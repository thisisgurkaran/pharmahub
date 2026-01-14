import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { muiTheme } from "./theme/muiTheme";
import Home from "./pages/Home";
import Scenarios from "./pages/Scenarios";
import PipelineIndication from "./pages/PipelineIndication";
import ForecastingAnalytics from "./pages/ForecastingAnalytics";
import ConsolidatedOutputs from "./pages/ConsolidatedOutputs";
import ScenarioDetail from "./pages/ScenarioDetail";
import Testpage from "./pages/Testpage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/scenario/:id" element={<ScenarioDetail />} />
          <Route path="/scenario/:id/pipeline" element={<PipelineIndication />} />
          <Route path="/pipeline-indication" element={<PipelineIndication />} />
          <Route path="/forecasting-analytics" element={<ForecastingAnalytics />} />
          <Route path="/consolidated-outputs" element={<ConsolidatedOutputs />} />
          <Route path="/testpage" element={<Testpage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
