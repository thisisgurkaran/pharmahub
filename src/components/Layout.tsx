import { ReactNode, useState } from "react";
import { Home, Grid3x3, Bell, Zap, RefreshCw, Newspaper, Search, ChevronDown, Check } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import { Link, useNavigate } from "react-router-dom";

interface Scenario {
  id: string;
  name: string;
  date: string;
}

const scenarios: Scenario[] = [
  { id: "base-case-q4-2025", name: "Base Case - Q4 2025", date: "Dec 15, 2024" },
  { id: "optimistic-pfs-launch", name: "Optimistic - PFS Launch", date: "Dec 18, 2024" },
  { id: "conservative-market-pressure", name: "Conservative - Market Pressure", date: "Dec 20, 2024" },
  { id: "aggressive-growth", name: "Aggressive Growth", date: "Dec 22, 2024" },
  { id: "baseline-2026", name: "Baseline 2026", date: "Jan 02, 2025" },
];

interface LayoutProps {
  children: ReactNode;
  username?: string;
  showLogo?: boolean;
  selectedScenario?: string;
  onScenarioChange?: (scenarioId: string) => void;
}

type NotificationType = "action" | "update" | "news";

interface Notification {
  id: number;
  text: string;
  type: NotificationType;
}

const notificationConfig: Record<NotificationType, { icon: typeof Zap; colorClass: string }> = {
  action: { icon: Zap, colorClass: "text-warning bg-warning/10" },
  update: { icon: RefreshCw, colorClass: "text-success bg-success/10" },
  news: { icon: Newspaper, colorClass: "text-primary bg-primary/10" },
};

const notifications: Notification[] = [
  { id: 1, text: "New MR Studies available", type: "news" },
  { id: 2, text: "New Actuals data flowed in", type: "update" },
  { id: 3, text: "Upcoming IST/ICT Meetings coming up", type: "action" },
];

export function Layout({ 
  children, 
  username = "Wouter Callewaert", 
  showLogo = true,
  selectedScenario = "base-case-q4-2025",
  onScenarioChange 
}: LayoutProps) {
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [scenarioAnchorEl, setScenarioAnchorEl] = useState<null | HTMLElement>(null);
  const [scenarioSearch, setScenarioSearch] = useState("");
  const [currentScenario, setCurrentScenario] = useState(selectedScenario);
  const navigate = useNavigate();

  const filteredScenarios = scenarios.filter(s => 
    s.name.toLowerCase().includes(scenarioSearch.toLowerCase())
  );

  const currentScenarioData = scenarios.find(s => s.id === currentScenario);

  const handleScenarioSelect = (scenarioId: string) => {
    setCurrentScenario(scenarioId);
    setScenarioAnchorEl(null);
    setScenarioSearch("");
    if (onScenarioChange) {
      onScenarioChange(scenarioId);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showLogo && (
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">argenx</span>
              </Link>
            )}
            
            {/* Scenario Selector */}
            <div className="flex items-center">
              <div className="h-6 w-px bg-border mx-2" />
              <button
                onClick={(e) => setScenarioAnchorEl(e.currentTarget)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm"
              >
                <span className="text-muted-foreground">Scenario:</span>
                <span className="font-medium text-foreground">{currentScenarioData?.name || "Select..."}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <Popover
                open={Boolean(scenarioAnchorEl)}
                anchorEl={scenarioAnchorEl}
                onClose={() => {
                  setScenarioAnchorEl(null);
                  setScenarioSearch("");
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                sx={{ '& .MuiPaper-root': { mt: 1, minWidth: 300, backgroundColor: 'hsl(var(--card))' } }}
              >
                <div className="p-2">
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search scenarios..."
                      value={scenarioSearch}
                      onChange={(e) => setScenarioSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                  </div>
                  
                  {/* Scenario List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredScenarios.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No scenarios found
                      </div>
                    ) : (
                      filteredScenarios.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => handleScenarioSelect(scenario.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-muted transition-colors ${
                            currentScenario === scenario.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div>
                            <div className="text-sm font-medium text-foreground">{scenario.name}</div>
                            <div className="text-xs text-muted-foreground">{scenario.date}</div>
                          </div>
                          {currentScenario === scenario.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground">
              Welcome, <span className="font-semibold">{username}</span>
            </span>
            
            {/* Notification Bell */}
            <IconButton 
              size="small" 
              sx={{ color: 'text.primary' }}
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            >
              <Badge badgeContent={notifications.length} color="error" max={9}>
                <Bell className="w-5 h-5" />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ '& .MuiPaper-root': { mt: 1, minWidth: 280, backgroundColor: 'white' } }}
            >
              <div className="p-3">
                <h4 className="text-sm font-semibold text-foreground mb-3">Notifications</h4>
                <div className="space-y-2">
                  {notifications.map((notif) => {
                    const config = notificationConfig[notif.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer transition-colors ${config.colorClass} hover:opacity-80`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-foreground">{notif.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Popover>

            <Link to="/">
              <IconButton size="small" sx={{ color: 'text.primary' }}>
                <Home className="w-5 h-5" />
              </IconButton>
            </Link>
            <IconButton size="small" sx={{ color: 'text.primary' }}>
              <Grid3x3 className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden min-h-0">{children}</main>
    </div>
  );
}
