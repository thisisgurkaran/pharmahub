import { Layout } from "@/components/Layout";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { LineChart } from "@mui/x-charts/LineChart";
import { TrendingUp, ChevronRight, Settings, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const ForecastingAnalytics = () => {
  const monthlyData = {
    months: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    patients: [7, 6, 11, 12, 8, 6, 9, 8, 7, 8, 7, 6],
    vials: [9, 8, 11, 12, 9, 8, 10, 9, 8, 9, 8, 8],
    revenue: [9, 10, 11, 12, 10, 9, 11, 10, 9, 11, 10, 12],
  };

  const keyMetrics = [
    { label: "Net Present Value", value: "$173M", change: "5%", comparison: "vs LE1" },
    { label: "Cumulative Net Revenue", value: "$173M", change: "5%", comparison: "vs LE1" },
    { label: "Free Cash Flow", value: "$173M", change: "5%", comparison: "vs LE1" },
    { label: "Gross Profit", subLabel: "(Margin)", value: "$173M (10%)", change: "5%", comparison: "vs LE1" },
    { label: "Operating Profit", subLabel: "(Margin)", value: "$165M (15%)", change: "2%", comparison: "vs LE1" },
  ];

  const menuItems = [
    { label: "Revenue Optimization", icon: TrendingUp },
    { label: "Price Volume Analysis", icon: TrendingUp },
    { label: "Investment Recommendations", icon: TrendingUp },
    { label: "Schedule Impact Analysis", icon: TrendingUp },
    { label: "Resource Allocation Optimization", icon: TrendingUp },
  ];

  const historyItems = [
    { timeframe: "Today", items: ["Schedule Impact Analysis - FinPlan 2025"] },
    { timeframe: "Yesterday", items: ["Price Volume Analysis Session - FinPlan 2026", "Pipeline Prioritization - FinPlan 2026"] },
    { timeframe: "Last 2 Days", items: ["Pipeline Prioritization - FinPlan 2026"] },
  ];

  return (
    <Layout>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border p-6 min-h-screen">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-foreground mb-2">Welcome back, Wouter!</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I have fetched the latest set of assumptions used in the scenario FinPlan 2026.
                These were refreshed on 1st September. I have published them along with my
                synthesized findings for your review in the right panel.
              </p>
            </div>

            <div>
              <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary w-full">
                What would you like to explore today?
                <ChevronDown className="w-4 h-4 ml-auto" />
              </button>

              <div className="mt-4 space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center justify-between w-full p-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-primary" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pt-4">
              <input
                type="text"
                placeholder="Enter your query"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm pr-10"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-white rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-foreground">Forecasting Analytics</h1>
                <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Settings className="w-4 h-4" />
                  Configuration
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Scenario: Base_Enterprise Valuation 2025_1
              </p>
            </div>

            {/* Key Highlights */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Key Highlights</h2>
              <div className="grid grid-cols-5 gap-4">
                {keyMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent sx={{ p: 2 }}>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">
                          {metric.label}
                          {metric.subLabel && (
                            <span className="text-muted-foreground"> {metric.subLabel}</span>
                          )}
                        </p>
                        <p className="text-xl font-bold text-foreground">{metric.value}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="w-3 h-3 text-success" />
                          <span className="text-success font-medium">{metric.change}</span>
                          <span className="text-muted-foreground">{metric.comparison}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-accent rounded">
                        <TrendingUp className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Patients</h3>
                    </div>
                    <button className="text-primary hover:underline">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-32">
                    <LineChart
                      xAxis={[{ data: monthlyData.months, scaleType: "point" }]}
                      series={[{ data: monthlyData.patients, color: "#40A9FF", curve: "linear" }]}
                      height={120}
                      margin={{ top: 5, right: 5, bottom: 20, left: 25 }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-accent rounded">
                        <TrendingUp className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Vials</h3>
                    </div>
                    <button className="text-primary hover:underline">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-32">
                    <LineChart
                      xAxis={[{ data: monthlyData.months, scaleType: "point" }]}
                      series={[{ data: monthlyData.vials, color: "#40A9FF", curve: "linear" }]}
                      height={120}
                      margin={{ top: 5, right: 5, bottom: 20, left: 25 }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-accent rounded">
                        <TrendingUp className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Revenue</h3>
                    </div>
                    <button className="text-primary hover:underline">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-32">
                    <LineChart
                      xAxis={[{ data: monthlyData.months, scaleType: "point" }]}
                      series={[{ data: monthlyData.revenue, color: "#40A9FF", curve: "linear" }]}
                      height={120}
                      margin={{ top: 5, right: 5, bottom: 20, left: 25 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">History</h2>
                <Link to="/scenarios" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {historyItems.map((section, index) => (
                  <Card key={index}>
                    <CardContent sx={{ p: 2 }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">{section.timeframe}</h3>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        {section.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">{item}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForecastingAnalytics;
