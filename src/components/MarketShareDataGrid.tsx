import { useState, useMemo, useCallback } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Plus, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, CellValueChangedEvent, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, TextEditorModule, ValidationModule, SelectEditorModule, CellStyleModule } from "ag-grid-community";
import { BarChart } from "@mui/x-charts/BarChart";
import CollapsibleSection from "./CollapsibleSection";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextEditorModule,
  ValidationModule,
  SelectEditorModule,
  CellStyleModule,
]);
// Generate months for monthly view
const generateMonthlyColumns = (): string[] => {
  const months: string[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let year = 2024; year <= 2030; year++) {
    const shortYear = year.toString().slice(-2);
    for (const month of monthNames) {
      months.push(`${month}-${shortYear}`);
    }
  }
  return months;
};

const monthlyColumns = generateMonthlyColumns();

const classShareRows = ["IVIG/SCIG", "Corticosteroids", "Plex", "FcRN"];
const brandShareRows = ["Vyvgart", "Nipocalimab IV", "Inebilizumab", "Rystiggo", "Rituxan"];

const eventPropertyLabels = [
  "Event Status",
  "Event Description", 
  "Impacted Product",
  "Event Start Date",
  "Curve Type",
  "Source of Business Type",
  "Time to Peak (months)",
  "Peak Share (%)",
];

interface GridRow {
  product: string;
  [key: string]: string;
}

interface EventInputRow {
  property: string;
  [key: string]: string;
}

interface SourceOfBusinessRow {
  product: string;
  [key: string]: string;
}

interface CohortShareData {
  baseline: GridRow[];
  events: EventInputRow[];
  sourceOfBusiness: SourceOfBusinessRow[];
  hasData: boolean;
}

interface CohortData {
  classShare: CohortShareData;
  brandShare: CohortShareData;
}

const createInitialBaselineData = (rows: string[]): GridRow[] => {
  return rows.map(row => {
    const rowData: GridRow = { product: row };
    monthlyColumns.forEach(month => {
      rowData[month] = "";
    });
    return rowData;
  });
};

const createInitialEventData = (numEvents: number = 1): EventInputRow[] => {
  return eventPropertyLabels.map(prop => {
    const row: EventInputRow = { property: prop };
    for (let i = 1; i <= numEvents; i++) {
      if (prop === "Event Status") {
        row[`Event ${i}`] = "Off";
      } else if (prop === "Curve Type") {
        row[`Event ${i}`] = "Linear";
      } else if (prop === "Source of Business Type") {
        row[`Event ${i}`] = "Market Growth";
      } else {
        row[`Event ${i}`] = "";
      }
    }
    return row;
  });
};

const createInitialSourceOfBusiness = (rows: string[], numEvents: number = 1): SourceOfBusinessRow[] => {
  return rows.map(row => {
    const rowData: SourceOfBusinessRow = { product: row };
    for (let i = 1; i <= numEvents; i++) {
      rowData[`Event ${i}`] = "";
    }
    return rowData;
  });
};

const MarketShareDataGrid = () => {
  const [expandedCohorts, setExpandedCohorts] = useState<string[]>(["cohort1"]);
  
  // Dialog states
  const [baselineDialogOpen, setBaselineDialogOpen] = useState(false);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [eventsStep, setEventsStep] = useState<"input" | "source">("input");
  const [currentCohort, setCurrentCohort] = useState<string>("");
  const [currentShareType, setCurrentShareType] = useState<"class" | "brand">("class");
  const [numEvents, setNumEvents] = useState(3);
  
  // Data for all cohorts
  const [cohortsData, setCohortsData] = useState<{ [key: string]: CohortData }>({
    cohort1: {
      classShare: { 
        baseline: createInitialBaselineData(classShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(classShareRows, 3),
        hasData: false,
      },
      brandShare: { 
        baseline: createInitialBaselineData(brandShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(brandShareRows, 3),
        hasData: false,
      },
    },
    cohort2: {
      classShare: { 
        baseline: createInitialBaselineData(classShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(classShareRows, 3),
        hasData: false,
      },
      brandShare: { 
        baseline: createInitialBaselineData(brandShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(brandShareRows, 3),
        hasData: false,
      },
    },
    cohort3: {
      classShare: { 
        baseline: createInitialBaselineData(classShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(classShareRows, 3),
        hasData: false,
      },
      brandShare: { 
        baseline: createInitialBaselineData(brandShareRows), 
        events: createInitialEventData(3),
        sourceOfBusiness: createInitialSourceOfBusiness(brandShareRows, 3),
        hasData: false,
      },
    },
  });

  // Temporary data for dialog editing
  const [tempBaselineData, setTempBaselineData] = useState<GridRow[]>([]);
  const [tempEventsData, setTempEventsData] = useState<EventInputRow[]>([]);
  const [tempSourceData, setTempSourceData] = useState<SourceOfBusinessRow[]>([]);

  const toggleCohort = (cohort: string) => {
    setExpandedCohorts(prev =>
      prev.includes(cohort) ? prev.filter(c => c !== cohort) : [...prev, cohort]
    );
  };

  const openBaselineDialog = (cohort: string, shareType: "class" | "brand") => {
    setCurrentCohort(cohort);
    setCurrentShareType(shareType);
    const shareKey = shareType === "class" ? "classShare" : "brandShare";
    setTempBaselineData(JSON.parse(JSON.stringify(cohortsData[cohort][shareKey].baseline)));
    setBaselineDialogOpen(true);
  };

  const openEventsDialog = (cohort: string, shareType: "class" | "brand") => {
    setCurrentCohort(cohort);
    setCurrentShareType(shareType);
    setEventsStep("input");
    const shareKey = shareType === "class" ? "classShare" : "brandShare";
    setTempEventsData(JSON.parse(JSON.stringify(cohortsData[cohort][shareKey].events)));
    setTempSourceData(JSON.parse(JSON.stringify(cohortsData[cohort][shareKey].sourceOfBusiness)));
    setEventsDialogOpen(true);
  };

  const handleBaselineCellChange = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event;
    if (colDef.field && colDef.field !== 'product') {
      setTempBaselineData(prev => 
        prev.map(row => 
          row.product === data.product 
            ? { ...row, [colDef.field as string]: newValue }
            : row
        )
      );
    }
  }, []);

  const handleEventsCellChange = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event;
    if (colDef.field && colDef.field !== 'property') {
      setTempEventsData(prev => 
        prev.map(row => 
          row.property === data.property 
            ? { ...row, [colDef.field as string]: newValue }
            : row
        )
      );
    }
  }, []);

  const handleSourceCellChange = useCallback((event: CellValueChangedEvent) => {
    const { data, colDef, newValue } = event;
    if (colDef.field && colDef.field !== 'product') {
      setTempSourceData(prev => 
        prev.map(row => 
          row.product === data.product 
            ? { ...row, [colDef.field as string]: newValue }
            : row
        )
      );
    }
  }, []);

  const handleSaveBaseline = () => {
    setCohortsData(prev => {
      const newData = { ...prev };
      const shareKey = currentShareType === "class" ? "classShare" : "brandShare";
      newData[currentCohort] = {
        ...newData[currentCohort],
        [shareKey]: {
          ...newData[currentCohort][shareKey],
          baseline: tempBaselineData,
          hasData: true,
        },
      };
      return newData;
    });
    setBaselineDialogOpen(false);
  };

  const handleFinishEvents = () => {
    setCohortsData(prev => {
      const newData = { ...prev };
      const shareKey = currentShareType === "class" ? "classShare" : "brandShare";
      newData[currentCohort] = {
        ...newData[currentCohort],
        [shareKey]: {
          ...newData[currentCohort][shareKey],
          events: tempEventsData,
          sourceOfBusiness: tempSourceData,
          hasData: true,
        },
      };
      return newData;
    });
    setEventsDialogOpen(false);
  };

  const addEvent = () => {
    const newEventNum = numEvents + 1;
    setNumEvents(newEventNum);
    setTempEventsData(prev => prev.map(row => ({
      ...row,
      [`Event ${newEventNum}`]: row.property === "Event Status" ? "Off" : 
                                row.property === "Curve Type" ? "Linear" :
                                row.property === "Source of Business Type" ? "Market Growth" : ""
    })));
    setTempSourceData(prev => prev.map(row => ({
      ...row,
      [`Event ${newEventNum}`]: ""
    })));
  };

  const deleteEvent = () => {
    if (numEvents <= 1) return;
    const eventToRemove = `Event ${numEvents}`;
    setNumEvents(prev => prev - 1);
    setTempEventsData(prev => prev.map(row => {
      const { [eventToRemove]: _, ...rest } = row;
      return rest as EventInputRow;
    }));
    setTempSourceData(prev => prev.map(row => {
      const { [eventToRemove]: _, ...rest } = row;
      return rest as SourceOfBusinessRow;
    }));
  };

  // AG Grid column definitions for baseline
  const baselineColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "product",
        headerName: "Product",
        pinned: "left",
        width: 130,
        editable: false,
        cellStyle: { backgroundColor: 'hsl(174, 62%, 35%)', fontWeight: 500, color: '#fff', textAlign: 'left' },
        headerClass: 'ag-header-primary',
      }
    ];
    monthlyColumns.forEach(month => {
      cols.push({
        field: month,
        headerName: month,
        width: 80,
        editable: true,
        cellStyle: { backgroundColor: 'hsl(45, 100%, 88%)', textAlign: 'center' },
        headerClass: 'ag-header-primary',
      });
    });
    return cols;
  }, []);

  // Dropdown options for event properties
  const impactedProductOptions = ["Vyvgart", "Nipocalimab IV", "Inebilizumab", "Rystiggo", "Rituxan"];
  const eventStatusOptions = ["On", "Off"];
  const curveTypeOptions = ["Linear", "S-Curve", "Exponential"];
  const sourceOfBusinessOptions = ["Fair", "Distribution"];
  
  // Generate month-year options for Event Start Date
  const monthYearOptions = useMemo(() => {
    const options: string[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let year = 2024; year <= 2035; year++) {
      for (const month of monthNames) {
        options.push(`${month}-${year}`);
      }
    }
    return options;
  }, []);

  // AG Grid column definitions for events input
  const eventsColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "property",
        headerName: "Event Property",
        pinned: "left",
        width: 180,
        editable: false,
        cellStyle: { backgroundColor: 'hsl(174, 62%, 35%)', fontWeight: 500, color: '#fff', textAlign: 'left' },
        headerClass: 'ag-header-primary',
      }
    ];
    for (let i = 1; i <= numEvents; i++) {
      cols.push({
        field: `Event ${i}`,
        headerName: `Event ${i}`,
        width: 150,
        editable: true,
        cellStyle: { backgroundColor: 'hsl(45, 100%, 88%)', textAlign: 'center' },
        headerClass: 'ag-header-primary',
        cellEditorSelector: (params) => {
          const property = params.data?.property;
          if (property === "Event Status") {
            return { component: 'agSelectCellEditor', params: { values: eventStatusOptions } };
          }
          if (property === "Impacted Product") {
            return { component: 'agSelectCellEditor', params: { values: impactedProductOptions } };
          }
          if (property === "Event Start Date") {
            return { component: 'agSelectCellEditor', params: { values: monthYearOptions } };
          }
          if (property === "Curve Type") {
            return { component: 'agSelectCellEditor', params: { values: curveTypeOptions } };
          }
          if (property === "Source of Business Type") {
            return { component: 'agSelectCellEditor', params: { values: sourceOfBusinessOptions } };
          }
          return { component: 'agTextCellEditor' };
        },
      });
    }
    return cols;
  }, [numEvents, monthYearOptions]);

  // AG Grid column definitions for source of business
  const sourceColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "product",
        headerName: "Event Source of Business",
        pinned: "left",
        width: 180,
        editable: false,
        cellStyle: { backgroundColor: 'hsl(174, 62%, 35%)', fontWeight: 500, color: '#fff', textAlign: 'left' },
        headerClass: 'ag-header-primary',
      }
    ];
    for (let i = 1; i <= numEvents; i++) {
      cols.push({
        field: `Event ${i}`,
        headerName: `Event ${i}`,
        width: 100,
        editable: true,
        cellStyle: { backgroundColor: 'hsl(45, 100%, 88%)', textAlign: 'center' },
        headerClass: 'ag-header-primary',
      });
    }
    return cols;
  }, [numEvents]);

  // Output table column definitions
  const outputColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "product",
        headerName: "Product",
        pinned: "left",
        width: 130,
        editable: false,
        cellStyle: { backgroundColor: 'hsl(174, 62%, 35%)', fontWeight: 500, color: '#fff', textAlign: 'left' },
        headerClass: 'ag-header-primary',
      }
    ];
    monthlyColumns.slice(0, 24).forEach(month => {
      cols.push({
        field: month,
        headerName: month,
        width: 80,
        editable: false,
        cellStyle: { textAlign: 'center', backgroundColor: 'hsl(174, 40%, 92%)' },
        headerClass: 'ag-header-primary',
      });
    });
    return cols;
  }, []);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);

  const getCohortLabel = () => {
    const cohortNum = currentCohort.replace('cohort', '');
    return `Cohort ${cohortNum}`;
  };

  const renderOutputSection = (cohortKey: string, shareType: "class" | "brand") => {
    const shareKey = shareType === "class" ? "classShare" : "brandShare";
    const data = cohortsData[cohortKey][shareKey];
    const rows = shareType === "class" ? classShareRows : brandShareRows;
    
    if (!data.hasData) return null;

    const outputData = rows.map((row, idx) => {
      const rowData: GridRow = { product: row };
      monthlyColumns.slice(0, 24).forEach((month, mIdx) => {
        const baseValue = 25 + (idx * 5) + (mIdx * 0.5);
        rowData[month] = `${Math.min(baseValue, 100).toFixed(1)}%`;
      });
      return rowData;
    });

    const chartData = monthlyColumns.slice(0, 12).map(month => ({
      month,
      ...rows.reduce((acc, row, idx) => {
        acc[row] = 25 + (idx * 5);
        return acc;
      }, {} as Record<string, number>)
    }));

    return (
      <div className="mt-4">
        <h5 className="text-sm font-semibold mb-2 text-foreground">Output - Market Share (%)</h5>
        <div className="h-48 mb-2">
          <BarChart
            xAxis={[{ data: monthlyColumns.slice(0, 12), scaleType: "band", tickLabelStyle: { fontSize: 9 } }]}
            series={rows.map((row, idx) => ({
              data: Array(12).fill(25 + (idx * 5)),
              label: row,
              stack: "total",
            }))}
            height={180}
            margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
          />
        </div>
        <div className="ag-theme-alpine" style={{ width: '100%', height: 180 }}>
          <AgGridReact
            rowData={outputData}
            columnDefs={outputColumnDefs}
            defaultColDef={defaultColDef}
            suppressMovableColumns={true}
          />
        </div>
      </div>
    );
  };

  const renderCohortSection = (cohortKey: string, cohortLabel: string) => (
    <CollapsibleSection
      key={cohortKey}
      id={cohortKey}
      title={cohortLabel}
      isExpanded={expandedCohorts.includes(cohortKey)}
      onToggle={toggleCohort}
      variant="primary"
    >
      <div className="p-3 space-y-3">
        {/* Class Share Section */}
        <Card sx={{ boxShadow: 'none', backgroundColor: 'hsl(var(--card))' }}>
          <CardContent sx={{ p: 3 }}>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Class share</h4>
            <div className="flex gap-3">
              <Button
                variant="contained"
                onClick={() => openBaselineDialog(cohortKey, "class")}
                sx={{
                  backgroundColor: 'hsl(174, 62%, 47%)',
                  '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Enter baseline share
              </Button>
              <Button
                variant="contained"
                onClick={() => openEventsDialog(cohortKey, "class")}
                sx={{
                  backgroundColor: 'hsl(174, 62%, 47%)',
                  '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Enter Events
              </Button>
            </div>
            {renderOutputSection(cohortKey, "class")}
          </CardContent>
        </Card>

        {/* Brand Share Section */}
        <Card sx={{ boxShadow: 'none', backgroundColor: 'hsl(var(--card))' }}>
          <CardContent sx={{ p: 3 }}>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Brand share for class FcRN</h4>
            <div className="flex gap-3">
              <Button
                variant="contained"
                onClick={() => openBaselineDialog(cohortKey, "brand")}
                sx={{
                  backgroundColor: 'hsl(174, 62%, 47%)',
                  '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Enter baseline share
              </Button>
              <Button
                variant="contained"
                onClick={() => openEventsDialog(cohortKey, "brand")}
                sx={{
                  backgroundColor: 'hsl(174, 62%, 47%)',
                  '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Enter Events
              </Button>
            </div>
            {renderOutputSection(cohortKey, "brand")}
          </CardContent>
        </Card>
      </div>
    </CollapsibleSection>
  );

  return (
    <div className="space-y-2">
      {renderCohortSection("cohort1", "Cohort 1")}
      {renderCohortSection("cohort2", "Cohort 2")}
      {renderCohortSection("cohort3", "Cohort 3")}

      {/* Baseline Share Dialog */}
      <Dialog 
        open={baselineDialogOpen} 
        onClose={() => setBaselineDialogOpen(false)} 
        maxWidth="xl" 
        fullWidth 
        PaperProps={{ sx: { maxHeight: '90vh', backgroundColor: 'hsl(var(--background))' } }}
      >
        <DialogTitle sx={{ backgroundColor: 'hsl(174, 62%, 30%)', color: 'white', py: 2 }}>
          Enter Baseline Share - {currentShareType === "class" ? "Class Share" : "Brand Share"}
        </DialogTitle>
        <DialogContent sx={{ p: 0, mt: 0 }}>
          <div className="ag-theme-alpine" style={{ width: '100%', height: 250 }}>
            <AgGridReact
              rowData={tempBaselineData}
              columnDefs={baselineColumnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={handleBaselineCellChange}
              suppressMovableColumns={true}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: 'hsl(var(--background))' }}>
          <Button onClick={() => setBaselineDialogOpen(false)} sx={{ color: 'hsl(174, 62%, 40%)' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBaseline} 
            sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Events Dialog - Multi-step */}
      <Dialog 
        open={eventsDialogOpen} 
        onClose={() => setEventsDialogOpen(false)} 
        maxWidth="xl" 
        fullWidth 
        PaperProps={{ sx: { maxHeight: '90vh', backgroundColor: 'hsl(var(--background))' } }}
      >
        <DialogTitle sx={{ backgroundColor: 'hsl(174, 62%, 30%)', color: 'white', py: 2 }}>
          {getCohortLabel()} – {currentShareType === "class" ? "Class" : "Brand"} Market Event
        </DialogTitle>
        
        {/* Navigation Tabs */}
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              eventsStep === "input" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setEventsStep("input")}
          >
            Event input
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              eventsStep === "source" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setEventsStep("source")}
          >
            Source of business
          </button>
        </div>

        <DialogContent sx={{ p: 2, backgroundColor: 'hsl(var(--background))' }}>
          {eventsStep === "input" ? (
            <>
              {/* Add/Delete Event Buttons at Top */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={addEvent}
                  sx={{ 
                    borderColor: 'hsl(174, 62%, 47%)', 
                    color: 'hsl(174, 62%, 47%)',
                    '&:hover': { borderColor: 'hsl(174, 62%, 40%)', backgroundColor: 'hsl(174, 62%, 95%)' }
                  }}
                >
                  Add Event
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Trash2 className="w-4 h-4" />}
                  onClick={deleteEvent}
                  disabled={numEvents <= 1}
                  sx={{ 
                    borderColor: 'hsl(0, 75%, 55%)', 
                    color: 'hsl(0, 75%, 55%)',
                    '&:hover': { borderColor: 'hsl(0, 75%, 45%)', backgroundColor: 'hsl(0, 75%, 95%)' },
                    '&:disabled': { borderColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                  }}
                >
                  Delete Event
                </Button>
              </div>
              <div className="ag-theme-alpine" style={{ width: '100%', height: 300 }}>
                <AgGridReact
                  rowData={tempEventsData}
                  columnDefs={eventsColumnDefs}
                  defaultColDef={defaultColDef}
                  onCellValueChanged={handleEventsCellChange}
                  suppressMovableColumns={true}
                />
              </div>
            </>
          ) : (
            <div className="ag-theme-alpine" style={{ width: '100%', height: 200 }}>
              <AgGridReact
                rowData={tempSourceData}
                columnDefs={sourceColumnDefs}
                defaultColDef={defaultColDef}
                onCellValueChanged={handleSourceCellChange}
                suppressMovableColumns={true}
              />
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between', backgroundColor: 'hsl(var(--background))' }}>
          <div>
            {eventsStep === "source" && (
              <Button onClick={() => setEventsStep("input")} sx={{ color: 'hsl(174, 62%, 40%)' }}>Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEventsDialogOpen(false)} sx={{ color: 'hsl(174, 62%, 40%)' }}>Cancel</Button>
            {eventsStep === "input" ? (
              <Button 
                variant="contained" 
                onClick={() => setEventsStep("source")} 
                sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } }}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleFinishEvents} 
                sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } }}
              >
                Finish
              </Button>
            )}
          </div>
        </DialogActions>
      </Dialog>

      <style>{`
        .ag-header-primary {
          background-color: hsl(174, 62%, 30%) !important;
          color: white !important;
        }
        .ag-header-primary .ag-header-cell-label {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default MarketShareDataGrid;
