import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const data = [
  { category: "Antibiotics", current: 18000, forecast: 20500 },
  { category: "Pain Relief", current: 15000, forecast: 17200 },
  { category: "Cardiovascular", current: 12500, forecast: 14800 },
  { category: "Respiratory", current: 10500, forecast: 12300 },
  { category: "Diabetes", current: 9000, forecast: 10800 },
  { category: "Others", current: 10000, forecast: 11400 },
];

export function CategoryBreakdown() {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Drug Category Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">Current vs. forecasted demand by category</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="category" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="current" fill="hsl(var(--primary))" name="Current Year" radius={[8, 8, 0, 0]} />
            <Bar dataKey="forecast" fill="hsl(var(--accent))" name="Next Year Forecast" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
