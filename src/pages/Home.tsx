import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, BarChart3, Eye, ChevronDown, Sparkles, Lightbulb, PanelLeftClose, PanelLeft, ChevronUp } from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ActionPanelIconCards from "@/components/ActionPanelIconCards";

const Home = () => {
  const navigate = useNavigate();
  const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedChatOption, setSelectedChatOption] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(true);

  const chatOptions = [
    { id: "forecast", title: "Create a Forecast", icon: BarChart3 },
    { id: "analyze", title: "Analyze Scenarios", icon: MessageSquare },
    { id: "visualize", title: "Visualize Outputs", icon: Eye },
  ];

  const handleChatOptionClick = (optionId: string) => {
    setSelectedChatOption(optionId);
    setChatDialogOpen(true);
  };

  const handleDialogAction = (action: string) => {
    setChatDialogOpen(false);
    if (action === "update-forecast") {
      navigate("/scenarios");
    }
  };

  const metricsData = [
    {
      title: "Net Revenue",
      value: "$1,064M",
      icon: "💰",
      prevQuarter: { value: "95%", label: "of Previous Quarter" },
      finPlan: { value: "83%", label: "of FinPlan 2026" },
    },
    {
      title: "Vials in Milligrams",
      value: "122,646K",
      icon: "💊",
      prevQuarter: { value: "104%", label: "of Previous Quarter" },
      finPlan: { value: "69%", label: "of FinPlan 2026" },
    },
    {
      title: "Cumulative Patients on Therapy",
      value: "18,158",
      icon: "👥",
      prevQuarter: { value: "109%", label: "of Previous Quarter" },
      finPlan: { value: "96%", label: "of FinPlan 2026" },
    },
  ];

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Chat Panel - Hidden on mobile/tablet */}
        {showChatPanel && (
          <div className="hidden lg:flex w-80 bg-card border-r border-border p-6 min-h-full flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
              <IconButton 
                size="small" 
                onClick={() => setShowChatPanel(false)}
                sx={{ color: 'text.primary' }}
              >
                <PanelLeftClose className="w-4 h-4" />
              </IconButton>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-sm text-foreground mb-2">Welcome back, Wouter!</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I have fetched the latest set of assumptions used in the scenario FinPlan 2026.
                  These were refreshed on 1st September. I have published them along with my
                  synthesized findings for your review.
                </p>
              </div>

              <div>
                <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                  What would you like to explore today?
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-2">
                {chatOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleChatOptionClick(option.id)}
                    className="w-full bg-muted hover:bg-muted/80 text-foreground rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <option.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{option.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Recommendations</span>
                </div>
                <div className="space-y-2">
                  {["Review Q4 forecast assumptions", "Update patient enrollment projections", "Validate market share estimates"].map((rec, idx) => (
                    <button
                      key={idx}
                      onClick={() => {}}
                      className="w-full bg-muted hover:bg-muted/80 text-foreground rounded-lg p-3 text-left transition-colors text-sm"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input */}
              <div className="mt-auto">
                <TextField
                  fullWidth
                  placeholder="Enter your query"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'primary.main', 
                            color: 'white', 
                            '&:hover': { backgroundColor: 'primary.dark' } 
                          }}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toggle button when panel is hidden - only on large screens */}
        {!showChatPanel && (
          <div className="hidden lg:flex p-2 bg-muted/30 items-start">
            <IconButton 
              size="small" 
              onClick={() => setShowChatPanel(true)}
              sx={{ color: 'hsl(var(--primary))' }}
            >
              <PanelLeft className="w-5 h-5" />
            </IconButton>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 bg-background">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Market Share Price */}
            <Card sx={{ backgroundColor: 'hsl(var(--card))' }}>
              <CardContent sx={{ p: 3 }}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Market Share Price</h4>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">$523.45</span>
                  <span className="text-sm text-green-600 font-medium">+2.4%</span>
                </div>
                <div className="flex gap-4 mt-3">
                  {["1D", "1M", "6M", "1Y"].map((period) => (
                    <button
                      key={period}
                      className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Valuation Per Share */}
            <Card sx={{ backgroundColor: 'hsl(var(--card))' }}>
              <CardContent sx={{ p: 3 }}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Valuation Per Share</h4>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">$612.80</span>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">FinPlan 26: </span>
                    <span className="text-green-600 font-medium">+5.2%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LRP 26: </span>
                    <span className="text-red-600 font-medium">-1.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Valuation */}
            <Card sx={{ backgroundColor: 'hsl(var(--card))' }}>
              <CardContent sx={{ p: 3 }}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Company Valuation</h4>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">$847.2M</span>
                  <span className="text-sm text-green-600 font-medium">+3.1%</span>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Market Cap: </span>
                    <span className="text-foreground font-medium">$756.4M</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Enterprise: </span>
                    <span className="text-foreground font-medium">$847.2M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Cards */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Attainment metrics based on latest forecast cycle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricsData.map((metric, index) => (
                <Card key={index} sx={{ backgroundColor: 'hsl(var(--card))' }}>
                  <CardContent sx={{ p: 3 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{metric.icon}</span>
                      <span className="text-foreground text-sm font-medium">{metric.title}</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-3">{metric.value}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground">{metric.prevQuarter.value}</span>
                        <span className="text-muted-foreground">{metric.prevQuarter.label}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground">{metric.finPlan.value}</span>
                        <span className="text-muted-foreground">{metric.finPlan.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Panel */}
          <ActionPanelIconCards onGenerateInsights={() => setShowChatPanel(true)} />
        </div>

      </div>

      {/* Chat Option Dialog */}
      <Dialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)}>
        <DialogTitle>
          {selectedChatOption === "forecast" && "Create a Forecast"}
          {selectedChatOption === "analyze" && "Analyze Scenarios"}
          {selectedChatOption === "visualize" && "Visualize Outputs"}
        </DialogTitle>
        <DialogContent>
          <p className="text-muted-foreground">
            {selectedChatOption === "forecast" && "Would you like to create a new forecast or update an existing one?"}
            {selectedChatOption === "analyze" && "Choose scenarios to compare and analyze."}
            {selectedChatOption === "visualize" && "Select the outputs you want to visualize."}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleDialogAction("update-forecast")}
            variant="contained"
            sx={{
              backgroundColor: 'hsl(var(--primary))',
              '&:hover': { backgroundColor: 'hsl(var(--primary) / 0.9)' },
            }}
          >
            {selectedChatOption === "forecast" ? "Update Forecast" : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default Home;
