import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { RefreshCw, Download, MessageSquare } from "lucide-react";
import { format, addMonths, isBefore, startOfMonth } from "date-fns";
import { AgGridReact } from "ag-grid-react";
import CollapsibleSection from "./CollapsibleSection";
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
  id: string;
  country: string;
  type?: string;
  [key: string]: string | undefined;
}

interface Section {
  id: string;
  title: string;
  rows: DataRow[];
}

// Generate months from Jan-22 to Dec-25 for table columns
const generateTableMonths = () => {
  const months: string[] = [];
  const startDate = new Date(2022, 0, 1); // Jan 2022
  const endDate = new Date(2025, 11, 1); // Dec 2025
  
  let date = startDate;
  while (isBefore(date, addMonths(endDate, 1))) {
    months.push(format(date, "MMM-yy"));
    date = addMonths(date, 1);
  }
  return months;
};

// Generate months from Jan-22 to current month for dropdown
const generateDropdownOptions = () => {
  const months: string[] = [];
  const startDate = new Date(2022, 0, 1); // Jan 2022
  const currentDate = startOfMonth(new Date());
  
  let date = startDate;
  while (isBefore(date, addMonths(currentDate, 1))) {
    months.push(format(date, "MMM-yy"));
    date = addMonths(date, 1);
  }
  return months;
};

const tableMonths = generateTableMonths();
const dropdownOptions = generateDropdownOptions();

const createInitialSections = (): Section[] => [
  {
    id: "new-patients",
    title: "New Patients on Therapy",
    rows: [
      { id: "np-1", country: "Germany", type: "-" }
    ]
  },
  {
    id: "discontinuations",
    title: "Discontinuations",
    rows: [
      { id: "disc-1", country: "Germany", type: "Discontinuations on New Patients on Therapy" },
      { id: "disc-2", country: "Germany", type: "Discontinuations on Continuing Patients on Therapy" }
    ]
  },
  {
    id: "total-adherent-vials",
    title: "Total Adherent Vials",
    rows: [
      { id: "tav-1", country: "Germany", type: "IV" },
      { id: "tav-2", country: "Germany", type: "SC" },
      { id: "tav-3", country: "Germany", type: "SC PFS" },
      { id: "tav-4", country: "Germany", type: "SC Autoinjector" }
    ]
  },
  {
    id: "gross-revenue",
    title: "Gross Revenue",
    rows: [
      { id: "gr-1", country: "Germany", type: "IV" },
      { id: "gr-2", country: "Germany", type: "SC" },
      { id: "gr-3", country: "Germany", type: "SC PFS" },
      { id: "gr-4", country: "Germany", type: "SC Autoinjector" }
    ]
  },
  {
    id: "net-revenue",
    title: "Net Revenue (Cap adjusted)",
    rows: [
      { id: "nr-1", country: "Germany", type: "IV" },
      { id: "nr-2", country: "Germany", type: "SC" },
      { id: "nr-3", country: "Germany", type: "SC PFS" },
      { id: "nr-4", country: "Germany", type: "SC Autoinjector" }
    ]
  },
  {
    id: "conversion-rate",
    title: "Conversion Rate",
    rows: [
      { id: "cr-1", country: "", type: "EUR" },
      { id: "cr-2", country: "", type: "GBP" },
      { id: "cr-3", country: "", type: "SEK" },
      { id: "cr-4", country: "", type: "NOK" },
      { id: "cr-5", country: "", type: "DKK" },
      { id: "cr-6", country: "", type: "CHF" }
    ]
  }
];

const ActualsDataGrid = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["new-patients"]);
  const [sections, setSections] = useState<Section[]>(createInitialSections);
  const [lastActualsDate, setLastActualsDate] = useState(dropdownOptions[dropdownOptions.length - 1]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const gridApiRefs = useRef<Record<string, GridApi | null>>({});

  const handleSaveComment = () => {
    setSavedComment(comment);
    setIsCommentOpen(false);
  };

  const handleOpenComment = () => {
    setComment(savedComment);
    setIsCommentOpen(true);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleRefreshActuals = () => {
    console.log("Refreshing actuals data for date:", lastActualsDate);
  };

  const handleDownload = () => {
    const headers = ["Country", "Type", ...tableMonths];
    const rows: string[] = [headers.join(",")];
    
    sections.forEach(section => {
      section.rows.forEach(row => {
        const rowData = [
          row.country,
          row.type || "",
          ...tableMonths.map(month => row[month] || "")
        ];
        rows.push(rowData.join(","));
      });
    });
    
    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "actuals_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "country",
        headerName: "Country",
        pinned: "left",
        width: 100,
        editable: false,
        cellStyle: { fontWeight: 500, textAlign: 'left' }
      },
      {
        field: "type",
        headerName: "Type",
        pinned: "left",
        width: 280,
        editable: false,
        cellStyle: { fontWeight: 500, textAlign: 'left' }
      }
    ];

    tableMonths.forEach(month => {
      cols.push({
        field: month,
        headerName: month,
        width: 85,
        editable: true,
        cellStyle: {
          backgroundColor: 'hsl(45, 100%, 88%)',
          textAlign: 'center'
        }
      });
    });

    return cols;
  }, []);

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);

  const onCellValueChanged = useCallback((sectionId: string, event: CellValueChangedEvent) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        rows: section.rows.map(row => 
          row.id === event.data.id ? { ...event.data } : row
        )
      };
    }));
  }, []);

  const onGridReady = useCallback((sectionId: string, params: { api: GridApi }) => {
    gridApiRefs.current[sectionId] = params.api;
  }, []);

  // Handle paste from clipboard for each grid
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const gridElement = document.querySelector('.ag-theme-alpine:focus-within');
      if (!gridElement) return;

      const sectionId = gridElement.getAttribute('data-section-id');
      if (!sectionId) return;

      e.preventDefault();
      
      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      const rows = clipboardData.split('\n').filter(row => row.trim());
      const parsedData = rows.map(row => row.split('\t'));
      
      if (parsedData.length === 0) return;

      const gridApi = gridApiRefs.current[sectionId];
      if (!gridApi) return;

      const focusedCell = gridApi.getFocusedCell();
      if (!focusedCell) return;

      const allColumns = gridApi.getColumns() || [];
      const focusedColIndex = allColumns.findIndex(col => col.getColId() === focusedCell.column.getColId());
      
      setSections(prev => prev.map(section => {
        if (section.id !== sectionId) return section;
        
        const newRows = [...section.rows];
        parsedData.forEach((pastedRow, rowOffset) => {
          const targetRowIndex = focusedCell.rowIndex + rowOffset;
          if (targetRowIndex < newRows.length) {
            pastedRow.forEach((value, colOffset) => {
              const targetColIndex = focusedColIndex + colOffset;
              if (targetColIndex < allColumns.length) {
                const colId = allColumns[targetColIndex].getColId();
                if (colId && colId !== 'country' && colId !== 'type' && colId !== 'id') {
                  newRows[targetRowIndex] = {
                    ...newRows[targetRowIndex],
                    [colId]: value.trim()
                  };
                }
              }
            });
          }
        });
        
        return { ...section, rows: newRows };
      }));
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const getGridHeight = (rowCount: number) => {
    const rowHeight = 42;
    const headerHeight = 48;
    return headerHeight + (rowCount * rowHeight) + 2;
  };

  return (
    <div className="space-y-4">
      {/* Header with Last Actuals Date dropdown */}
      <div className="flex items-center gap-4 flex-wrap py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Last Actuals Date:</span>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={lastActualsDate}
              onChange={(e) => setLastActualsDate(e.target.value)}
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiSelect-select': { py: 0.75, fontSize: '0.875rem' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'hsl(0, 0%, 90%)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'hsl(174, 62%, 47%)',
                },
              }}
            >
              {dropdownOptions.map(month => (
                <MenuItem key={month} value={month}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <Tooltip title="Note: Click the 'Refresh Last Actuals' button when Last Actuals Date is changed" arrow>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefreshActuals}
          >
            Refresh Last Actuals
          </Button>
        </Tooltip>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip title="Download data" arrow>
            <IconButton
              size="small"
              onClick={handleDownload}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Download className="w-4 h-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title={savedComment ? "View/Edit comment" : "Add comment"} arrow>
            <Badge 
              color="error" 
              variant="dot" 
              invisible={!savedComment}
              sx={{ '& .MuiBadge-badge': { top: 4, right: 4 } }}
            >
              <IconButton
                size="small"
                onClick={handleOpenComment}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '4px',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </IconButton>
            </Badge>
          </Tooltip>
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog 
        open={isCommentOpen} 
        onClose={() => setIsCommentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsCommentOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveComment}
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Grid Sections */}
      {sections.map(section => (
        <CollapsibleSection
          key={section.id}
          id={section.id}
          title={section.title}
          isExpanded={expandedSections.includes(section.id)}
          onToggle={toggleSection}
          variant="primary"
        >
          <div 
            className="ag-theme-alpine" 
            style={{ width: '100%', height: getGridHeight(section.rows.length) }}
            data-section-id={section.id}
            tabIndex={0}
          >
            <AgGridReact
              rowData={section.rows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={(e) => onCellValueChanged(section.id, e)}
              onGridReady={(params) => onGridReady(section.id, params)}
              suppressMovableColumns={true}
              getRowId={(params) => params.data.id}
            />
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
};

export default ActualsDataGrid;
