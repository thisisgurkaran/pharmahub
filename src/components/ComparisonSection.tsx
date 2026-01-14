import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule, type ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CollapsibleSection from "./CollapsibleSection";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

ModuleRegistry.registerModules([ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule]);

interface ComparisonSectionProps {
  periodType: "monthly" | "quarterly" | "annual";
}

const ComparisonSection = ({ periodType }: ComparisonSectionProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['scenarioComparison', 'modeOfAdmin', 'forecastComparison']);
  const [selectedMoA, setSelectedMoA] = useState('IV');
  const [selectDate, setSelectDate] = useState('May-29');
  const [startDate, setStartDate] = useState('Jan-29');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Generate columns based on period type
  const generateColumns = useMemo(() => {
    const cols: string[] = [];
    
    if (periodType === "annual") {
      for (let year = 2022; year <= 2032; year++) {
        cols.push(year.toString());
      }
    } else if (periodType === "quarterly") {
      for (let year = 2022; year <= 2026; year++) {
        for (let q = 1; q <= 4; q++) {
          cols.push(`Q${q}-${year.toString().slice(-2)}`);
        }
      }
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let year = 2022; year <= 2025; year++) {
        for (const month of months) {
          cols.push(`${month}-${year.toString().slice(-2)}`);
        }
      }
    }
    return cols;
  }, [periodType]);

  // Chart data
  const chartData = useMemo(() => {
    if (periodType === "annual") {
      return [
        { name: "2022", IV: 0.2, SC: 0.15, "SC Autoinjector": 0.1, "SC PFS": 0.05 },
        { name: "2023", IV: 0.25, SC: 0.2, "SC Autoinjector": 0.12, "SC PFS": 0.08 },
        { name: "2024", IV: 0.3, SC: 0.28, "SC Autoinjector": 0.18, "SC PFS": 0.12 },
        { name: "2025", IV: 0.35, SC: 0.32, "SC Autoinjector": 0.22, "SC PFS": 0.15 },
        { name: "2026", IV: 0.4, SC: 0.38, "SC Autoinjector": 0.28, "SC PFS": 0.2 },
        { name: "2027", IV: 0.45, SC: 0.42, "SC Autoinjector": 0.32, "SC PFS": 0.25 },
        { name: "2028", IV: 0.5, SC: 0.48, "SC Autoinjector": 0.38, "SC PFS": 0.3 },
        { name: "2029", IV: 0.52, SC: 0.5, "SC Autoinjector": 0.42, "SC PFS": 0.35 },
        { name: "2030", IV: 0.55, SC: 0.52, "SC Autoinjector": 0.45, "SC PFS": 0.38 },
        { name: "2031", IV: 0.58, SC: 0.55, "SC Autoinjector": 0.48, "SC PFS": 0.4 },
        { name: "2032", IV: 0.6, SC: 0.58, "SC Autoinjector": 0.5, "SC PFS": 0.42 },
      ];
    } else if (periodType === "quarterly") {
      return [
        { name: "Q1-22", IV: 0.05, SC: 0.04, "SC Autoinjector": 0.02, "SC PFS": 0.01 },
        { name: "Q2-22", IV: 0.06, SC: 0.05, "SC Autoinjector": 0.03, "SC PFS": 0.02 },
        { name: "Q3-22", IV: 0.07, SC: 0.06, "SC Autoinjector": 0.04, "SC PFS": 0.02 },
        { name: "Q4-22", IV: 0.08, SC: 0.07, "SC Autoinjector": 0.04, "SC PFS": 0.03 },
        { name: "Q1-23", IV: 0.09, SC: 0.08, "SC Autoinjector": 0.05, "SC PFS": 0.03 },
        { name: "Q2-23", IV: 0.1, SC: 0.09, "SC Autoinjector": 0.06, "SC PFS": 0.04 },
        { name: "Q3-23", IV: 0.11, SC: 0.1, "SC Autoinjector": 0.07, "SC PFS": 0.05 },
        { name: "Q4-23", IV: 0.12, SC: 0.11, "SC Autoinjector": 0.08, "SC PFS": 0.06 },
      ];
    } else {
      return [
        { name: "Jan-22", IV: 0.02, SC: 0.015, "SC Autoinjector": 0.008, "SC PFS": 0.004 },
        { name: "Feb-22", IV: 0.022, SC: 0.017, "SC Autoinjector": 0.009, "SC PFS": 0.005 },
        { name: "Mar-22", IV: 0.024, SC: 0.019, "SC Autoinjector": 0.01, "SC PFS": 0.006 },
        { name: "Apr-22", IV: 0.026, SC: 0.021, "SC Autoinjector": 0.011, "SC PFS": 0.007 },
        { name: "May-22", IV: 0.028, SC: 0.023, "SC Autoinjector": 0.012, "SC PFS": 0.008 },
        { name: "Jun-22", IV: 0.03, SC: 0.025, "SC Autoinjector": 0.013, "SC PFS": 0.009 },
      ];
    }
  }, [periodType]);

  // Grid column definitions for Mode of Admin
  const modeOfAdminColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: 'metric',
        headerName: 'Gross Revenue',
        pinned: 'left',
        width: 140,
        cellStyle: { fontWeight: 500, backgroundColor: '#fff' }
      }
    ];

    const actualsEndIndex = periodType === "annual" ? 4 : periodType === "quarterly" ? 16 : 48;

    generateColumns.forEach((col, index) => {
      const isActual = index < actualsEndIndex;
      cols.push({
        field: col,
        headerName: col,
        width: periodType === "monthly" ? 70 : 90,
        cellStyle: { 
          textAlign: 'center',
          backgroundColor: isActual ? '#E8F5E9' : '#fff'
        }
      });
    });

    return cols;
  }, [generateColumns, periodType]);

  // Row data for Mode of Admin
  const modeOfAdminRowData = useMemo(() => {
    const metrics = ['IV', 'SC', 'SC Autoinjector', 'SC PFS', 'Total'];
    
    return metrics.map(metric => {
      const row: { [key: string]: string } = { metric };
      generateColumns.forEach(col => {
        row[col] = '-';
      });
      return row;
    });
  }, [generateColumns]);

  // Scenario Comparison column definitions
  const scenarioComparisonColumnDefs: ColDef[] = useMemo(() => {
    return [
      {
        field: 'metric',
        headerName: 'Metric',
        pinned: 'left',
        width: 280,
        cellStyle: (params) => ({ 
          fontWeight: params.data?.isItalic ? 400 : 500, 
          fontStyle: params.data?.isItalic ? 'italic' : 'normal',
          backgroundColor: '#fff',
          color: params.data?.isGreyed ? '#9e9e9e' : '#333'
        })
      },
      {
        field: 'currentScenario',
        headerName: 'Current Scenario',
        width: 140,
        cellStyle: { textAlign: 'center' },
        headerClass: 'ag-header-center'
      },
      {
        field: 'germany_base_as_le2_2025',
        headerName: 'Germany_Base_AS_LE2_2025',
        width: 180,
        cellStyle: { textAlign: 'center' },
        headerClass: 'ag-header-center'
      },
      {
        field: 'germany_base1_le1_2025',
        headerName: 'Germany_Base1_LE1_2025',
        width: 180,
        cellStyle: { textAlign: 'center' },
        headerClass: 'ag-header-center'
      },
      {
        field: 'base_aop_2025',
        headerName: 'Base_AOP_2025',
        width: 140,
        cellStyle: { textAlign: 'center' },
        headerClass: 'ag-header-center'
      }
    ];
  }, []);

  // Scenario Comparison row data
  const scenarioComparisonRowData = useMemo(() => {
    const metrics = [
      { metric: 'New Patients on Therapy', isItalic: false, isGreyed: false },
      { metric: 'Discontinuations on New Patients on Therapy', isItalic: false, isGreyed: false },
      { metric: 'Discontinuations on Continuing Patients on Therapy', isItalic: false, isGreyed: false },
      { metric: 'Cumulative Net Patients', isItalic: false, isGreyed: false },
      { metric: 'Vials/Dose', isItalic: true, isGreyed: true },
      { metric: 'Adherence %', isItalic: true, isGreyed: true },
      { metric: 'Total Adherent Vials', isItalic: false, isGreyed: false },
      { metric: 'Adherent FOC Vials', isItalic: false, isGreyed: false },
      { metric: 'Equivalized Total Adherent Vials (mg)', isItalic: false, isGreyed: false },
      { metric: 'Price', isItalic: true, isGreyed: true },
      { metric: 'Gross Revenue', isItalic: false, isGreyed: false },
      { metric: 'GTN %', isItalic: true, isGreyed: true },
      { metric: 'Net Revenue', isItalic: false, isGreyed: false },
      { metric: 'Net Revenue (not Cap adjusted)', isItalic: false, isGreyed: false },
      { metric: 'Net Revenue forfeit for Cap', isItalic: false, isGreyed: false },
    ];

    return metrics.map(item => ({
      metric: item.metric,
      isItalic: item.isItalic,
      isGreyed: item.isGreyed,
      currentScenario: item.metric === 'Price' ? '$0' : '-',
      germany_base_as_le2_2025: item.metric === 'Price' ? '$0' : '-',
      germany_base1_le1_2025: item.metric === 'Price' ? '$0' : '-',
      base_aop_2025: item.metric === 'Price' ? '$0' : '-',
    }));
  }, []);

  const defaultColDef: ColDef = {
    sortable: false,
    filter: false,
    resizable: true,
    suppressMovable: true,
  };

  return (
    <div className="space-y-4">
      {/* Scenario Comparison Header */}
      <div className="text-lg font-semibold text-foreground">
        Scenario Comparison
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-6 px-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Select MoA</span>
          <Select
            value={selectedMoA}
            onChange={(e) => setSelectedMoA(e.target.value)}
            size="small"
            sx={{ minWidth: 140, bgcolor: 'white' }}
          >
            <MenuItem value="IV">IV</MenuItem>
            <MenuItem value="SC">SC</MenuItem>
            <MenuItem value="SC Autoinjector">SC Autoinjector</MenuItem>
            <MenuItem value="SC PFS">SC PFS</MenuItem>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Select Date</span>
          <Select
            value={selectDate}
            onChange={(e) => setSelectDate(e.target.value)}
            size="small"
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="May-29">May-29</MenuItem>
            <MenuItem value="Jun-29">Jun-29</MenuItem>
            <MenuItem value="Jul-29">Jul-29</MenuItem>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Start Date</span>
          <Select
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="Jan-29">Jan-29</MenuItem>
            <MenuItem value="Feb-29">Feb-29</MenuItem>
            <MenuItem value="Mar-29">Mar-29</MenuItem>
          </Select>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="border border-gray-300">
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1 text-sm font-medium">Metric</div>
            <div className="col-span-4 text-sm font-medium text-center">Scenario aggregated at YTD</div>
          </div>
        </div>
        <div 
          className="ag-theme-alpine" 
          style={{ width: '100%', height: 480 }}
        >
          <AgGridReact
            rowData={scenarioComparisonRowData}
            columnDefs={scenarioComparisonColumnDefs}
            defaultColDef={defaultColDef}
            suppressMovableColumns={true}
            headerHeight={36}
            rowHeight={28}
          />
        </div>
      </div>

      {/* Summary by Mode of Administration */}
      <CollapsibleSection
        id="modeOfAdmin"
        title="Summary by Mode of Administration"
        isExpanded={expandedSections.includes('modeOfAdmin')}
        onToggle={toggleSection}
        variant="primary"
      >
        <div className="p-4 space-y-4">
          {/* Chart */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(value) => `€${value}M`}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toFixed(2)}M`, '']}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="plainline"
                />
                <Line type="monotone" dataKey="IV" stroke="#1976D2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SC" stroke="#FF9800" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SC Autoinjector" stroke="#4CAF50" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SC PFS" stroke="#9C27B0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div 
            className="ag-theme-alpine" 
            style={{ width: '100%', height: 200 }}
          >
            <AgGridReact
              rowData={modeOfAdminRowData}
              columnDefs={modeOfAdminColumnDefs}
              defaultColDef={defaultColDef}
              suppressMovableColumns={true}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Forecast vs. Actuals Comparison */}
      <CollapsibleSection
        id="forecastComparison"
        title="Forecast vs. Actuals Comparison"
        isExpanded={expandedSections.includes('forecastComparison')}
        onToggle={toggleSection}
        variant="primary"
      >
        <div className="p-4">
          <p className="text-sm text-muted-foreground italic">
            Forecast vs. Actuals comparison data will be displayed here
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ComparisonSection;
