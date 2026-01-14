import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const data = [
  { year: "2020", actual: 45000, forecast: 45000 },
  { year: "2021", actual: 52000, forecast: 50000 },
  { year: "2022", actual: 61000, forecast: 58000 },
  { year: "2023", actual: 68000, forecast: 67000 },
  { year: "2024", actual: 75000, forecast: 76000 },
  { year: "2025", forecast: 84000 },
  { year: "2026", forecast: 92000 },
];

export function ForecastChart() {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Yearly Drug Demand Forecast</h3>
          <p className="text-sm text-muted-foreground mt-1">Historical data and predictive analysis</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              name="Actual Demand"
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--accent))", r: 5 }}
              name="Forecasted Demand"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
