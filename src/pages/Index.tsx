import { MetricCard } from "@/components/MetricCard";
import { ForecastChart } from "@/components/ForecastChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { DrugDataTable } from "@/components/DrugDataTable";
import { Activity, TrendingUp, Package, AlertCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PharmaCast
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced Drug Demand Forecasting & Analytics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-semibold text-foreground">December 2024</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Drug Units"
              value="75,000"
              change={10.3}
              icon={Package}
              trend="up"
            />
            <MetricCard
              title="Forecast Accuracy"
              value="94.2%"
              change={2.1}
              icon={TrendingUp}
              trend="up"
            />
            <MetricCard
              title="Active Drug Categories"
              value="24"
              change={0}
              icon={Activity}
              trend="neutral"
            />
            <MetricCard
              title="Stock Alerts"
              value="3"
              change={-25}
              icon={AlertCircle}
              trend="up"
            />
          </div>
        </section>

        {/* Forecast Chart */}
        <section>
          <ForecastChart />
        </section>

        {/* Category Breakdown */}
        <section>
          <CategoryBreakdown />
        </section>

        {/* Detailed Data Table */}
        <section>
          <DrugDataTable />
        </section>

        {/* Insights Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-gradient-primary text-white">
            <h3 className="text-lg font-semibold mb-2">Demand Increase</h3>
            <p className="text-sm opacity-90">
              Expected 12% increase in overall drug demand for 2025
            </p>
          </div>
          <div className="p-6 rounded-xl bg-success text-success-foreground">
            <h3 className="text-lg font-semibold mb-2">Top Performer</h3>
            <p className="text-sm opacity-90">
              Antibiotics showing strongest growth at 13.9%
            </p>
          </div>
          <div className="p-6 rounded-xl bg-warning text-warning-foreground">
            <h3 className="text-lg font-semibold mb-2">Monitor Closely</h3>
            <p className="text-sm opacity-90">
              Cardiovascular category needs inventory attention
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
