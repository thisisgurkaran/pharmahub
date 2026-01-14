import { useState, useRef, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule, SelectEditorModule, type ColDef, type GridApi } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Download, MessageSquare, ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import ActionButtons from "./ActionButtons";
import CollapsibleSection from "./CollapsibleSection";
ModuleRegistry.registerModules([ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule, SelectEditorModule]);

interface DataRow {
  label: string;
  [key: string]: string | undefined;
}

interface PriceAction {
  id: number;
  monthYear: string;
  percentage: string;
}

interface PriceInputData {
  launchPrice: string;
  priceActions: PriceAction[];
}

const generateMonthColumns = () => {
  const months: string[] = [];
  const startDate = new Date(2025, 0);
  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push(monthName);
  }
  return months;
};

interface RevenueDataGridProps {
  onBack?: () => void;
  onNext?: () => void;
}

const RevenueDataGrid = ({ onBack, onNext }: RevenueDataGridProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['priceInputs', 'gtn', 'outputs']);
  const [expandedSubSections, setExpandedSubSections] = useState<string[]>([]);
  const [netRevenueCapStatus, setNetRevenueCapStatus] = useState(false);
  const [capType, setCapType] = useState("France");

  // Price Input Dialog state
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [currentPriceType, setCurrentPriceType] = useState("");
  const [tempLaunchPrice, setTempLaunchPrice] = useState("");
  const [tempPriceActions, setTempPriceActions] = useState<PriceAction[]>([]);

  // Store price data for each type
  const [priceData, setPriceData] = useState<{ [key: string]: PriceInputData }>({
    'IV': { launchPrice: '', priceActions: [] },
    'SC': { launchPrice: '', priceActions: [] },
    'SC PFS': { launchPrice: '', priceActions: [] },
    'SC Autoinjector': { launchPrice: '', priceActions: [] },
  });

  const gridRefs = useRef<{ [key: string]: GridApi | null }>({});
  const months = generateMonthColumns();

  // Generate month-year options for dropdown
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleSubSection = (section: string) => {
    setExpandedSubSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Open price dialog
  const openPriceDialog = (type: string) => {
    setCurrentPriceType(type);
    const data = priceData[type];
    setTempLaunchPrice(data.launchPrice);
    setTempPriceActions(data.priceActions.length > 0 ? [...data.priceActions] : [{ id: 1, monthYear: '', percentage: '' }]);
    setIsPriceDialogOpen(true);
  };

  // Save price dialog
  const savePriceDialog = () => {
    setPriceData(prev => ({
      ...prev,
      [currentPriceType]: {
        launchPrice: tempLaunchPrice,
        priceActions: tempPriceActions.filter(pa => pa.monthYear || pa.percentage)
      }
    }));
    setIsPriceDialogOpen(false);
  };

  // Add price action
  const addPriceAction = () => {
    const newId = Math.max(...tempPriceActions.map(pa => pa.id), 0) + 1;
    setTempPriceActions([...tempPriceActions, { id: newId, monthYear: '', percentage: '' }]);
  };

  // Delete price action
  const deletePriceAction = (id: number) => {
    if (tempPriceActions.length > 1) {
      setTempPriceActions(tempPriceActions.filter(pa => pa.id !== id));
    }
  };

  // Update price action
  const updatePriceAction = (id: number, field: 'monthYear' | 'percentage', value: string) => {
    setTempPriceActions(tempPriceActions.map(pa => 
      pa.id === id ? { ...pa, [field]: value } : pa
    ));
  };

  // Column definitions for monthly grids
  const createColumnDefs = (isInput: boolean = true): ColDef<DataRow>[] => {
    const cols: ColDef<DataRow>[] = [
      {
        field: 'label',
        headerName: '',
        pinned: 'left',
        width: 220,
        editable: false,
        cellStyle: { fontWeight: 500, backgroundColor: '#fff', textAlign: 'left' }
      }
    ];

    months.forEach((month, index) => {
      cols.push({
        field: `month${index + 1}`,
        headerName: month,
        width: 80,
        editable: isInput,
        cellStyle: isInput ? { backgroundColor: '#FFEB3B', textAlign: 'center' } : { backgroundColor: '#FFF2CC', textAlign: 'center' }
      });
    });

    return cols;
  };

  const defaultColDef: ColDef = {
    sortable: false,
    filter: false,
    resizable: true,
    suppressMovable: true,
  };

  const onCellValueChanged = (params: any) => {
    console.log('Cell value changed:', params);
  };

  const handleDownload = () => {
    const firstGrid = Object.values(gridRefs.current).find(g => g);
    if (firstGrid) {
      firstGrid.exportDataAsCsv({ fileName: 'revenue_data.csv' });
    }
  };

  const handleSaveComment = () => {
    // Comment handling moved to shared ActionButtons component
  };

  // Create row data for monthly grids
  const createRowData = (labels: string[], defaultValue: string = "0"): DataRow[] => {
    return labels.map(label => ({
      label,
      ...months.reduce((acc, _, i) => ({ ...acc, [`month${i + 1}`]: defaultValue }), {})
    }));
  };

  // GTN rows
  const gtnRows = ['GTN %', 'Rebate', 'Distribution Fee', 'Budget Cap', 'Other Discount', 'Prompt Pay', 'Volume Rebates', 'Placeholder 3', 'GTN %'];
  
  // Output rows
  const outputRows = ['IV', 'SC', 'SC PFS', 'SC Autoinjector', 'Total'];

  // Price input types
  const priceInputTypes = ['IV', 'SC', 'SC PFS', 'SC Autoinjector'];

  // Paste handling
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const gridContainer = target.closest('.revenue-grid');
      if (!gridContainer) return;

      e.preventDefault();
      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      const rows = clipboardData.split('\n').filter(row => row.trim());
      const gridId = gridContainer.getAttribute('data-grid-id');
      if (!gridId) return;

      const gridApi = gridRefs.current[gridId];
      if (!gridApi) return;

      const focusedCell = gridApi.getFocusedCell();
      if (!focusedCell) return;

      const startRowIndex = focusedCell.rowIndex;
      const startColId = focusedCell.column.getColId();
      const columns = gridApi.getColumns();
      if (!columns) return;

      const startColIndex = columns.findIndex(col => col.getColId() === startColId);

      rows.forEach((row, rowOffset) => {
        const values = row.split('\t');
        const rowNode = gridApi.getDisplayedRowAtIndex(startRowIndex + rowOffset);
        if (!rowNode) return;

        values.forEach((value, colOffset) => {
          const targetColIndex = startColIndex + colOffset;
          if (targetColIndex < columns.length) {
            const colId = columns[targetColIndex].getColId();
            rowNode.setDataValue(colId, value.trim());
          }
        });
      });
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Render a collapsible sub-section with grid
  const renderSubSection = (
    id: string,
    title: string,
    data: DataRow[],
    height: number,
    isInput: boolean = true
  ) => (
    <CollapsibleSection
      key={id}
      id={id}
      title={title}
      isExpanded={expandedSubSections.includes(id)}
      onToggle={toggleSubSection}
      variant="tertiary"
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <div 
          className="ag-theme-alpine revenue-grid" 
          data-grid-id={id}
          style={{ width: '100%', height }}
          tabIndex={0}
        >
          <AgGridReact
            rowData={data}
            columnDefs={createColumnDefs(isInput)}
            defaultColDef={defaultColDef}
            onCellValueChanged={onCellValueChanged}
            onGridReady={(params) => { gridRefs.current[id] = params.api; }}
            suppressMovableColumns={true}
          />
        </div>
      </CardContent>
    </CollapsibleSection>
  );

  // Render Price Input section with Update Price button
  const renderPriceInputSection = (type: string) => {
    const data = priceData[type];
    const hasData = data.launchPrice || data.priceActions.length > 0;

    return (
      <Card sx={{ mb: 1 }} key={`priceInput_${type}`}>
        <div 
          className="flex items-center justify-between px-3 py-2"
          style={{ backgroundColor: 'hsl(174, 50%, 92%)' }}
        >
          <h4 className="text-sm font-semibold text-foreground">{type}</h4>
          <Button
            variant="contained"
            size="small"
            onClick={() => openPriceDialog(type)}
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
              textTransform: 'none',
            }}
          >
            Update Price
          </Button>
        </div>
        {hasData && (
          <CardContent sx={{ py: 1.5, px: 3 }}>
            <div className="text-sm text-muted-foreground">
              {data.launchPrice && <span className="mr-4">Launch Price: <strong>{data.launchPrice}</strong></span>}
              {data.priceActions.length > 0 && (
                <span>Price Actions: <strong>{data.priceActions.length}</strong></span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Revenue</h2>
        <div className="flex items-center gap-2">
          <ActionButtons onDownload={handleDownload} variant="icon" color="neutral" />
          {onBack && (
            <Button
              variant="outlined"
              size="small"
              onClick={onBack}
              startIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          )}
          {onNext && (
            <Button
              variant="contained"
              size="small"
              onClick={onNext}
              endIcon={<ArrowRight className="w-4 h-4" />}
              sx={{
                backgroundColor: 'hsl(174, 62%, 47%)',
                '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Net Revenue Cap Status Section */}
      <div className="flex items-center gap-8 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Net Revenue Cap Status</span>
          <div className="flex items-center gap-2">
            <Switch
              checked={netRevenueCapStatus}
              onChange={(e) => setNetRevenueCapStatus(e.target.checked)}
              size="small"
            />
            <span className="text-sm text-muted-foreground">{netRevenueCapStatus ? 'On' : 'Off'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Select Cap Type</span>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={capType}
              onChange={(e) => setCapType(e.target.value)}
            >
              <MenuItem value="Spain">Spain</MenuItem>
              <MenuItem value="France">France</MenuItem>
              <MenuItem value="Belgium">Belgium</MenuItem>
              <MenuItem value="Per Patient">Per Patient</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Price Inputs Section */}
      <CollapsibleSection
        id="priceInputs"
        title="Price Inputs"
        isExpanded={expandedSections.includes('priceInputs')}
        onToggle={toggleSection}
        variant="primary"
      >
        <div className="space-y-3 px-4 py-2">
          {priceInputTypes.map(type => renderPriceInputSection(type))}
        </div>
      </CollapsibleSection>

      {/* Revenue Cap Section - Only visible when netRevenueCapStatus is ON */}
      {netRevenueCapStatus && (
        <CollapsibleSection
          id="revenueCap"
          title="Revenue Cap"
          isExpanded={expandedSections.includes('revenueCap')}
          onToggle={toggleSection}
          variant="primary"
        >
        <div className="space-y-3 px-4 py-2">
            <Card sx={{ mb: 1 }}>
              <CardContent sx={{ py: 4 }}>
                <p className="text-sm text-gray-500 italic">Revenue Cap configuration section - to be configured</p>
              </CardContent>
            </Card>
          </div>
        </CollapsibleSection>
      )}

      {/* GTN Section */}
      <CollapsibleSection
        id="gtn"
        title="GTN"
        isExpanded={expandedSections.includes('gtn')}
        onToggle={toggleSection}
        variant="primary"
      >
          <div className="space-y-3 px-4 py-2">
          {priceInputTypes.map(type => (
            renderSubSection(
              `gtn_${type}`,
              type,
              createRowData(gtnRows, '0.0%'),
              320,
              true
            )
          ))}
        </div>
      </CollapsibleSection>

      {/* Outputs Section */}
      <CollapsibleSection
        id="outputs"
        title="Outputs"
        isExpanded={expandedSections.includes('outputs')}
        onToggle={toggleSection}
        variant="primary"
      >
        <div className="space-y-3 px-4 py-2">
          {/* Gross Revenue - Output */}
          {renderSubSection(
            'grossRevenue',
            'Gross Revenue',
            createRowData(outputRows),
            200,
            false
          )}

          {/* Rebates - Output */}
          {renderSubSection(
            'rebates',
            'Rebates',
            createRowData(outputRows),
            200,
            false
          )}

          {/* Net Revenue - Output */}
          {renderSubSection(
            'netRevenue',
            'Net Revenue',
            createRowData(outputRows),
            200,
            false
          )}

          {/* Net Revenue Adjustment - Input (yellow cells) */}
          {renderSubSection(
            'netRevenueAdjustment',
            'Net Revenue Adjustment',
            createRowData(outputRows),
            200,
            true
          )}

          {/* Final Net Revenue - Output */}
          {renderSubSection(
            'finalNetRevenue',
            'Final Net Revenue',
            createRowData(outputRows),
            200,
            false
          )}
        </div>
      </CollapsibleSection>

      {/* Update Price Dialog */}
      <Dialog open={isPriceDialogOpen} onClose={() => setIsPriceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Price - {currentPriceType}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            {/* Launch Price */}
            <TextField
              label="Launch Price"
              fullWidth
              value={tempLaunchPrice}
              onChange={(e) => setTempLaunchPrice(e.target.value)}
              placeholder="Enter launch price"
              size="small"
            />

            {/* Price Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Price Actions</h4>
                <Button
                  size="small"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={addPriceAction}
                  sx={{ textTransform: 'none' }}
                >
                  Add
                </Button>
              </div>

              {tempPriceActions.map((action, index) => (
                <div key={action.id} className="flex items-center gap-2">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={action.monthYear}
                      onChange={(e) => updatePriceAction(action.id, 'monthYear', e.target.value)}
                      displayEmpty
                      sx={{ backgroundColor: '#fff' }}
                    >
                      <MenuItem value="" disabled>Select Month-Year</MenuItem>
                      {monthYearOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    placeholder="%"
                    value={action.percentage}
                    onChange={(e) => updatePriceAction(action.id, 'percentage', e.target.value)}
                    sx={{ width: 100 }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deletePriceAction(action.id)}
                    disabled={tempPriceActions.length === 1}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPriceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={savePriceDialog} 
            variant="contained"
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default RevenueDataGrid;
