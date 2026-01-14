import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ActionButtons from "./ActionButtons";
import { AgGridReact } from "ag-grid-react";
import { 
  ColDef, 
  CellValueChangedEvent,
  ModuleRegistry,
  ClientSideRowModelModule,
  TextEditorModule,
  ValidationModule,
  GridApi
} from "ag-grid-community";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextEditorModule,
  ValidationModule
]);

interface DataRow {
  label: string;
  [key: string]: string;
}

// Generate months from Jan-20 to Dec-30 for monthly view
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

// Generate years from 2020 to 2030 for annual view
const generateAnnualColumns = (): string[] => {
  const years: string[] = [];
  for (let year = 2020; year <= 2030; year++) {
    years.push(year.toString());
  }
  return years;
};

const monthlyColumns = generateMonthlyColumns();
const annualColumns = generateAnnualColumns();

interface EpidemiologyDataGridProps {
  title: string;
  initialData?: DataRow[];
}

const uptakeCurveOptions = [
  "Slow Uptake 4",
  "Slow Uptake 3",
  "Slow Uptake 2",
  "Slow Uptake 1",
  "Linear Uptake",
  "Fast Uptake 1",
  "Fast Uptake 2",
  "Fast Uptake 3",
  "Fast Uptake 4",
  "Fast Uptake 5"
];

interface CurveFormData {
  startDate: string;
  startValue: string;
  startValueType: "number" | "percentage";
  peakValue: string;
  peakValueType: "number" | "percentage";
  timeToReachPeak: string;
  uptakeCurve: string;
}

const EpidemiologyDataGrid = ({ title, initialData }: EpidemiologyDataGridProps) => {
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("annual");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curveForm, setCurveForm] = useState<CurveFormData>({
    startDate: "",
    startValue: "",
    startValueType: "number",
    peakValue: "",
    peakValueType: "number",
    timeToReachPeak: "",
    uptakeCurve: ""
  });
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  
  const columns = viewMode === "monthly" ? monthlyColumns : annualColumns;

  const defaultRowData: DataRow[] = useMemo(() => {
    if (initialData) return initialData;
    const row: DataRow = { label: "Current Values" };
    annualColumns.forEach(col => {
      row[col] = "";
    });
    return [row];
  }, [initialData]);

  const [rowData, setRowData] = useState<DataRow[]>(defaultRowData);

  const columnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "label",
        headerName: "Phase",
        pinned: "left",
        width: 150,
        editable: false,
        cellStyle: { fontWeight: 500, textAlign: 'left' }
      }
    ];

    columns.forEach(col => {
      cols.push({
        field: col,
        headerName: col,
        width: 100,
        editable: true,
        cellClass: 'ag-cell-number',
        cellStyle: {
          backgroundColor: 'hsl(45, 100%, 88%)',
        }
      });
    });

    return cols;
  }, [columns]);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log("Cell value changed:", event.data);
  }, []);

  const onGridReady = useCallback((params: { api: GridApi }) => {
    gridApiRef.current = params.api;
  }, []);

  const handleFormChange = (field: keyof CurveFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurveForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateCurve = () => {
    console.log("Creating curve with:", curveForm);
    // TODO: Implement curve generation logic
    setIsModalOpen(false);
    setCurveForm({
      startDate: "",
      startValue: "",
      startValueType: "number",
      peakValue: "",
      peakValueType: "number",
      timeToReachPeak: "",
      uptakeCurve: ""
    });
  };

  const handleValueTypeChange = (field: 'startValueType' | 'peakValueType') => (
    _: React.MouseEvent<HTMLElement>,
    newValue: "number" | "percentage" | null
  ) => {
    if (newValue !== null) {
      setCurveForm(prev => ({ ...prev, [field]: newValue }));
    }
  };

  const handleDownload = () => {
    // Create CSV from rowData
    const headers = ["Phase", ...columns];
    const csvContent = [
      headers.join(","),
      ...rowData.map(row => [row.label, ...columns.map(col => row[col] || "")].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "epidemiology_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const gridElement = document.querySelector('.ag-theme-alpine');
      if (!gridElement?.contains(document.activeElement) && document.activeElement !== gridElement) {
        return;
      }

      e.preventDefault();
      
      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      const rows = clipboardData.split('\n').filter(row => row.trim());
      const parsedData = rows.map(row => row.split('\t'));
      
      if (parsedData.length === 0) return;

      const focusedCell = gridApiRef.current?.getFocusedCell();
      if (!focusedCell) {
        const newRowData = [...rowData];
        const startColIndex = 0;
        
        parsedData[0].forEach((value, colIndex) => {
          const targetCol = columns[startColIndex + colIndex];
          if (targetCol && newRowData[0]) {
            newRowData[0][targetCol] = value.trim();
          }
        });
        
        setRowData(newRowData);
        return;
      }

      const allColumns = gridApiRef.current?.getColumns() || [];
      const focusedColIndex = allColumns.findIndex(col => col.getColId() === focusedCell.column.getColId());
      
      const newRowData = [...rowData];
      parsedData.forEach((pastedRow, rowOffset) => {
        const targetRowIndex = focusedCell.rowIndex + rowOffset;
        if (targetRowIndex < newRowData.length) {
          pastedRow.forEach((value, colOffset) => {
            const targetColIndex = focusedColIndex + colOffset;
            if (targetColIndex < allColumns.length) {
              const colId = allColumns[targetColIndex].getColId();
              if (colId && colId !== 'label') {
                newRowData[targetRowIndex][colId] = value.trim();
              }
            }
          });
        }
      });
      
      setRowData(newRowData);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [rowData, columns]);

  return (
    <div className="space-y-2">
      {/* Toggle for Monthly/Annual and Create Curve button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsModalOpen(true)}
            sx={{
              borderColor: 'hsl(174, 62%, 47%)',
              color: 'hsl(174, 62%, 47%)',
              '&:hover': {
                borderColor: 'hsl(174, 62%, 40%)',
                backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
              },
            }}
          >
            Create Curve
          </Button>
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
        </div>
      </div>

      {/* AG Grid */}
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <div 
            className="ag-theme-alpine" 
            style={{ 
              width: '100%', 
              height: 100
            }}
            tabIndex={0}
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={onCellValueChanged}
              onGridReady={onGridReady}
              suppressMovableColumns={true}
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-1">Tip: Click on a cell and press Ctrl+V to paste data from Excel</p>

      {/* Create Curve Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create Curve</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              size="small"
              value={curveForm.startDate}
              onChange={handleFormChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
            
            {/* Start Value with Toggle */}
            <div className="flex items-center gap-2">
              <ToggleButtonGroup
                value={curveForm.startValueType}
                exclusive
                onChange={handleValueTypeChange('startValueType')}
                size="small"
              >
                <ToggleButton value="number" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                  #
                </ToggleButton>
                <ToggleButton value="percentage" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                  %
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                label="Start Value"
                type="number"
                fullWidth
                size="small"
                value={curveForm.startValue}
                onChange={handleFormChange('startValue')}
                placeholder={curveForm.startValueType === "percentage" ? "Enter %" : "Enter value"}
              />
            </div>

            {/* Peak Value with Toggle */}
            <div className="flex items-center gap-2">
              <ToggleButtonGroup
                value={curveForm.peakValueType}
                exclusive
                onChange={handleValueTypeChange('peakValueType')}
                size="small"
              >
                <ToggleButton value="number" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                  #
                </ToggleButton>
                <ToggleButton value="percentage" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                  %
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                label="Peak Value"
                type="number"
                fullWidth
                size="small"
                value={curveForm.peakValue}
                onChange={handleFormChange('peakValue')}
                placeholder={curveForm.peakValueType === "percentage" ? "Enter %" : "Enter value"}
              />
            </div>

            <TextField
              label="Time to Reach Peak Value"
              type="number"
              fullWidth
              size="small"
              value={curveForm.timeToReachPeak}
              onChange={handleFormChange('timeToReachPeak')}
              placeholder="Enter time in months"
              helperText="Time in months"
            />
            
            {/* Uptake Curve Dropdown */}
            <FormControl fullWidth size="small">
              <InputLabel>Uptake Curve</InputLabel>
              <Select
                value={curveForm.uptakeCurve}
                label="Uptake Curve"
                onChange={(e) => setCurveForm(prev => ({ ...prev, uptakeCurve: e.target.value }))}
              >
                {uptakeCurveOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsModalOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCurve}
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EpidemiologyDataGrid;
