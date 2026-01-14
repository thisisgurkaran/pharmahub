import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, LayoutGrid, TrendingUp, PieChart, ChevronDown } from "lucide-react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface ActionPanelIconCardsProps {
  onGenerateInsights: () => void;
}

const ActionPanelIconCards = ({ onGenerateInsights }: ActionPanelIconCardsProps) => {
  const navigate = useNavigate();
  const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null);

  const actions = [
    {
      id: "apps",
      icon: LayoutGrid,
      title: "Apps",
      description: "Access Pipeline, Inline & Enterprise tools",
      hasDropdown: true,
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-500",
      hidden: false,
    },
    {
      id: "insights",
      icon: Sparkles,
      title: "Generate Insights",
      description: "AI-powered analysis and recommendations",
      onClick: onGenerateInsights,
      color: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-500",
      hidden: true,
    },
    {
      id: "forecast",
      icon: TrendingUp,
      title: "View Forecasts",
      description: "Explore scenario projections",
      onClick: () => navigate("/scenarios"),
      color: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-500",
      hidden: true,
    },
    {
      id: "outputs",
      icon: PieChart,
      title: "Consolidated Outputs",
      description: "Review aggregated results",
      onClick: () => navigate("/consolidated-outputs"),
      color: "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-500",
      hidden: false,
    },
  ];

  const handleAppsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-4">Action Panel</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.filter(action => !action.hidden).map((action) => (
          <button
            key={action.id}
            onClick={action.hasDropdown ? handleAppsClick : action.onClick}
            className={`group relative p-4 rounded-xl bg-gradient-to-br ${action.color} border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left`}
          >
            <div className={`w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <div className="flex items-center gap-1">
              <h5 className="text-sm font-semibold text-foreground mb-1">{action.title}</h5>
              {action.hasDropdown && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
          </button>
        ))}
      </div>
      
      <Menu
        anchorEl={appsAnchorEl}
        open={Boolean(appsAnchorEl)}
        onClose={() => setAppsAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            minWidth: 180,
          },
        }}
      >
        <MenuItem 
          onClick={() => { setAppsAnchorEl(null); navigate('/pipeline-indication'); }}
          sx={{ color: 'hsl(var(--foreground))' }}
        >
          Pipeline
        </MenuItem>
        <MenuItem 
          onClick={() => { setAppsAnchorEl(null); navigate('/testpage'); }}
          sx={{ color: 'hsl(var(--foreground))' }}
        >
          Inline
        </MenuItem>
        <MenuItem 
          onClick={() => { setAppsAnchorEl(null); navigate('/consolidated-outputs'); }}
          sx={{ color: 'hsl(var(--foreground))' }}
        >
          Enterprise Valuation
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ActionPanelIconCards;
