import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Download, MessageSquare } from "lucide-react";
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
  label: string;
  [key: string]: string;
}

// Generate monthly columns
const generateMonthColumns = () => {
  const months: string[] = [];
  const startDate = new Date(2025, 0);
  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    months.push(`${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`);
  }
  return months;
};

const monthColumns = generateMonthColumns();

// Standard 4 rows for route of administration
const routeRows = ['IV', 'SC', 'SC PFS', 'SC Autoinjector'];
// 5 rows including Total
const routeRowsWithTotal = [...routeRows, 'Total'];

const VolumeConversionDataGrid = () => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  
  // Main section expansion
  const [expandedMainSections, setExpandedMainSections] = useState<string[]>(["patientConversion", "volumeConversion"]);
  
  // Sub-section expansion
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "commercialPatients", "freeOfChargePatients", "dosingSetup", "vialConversion",
    "routeAdminSplit", "vialConversionInput", "grossVialsCommercial", "grossVialsFOC",
    "adherence", "adherentVialsCommercial", "adherentVialsFOC",
    "vialAdjustmentCommercial", "vialAdjustmentFOC",
    "totalAdherentVialsCommercial", "totalAdherentVialsFOC",
    "eqTotalAdherentVialsCommercial", "eqTotalAdherentVialsFOC",
    "commercial_newPatients", "commercial_manualAdjustment", "commercial_discontinuation", "commercial_patients",
    "foc_newPatients", "foc_manualAdjustment", "foc_discontinuation", "foc_patients",
    "dosingSetupInput", "frequencyOfDosage", "vialsConsumed"
  ]);
  
  // Grid API refs
  const gridRefs = useRef<{ [key: string]: GridApi | null }>({});

  const toggleMainSection = (section: string) => {
    setExpandedMainSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Column definitions - with optional yellow cells for output rows
  const createColumnDefs = (isInput?: boolean, isOutput?: boolean): ColDef[] => {
    const cols: ColDef[] = [
      {
        field: "label",
        headerName: "",
        pinned: "left",
        width: 280,
        editable: false,
        cellStyle: { fontWeight: 500, backgroundColor: 'hsl(0, 0%, 100%)', textAlign: 'left' }
      }
    ];

    monthColumns.forEach((col) => {
      cols.push({
        field: col,
        headerName: col,
        width: 80,
        editable: !isOutput,
        cellStyle: isOutput ? {
          backgroundColor: 'hsl(174, 40%, 92%)',
          textAlign: 'center'
        } : isInput ? {
          backgroundColor: 'hsl(45, 100%, 88%)',
          textAlign: 'center'
        } : {
          textAlign: 'center'
        }
      });
    });

    return cols;
  };

  // Column definitions for single input column (not monthly)
  const createSingleColumnDefs = (): ColDef[] => {
    return [
      {
        field: "label",
        headerName: "",
        pinned: "left",
        width: 280,
        editable: false,
        cellStyle: { fontWeight: 500, backgroundColor: 'hsl(0, 0%, 100%)', textAlign: 'left' }
      },
      {
        field: "value",
        headerName: "Value",
        width: 100,
        editable: true,
        cellStyle: { backgroundColor: 'hsl(45, 100%, 88%)', textAlign: 'center' }
      }
    ];
  };

  // Generate single column row data
  const createSingleColumnRowData = (labels: string[], values: string[]): DataRow[] => {
    return labels.map((label, idx) => ({
      label,
      value: values[idx] || "0"
    }));
  };

  // Generate row data with Total row
  const createRowDataWithTotal = (labels: string[], defaultValue: string = "0"): DataRow[] => {
    const rows = labels.map(label => ({
      label,
      ...monthColumns.reduce((acc, col) => ({ ...acc, [col]: defaultValue }), {})
    }));
    rows.push({
      label: "Total",
      ...monthColumns.reduce((acc, col) => ({ ...acc, [col]: defaultValue }), {})
    });
    return rows;
  };

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log("Cell value changed:", event.data);
  }, []);

  const handleDownload = () => {
    const headers = ["", ...monthColumns];
    const csvContent = headers.join(",");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversion_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveComment = () => {
    setSavedComment(comment);
    setIsCommentOpen(false);
  };

  const handleOpenComment = () => {
    setComment(savedComment);
    setIsCommentOpen(true);
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const gridElements = document.querySelectorAll('.volume-conversion-grid');
      let activeGrid: GridApi | null = null;
      
      gridElements.forEach((el) => {
        if (el.contains(document.activeElement)) {
          const gridId = el.getAttribute('data-grid-id');
          if (gridId) {
            activeGrid = gridRefs.current[gridId];
          }
        }
      });

      if (!activeGrid) return;

      e.preventDefault();
      
      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      const rows = clipboardData.split('\n').filter(row => row.trim());
      const parsedData = rows.map(row => row.split('\t'));
      
      if (parsedData.length === 0) return;

      const focusedCell = activeGrid.getFocusedCell();
      if (!focusedCell) return;

      const allColumns = activeGrid.getColumns() || [];
      const focusedColIndex = allColumns.findIndex(col => col.getColId() === focusedCell.column.getColId());
      
      const rowNodes: any[] = [];
      activeGrid.forEachNode(node => rowNodes.push(node));
      
      parsedData.forEach((pastedRow, rowOffset) => {
        const targetRowIndex = focusedCell.rowIndex + rowOffset;
        if (targetRowIndex < rowNodes.length) {
          pastedRow.forEach((value, colOffset) => {
            const targetColIndex = focusedColIndex + colOffset;
            if (targetColIndex < allColumns.length) {
              const colId = allColumns[targetColIndex].getColId();
              if (colId && colId !== 'label') {
                rowNodes[targetRowIndex].setDataValue(colId, value.trim());
              }
            }
          });
        }
      });
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Generate row data with labels
  const createRowData = (labels: string[], defaultValue: string = "0"): DataRow[] => {
    return labels.map(label => ({
      label,
      ...monthColumns.reduce((acc, col) => ({ ...acc, [col]: defaultValue }), {})
    }));
  };

  // Render a grid section
  const renderGridContent = (
    id: string,
    data: DataRow[],
    height: number,
    isInput?: boolean,
    isOutput?: boolean,
    isSingleColumn?: boolean
  ) => (
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
      <div 
        className="ag-theme-alpine volume-conversion-grid" 
        data-grid-id={id}
        style={{ width: '100%', height }}
        tabIndex={0}
      >
        <AgGridReact
          rowData={data}
          columnDefs={isSingleColumn ? createSingleColumnDefs() : createColumnDefs(isInput, isOutput)}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          onGridReady={(params) => { gridRefs.current[id] = params.api; }}
          suppressMovableColumns={true}
        />
      </div>
    </CardContent>
  );

  const renderPatientConversionContent = (prefix: string) => (
    <div className="space-y-2 pl-4">
      <CollapsibleSection
        id={`${prefix}_newPatients`}
        title="New Patients on Therapy"
        isExpanded={expandedSections.includes(`${prefix}_newPatients`)}
        onToggle={toggleSection}
        variant="tertiary"
      >
        {renderGridContent(`${prefix}_newPatients`, createRowData(['New Patients on Therapy']), 80, true)}
      </CollapsibleSection>
      
      <CollapsibleSection
        id={`${prefix}_manualAdjustment`}
        title="New Patients on Therapy (Manual Adjustment)"
        isExpanded={expandedSections.includes(`${prefix}_manualAdjustment`)}
        onToggle={toggleSection}
        variant="tertiary"
      >
        {renderGridContent(`${prefix}_manualAdjustment`, createRowData(['New Patients on Therapy']), 80, false, true)}
      </CollapsibleSection>
      
      <CollapsibleSection
        id={`${prefix}_discontinuation`}
        title="Discontinuation table"
        isExpanded={expandedSections.includes(`${prefix}_discontinuation`)}
        onToggle={toggleSection}
        variant="tertiary"
      >
        {renderGridContent(`${prefix}_discontinuation`, createRowData(['Discon on % New Patients', 'Discon on % Continuing Patients'], '0.0%'), 110, true)}
      </CollapsibleSection>
      
      <CollapsibleSection
        id={`${prefix}_patients`}
        title="Patients table"
        isExpanded={expandedSections.includes(`${prefix}_patients`)}
        onToggle={toggleSection}
        variant="tertiary"
      >
        {renderGridContent(`${prefix}_patients`, createRowData(['New Patients on Therapy', 'Continuing Patients on Therapy', 'Discon on New Patients', 'Discon on Continuing Patients', 'Cumulative Net Patients']), 200, false, true)}
      </CollapsibleSection>
    </div>
  );

  const actionButtons = (
    <div className="flex items-center gap-1">
      <IconButton 
        size="small" 
        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
        sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
      >
        <Download className="w-4 h-4" />
      </IconButton>
      <IconButton 
        size="small" 
        onClick={(e) => { e.stopPropagation(); handleOpenComment(); }}
        sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
      >
        <Badge color="error" variant="dot" invisible={!savedComment}>
          <MessageSquare className="w-4 h-4" />
        </Badge>
      </IconButton>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Patient Conversion Section */}
      <CollapsibleSection
        id="patientConversion"
        title="Patient Conversion"
        isExpanded={expandedMainSections.includes('patientConversion')}
        onToggle={toggleMainSection}
        variant="primary"
        actions={actionButtons}
      >
        <div className="space-y-4 p-2">
          {/* Commercial Patients */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-2 px-2">Commercial patients</h4>
            {renderPatientConversionContent('commercial')}
          </div>

          {/* Free of Charge Patients */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-2 px-2">Free of charge Patients</h4>
            {renderPatientConversionContent('foc')}
          </div>
        </div>
      </CollapsibleSection>

      {/* Volume Conversion Section */}
      <CollapsibleSection
        id="volumeConversion"
        title="Volume Conversion"
        isExpanded={expandedMainSections.includes('volumeConversion')}
        onToggle={toggleMainSection}
        variant="primary"
      >
        <div className="space-y-4 p-2">
          {/* Dosing Setup - Commercial Vials */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-2 px-2">Dosing Setup - Commercial Vials</h4>
            <div className="space-y-2 pl-4">
              <CollapsibleSection
                id="dosingSetupInput"
                title="Dosing setup: one input each - QW, 2QW, 3QW"
                isExpanded={expandedSections.includes('dosingSetupInput')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('dosingSetupInput', createSingleColumnRowData(['QW', '2QW', '3QW'], ['4.3', '2.2', '1.4']), 130, false, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="frequencyOfDosage"
                title="Frequency of dosage - Monthly input in %"
                isExpanded={expandedSections.includes('frequencyOfDosage')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('frequencyOfDosage', createRowData(['QW', '2QW', '3QW'], '0.0%'), 130, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="vialsConsumed"
                title="Vials consumed - Monthly vials"
                isExpanded={expandedSections.includes('vialsConsumed')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('vialsConsumed', createRowDataWithTotal(['QW Vials', '2QW Vials', '3QW Vials']), 160, false, true)}
              </CollapsibleSection>
            </div>
          </div>

          {/* Vial Conversion */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-2 px-2">Vial Conversion</h4>
            <div className="space-y-2 pl-4">
              <CollapsibleSection
                id="routeAdminSplit"
                title="Route of Administration Split"
                isExpanded={expandedSections.includes('routeAdminSplit')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('routeAdminSplit', createRowData(routeRows, '0.0%'), 170, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="vialConversionInput"
                title="Vial Conversion"
                isExpanded={expandedSections.includes('vialConversionInput')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('vialConversionInput', createRowData(routeRows), 170, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="grossVialsCommercial"
                title="Gross Vials - Commercial"
                isExpanded={expandedSections.includes('grossVialsCommercial')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('grossVialsCommercial', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="grossVialsFOC"
                title="Gross Vials - Free of Charge"
                isExpanded={expandedSections.includes('grossVialsFOC')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('grossVialsFOC', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="adherence"
                title="Adherence"
                isExpanded={expandedSections.includes('adherence')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('adherence', createRowData(routeRows, '0.0%'), 170, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="adherentVialsCommercial"
                title="Adherent Vials - Commercial"
                isExpanded={expandedSections.includes('adherentVialsCommercial')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('adherentVialsCommercial', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="adherentVialsFOC"
                title="Adherent Vials - Free of Charge"
                isExpanded={expandedSections.includes('adherentVialsFOC')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('adherentVialsFOC', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="vialAdjustmentCommercial"
                title="Vial Adjustment - Commercial"
                isExpanded={expandedSections.includes('vialAdjustmentCommercial')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('vialAdjustmentCommercial', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="vialAdjustmentFOC"
                title="Vial Adjustment - Free of Charge"
                isExpanded={expandedSections.includes('vialAdjustmentFOC')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('vialAdjustmentFOC', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="totalAdherentVialsCommercial"
                title="Total Adherent Vials - Commercial"
                isExpanded={expandedSections.includes('totalAdherentVialsCommercial')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('totalAdherentVialsCommercial', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="totalAdherentVialsFOC"
                title="Total Adherent Vials - Free of Charge"
                isExpanded={expandedSections.includes('totalAdherentVialsFOC')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('totalAdherentVialsFOC', createRowData(routeRows), 170, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="eqTotalAdherentVialsCommercial"
                title="Eq Total Adherent Vials - Commercial"
                isExpanded={expandedSections.includes('eqTotalAdherentVialsCommercial')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('eqTotalAdherentVialsCommercial', createRowData(routeRowsWithTotal), 200, false, true)}
              </CollapsibleSection>

              <CollapsibleSection
                id="eqTotalAdherentVialsFOC"
                title="Eq Total Adherent Vials - Free of Charge"
                isExpanded={expandedSections.includes('eqTotalAdherentVialsFOC')}
                onToggle={toggleSection}
                variant="tertiary"
              >
                {renderGridContent('eqTotalAdherentVialsFOC', createRowData(routeRowsWithTotal), 200, false, true)}
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Comment Dialog */}
      <Dialog open={isCommentOpen} onClose={() => setIsCommentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCommentOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VolumeConversionDataGrid;
