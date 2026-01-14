import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { ColDef } from "ag-grid-community";

interface DrugData {
  id: string;
  drugName: string;
  category: string;
  currentStock: number;
  forecast2025: number;
  variance: number;
  status: string;
  supplier: string;
}

const rowData: DrugData[] = [
  { id: "D001", drugName: "Amoxicillin 500mg", category: "Antibiotics", currentStock: 2500, forecast2025: 2850, variance: 14.0, status: "In Stock", supplier: "PharmaCorp" },
  { id: "D002", drugName: "Ibuprofen 400mg", category: "Pain Relief", currentStock: 3200, forecast2025: 3680, variance: 15.0, status: "In Stock", supplier: "MediSupply" },
  { id: "D003", drugName: "Atorvastatin 20mg", category: "Cardiovascular", currentStock: 1800, forecast2025: 2160, variance: 20.0, status: "Low Stock", supplier: "CardioMed" },
  { id: "D004", drugName: "Salbutamol Inhaler", category: "Respiratory", currentStock: 1200, forecast2025: 1440, variance: 20.0, status: "In Stock", supplier: "RespiCare" },
  { id: "D005", drugName: "Metformin 850mg", category: "Diabetes", currentStock: 2100, forecast2025: 2520, variance: 20.0, status: "In Stock", supplier: "DiabetesCare" },
  { id: "D006", drugName: "Azithromycin 250mg", category: "Antibiotics", currentStock: 1500, forecast2025: 1725, variance: 15.0, status: "In Stock", supplier: "PharmaCorp" },
  { id: "D007", drugName: "Paracetamol 500mg", category: "Pain Relief", currentStock: 4500, forecast2025: 5175, variance: 15.0, status: "In Stock", supplier: "MediSupply" },
  { id: "D008", drugName: "Lisinopril 10mg", category: "Cardiovascular", currentStock: 1600, forecast2025: 1920, variance: 20.0, status: "Low Stock", supplier: "CardioMed" },
  { id: "D009", drugName: "Budesonide Inhaler", category: "Respiratory", currentStock: 980, forecast2025: 1180, variance: 20.4, status: "Low Stock", supplier: "RespiCare" },
  { id: "D010", drugName: "Insulin Glargine", category: "Diabetes", currentStock: 850, forecast2025: 1020, variance: 20.0, status: "Critical", supplier: "DiabetesCare" },
  { id: "D011", drugName: "Ciprofloxacin 500mg", category: "Antibiotics", currentStock: 1850, forecast2025: 2130, variance: 15.1, status: "In Stock", supplier: "PharmaCorp" },
  { id: "D012", drugName: "Naproxen 250mg", category: "Pain Relief", currentStock: 1400, forecast2025: 1610, variance: 15.0, status: "In Stock", supplier: "MediSupply" },
];

export function DrugDataTable() {
  const columnDefs: ColDef<DrugData>[] = useMemo(() => [
    { field: "id", headerName: "Drug ID", width: 110, filter: true, pinned: "left" },
    { field: "drugName", headerName: "Drug Name", width: 200, filter: true, pinned: "left" },
    { field: "category", headerName: "Category", width: 150, filter: true },
    { field: "currentStock", headerName: "Current Stock", width: 150, filter: "agNumberColumnFilter", valueFormatter: (params) => params.value?.toLocaleString() || "0" },
    { field: "forecast2025", headerName: "2025 Forecast", width: 150, filter: "agNumberColumnFilter", valueFormatter: (params) => params.value?.toLocaleString() || "0" },
    { 
      field: "variance", headerName: "Growth %", width: 120, filter: "agNumberColumnFilter",
      valueFormatter: (params) => `${params.value?.toFixed(1)}%`,
      cellStyle: (params) => {
        if (params.value > 18) return { color: "hsl(var(--success))", fontWeight: "600" };
        if (params.value < 12) return { color: "hsl(var(--warning))", fontWeight: "600" };
        return { fontWeight: "600" };
      }
    },
    { 
      field: "status", headerName: "Status", width: 130, filter: true,
      cellStyle: (params) => {
        if (params.value === "Critical") return { backgroundColor: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", fontWeight: "600" };
        if (params.value === "Low Stock") return { backgroundColor: "hsl(var(--warning) / 0.1)", color: "hsl(var(--warning))", fontWeight: "600" };
        return { backgroundColor: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))", fontWeight: "600" };
      }
    },
    { field: "supplier", headerName: "Supplier", width: 150, filter: true },
  ], []);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Detailed Drug Inventory</h3>
          <p className="text-sm text-muted-foreground mt-1">Complete data with forecasting and status tracking</p>
        </div>
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            animateRows={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
