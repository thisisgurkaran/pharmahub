import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { BarChart } from "@mui/x-charts/BarChart";
import { AgGridReact } from "ag-grid-react";
import { 
  ColDef, 
  CellValueChangedEvent,
  GridApi
} from "ag-grid-community";
import ActionButtons from "./ActionButtons";

interface DataRow {
  label: string;
  [key: string]: string;
}

// Generate months for monthly view
const generateMonthlyColumns = (): string[] => {
  const months: string[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let year = 2020; year <= 2030; year++) {
    const shortYear = year.toString().slice(-2);
    for (const month of monthNames) {
      months.push(`${month}-${shortYear}`);
    }
  }
  return months;
};

// Generate years for annual view
const generateAnnualColumns = (): string[] => {
  const years: string[] = [];
  for (let year = 2020; year <= 2030; year++) {
    years.push(year.toString());
  }
  return years;
};

const monthlyColumns = generateMonthlyColumns();
const annualColumns = generateAnnualColumns();

// Format number with commas, no decimals
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);
};

// Format percentage with one decimal
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const PatientSegmentsSection = () => {
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("annual");
  const [chartMode, setChartMode] = useState<"segments" | "patientCount">("segments");
  const gridApiRef = useRef<GridApi | null>(null);

  const columns = viewMode === "monthly" ? monthlyColumns : annualColumns;

  // Input data (percentages - must add to 100%)
  const [inputRowData] = useState<DataRow[]>([
    { label: "Cohort 1", "2020": "45.0%", "2021": "44.0%", "2022": "43.0%", "2023": "42.0%", "2024": "41.0%", "2025": "40.0%", "2026": "39.0%", "2027": "38.0%", "2028": "37.0%", "2029": "36.0%", "2030": "35.0%" },
    { label: "Cohort 2", "2020": "35.0%", "2021": "35.0%", "2022": "35.0%", "2023": "35.0%", "2024": "35.0%", "2025": "35.0%", "2026": "35.0%", "2027": "35.0%", "2028": "35.0%", "2029": "35.0%", "2030": "35.0%" },
    { label: "Cohort 3", "2020": "20.0%", "2021": "21.0%", "2022": "22.0%", "2023": "23.0%", "2024": "24.0%", "2025": "25.0%", "2026": "26.0%", "2027": "27.0%", "2028": "28.0%", "2029": "29.0%", "2030": "30.0%" }
  ]);

  // Output data (numbers)
  const [outputRowData] = useState<DataRow[]>([
    { label: "Cohort 1", "2020": "13,500", "2021": "15,015", "2022": "16,625", "2023": "18,300", "2024": "20,040", "2025": "21,888", "2026": "23,805", "2027": "25,840", "2028": "27,950", "2029": "30,188", "2030": "32,505" },
    { label: "Cohort 2", "2020": "11,250", "2021": "12,012", "2022": "12,825", "2023": "13,664", "2024": "14,529", "2025": "15,444", "2026": "16,381", "2027": "17,408", "2028": "18,447", "2029": "19,550", "2030": "20,685" },
    { label: "Cohort 3", "2020": "6,750", "2021": "7,392", "2022": "8,075", "2023": "8,784", "2024": "9,519", "2025": "10,300", "2026": "11,099", "2027": "11,968", "2028": "12,839", "2029": "13,782", "2030": "14,763" }
  ]);

  const segmentsChartData = useMemo(() => {
    return annualColumns.map((year) => ({
      year: parseInt(year),
      cohort1: parseFloat(inputRowData[0][year]?.replace('%', '') || '0'),
      cohort2: parseFloat(inputRowData[1][year]?.replace('%', '') || '0'),
      cohort3: parseFloat(inputRowData[2][year]?.replace('%', '') || '0'),
    }));
  }, [inputRowData]);

  const patientCountChartData = useMemo(() => {
    return annualColumns.map((year) => ({
      year: parseInt(year),
      cohort1: parseFloat(outputRowData[0][year]?.replace(/,/g, '') || '0'),
      cohort2: parseFloat(outputRowData[1][year]?.replace(/,/g, '') || '0'),
      cohort3: parseFloat(outputRowData[2][year]?.replace(/,/g, '') || '0'),
    }));
  }, [outputRowData]);

  const inputColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "label",
        headerName: "Segment",
        pinned: "left",
        width: 120,
        editable: false,
        cellStyle: { fontWeight: 500 }
      }
    ];

    columns.forEach((col, index) => {
      cols.push({
        field: col,
        headerName: col,
        width: 100,
        editable: true,
        cellStyle: index === 0 ? {
          backgroundColor: '#FFF2CC',
          textAlign: 'center'
        } : {
          backgroundColor: 'hsl(174, 40%, 95%)',
          textAlign: 'center'
        }
      });
    });

    return cols;
  }, [columns]);

  const outputColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "label",
        headerName: "Segment",
        pinned: "left",
        width: 120,
        editable: false,
        cellStyle: { fontWeight: 500 }
      }
    ];

    columns.forEach((col, index) => {
      cols.push({
        field: col,
        headerName: col,
        width: 100,
        editable: false,
        cellStyle: index === 0 ? {
          backgroundColor: '#FFF2CC',
          textAlign: 'center'
        } : {
          textAlign: 'center'
        }
      });
    });

    return cols;
  }, [columns]);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);

  const handleDownload = () => {
    const headers = ["Segment", ...columns];
    const csvContent = [
      "# Input (Percentages)",
      headers.join(","),
      ...inputRowData.map(row => [row.label, ...columns.map(col => row[col] || "")].join(",")),
      "",
      "# Output (Patients)",
      headers.join(","),
      ...outputRowData.map(row => [row.label, ...columns.map(col => row[col] || "")].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_segments_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Patient Segments
          </h3>
          <div className="flex items-center gap-2">
            <ActionButtons onDownload={handleDownload} variant="icon" />
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={viewMode === "monthly" ? "contained" : "outlined"}
                onClick={() => setViewMode("monthly")}
                sx={{
                  backgroundColor: viewMode === "monthly" ? 'hsl(174, 62%, 47%)' : 'transparent',
                  borderColor: 'hsl(174, 62%, 47%)',
                  color: viewMode === "monthly" ? 'white' : 'hsl(174, 62%, 47%)',
                  '&:hover': {
                    backgroundColor: viewMode === "monthly" ? 'hsl(174, 62%, 40%)' : 'hsl(174, 62%, 47%, 0.08)',
                    borderColor: 'hsl(174, 62%, 47%)',
                  },
                }}
              >
                Monthly
              </Button>
              <Button
                variant={viewMode === "annual" ? "contained" : "outlined"}
                onClick={() => setViewMode("annual")}
                sx={{
                  backgroundColor: viewMode === "annual" ? 'hsl(174, 62%, 47%)' : 'transparent',
                  borderColor: 'hsl(174, 62%, 47%)',
                  color: viewMode === "annual" ? 'white' : 'hsl(174, 62%, 47%)',
                  '&:hover': {
                    backgroundColor: viewMode === "annual" ? 'hsl(174, 62%, 40%)' : 'hsl(174, 62%, 47%, 0.08)',
                    borderColor: 'hsl(174, 62%, 47%)',
                  },
                }}
              >
                Annual
              </Button>
            </ButtonGroup>
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={chartMode === "segments" ? "contained" : "outlined"}
                onClick={() => setChartMode("segments")}
                sx={{
                  backgroundColor: chartMode === "segments" ? 'hsl(174, 62%, 47%)' : 'transparent',
                  borderColor: 'hsl(174, 62%, 47%)',
                  color: chartMode === "segments" ? 'white' : 'hsl(174, 62%, 47%)',
                  '&:hover': {
                    backgroundColor: chartMode === "segments" ? 'hsl(174, 62%, 40%)' : 'hsl(174, 62%, 47%, 0.08)',
                    borderColor: 'hsl(174, 62%, 47%)',
                  },
                }}
              >
                Segments
              </Button>
              <Button
                variant={chartMode === "patientCount" ? "contained" : "outlined"}
                onClick={() => setChartMode("patientCount")}
                sx={{
                  backgroundColor: chartMode === "patientCount" ? 'hsl(174, 62%, 47%)' : 'transparent',
                  borderColor: 'hsl(174, 62%, 47%)',
                  color: chartMode === "patientCount" ? 'white' : 'hsl(174, 62%, 47%)',
                  '&:hover': {
                    backgroundColor: chartMode === "patientCount" ? 'hsl(174, 62%, 40%)' : 'hsl(174, 62%, 47%, 0.08)',
                    borderColor: 'hsl(174, 62%, 47%)',
                  },
                }}
              >
                Patient Count
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56">
          <BarChart
            xAxis={[{ 
              data: (chartMode === "segments" ? segmentsChartData : patientCountChartData).map(d => d.year.toString()), 
              scaleType: "band",
              tickLabelStyle: { fontSize: 11 },
              categoryGapRatio: 0.6
            }]}
            yAxis={[{ tickLabelStyle: { fontSize: 11 } }]}
            series={[
              { data: (chartMode === "segments" ? segmentsChartData : patientCountChartData).map(d => d.cohort1), color: "#40A9FF", label: "Cohort 1", stack: "total" },
              { data: (chartMode === "segments" ? segmentsChartData : patientCountChartData).map(d => d.cohort2), color: "#FFD54F", label: "Cohort 2", stack: "total" },
              { data: (chartMode === "segments" ? segmentsChartData : patientCountChartData).map(d => d.cohort3), color: "#FF7043", label: "Cohort 3", stack: "total" },
            ]}
            height={220}
            margin={{ top: 10, right: 10, bottom: 25, left: 50 }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#40A9FF" }} />
            <span className="text-sm text-foreground">Cohort 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFD54F" }} />
            <span className="text-sm text-foreground">Cohort 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF7043" }} />
            <span className="text-sm text-foreground">Cohort 3</span>
          </div>
        </div>

        {/* Input Grid */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Segments</h4>
          <div 
            className="ag-theme-alpine" 
            style={{ width: '100%', height: 130 }}
            tabIndex={0}
          >
            <AgGridReact
              rowData={inputRowData}
              columnDefs={inputColumnDefs}
              defaultColDef={defaultColDef}
              suppressMovableColumns={true}
            />
          </div>
        </div>

        {/* Output Grid */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Patient Count</h4>
          <div 
            className="ag-theme-alpine" 
            style={{ width: '100%', height: 130 }}
          >
            <AgGridReact
              rowData={outputRowData}
              columnDefs={outputColumnDefs}
              defaultColDef={defaultColDef}
              suppressMovableColumns={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSegmentsSection;
