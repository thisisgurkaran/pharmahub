import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/Layout";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MuiTooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Bar, BarChart } from "recharts";
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
import { 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  History, 
  Send,
  Settings,
  FileText,
  BarChart3,
  GitBranch,
  ClipboardCheck,
  ListChecks,
  Calculator,
  X,
  Check,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  PartyPopper,
  PanelRightClose,
  PanelRight,
  Table,
  LineChart as LineChartIcon,
  Save,
  Database,
  Download
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  icon: React.ElementType;
  subActivities?: string[];
}

const activities: Activity[] = [
  { 
    id: "update-assumptions", 
    title: "Update assumptions", 
    icon: Settings,
    subActivities: ["Market assumptions", "Patient flow assumptions", "Pricing assumptions"]
  },
  { 
    id: "audit-outputs", 
    title: "Audit outputs", 
    icon: FileText,
    subActivities: ["Revenue audit", "Volume audit", "Compliance check"]
  },
  { 
    id: "review-outputs", 
    title: "Review outputs", 
    icon: BarChart3,
    subActivities: ["Summary view", "Detailed breakdown"]
  },
  { 
    id: "what-if-analysis", 
    title: "What if analysis", 
    icon: Calculator,
    subActivities: ["Scenario comparison", "Sensitivity analysis"]
  },
];

const mockKPIs = [
  { name: "Total Revenue", value: "$125.4M", change: "+2.3%" },
  { name: "Patient Volume", value: "45,230", change: "+5.1%" },
  { name: "Market Share", value: "23.4%", change: "-0.2%" },
  { name: "Avg. Price", value: "$2,770", change: "+1.8%" },
];

interface CohortData {
  id: number;
  expanded: boolean;
  classShare: { baseline: string; events: string[] };
  brandShare: { baseline: string; events: string[] };
}

interface ChatMessage {
  role: "user" | "system";
  content: string;
  options?: string[];
  showOptions?: boolean;
  showCharts?: boolean;
  chartType?: "forecast" | "metric" | "prevalence" | "diagnosis" | "treatment" | "moaMix" | "channelMix" | "adherence" | "gtn";
  showAgentSteps?: boolean;
  agentSteps?: string[];
  showInsights?: boolean;
  insights?: { text: string; type: "up" | "down" | "warning" }[];
  showClarifications?: boolean;
  clarifications?: string[];
  showConfirmation?: boolean;
  showActualizeComplete?: boolean;
  actualizeMetricOptions?: string[];
}

type ChatStep = 
  | "initial"
  | "forecast_selected"
  | "new_scenario_asked"
  | "scenario_selected"
  | "what_next"
  | "action_selected"
  | "agent_executing"
  | "agent_complete"
  | "metric_options"
  | "metric_selected"
  | "trend_analysis"
  | "clarifications"
  | "confirmation"
  // Flow 2 steps
  | "flow2_initial"
  | "flow2_new_scenario_asked"
  | "flow2_scenario_selected"
  | "flow2_loaded"
  | "flow2_actuals_shown"
  | "flow2_what_next"
  | "flow2_variance_analyzed"
  | "flow2_actualizing"
  | "flow2_actualized"
  | "flow2_trend_question"
  | "flow2_trend_analysis"
  | "flow2_pums_update"
  | "flow2_pums_clarify"
  | "flow2_pums_confirmed"
  | "flow2_saved";

type DemoFlow = "flow1" | "flow2";

// Mock chart data - Stacked bar with line overlay
const pumsChartData = [
  { month: "Jan-25", actualsSC: 70, actualsSCPFS: 20, finPlan26: 95 },
  { month: "Feb-25", actualsSC: 85, actualsSCPFS: 25, finPlan26: 115 },
  { month: "Mar-25", actualsSC: 100, actualsSCPFS: 35, finPlan26: 140 },
  { month: "Apr-25", actualsSC: 120, actualsSCPFS: 45, finPlan26: 175 },
  { month: "May-25", actualsSC: 140, actualsSCPFS: 55, finPlan26: 210 },
  { month: "Jun-25", actualsSC: 165, actualsSCPFS: 70, finPlan26: 250 },
  { month: "Jul-25", actualsSC: 185, actualsSCPFS: 85, finPlan26: 290 },
  { month: "Aug-25", actualsSC: 210, actualsSCPFS: 100, finPlan26: 335 },
  { month: "Sep-25", actualsSC: 235, actualsSCPFS: 115, finPlan26: 380 },
  { month: "Oct-25", actualsSC: 260, actualsSCPFS: 135, finPlan26: 430 },
  { month: "Nov-25", actualsSC: 290, actualsSCPFS: 155, finPlan26: 485 },
  { month: "Dec-25", actualsSC: 285, actualsSCPFS: 175, finPlan26: 500 },
];

const vialsChartData = [
  { month: "Jan-25", actualsSC: 3500, actualsSCPFS: 1200, finPlan26: 5000 },
  { month: "Feb-25", actualsSC: 4200, actualsSCPFS: 1500, finPlan26: 6100 },
  { month: "Mar-25", actualsSC: 5000, actualsSCPFS: 1900, finPlan26: 7400 },
  { month: "Apr-25", actualsSC: 5800, actualsSCPFS: 2400, finPlan26: 8800 },
  { month: "May-25", actualsSC: 6700, actualsSCPFS: 2900, finPlan26: 10300 },
  { month: "Jun-25", actualsSC: 7600, actualsSCPFS: 3500, finPlan26: 12000 },
  { month: "Jul-25", actualsSC: 8500, actualsSCPFS: 4100, finPlan26: 13600 },
  { month: "Aug-25", actualsSC: 9400, actualsSCPFS: 4800, finPlan26: 15400 },
  { month: "Sep-25", actualsSC: 10400, actualsSCPFS: 5500, finPlan26: 17200 },
  { month: "Oct-25", actualsSC: 11400, actualsSCPFS: 6300, finPlan26: 19200 },
  { month: "Nov-25", actualsSC: 12500, actualsSCPFS: 7100, finPlan26: 21300 },
  { month: "Dec-25", actualsSC: 12200, actualsSCPFS: 7800, finPlan26: 21500 },
];

const revenueChartData = [
  { month: "Jan-25", actualsSC: 8.5, actualsSCPFS: 3.2, finPlan26: 12.5 },
  { month: "Feb-25", actualsSC: 10.2, actualsSCPFS: 4.0, finPlan26: 15.2 },
  { month: "Mar-25", actualsSC: 12.1, actualsSCPFS: 5.1, finPlan26: 18.5 },
  { month: "Apr-25", actualsSC: 14.0, actualsSCPFS: 6.4, finPlan26: 22.0 },
  { month: "May-25", actualsSC: 16.2, actualsSCPFS: 7.8, finPlan26: 25.8 },
  { month: "Jun-25", actualsSC: 18.4, actualsSCPFS: 9.4, finPlan26: 30.0 },
  { month: "Jul-25", actualsSC: 20.6, actualsSCPFS: 11.0, finPlan26: 34.0 },
  { month: "Aug-25", actualsSC: 22.8, actualsSCPFS: 12.9, finPlan26: 38.5 },
  { month: "Sep-25", actualsSC: 25.2, actualsSCPFS: 14.8, finPlan26: 43.0 },
  { month: "Oct-25", actualsSC: 27.6, actualsSCPFS: 16.9, finPlan26: 48.0 },
  { month: "Nov-25", actualsSC: 30.3, actualsSCPFS: 19.1, finPlan26: 53.3 },
  { month: "Dec-25", actualsSC: 29.5, actualsSCPFS: 20.9, finPlan26: 53.8 },
];

const metricChartData2026 = [
  { month: "Jan-26", value: 6100, forecast: 6200 },
  { month: "Feb-26", value: 6280, forecast: 6400 },
  { month: "Mar-26", value: 6450, forecast: 6600 },
  { month: "Apr-26", value: 6620, forecast: 6800 },
  { month: "May-26", value: 6800, forecast: 7000 },
  { month: "Jun-26", value: 6980, forecast: 7200 },
  { month: "Jul-26", value: 7150, forecast: 7400 },
  { month: "Aug-26", value: 7320, forecast: 7600 },
  { month: "Sep-26", value: 7500, forecast: 7800 },
  { month: "Oct-26", value: 7680, forecast: 8000 },
  { month: "Nov-26", value: 7850, forecast: 8200 },
  { month: "Dec-26", value: 8020, forecast: 8400 },
];

// Prevalence chart data for Total CIDP Prevalence (%)
const prevalenceChartData = [
  { year: "2020", value: 0.021 },
  { year: "2021", value: 0.022 },
  { year: "2022", value: 0.023 },
  { year: "2023", value: 0.024 },
  { year: "2024", value: 0.025 },
  { year: "2025", value: 0.026 },
  { year: "2026", value: 0.027 },
  { year: "2027", value: 0.028 },
  { year: "2028", value: 0.029 },
  { year: "2029", value: 0.030 },
  { year: "2030", value: 0.031 },
];

// Prevalence table data
const prevalenceTableData = [
  { metric: "Total CIDP Prevalence (%)", values: ["0.021%", "0.022%", "0.023%", "0.024%", "0.025%", "0.026%", "0.027%", "0.028%", "0.029%", "0.030%", "0.031%"] },
];

const scenarios = [
  { id: 1, name: "Base Case - Q4 2025", lastUpdated: "Dec 15, 2024" },
  { id: 2, name: "Optimistic - PFS Launch", lastUpdated: "Dec 18, 2024" },
  { id: 3, name: "Conservative - Market Pressure", lastUpdated: "Dec 20, 2024" },
];

// Workflow pipeline sections - simplified
const workflowSections = [
  { id: "epidemiology", title: "Epidemiology Conversion", setup: "Annual", status: "in-progress", progress: 2, total: 6, subItems: ["Prevalence Rate", "Diagnosis Rate", "Treatment Rate"] },
  { id: "patient-treatment", title: "Patients on Treatment", setup: "Annual → Monthly", status: "pending", progress: 0, total: 6, subItems: ["PUMS", "MOA Mix", "Enrollment Rate", "Channel Mix", "Discontinuation Rate", "Switching Rate"] },
  { id: "vial-conversion", title: "Vial Conversion", setup: "Monthly", status: "pending", progress: 0, total: 5, subItems: ["Dosing Inputs", "Adherence"] },
  { id: "finance", title: "Finance Conversion", setup: "Monthly", status: "pending", progress: 0, total: 4, subItems: ["List Price", "GTN %"] },
];

const Testpage = () => {
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedSubActivity, setSelectedSubActivity] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatStep, setChatStep] = useState<ChatStep>("flow2_initial");
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [demoFlow, setDemoFlow] = useState<DemoFlow>("flow2");
  const [activeLeftPanel, setActiveLeftPanel] = useState<"activities" | "actuals" | "workflow" | "scenarios" | "configuration" | null>("activities");
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [sectionViews, setSectionViews] = useState<Record<string, "table" | "chart">>({
    "scenario-comparison": "chart",
    "patient-metrics": "chart",
    "revenue-metrics": "chart",
  });
  const [expandedMetricSections, setExpandedMetricSections] = useState<string[]>(["scenario-comparison"]);
  const [selectedBaseScenario, setSelectedBaseScenario] = useState<string>("LE3_2025");
  const baseScenarioOptions = ["Upside_LE3_2025", "LE3_2025", "Downside_LE3_2025"];
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const yearOptions = ["2024", "2025", "2026", "2027", "2028"];
  const [editingChart, setEditingChart] = useState<"pums" | "vials" | "revenue" | null>(null);
  const [editablePumsData, setEditablePumsData] = useState(pumsChartData.map(d => ({ month: d.month, sc: d.actualsSC, scPfs: d.actualsSCPFS })));
  const [editableVialsData, setEditableVialsData] = useState(vialsChartData.map(d => ({ month: d.month, sc: d.actualsSC, scPfs: d.actualsSCPFS })));
  const [editableRevenueData, setEditableRevenueData] = useState(revenueChartData.map(d => ({ month: d.month, sc: d.actualsSC, scPfs: d.actualsSCPFS })));

  // State for selected chart metric
  const [selectedChartMetric, setSelectedChartMetric] = useState<string>("Cumulative net patients");
  
  // State for Tableau dashboard modal
  const [showTableauModal, setShowTableauModal] = useState(false);
  
  // State for Actualize Forecast modal
  const [showActualizeModal, setShowActualizeModal] = useState(false);
  
  // State for expanded recommendation card
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [selectedWorkflowSubItem, setSelectedWorkflowSubItem] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const chartMetricOptions = ["Cumulative net patients", "Total Adherent Vials", "Net Revenue"];
  
  // Curve form state type
  type CurveFormState = {
    startDate: string;
    startValue: string;
    startValueType: "number" | "percentage";
    peakValue: string;
    peakValueType: "number" | "percentage";
    timeToReachPeak: string;
    uptakeCurve: string;
  };

  const defaultCurveForm: CurveFormState = {
    startDate: "",
    startValue: "",
    startValueType: "number",
    peakValue: "",
    peakValueType: "number",
    timeToReachPeak: "",
    uptakeCurve: ""
  };

  const uptakeCurveOptions = [
    "Slow Uptake 4", "Slow Uptake 3", "Slow Uptake 2", "Slow Uptake 1",
    "Linear Uptake", "Fast Uptake 1", "Fast Uptake 2", "Fast Uptake 3", "Fast Uptake 4", "Fast Uptake 5"
  ];

  // ========== PREVALENCE RATE ==========
  const [showPrevalenceCurveModal, setShowPrevalenceCurveModal] = useState(false);
  const [hasPrevalenceCustomCurve, setHasPrevalenceCustomCurve] = useState(false);
  const [selectedPrevalenceCurveIndex, setSelectedPrevalenceCurveIndex] = useState<number | null>(null);
  const [prevalenceCurveConfirmed, setPrevalenceCurveConfirmed] = useState(false);
  const [prevalenceFinalConfirmed, setPrevalenceFinalConfirmed] = useState(false);
  const [prevalenceProcessingComplete, setPrevalenceProcessingComplete] = useState(false);
  const [prevalenceCurveForm, setPrevalenceCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [prevalenceRowData, setPrevalenceRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "Total CIDP Prevalence (%)", "2020": "0.021%", "2021": "0.022%", "2022": "0.023%", "2023": "0.024%", "2024": "0.025%", "2025": "0.026%", "2026": "0.027%", "2027": "0.028%", "2028": "0.029%", "2029": "0.030%", "2030": "0.031%" }
  ]);

  // ========== DIAGNOSIS RATE ==========
  const [showDiagnosisCurveModal, setShowDiagnosisCurveModal] = useState(false);
  const [hasDiagnosisCustomCurve, setHasDiagnosisCustomCurve] = useState(false);
  const [selectedDiagnosisCurveIndex, setSelectedDiagnosisCurveIndex] = useState<number | null>(null);
  const [diagnosisCurveConfirmed, setDiagnosisCurveConfirmed] = useState(false);
  const [diagnosisCurveForm, setDiagnosisCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [diagnosisRowData, setDiagnosisRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "Diagnosis Rate (%)", "2020": "45.0%", "2021": "46.5%", "2022": "48.0%", "2023": "49.5%", "2024": "51.0%", "2025": "52.5%", "2026": "54.0%", "2027": "55.5%", "2028": "57.0%", "2029": "58.5%", "2030": "60.0%" }
  ]);

  // ========== TREATMENT RATE ==========
  const [showTreatmentCurveModal, setShowTreatmentCurveModal] = useState(false);
  const [hasTreatmentCustomCurve, setHasTreatmentCustomCurve] = useState(false);
  const [selectedTreatmentCurveIndex, setSelectedTreatmentCurveIndex] = useState<number | null>(null);
  const [treatmentCurveConfirmed, setTreatmentCurveConfirmed] = useState(false);
  const [treatmentCurveForm, setTreatmentCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [treatmentRowData, setTreatmentRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "Treatment Rate (%)", "2020": "68.0%", "2021": "69.5%", "2022": "71.0%", "2023": "72.5%", "2024": "74.0%", "2025": "75.5%", "2026": "77.0%", "2027": "78.5%", "2028": "80.0%", "2029": "81.5%", "2030": "83.0%" }
  ]);

  // ========== MOA MIX ==========
  const [showMoaMixCurveModal, setShowMoaMixCurveModal] = useState(false);
  const [hasMoaMixCustomCurve, setHasMoaMixCustomCurve] = useState(false);
  const [selectedMoaMixCurveIndex, setSelectedMoaMixCurveIndex] = useState<number | null>(null);
  const [moaMixCurveConfirmed, setMoaMixCurveConfirmed] = useState(false);
  const [moaMixCurveForm, setMoaMixCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [moaMixRowData, setMoaMixRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "MOA Mix - SC (%)", "2020": "65.0%", "2021": "67.0%", "2022": "69.0%", "2023": "70.5%", "2024": "72.0%", "2025": "73.5%", "2026": "75.0%", "2027": "76.5%", "2028": "78.0%", "2029": "79.5%", "2030": "81.0%" }
  ]);

  // ========== CHANNEL MIX ==========
  const [showChannelMixCurveModal, setShowChannelMixCurveModal] = useState(false);
  const [hasChannelMixCustomCurve, setHasChannelMixCustomCurve] = useState(false);
  const [selectedChannelMixCurveIndex, setSelectedChannelMixCurveIndex] = useState<number | null>(null);
  const [channelMixCurveConfirmed, setChannelMixCurveConfirmed] = useState(false);
  const [channelMixCurveForm, setChannelMixCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [channelMixRowData, setChannelMixRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "Channel Mix - Specialty (%)", "2020": "55.0%", "2021": "57.5%", "2022": "60.0%", "2023": "62.5%", "2024": "65.0%", "2025": "67.5%", "2026": "70.0%", "2027": "72.5%", "2028": "75.0%", "2029": "77.5%", "2030": "80.0%" }
  ]);

  // ========== ADHERENCE ==========
  const [showAdherenceCurveModal, setShowAdherenceCurveModal] = useState(false);
  const [hasAdherenceCustomCurve, setHasAdherenceCustomCurve] = useState(false);
  const [selectedAdherenceCurveIndex, setSelectedAdherenceCurveIndex] = useState<number | null>(null);
  const [adherenceCurveConfirmed, setAdherenceCurveConfirmed] = useState(false);
  const [adherenceCurveForm, setAdherenceCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [adherenceRowData, setAdherenceRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "Adherence Rate (%)", "2020": "82.0%", "2021": "83.0%", "2022": "84.0%", "2023": "85.0%", "2024": "86.0%", "2025": "87.0%", "2026": "88.0%", "2027": "89.0%", "2028": "90.0%", "2029": "91.0%", "2030": "92.0%" }
  ]);

  // ========== GTN % ==========
  const [showGtnCurveModal, setShowGtnCurveModal] = useState(false);
  const [hasGtnCustomCurve, setHasGtnCustomCurve] = useState(false);
  const [selectedGtnCurveIndex, setSelectedGtnCurveIndex] = useState<number | null>(null);
  const [gtnCurveConfirmed, setGtnCurveConfirmed] = useState(false);
  const [gtnCurveForm, setGtnCurveForm] = useState<CurveFormState>(defaultCurveForm);
  const [gtnRowData, setGtnRowData] = useState<{label: string; [key: string]: string}[]>([
    { label: "GTN Rate (%)", "2020": "12.0%", "2021": "12.3%", "2022": "12.6%", "2023": "12.9%", "2024": "13.2%", "2025": "13.5%", "2026": "13.8%", "2027": "14.1%", "2028": "14.4%", "2029": "14.7%", "2030": "15.0%" }
  ]);
  
  const prevalenceGridRef = useRef<AgGridReact>(null);
  const prevalenceGridApiRef = useRef<GridApi | null>(null);
  
  const prevalenceYears = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  
  const prevalenceColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "label",
        headerName: "Metric",
        pinned: "left",
        width: 180,
        editable: false,
        cellStyle: { fontWeight: 500, textAlign: 'left' }
      }
    ];

    prevalenceYears.forEach(year => {
      cols.push({
        field: year,
        headerName: year,
        width: 80,
        editable: true,
        cellClass: 'ag-cell-number',
        cellStyle: {
          backgroundColor: 'hsl(45, 100%, 88%)',
          textAlign: 'center'
        }
      });
    });

    return cols;
  }, []);
  
  const prevalenceDefaultColDef: ColDef = useMemo(() => ({
    resizable: true,
    sortable: false,
  }), []);
  
  const onPrevalenceCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log("Prevalence cell value changed:", event.data);
    setPrevalenceRowData(prev => [...prev]);
  }, []);
  
  const onPrevalenceGridReady = useCallback((params: { api: GridApi }) => {
    prevalenceGridApiRef.current = params.api;
  }, []);

  // Convert prevalence row data to chart data format - supports multiple curves
  const editablePrevalenceData = useMemo(() => {
    if (prevalenceRowData.length === 0) return [];
    return prevalenceYears.map(year => {
      const dataPoint: { year: string; [key: string]: number | string } = { year };
      prevalenceRowData.forEach((row, index) => {
        const key = index === 0 ? 'value' : `curve${index}`;
        dataPoint[key] = parseFloat(row[year]?.replace('%', '') || '0') / 100;
      });
      return dataPoint;
    });
  }, [prevalenceRowData]);

  // Generate 5-year chart data based on selected year
  const scenarioChartData = useMemo(() => {
    const startYear = parseInt(selectedYear);
    const years = Array.from({ length: 5 }, (_, i) => startYear + i);
    
    // Base values for different metrics
    const baseValues: Record<string, { current: number[], base: number[] }> = {
      "Cumulative net patients": {
        current: [4250, 5120, 6180, 7340, 8520],
        base: [4100, 4920, 5890, 6950, 8020]
      },
      "Total Adherent Vials": {
        current: [18500, 22300, 26800, 31500, 36200],
        base: [17800, 21400, 25600, 30100, 34500]
      },
      "Net Revenue": {
        current: [125.4, 152.8, 184.2, 218.5, 256.3],
        base: [119.8, 145.2, 174.6, 206.8, 242.1]
      }
    };
    
    const metricData = baseValues[selectedChartMetric] || baseValues["Cumulative net patients"];
    
    return years.map((year, idx) => ({
      year: year.toString(),
      current: metricData.current[idx],
      base: metricData.base[idx]
    }));
  }, [selectedYear, selectedChartMetric]);

  // Metrics data for right panel with logical numbers
  const metricsData = [
    { metric: "Total Identifiable Patients", currentScenario: "12,450", baseLE3: "11,980", isBold: true },
    { metric: "Enrolment Rate", currentScenario: "34.2%", baseLE3: "32.8%", isItalic: true },
    { metric: "New Patients on Therapy", currentScenario: "1,245", baseLE3: "1,180", isBold: true },
    { metric: "MoA Mix - on New Patients on Therapy", currentScenario: "100.0%", baseLE3: "100.0%", isItalic: true },
    { metric: "% IV", currentScenario: "0.0%", baseLE3: "0.0%", isItalic: true, indent: true },
    { metric: "% SC", currentScenario: "69.3%", baseLE3: "73.6%", isItalic: true, indent: true },
    { metric: "% SC PFS", currentScenario: "30.7%", baseLE3: "26.4%", isItalic: true, indent: true },
    { metric: "% SC Autoinjector", currentScenario: "0.0%", baseLE3: "0.0%", isItalic: true, indent: true },
    { metric: "Discontinuations % Rate", currentScenario: "12.5%", baseLE3: "12.0%", isItalic: true },
    { metric: "Discontinuations", currentScenario: "156", baseLE3: "142", isBold: true },
    { metric: "Cumulative net patients", currentScenario: "4,250", baseLE3: "4,100", isBold: true },
    { metric: "Cycles/Year", currentScenario: "4.61", baseLE3: "4.61", isItalic: true, indent: true },
    { metric: "% Adherence", currentScenario: "87.5%", baseLE3: "86.2%", isItalic: true, indent: true },
    { metric: "Total Adherent Vials", currentScenario: "18,500", baseLE3: "17,800", isBold: true },
    { metric: "Equivalized Total Adherent Vials (mg)", currentScenario: "925,000", baseLE3: "890,000", isBold: true },
    { metric: "Price", currentScenario: "$7,850", baseLE3: "$7,850", isItalic: true, indent: true },
    { metric: "Gross Revenue", currentScenario: "$145.2M", baseLE3: "$138.5M", isBold: true },
    { metric: "GTN %", currentScenario: "13.6%", baseLE3: "13.5%", isItalic: true },
    { metric: "Net Revenue", currentScenario: "$125.4M", baseLE3: "$119.8M", isBold: true },
  ];

  const toggleMetricSection = (sectionId: string) => {
    setExpandedMetricSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleSectionView = (sectionId: string, view: "table" | "chart") => {
    setSectionViews(prev => ({ ...prev, [sectionId]: view }));
  };

  // Patient metrics data
  const patientMetricsData = [
    { metric: "New Patients", currentScenario: "1,245", baseLE3: "1,180" },
    { metric: "Continuing Patients", currentScenario: "3,892", baseLE3: "3,750" },
    { metric: "Discontinued", currentScenario: "156", baseLE3: "142" },
  ];

  // Revenue metrics data
  const revenueMetricsData = [
    { metric: "Gross Revenue", currentScenario: "$145.2M", baseLE3: "$138.5M" },
    { metric: "Net Revenue", currentScenario: "$125.4M", baseLE3: "$119.8M" },
    { metric: "GTN %", currentScenario: "13.6%", baseLE3: "13.5%" },
  ];

  const flow1InitialMessages: ChatMessage[] = [
    { 
      role: "system", 
      content: "Which forecast would you want to work on today?",
      options: ["Create a forecast", "Review existing forecast", "Compare scenarios"],
      showOptions: true
    }
  ];

  const flow2InitialMessages: ChatMessage[] = [
    { 
      role: "system", 
      content: "Which forecast would you want to work today?",
    }
  ];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(flow2InitialMessages);

  const resetToFlow = (flow: DemoFlow) => {
    setDemoFlow(flow);
    setSelectedScenario(null);
    setSelectedMetric(null);
    setIsAgentRunning(false);
    setCurrentAgentStep(0);
    if (flow === "flow1") {
      setChatStep("initial");
      setChatMessages(flow1InitialMessages);
    } else {
      setChatStep("flow2_initial");
      setChatMessages(flow2InitialMessages);
    }
  };

  // Market Share Dialog State
  const [baselineDialogOpen, setBaselineDialogOpen] = useState(false);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [currentCohort, setCurrentCohort] = useState<number>(1);
  const [currentShareType, setCurrentShareType] = useState<"class" | "brand">("class");
  const [baselineValue, setBaselineValue] = useState("");
  const [eventValues, setEventValues] = useState<string[]>([""]);

  const [cohortsData, setCohortsData] = useState<CohortData[]>([
    { id: 1, expanded: true, classShare: { baseline: "", events: [] }, brandShare: { baseline: "", events: [] } },
    { id: 2, expanded: false, classShare: { baseline: "", events: [] }, brandShare: { baseline: "", events: [] } },
    { id: 3, expanded: false, classShare: { baseline: "", events: [] }, brandShare: { baseline: "", events: [] } },
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const agentStepsActualize = [
    "Updating actuals for PUMs...",
    "Now updating actuals for New Patients...",
    "Calculating the continuing patient pool...",
    "Now actualizing the discontinuations and switches...",
    "Now calculating the vials...",
    "Actualizing the total adherent vials...",
    "Now estimating revenue...",
    "Actualizing net revenue for 2025...",
    "Synthesizing the outputs...",
    "Storing an interim version of the forecast..."
  ];

  const agentStepsAnalyze = [
    "Checking the horizon for 2026...",
    "Comparing the trends for cumulative net patients and total adherent vials...",
    "Comparing the trend of intermediate metrics...",
    "Identifying impact of manual adjustments...",
    "Synthesizing outputs..."
  ];

  const runAgentSteps = (steps: string[], onComplete: () => void) => {
    setIsAgentRunning(true);
    setCurrentAgentStep(0);
    
    steps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentAgentStep(index + 1);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsAgentRunning(false);
            onComplete();
          }, 500);
        }
      }, (index + 1) * 800);
    });
  };

  const handleWorkflowSubItemClick = (subItem: string) => {
    setSelectedWorkflowSubItem(subItem);
    
    // Map workflow items to their chart types and messages
    const workflowChartMap: Record<string, { chartType: ChatMessage['chartType']; title: string }> = {
      "Prevalence Rate": { chartType: "prevalence", title: "Total CIDP Prevalence (%)" },
      "Diagnosis Rate": { chartType: "diagnosis", title: "Diagnosis Rate (%)" },
      "Treatment Rate": { chartType: "treatment", title: "Treatment Rate (%)" },
      "MOA Mix": { chartType: "moaMix", title: "MOA Mix - SC (%)" },
      "Channel Mix": { chartType: "channelMix", title: "Channel Mix - Specialty (%)" },
      "Adherence": { chartType: "adherence", title: "Adherence Rate (%)" },
      "GTN %": { chartType: "gtn", title: "GTN Rate (%)" },
    };

    const config = workflowChartMap[subItem];
    
    if (config) {
      setChatMessages(prev => [...prev, {
        role: "system",
        content: `Here's the ${config.title} data:`,
        showCharts: true,
        chartType: config.chartType,
        showConfirmation: true
      }]);
      setSelectedMetric(config.title);
    } else {
      // Default handling for other items
      setChatMessages(prev => [...prev, {
        role: "system",
        content: "Amazing! Please confirm if the updated assumptions look correct to you in the charts below:",
        showCharts: true,
        chartType: "metric" as const,
        showConfirmation: true
      }]);
      setSelectedMetric(`Monthly ${subItem}`);
    }
  };

  const handleOptionSelect = (option: string) => {
    setChatMessages(prev => [
      ...prev.map(msg => ({ ...msg, showOptions: false })),
      { role: "user", content: option }
    ]);

    setTimeout(() => {
      if (chatStep === "initial") {
        if (option === "Create a forecast") {
          setChatStep("forecast_selected");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Do you want to create a new scenario?",
            options: ["Yes, create new", "No, use existing"],
            showOptions: true
          }]);
        }
      } else if (chatStep === "forecast_selected") {
        setChatStep("new_scenario_asked");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "These were the 3 scenarios you worked on. Which one would you like to choose?",
          options: scenarios.map(s => s.name),
          showOptions: true
        }]);
      } else if (chatStep === "new_scenario_asked") {
        const scenarioIdx = scenarios.findIndex(s => s.name === option);
        setSelectedScenario(scenarioIdx + 1);
        setChatStep("scenario_selected");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: `I have loaded ${option}. What would you like to update on the forecast?`,
          showCharts: true,
          chartType: "forecast"
        }]);
        setTimeout(() => {
          setChatStep("what_next");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "What do you want to do next?",
            options: ["Analyze variances", "Actualize forecast", "Get insights"],
            showOptions: true
          }]);
        }, 1000);
      } else if (chatStep === "what_next") {
        setChatStep("action_selected");
        if (option === "Actualize forecast") {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Starting the actualization process...",
            showAgentSteps: true,
            agentSteps: agentStepsActualize
          }]);
          runAgentSteps(agentStepsActualize, () => {
            setChatStep("agent_complete");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "The forecast is now actualized and an interim version has been saved. Would you like to see the updated trends for any particular metric?",
              options: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"],
              showOptions: true
            }]);
            setChatStep("metric_options");
          });
        } else if (option === "Get insights") {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Here are some key insights from your forecast:",
            showInsights: true,
            insights: [
              { text: "Your vials are significantly higher than patients, which highlights incomplete patient capture rate", type: "warning" },
              { text: "Q4 sales for 2025 are 12% higher than Q4-24 sales, which can be due to launch of PFS", type: "up" },
              { text: "Market share declined by 0.2% compared to last quarter", type: "down" }
            ]
          }]);
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "What should we do next?",
              options: ["Actualize forecast", "Analyze variances", "Review assumptions"],
              showOptions: true
            }]);
          }, 500);
        }
      } else if (chatStep === "metric_options") {
        setSelectedMetric(option);
        setChatStep("metric_selected");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: `Here's the ${option} trend from Jan-2026 to Dec-2026:`,
          showCharts: true,
          chartType: "metric"
        }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Analyzing the trends...",
            showAgentSteps: true,
            agentSteps: agentStepsAnalyze
          }]);
          runAgentSteps(agentStepsAnalyze, () => {
            setChatStep("trend_analysis");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "On review, the trend discrepancies happening is due to a significantly higher vial count compared to patients actuals. This can be due to higher vial sales from channels we do not capture patients actuals from, the patient actuals has lower capture rate, there is higher consumption than our assumptions for CIDP."
            }]);
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "What should we do next?",
                options: ["Update assumptions", "Accept current forecast", "Run what-if analysis"],
                showOptions: true
              }]);
            }, 500);
          });
        }, 800);
      } else if (chatStep === "trend_analysis" && option === "Update assumptions") {
        setChatStep("clarifications");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "That sounds great. A few clarifications needed:",
          showClarifications: true,
          clarifications: [
            "1. For PUMs, what should be the distribution between SC and SC PFS?",
            "2. For Enrollment, should we use the same enrollment for SC and SC PFS?"
          ]
        }]);
      }
      // Flow 2 handlers
      else if (chatStep === "flow2_new_scenario_asked") {
        if (option === "No, work off version from last cycle") {
          setChatStep("flow2_scenario_selected");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "These were the 3 scenarios you worked on. Which one would you like to choose?",
            options: ["Scenario 1", "Scenario 2", "Scenario 3"],
            showOptions: true
          }]);
        } else if (option === "Yes, create new") {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Creating a new scenario for CIDP USA. What would you like to name it?"
          }]);
        }
      } else if (chatStep === "flow2_scenario_selected") {
        const scenarioName = option;
        setSelectedScenario(option === "Scenario 1" ? 1 : option === "Scenario 2" ? 2 : 3);
        setChatStep("flow2_loaded");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: `I have loaded ${scenarioName}, what would you like to update on the forecast?`
        }]);
      } else if (chatStep === "flow2_actuals_shown") {
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "",
          showCharts: true,
          chartType: "forecast"
        }]);
        setTimeout(() => {
          setChatStep("flow2_what_next");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "What do you want to do next?",
            options: ["Analyze variances", "Actualize forecast", "Insights"],
            showOptions: true
          }]);
        }, 800);
      } else if (chatStep === "flow2_what_next") {
        if (option === "Analyze variances") {
          const varianceAgentSteps = [
            "Analyzing variances between actuals and forecast...",
            "Calculating percentage changes...",
            "Identifying key discrepancies..."
          ];
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: varianceAgentSteps
          }]);
          runAgentSteps(varianceAgentSteps, () => {
            setChatStep("flow2_variance_analyzed");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "",
              showInsights: true,
              insights: [
                { text: "Your vials are significantly higher than patients, which highlights incomplete patient capture rate", type: "warning" },
                { text: "Your Q4 sales for 2025 are 12% higher than Q4-24 sales which can be due to launch of PFS", type: "up" }
              ]
            }]);
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "What should we do next?",
                options: ["Actualize forecast", "Update assumptions", "Export report"],
                showOptions: true
              }]);
            }, 500);
          });
        } else if (option === "Actualize forecast") {
          setChatStep("flow2_actualizing");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: agentStepsActualize
          }]);
          runAgentSteps(agentStepsActualize, () => {
            setChatStep("flow2_actualized");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "The forecast is now actualized and an interim version has been saved, would you like to see the updated trends for any particular metric?",
              options: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"],
              showOptions: true
            }]);
          });
        }
      } else if (chatStep === "flow2_variance_analyzed") {
        if (option === "Actualize forecast") {
          setChatStep("flow2_actualizing");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: agentStepsActualize
          }]);
          runAgentSteps(agentStepsActualize, () => {
            setChatStep("flow2_actualized");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "The forecast is now actualized and an interim version has been saved, would you like to see the updated trends for any particular metric?",
              options: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"],
              showOptions: true
            }]);
          });
        }
      } else if (chatStep === "flow2_actualized") {
        setSelectedMetric(option);
        setChatStep("flow2_trend_question");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: `Here's the ${option} trend:`,
          showCharts: true,
          chartType: "metric"
        }]);
      } else if (chatStep === "flow2_trend_analysis") {
        if (option === "Update PUMs and enrollment assumptions") {
          setChatStep("flow2_pums_update");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Sure! Please provide the PUMs and enrollment update details."
          }]);
        }
      } else if (chatStep === "flow2_pums_clarify") {
        setChatStep("flow2_pums_confirmed");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "Amazing! Please confirm if the updated assumption looks correct to you in the charts below:",
          showCharts: true,
          chartType: "metric"
        }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Sure! Does this correction looks good?",
            showCharts: true,
            chartType: "metric",
            showConfirmation: true
          }]);
        }, 800);
      } else if (chatStep === "flow2_pums_confirmed") {
        if (option === "Yes! This works") {
          setChatStep("flow2_saved");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "🎉 Scenario saved as interim version successfully!"
          }]);
        }
      }
    }, 400);
  };

  const handleFlow2TextInput = (input: string) => {
    setChatMessages(prev => [...prev, { role: "user", content: input }]);
    
    setTimeout(() => {
      if (chatStep === "flow2_initial") {
        if (input.toLowerCase().includes("cidp") || input.toLowerCase().includes("forecast")) {
          setChatStep("flow2_new_scenario_asked");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Do you want to create a new scenario?",
            options: ["Yes, create new", "No, work off version from last cycle"],
            showOptions: true
          }]);
        }
      } else if (chatStep === "flow2_loaded") {
        if (input.toLowerCase().includes("actuals") || input.toLowerCase().includes("plot")) {
          setChatStep("flow2_actuals_shown");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showCharts: true,
            chartType: "forecast"
          }]);
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "What do you want to do next?",
              options: ["Analyze variances", "Actualize forecast", "Insights"],
              showOptions: true
            }]);
            setChatStep("flow2_what_next");
          }, 800);
        }
      } else if (chatStep === "flow2_what_next" || chatStep === "flow2_variance_analyzed") {
        if (input.toLowerCase().includes("actualize") || input.toLowerCase().includes("model")) {
          setChatStep("flow2_actualizing");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: agentStepsActualize
          }]);
          runAgentSteps(agentStepsActualize, () => {
            setChatStep("flow2_actualized");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "The forecast is now actualized and an interim version has been saved, would you like to see the updated trends for any particular metric?",
              options: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"],
              showOptions: true
            }]);
          });
        } else if (input.toLowerCase().includes("variance") || input.toLowerCase().includes("analyze")) {
          const varianceAgentSteps = [
            "Analyzing variances between actuals and forecast...",
            "Calculating percentage changes...",
            "Identifying key discrepancies..."
          ];
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: varianceAgentSteps
          }]);
          runAgentSteps(varianceAgentSteps, () => {
            setChatStep("flow2_variance_analyzed");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "",
              showInsights: true,
              insights: [
                { text: "Your vials are significantly higher than patients, which highlights incomplete patient capture rate", type: "warning" },
                { text: "Your Q4 sales for 2025 are 12% higher than Q4-24 sales which can be due to launch of PFS", type: "up" }
              ]
            }]);
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "What should we do next?"
              }]);
            }, 500);
          });
        }
      } else if (chatStep === "flow2_actualized") {
        if (input.toLowerCase().includes("trend") || input.toLowerCase().includes("not showing") || input.toLowerCase().includes("cumulative")) {
          const trendAgentSteps = [
            "Checking the horizon for 2026...",
            "Comparing the trends for cumulative net patients and total adherent vials...",
            "Comparing the trend of intermediate metrics...",
            "Identifying impact of manual adjustments...",
            "Synthesizing outputs..."
          ];
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: trendAgentSteps
          }]);
          runAgentSteps(trendAgentSteps, () => {
            setChatStep("flow2_trend_analysis");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "On review, the trend discrepancies happening is due to a significantly higher vial count compared to patients actuals. This can be due to:",
              showInsights: true,
              insights: [
                { text: "Higher vial sales from channels we do not capture patients actuals from", type: "warning" },
                { text: "Patient actuals has lower capture rate", type: "warning" },
                { text: "Higher consumption than our assumptions for CIDP", type: "warning" }
              ]
            }]);
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "What should we do next?"
              }]);
            }, 500);
          });
        }
      } else if (chatStep === "flow2_trend_question") {
        if (input.toLowerCase().includes("trend") || input.toLowerCase().includes("not showing")) {
          const trendAgentSteps = [
            "Checking the horizon for 2026...",
            "Comparing the trends for cumulative net patients and total adherent vials...",
            "Comparing the trend of intermediate metrics...",
            "Identifying impact of manual adjustments...",
            "Synthesizing outputs..."
          ];
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "",
            showAgentSteps: true,
            agentSteps: trendAgentSteps
          }]);
          runAgentSteps(trendAgentSteps, () => {
            setChatStep("flow2_trend_analysis");
            setChatMessages(prev => [...prev, {
              role: "system",
              content: "On review, the trend discrepancies happening is due to a significantly higher vial count compared to patients actuals. This can be due to:",
              showInsights: true,
              insights: [
                { text: "Higher vial sales from channels we do not capture patients actuals from", type: "warning" },
                { text: "Patient actuals has lower capture rate", type: "warning" },
                { text: "Higher consumption than our assumptions for CIDP", type: "warning" }
              ]
            }]);
            setTimeout(() => {
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "What should we do next?"
              }]);
            }, 500);
          });
        }
      } else if (chatStep === "flow2_trend_analysis") {
        if (input.toLowerCase().includes("pums") || input.toLowerCase().includes("enrollment") || input.toLowerCase().includes("update")) {
          setChatStep("flow2_pums_update");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "That sounds great. Few clarifications needed.",
            showClarifications: true,
            clarifications: [
              "1. For PUMs, what should be the distribution between SC and SC PFS?",
              "2. For Enrollment, should we use the same enrollment for SC and SC PFS?"
            ]
          }]);
        }
        setChatStep("flow2_pums_clarify");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "That sounds great. Few clarifications needed.",
          showClarifications: true,
          clarifications: [
            "1. For PUMs, what should be the distribution between SC and SC PFS?",
            "2. For Enrollment, should we use the same enrollment for SC and SC PFS?"
          ]
        }]);
      } else if (chatStep === "flow2_pums_clarify") {
        setChatStep("flow2_pums_confirmed");
        setChatMessages(prev => [...prev, {
          role: "system",
          content: "Amazing! Please confirm if the updated assumption looks correct to you in the charts below:",
          showCharts: true,
          chartType: "metric"
        }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "Sure! Does this correction looks good?",
            showCharts: true,
            chartType: "metric",
            showConfirmation: true
          }]);
        }, 800);
      } else if (chatStep === "flow2_pums_confirmed") {
        if (input.toLowerCase().includes("yes") || input.toLowerCase().includes("works") || input.toLowerCase().includes("save")) {
          setChatStep("flow2_saved");
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "🎉 Scenario saved as interim version successfully!"
          }]);
        }
      }
    }, 400);
  };

  const handleClarificationResponse = (response: string) => {
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: response }
    ]);
    
    setTimeout(() => {
      setChatStep("confirmation");
      setChatMessages(prev => [...prev, {
        role: "system",
        content: "Amazing! Please confirm if the updated assumptions look correct to you in the charts below:",
        showCharts: true,
        chartType: "metric",
        showConfirmation: true
      }]);
    }, 400);
  };

  const toggleActivity = (id: string) => {
    setExpandedActivities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleActivityClick = (id: string) => {
    setSelectedActivity(id);
    setSelectedSubActivity(null);
    const activity = activities.find(a => a.id === id);
    if (activity) {
      setChatMessages(prev => [...prev, { 
        role: "system", 
        content: `Selected: ${activity.title}. What would you like to do?` 
      }]);
    }
  };

  const handleSubActivityClick = (subActivity: string) => {
    setSelectedSubActivity(subActivity);
    setChatMessages(prev => [...prev, { 
      role: "system", 
      content: `Selected: ${subActivity}. Configure your settings below.` 
    }]);
  };

  // Helper function to parse prevalence update prompts
  const parsePrevalenceUpdate = (input: string): { startYear: string; startValue: number; endYear: string; endValue: number } | null => {
    // Pattern: "increase prevalence from X in YYYY to Y in YYYY"
    // Supports formats like:
    // - "increase prevalence from 0.024 in 2020 to 0.030 in 2024"
    // - "prevalence from 0.024 in 2020 to 0.030 in 2024"
    // - "update prevalence 0.024 2020 to 0.030 2024"
    const patterns = [
      /prevalence\s+from\s+(\d+\.?\d*)\s+in\s+(\d{4})\s+to\s+(\d+\.?\d*)\s+in\s+(\d{4})/i,
      /prevalence\s+(\d+\.?\d*)\s+(?:in\s+)?(\d{4})\s+to\s+(\d+\.?\d*)\s+(?:in\s+)?(\d{4})/i,
      /(?:increase|update|change|set)\s+prevalence\s+from\s+(\d+\.?\d*)\s+in\s+(\d{4})\s+to\s+(\d+\.?\d*)\s+in\s+(\d{4})/i,
      /(?:increase|update|change|set)\s+prevalence\s+(\d+\.?\d*)\s+(?:in\s+)?(\d{4})\s+to\s+(\d+\.?\d*)\s+(?:in\s+)?(\d{4})/i,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          startValue: parseFloat(match[1]),
          startYear: match[2],
          endValue: parseFloat(match[3]),
          endYear: match[4]
        };
      }
    }
    return null;
  };

  // Generate interpolated prevalence curve data
  const generatePrevalenceCurve = (startYear: string, startValue: number, endYear: string, endValue: number) => {
    const years = prevalenceYears;
    const startIdx = years.indexOf(startYear);
    const endIdx = years.indexOf(endYear);
    
    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
      // Default to full range if years not found
      return null;
    }
    
    const curveData: { [key: string]: string } = { label: "Updated Prevalence Curve" };
    
    years.forEach((year, idx) => {
      let value: number;
      if (idx <= startIdx) {
        value = startValue;
      } else if (idx >= endIdx) {
        value = endValue;
      } else {
        // Linear interpolation between start and end
        const progress = (idx - startIdx) / (endIdx - startIdx);
        value = startValue + (endValue - startValue) * progress;
      }
      curveData[year] = `${value.toFixed(3)}%`;
    });
    
    return curveData;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const input = chatInput;
    setChatInput("");
    
    // Check for prevalence update prompts FIRST (before flow-specific handling)
    const prevalenceParams = parsePrevalenceUpdate(input);
    if (prevalenceParams) {
      setChatMessages(prev => [...prev, { role: "user", content: input }]);
      
      // Show agent thinking steps
      const prevalenceAgentSteps = [
        "Parsing prevalence parameters...",
        `Identified start: ${prevalenceParams.startValue}% in ${prevalenceParams.startYear}`,
        `Identified end: ${prevalenceParams.endValue}% in ${prevalenceParams.endYear}`,
        "Calculating interpolated curve values...",
        "Generating prevalence projection curve...",
        "Validating data consistency..."
      ];
      
      setChatMessages(prev => [...prev, {
        role: "system",
        content: "",
        showAgentSteps: true,
        agentSteps: prevalenceAgentSteps
      }]);
      
      runAgentSteps(prevalenceAgentSteps, () => {
        // Generate the new curve
        const newCurve = generatePrevalenceCurve(
          prevalenceParams.startYear,
          prevalenceParams.startValue,
          prevalenceParams.endYear,
          prevalenceParams.endValue
        );
        
        if (newCurve) {
          // Add the new curve to prevalence data
          setPrevalenceRowData(prev => {
            const hasCustom = prev.length > 1;
            if (hasCustom) {
              // Replace existing custom curve
              return [prev[0], newCurve as {label: string; [key: string]: string}];
            } else {
              // Add as new curve
              return [...prev, newCurve as {label: string; [key: string]: string}];
            }
          });
          setHasPrevalenceCustomCurve(true);
          setSelectedPrevalenceCurveIndex(null);
          setPrevalenceCurveConfirmed(false);
          setPrevalenceFinalConfirmed(false);
          setPrevalenceProcessingComplete(false);
          
          setChatMessages(prev => [...prev, {
            role: "system",
            content: `I've generated a prevalence curve based on your parameters (${prevalenceParams.startValue}% in ${prevalenceParams.startYear} → ${prevalenceParams.endValue}% in ${prevalenceParams.endYear}). Please review and select your preferred curve:`,
            showCharts: true,
            chartType: "prevalence"
          }]);
        } else {
          setChatMessages(prev => [...prev, {
            role: "system",
            content: "I couldn't generate the curve. Please ensure the years are within the range 2020-2030 and the start year is before the end year."
          }]);
        }
      });
      return;
    }
    
    // Flow 2 text-based navigation
    if (demoFlow === "flow2" && (
      chatStep === "flow2_initial" || 
      chatStep === "flow2_loaded" || 
      chatStep === "flow2_what_next" ||
      chatStep === "flow2_variance_analyzed" ||
      chatStep === "flow2_actualized" ||
      chatStep === "flow2_trend_question" ||
      chatStep === "flow2_trend_analysis" ||
      chatStep === "flow2_pums_update" || 
      chatStep === "flow2_pums_clarify" || 
      chatStep === "flow2_pums_confirmed"
    )) {
      handleFlow2TextInput(input);
      return;
    }
    if (chatStep === "clarifications") {
      handleClarificationResponse(input);
    } else {
      setChatMessages(prev => [...prev, { role: "user", content: input }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: "system", 
          content: "Command received. Processing your request..." 
        }]);
      }, 500);
    }
  };

  const openBaselineDialog = (cohortId: number, shareType: "class" | "brand") => {
    setCurrentCohort(cohortId);
    setCurrentShareType(shareType);
    const cohort = cohortsData.find(c => c.id === cohortId);
    setBaselineValue(shareType === "class" ? cohort?.classShare.baseline || "" : cohort?.brandShare.baseline || "");
    setBaselineDialogOpen(true);
  };

  const openEventsDialog = (cohortId: number, shareType: "class" | "brand") => {
    setCurrentCohort(cohortId);
    setCurrentShareType(shareType);
    const cohort = cohortsData.find(c => c.id === cohortId);
    const events = shareType === "class" ? cohort?.classShare.events : cohort?.brandShare.events;
    setEventValues(events?.length ? [...events] : [""]);
    setEventsDialogOpen(true);
  };

  const handleSaveBaseline = () => {
    setCohortsData(prev => prev.map(c => {
      if (c.id === currentCohort) {
        if (currentShareType === "class") {
          return { ...c, classShare: { ...c.classShare, baseline: baselineValue } };
        } else {
          return { ...c, brandShare: { ...c.brandShare, baseline: baselineValue } };
        }
      }
      return c;
    }));
    setBaselineDialogOpen(false);
  };

  const handleSaveEvents = () => {
    setCohortsData(prev => prev.map(c => {
      if (c.id === currentCohort) {
        if (currentShareType === "class") {
          return { ...c, classShare: { ...c.classShare, events: eventValues.filter(e => e) } };
        } else {
          return { ...c, brandShare: { ...c.brandShare, events: eventValues.filter(e => e) } };
        }
      }
      return c;
    }));
    setEventsDialogOpen(false);
  };

  const toggleCohort = (cohortId: number) => {
    setCohortsData(prev => prev.map(c => 
      c.id === cohortId ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const hasMarketShareData = useMemo(() => {
    return cohortsData.some(c => c.classShare.baseline || c.brandShare.baseline);
  }, [cohortsData]);

  const chartData = useMemo(() => {
    return cohortsData.map(cohort => ({
      name: `Cohort ${cohort.id}`,
      classShare: cohort.classShare.baseline ? parseFloat(cohort.classShare.baseline) : 0,
      brandShare: cohort.brandShare.baseline ? parseFloat(cohort.brandShare.baseline) : 0,
    }));
  }, [cohortsData]);

  const handleEditCell = (
    chartType: "pums" | "vials" | "revenue",
    monthIndex: number,
    field: "sc" | "scPfs",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    if (chartType === "pums") {
      setEditablePumsData(prev => prev.map((item, idx) => 
        idx === monthIndex ? { ...item, [field]: numValue } : item
      ));
    } else if (chartType === "vials") {
      setEditableVialsData(prev => prev.map((item, idx) => 
        idx === monthIndex ? { ...item, [field]: numValue } : item
      ));
    } else {
      setEditableRevenueData(prev => prev.map((item, idx) => 
        idx === monthIndex ? { ...item, [field]: numValue } : item
      ));
    }
  };

  const renderEditableTable = (
    chartType: "pums" | "vials" | "revenue",
    data: { month: string; sc: number; scPfs: number }[]
  ) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border border-border px-2 py-1 text-left font-medium text-foreground sticky left-0 bg-muted/50">Metric</th>
            {data.map((d, idx) => (
              <th key={idx} className="border border-border px-2 py-1 text-center font-medium text-foreground min-w-[60px]">
                {d.month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-border px-2 py-1 font-medium text-foreground sticky left-0 bg-card">SC</td>
            {data.map((d, idx) => (
              <td key={idx} className="border border-border p-0">
                <input
                  type="number"
                  value={d.sc}
                  onChange={(e) => handleEditCell(chartType, idx, "sc", e.target.value)}
                  className="w-full px-2 py-1 text-center bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-border px-2 py-1 font-medium text-foreground sticky left-0 bg-card">SC PFS</td>
            {data.map((d, idx) => (
              <td key={idx} className="border border-border p-0">
                <input
                  type="number"
                  value={d.scPfs}
                  onChange={(e) => handleEditCell(chartType, idx, "scPfs", e.target.value)}
                  className="w-full px-2 py-1 text-center bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderForecastCharts = () => (
    <div className="mr-12 space-y-4">
      {/* PUMs Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground flex-1 text-center">PUMs: Latest Actuals vs Last Submitted Forecast</p>
          <button
            onClick={() => setEditingChart(editingChart === "pums" ? null : "pums")}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Edit className="w-3 h-3" />
            {editingChart === "pums" ? "Close" : "Edit"}
          </button>
        </div>
        {editingChart === "pums" ? (
          renderEditableTable("pums", editablePumsData)
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pumsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" domain={[0, 600]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }} 
                  />
                  <Bar dataKey="actualsSC" stackId="a" fill="#1e5a8a" name="Actuals - SC" />
                  <Bar dataKey="actualsSCPFS" stackId="a" fill="#d97233" name="Actuals - SC PFS" />
                  <Line type="monotone" dataKey="finPlan26" stroke="#2d7a6f" strokeWidth={2} dot={{ r: 3, fill: "#2d7a6f" }} name="FinPlan26" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#1e5a8a" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#d97233" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC PFS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5" style={{ backgroundColor: "#2d7a6f" }}></div>
                <span className="text-xs text-muted-foreground">FinPlan26</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vials Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground flex-1 text-center">Vials: Latest Actuals vs Last Submitted Forecast</p>
          <button
            onClick={() => setEditingChart(editingChart === "vials" ? null : "vials")}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Edit className="w-3 h-3" />
            {editingChart === "vials" ? "Close" : "Edit"}
          </button>
        </div>
        {editingChart === "vials" ? (
          renderEditableTable("vials", editableVialsData)
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={vialsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }} 
                  />
                  <Bar dataKey="actualsSC" stackId="a" fill="#1e5a8a" name="Actuals - SC" />
                  <Bar dataKey="actualsSCPFS" stackId="a" fill="#d97233" name="Actuals - SC PFS" />
                  <Line type="monotone" dataKey="finPlan26" stroke="#2d7a6f" strokeWidth={2} dot={{ r: 3, fill: "#2d7a6f" }} name="FinPlan26" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#1e5a8a" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#d97233" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC PFS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5" style={{ backgroundColor: "#2d7a6f" }}></div>
                <span className="text-xs text-muted-foreground">FinPlan26</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Net Revenue Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground flex-1 text-center">Net Revenue: Latest Actuals vs Last Submitted Forecast</p>
          <button
            onClick={() => setEditingChart(editingChart === "revenue" ? null : "revenue")}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Edit className="w-3 h-3" />
            {editingChart === "revenue" ? "Close" : "Edit"}
          </button>
        </div>
        {editingChart === "revenue" ? (
          renderEditableTable("revenue", editableRevenueData)
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "11px"
                    }} 
                  />
                  <Bar dataKey="actualsSC" stackId="a" fill="#1e5a8a" name="Actuals - SC" />
                  <Bar dataKey="actualsSCPFS" stackId="a" fill="#d97233" name="Actuals - SC PFS" />
                  <Line type="monotone" dataKey="finPlan26" stroke="#2d7a6f" strokeWidth={2} dot={{ r: 3, fill: "#2d7a6f" }} name="FinPlan26" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#1e5a8a" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3" style={{ backgroundColor: "#d97233" }}></div>
                <span className="text-xs text-muted-foreground">Actuals - SC PFS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5" style={{ backgroundColor: "#2d7a6f" }}></div>
                <span className="text-xs text-muted-foreground">FinPlan26</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderMetricChart = () => (
    <div className="bg-card border border-border rounded-lg p-4 mr-12">
      <p className="text-sm font-medium text-foreground mb-3">{selectedMetric || "Monthly Metric"} - Jan 2026 to Dec 2026</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricChartData2026}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px"
              }} 
            />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Line type="monotone" dataKey="value" name="Actual - Post Update" stroke="hsl(174, 62%, 47%)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="forecast" name="Forecast - Prior Update" stroke="hsl(210, 80%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Generic curve chart renderer
  const renderCurveChart = (
    title: string,
    rowData: {label: string; [key: string]: string}[],
    setRowData: React.Dispatch<React.SetStateAction<{label: string; [key: string]: string}[]>>,
    hasCustomCurve: boolean,
    selectedCurveIndex: number | null,
    setSelectedCurveIndex: React.Dispatch<React.SetStateAction<number | null>>,
    curveConfirmed: boolean,
    setCurveConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    gridRef: React.RefObject<AgGridReact | null>,
    gridApiRef: React.MutableRefObject<GridApi | null>,
    onCellValueChanged: (event: CellValueChangedEvent) => void,
    onGridReady: (params: { api: GridApi }) => void,
    formatAsPercentage: boolean = true
  ) => {
    const chartData = prevalenceYears.map(year => {
      const dataPoint: { year: string; [key: string]: number | string } = { year };
      rowData.forEach((row, index) => {
        const key = index === 0 ? 'value' : `curve${index}`;
        dataPoint[key] = parseFloat(row[year]?.replace('%', '') || '0') / 100;
      });
      return dataPoint;
    });

    return (
      <div className="bg-card border border-border rounded-lg p-4 mr-12 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowModal(true)}
            sx={{
              borderColor: 'hsl(174, 62%, 47%)',
              color: 'hsl(174, 62%, 47%)',
              fontSize: '11px',
              py: 0.5,
              '&:hover': {
                borderColor: 'hsl(174, 62%, 40%)',
                backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
              },
            }}
          >
            {hasCustomCurve ? 'Update Curve' : 'Create Curve'}
          </Button>
        </div>
        
        {/* Curve Selection with Checkboxes */}
        {hasCustomCurve && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Select a curve:</span>
              {!curveConfirmed && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={selectedCurveIndex === null}
                  onClick={() => {
                    setCurveConfirmed(true);
                    console.log("Confirmed curve:", rowData[selectedCurveIndex!]?.label);
                  }}
                  sx={{
                    backgroundColor: 'hsl(174, 62%, 47%)',
                    fontSize: '11px',
                    py: 0.5,
                    '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    '&:disabled': { backgroundColor: 'hsl(var(--muted))' },
                  }}
                >
                  Save Selection
                </Button>
              )}
            </div>
            
            {/* Curve rows with checkboxes */}
            <div className="space-y-1">
              {rowData.map((row, index) => (
                <div 
                  key={row.label}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedCurveIndex === index 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                  } ${curveConfirmed && selectedCurveIndex !== index ? 'opacity-40' : ''}`}
                  onClick={() => !curveConfirmed && setSelectedCurveIndex(index)}
                >
                  <input
                    type="checkbox"
                    checked={selectedCurveIndex === index}
                    onChange={() => !curveConfirmed && setSelectedCurveIndex(index)}
                    disabled={curveConfirmed}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <div 
                    className="w-4 h-0.5 rounded"
                    style={{ 
                      backgroundColor: index === 0 ? "hsl(174, 62%, 47%)" : "hsl(280, 65%, 55%)",
                      borderStyle: index > 0 ? 'dashed' : 'solid'
                    }}
                  />
                  <span className={`text-xs ${selectedCurveIndex === index ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {row.label}
                  </span>
                  {curveConfirmed && selectedCurveIndex === index && (
                    <div className="ml-auto flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {curveConfirmed && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Saved: "{rowData[selectedCurveIndex!]?.label}" has been selected as the active curve
                </span>
                <button 
                  onClick={() => setCurveConfirmed(false)}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                tick={{ fontSize: 9 }} 
                stroke="hsl(var(--muted-foreground))" 
                tickFormatter={(value) => formatAsPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(3)}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "11px"
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, title]}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              {rowData.map((row, index) => (
                <Line 
                  key={row.label}
                  type="monotone" 
                  dataKey={index === 0 ? 'value' : `curve${index}`} 
                  name={row.label} 
                  stroke={index === 0 ? "hsl(174, 62%, 47%)" : "hsl(280, 65%, 55%)"} 
                  strokeWidth={selectedCurveIndex === index ? 3 : 2} 
                  dot={{ r: selectedCurveIndex === index ? 4 : 3 }} 
                  strokeDasharray={index > 0 ? "5 5" : undefined}
                  opacity={curveConfirmed && selectedCurveIndex !== index ? 0.3 : 1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* AG Grid Excel-like Table */}
        <div 
          className="ag-theme-alpine" 
          style={{ 
            width: '100%', 
            height: 56 + (rowData.length * 28)
          }}
          tabIndex={0}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={prevalenceColumnDefs}
            defaultColDef={prevalenceDefaultColDef}
            onCellValueChanged={onCellValueChanged}
            onGridReady={onGridReady}
            suppressMovableColumns={true}
          />
        </div>
      </div>
    );
  };

  // Handler for prevalence final confirmation
  const handlePrevalenceFinalConfirm = () => {
    setPrevalenceFinalConfirmed(true);
    
    // Show agent processing steps
    const processingSteps = [
      "Updating actuals for PUMs...",
      "Now updating actuals for New Patients...",
      "Calculating the continuing patient pool...",
      "Now actualizing the discontinuations and switches...",
      "Now calculating the vials...",
      "Actualizing the total adherent vials...",
      "Now estimating revenue...",
      "Actualizing net revenue for 2025...",
      "Synthesizing the outputs...",
      "Storing an interim version of the forecast..."
    ];
    
    setChatMessages(prev => [...prev, {
      role: "system",
      content: "",
      showAgentSteps: true,
      agentSteps: processingSteps
    }]);
    
    runAgentSteps(processingSteps, () => {
      setPrevalenceProcessingComplete(true);
      setChatMessages(prev => [...prev, {
        role: "system",
        content: "The forecast is now actualized and an interim version has been saved, would you like to see the updated trends for any particular metric?",
        showActualizeComplete: true,
        actualizeMetricOptions: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"]
      }]);
    });
  };

  // Individual render functions using the generic renderer
  const renderPrevalenceChart = () => (
    <div className="space-y-3">
      {renderCurveChart(
        "Total CIDP Prevalence (%)",
        prevalenceRowData,
        setPrevalenceRowData,
        hasPrevalenceCustomCurve,
        selectedPrevalenceCurveIndex,
        setSelectedPrevalenceCurveIndex,
        prevalenceCurveConfirmed,
        setPrevalenceCurveConfirmed,
        setShowPrevalenceCurveModal,
        prevalenceGridRef,
        prevalenceGridApiRef,
        onPrevalenceCellValueChanged,
        onPrevalenceGridReady,
        false
      )}
      
      {/* Yes Confirm Button - shows after curve is saved */}
      {prevalenceCurveConfirmed && !prevalenceFinalConfirmed && (
        <div className="flex justify-end mr-12">
          <Button
            variant="contained"
            size="small"
            onClick={handlePrevalenceFinalConfirm}
            startIcon={<Check className="w-4 h-4" />}
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              fontSize: '12px',
              py: 1,
              px: 3,
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
            }}
          >
            Yes, confirm this update
          </Button>
        </div>
      )}
    </div>
  );

  const renderDiagnosisChart = () => renderCurveChart(
    "Diagnosis Rate (%)",
    diagnosisRowData,
    setDiagnosisRowData,
    hasDiagnosisCustomCurve,
    selectedDiagnosisCurveIndex,
    setSelectedDiagnosisCurveIndex,
    diagnosisCurveConfirmed,
    setDiagnosisCurveConfirmed,
    setShowDiagnosisCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderTreatmentChart = () => renderCurveChart(
    "Treatment Rate (%)",
    treatmentRowData,
    setTreatmentRowData,
    hasTreatmentCustomCurve,
    selectedTreatmentCurveIndex,
    setSelectedTreatmentCurveIndex,
    treatmentCurveConfirmed,
    setTreatmentCurveConfirmed,
    setShowTreatmentCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderMoaMixChart = () => renderCurveChart(
    "MOA Mix - SC (%)",
    moaMixRowData,
    setMoaMixRowData,
    hasMoaMixCustomCurve,
    selectedMoaMixCurveIndex,
    setSelectedMoaMixCurveIndex,
    moaMixCurveConfirmed,
    setMoaMixCurveConfirmed,
    setShowMoaMixCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderChannelMixChart = () => renderCurveChart(
    "Channel Mix - Specialty (%)",
    channelMixRowData,
    setChannelMixRowData,
    hasChannelMixCustomCurve,
    selectedChannelMixCurveIndex,
    setSelectedChannelMixCurveIndex,
    channelMixCurveConfirmed,
    setChannelMixCurveConfirmed,
    setShowChannelMixCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderAdherenceChart = () => renderCurveChart(
    "Adherence Rate (%)",
    adherenceRowData,
    setAdherenceRowData,
    hasAdherenceCustomCurve,
    selectedAdherenceCurveIndex,
    setSelectedAdherenceCurveIndex,
    adherenceCurveConfirmed,
    setAdherenceCurveConfirmed,
    setShowAdherenceCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderGtnChart = () => renderCurveChart(
    "GTN Rate (%)",
    gtnRowData,
    setGtnRowData,
    hasGtnCustomCurve,
    selectedGtnCurveIndex,
    setSelectedGtnCurveIndex,
    gtnCurveConfirmed,
    setGtnCurveConfirmed,
    setShowGtnCurveModal,
    prevalenceGridRef,
    prevalenceGridApiRef,
    onPrevalenceCellValueChanged,
    onPrevalenceGridReady,
    true
  );

  const renderAgentSteps = (steps: string[]) => (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mr-12 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
        <span className="text-sm font-medium text-foreground">EDGE Agent Processing</span>
      </div>
      {steps.map((step, idx) => (
        <div 
          key={idx} 
          className={`flex items-center gap-2 text-xs transition-all duration-300 ${
            idx < currentAgentStep 
              ? "text-foreground" 
              : idx === currentAgentStep 
                ? "text-primary font-medium" 
                : "text-muted-foreground opacity-50"
          }`}
        >
          {idx < currentAgentStep ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : idx === currentAgentStep ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <div className="w-3 h-3" />
          )}
          <span>{step}</span>
        </div>
      ))}
    </div>
  );

  const renderInsights = (insights: { text: string; type: "up" | "down" | "warning" }[]) => (
    <div className="space-y-2 mr-12">
      {insights.map((insight, idx) => (
        <div 
          key={idx} 
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            insight.type === "up" 
              ? "bg-green-500/10 border-green-500/20" 
              : insight.type === "down" 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-yellow-500/10 border-yellow-500/20"
          }`}
        >
          {insight.type === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          ) : insight.type === "down" ? (
            <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-xs text-foreground">{insight.text}</p>
        </div>
      ))}
    </div>
  );

  const renderClarifications = (clarifications: string[]) => (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mr-12 space-y-3">
      {clarifications.map((clarification, idx) => (
        <p key={idx} className="text-sm text-foreground">{clarification}</p>
      ))}
      <div className="pt-2">
        <input
          type="text"
          placeholder="Type your response..."
          className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
              handleClarificationResponse((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>
    </div>
  );

  const [isEditingConfirmation, setIsEditingConfirmation] = useState(false);
  const [confirmationEditData, setConfirmationEditData] = useState(
    metricChartData2026.map(d => ({ month: d.month, sc: Math.round(d.value * 0.7), scPfs: Math.round(d.value * 0.3) }))
  );

  const handleConfirmationEditCell = (monthIndex: number, field: "sc" | "scPfs", value: string) => {
    const numValue = parseFloat(value) || 0;
    setConfirmationEditData(prev => prev.map((item, idx) => 
      idx === monthIndex ? { ...item, [field]: numValue } : item
    ));
  };

  const renderConfirmation = () => (
    <div className="mr-12 space-y-3">
      {isEditingConfirmation && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">Edit SC and SC PFS values</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border px-2 py-1 text-left font-medium text-foreground sticky left-0 bg-muted/50">Metric</th>
                  {confirmationEditData.map((d, idx) => (
                    <th key={idx} className="border border-border px-2 py-1 text-center font-medium text-foreground min-w-[60px]">
                      {d.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-2 py-1 font-medium text-foreground sticky left-0 bg-card">SC</td>
                  {confirmationEditData.map((d, idx) => (
                    <td key={idx} className="border border-border p-0">
                      <input
                        type="number"
                        value={d.sc}
                        onChange={(e) => handleConfirmationEditCell(idx, "sc", e.target.value)}
                        className="w-full px-2 py-1 text-center bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border px-2 py-1 font-medium text-foreground sticky left-0 bg-card">SC PFS</td>
                  {confirmationEditData.map((d, idx) => (
                    <td key={idx} className="border border-border p-0">
                      <input
                        type="number"
                        value={d.scPfs}
                        onChange={(e) => handleConfirmationEditCell(idx, "scPfs", e.target.value)}
                        className="w-full px-2 py-1 text-center bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button 
          className="flex items-center gap-1 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
          onClick={() => {
            setIsEditingConfirmation(false);
            setIsRecalculating(true);
            setTimeout(() => {
              setIsRecalculating(false);
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "Great! The assumptions have been confirmed and saved. Your forecast has been updated."
              }]);
            }, 2000);
          }}
        >
          <Check className="w-4 h-4" />
          Yes, Confirm
        </button>
      </div>
    </div>
  );

  const renderMarketShareContent = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Market Share</h3>
      {cohortsData.map((cohort) => (
        <div key={cohort.id} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCohort(cohort.id)}
            className="w-full p-3 flex items-center justify-between text-primary-foreground"
            style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
          >
            <span className="font-semibold">Cohort {cohort.id}</span>
            {cohort.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          {cohort.expanded && (
            <div className="p-4 space-y-4 bg-card">
              <div className="border border-border rounded-lg p-4">
                <p className="font-medium text-foreground mb-3">Class share</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openBaselineDialog(cohort.id, "class")}
                    className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
                  >
                    Enter baseline share
                  </button>
                  <button
                    onClick={() => openEventsDialog(cohort.id, "class")}
                    className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
                  >
                    Enter Events
                  </button>
                </div>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="font-medium text-foreground mb-3">Brand share for class FcRN</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openBaselineDialog(cohort.id, "brand")}
                    className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
                  >
                    Enter baseline share
                  </button>
                  <button
                    onClick={() => openEventsDialog(cohort.id, "brand")}
                    className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
                  >
                    Enter Events
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="flex h-full max-h-full bg-background overflow-hidden min-h-0">
        {/* VS Code-style Icon Bar */}
        <div className="w-12 bg-muted/50 border-r border-border flex flex-col items-center py-2 gap-1">
          <MuiTooltip title="Activities - Review and manage forecast activities" placement="right" arrow>
            <button
              onClick={() => setActiveLeftPanel(activeLeftPanel === "activities" ? null : "activities")}
              className={`p-2.5 rounded transition-colors ${
                activeLeftPanel === "activities" 
                  ? "bg-primary/20 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ListChecks className="w-5 h-5" />
            </button>
          </MuiTooltip>
          <MuiTooltip title="Workflow - View pipeline and data flow" placement="right" arrow>
            <button
              onClick={() => setActiveLeftPanel(activeLeftPanel === "workflow" ? null : "workflow")}
              className={`p-2.5 rounded transition-colors ${
                activeLeftPanel === "workflow" 
                  ? "bg-primary/20 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <GitBranch className="w-5 h-5" />
            </button>
          </MuiTooltip>
          <div className="w-6 h-px bg-border my-1" />
          <MuiTooltip title="Configuration - System and model settings" placement="right" arrow>
            <button
              onClick={() => setActiveLeftPanel(activeLeftPanel === "configuration" ? null : "configuration")}
              className={`p-2.5 rounded transition-colors ${
                activeLeftPanel === "configuration" 
                  ? "bg-primary/20 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </MuiTooltip>
        </div>

        {/* Left Panel - Activities or Workflow (conditionally rendered) */}
        {activeLeftPanel && (
          <div className="w-72 border-r border-border bg-card flex flex-col transition-all duration-300 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
            {activeLeftPanel === "activities" && (
              <>
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Activities</h3>
                  <button
                    onClick={() => setActiveLeftPanel(null)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-1">
                  {/* Actuals Section */}
                  <div className="mb-3 pb-3 border-b border-border">
                    <button
                      onClick={() => toggleActivity("actuals")}
                      className="w-full flex items-center gap-2 p-2 rounded text-left text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {expandedActivities.includes("actuals") 
                        ? <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      }
                      <Database className="w-4 h-4 flex-shrink-0" />
                      <span>Actuals</span>
                    </button>
                    {expandedActivities.includes("actuals") && (
                      <div className="ml-8 mt-1 space-y-1">
                        <button
                          onClick={() => setShowTableauModal(true)}
                          className="w-full text-left text-xs p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
                        >
                          Fetch latest actuals
                        </button>
                        <button
                          onClick={() => {
                            // Add agent processing message
                            setChatMessages(prev => [...prev, {
                              role: "system",
                              content: "",
                              showAgentSteps: true,
                              agentSteps: agentStepsActualize
                            }]);
                            // Run the agent steps animation
                            runAgentSteps(agentStepsActualize, () => {
                              // After completion, add the completion message with options
                              setChatMessages(prev => [...prev, {
                                role: "system",
                                content: "The forecast is now actualized and an interim version has been saved, would you like to see the updated trends for any particular metric?",
                                showActualizeComplete: true,
                                actualizeMetricOptions: ["Monthly PUMs", "Monthly Vials", "Monthly Net Revenue"]
                              }]);
                            });
                          }}
                          className="w-full text-left text-xs p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
                        >
                          Actualize Forecast
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {activities.map((activity) => (
                    <div key={activity.id}>
                      <button
                        onClick={() => {
                          toggleActivity(activity.id);
                          handleActivityClick(activity.id);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm text-foreground hover:bg-muted transition-colors ${
                          selectedActivity === activity.id ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        {activity.subActivities && (
                          expandedActivities.includes(activity.id) 
                            ? <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            : <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        <activity.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{activity.title}</span>
                      </button>
                      {activity.subActivities && expandedActivities.includes(activity.id) && (
                        <div className="ml-8 mt-1 space-y-1">
                          {activity.subActivities.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSubActivityClick(sub)}
                              className={`w-full text-left text-xs p-2 rounded hover:bg-muted transition-colors ${
                                selectedSubActivity === sub ? "bg-primary/10 text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}


            {activeLeftPanel === "workflow" && (
              <>
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Workflow</h3>
                  <button
                    onClick={() => setActiveLeftPanel(null)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative">
                    {workflowSections.map((section, idx) => (
                      <div key={section.id} className="relative">
                        <div className="flex items-start">
                          {/* Connector line to next main node */}
                          {idx < workflowSections.length - 1 && (
                            <div 
                              className={`absolute left-4 top-8 w-0.5 bg-border`}
                              style={{ height: `${section.subItems.length * 24 + 40}px` }}
                            />
                          )}
                          {/* Node */}
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              section.status === 'complete'
                                ? 'bg-primary'
                                : section.status === 'in-progress'
                                  ? 'bg-primary/20 border-2 border-primary'
                                  : 'bg-muted border-2 border-border'
                            }`}
                          >
                            {section.status === 'complete' ? (
                              <Check className="w-4 h-4 text-primary-foreground" />
                            ) : section.status === 'in-progress' ? (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            ) : (
                              <span className="text-xs text-muted-foreground">{idx + 1}</span>
                            )}
                          </div>
                          {/* Content */}
                          <div className="ml-3 pb-4 flex-1">
                            <h4 className="text-sm font-medium text-foreground leading-tight">
                              {section.title}
                            </h4>
                            {/* Sub-items */}
                            <div className="mt-2 space-y-0.5">
                              {section.subItems.map((subItem, subIdx) => (
                                <button
                                  key={subIdx}
                                  onClick={() => handleWorkflowSubItemClick(subItem)}
                                  className={`w-full flex items-center gap-2 py-1 px-2 rounded text-left transition-colors ${
                                    selectedWorkflowSubItem === subItem
                                      ? 'bg-primary/10 text-primary'
                                      : 'hover:bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${selectedWorkflowSubItem === subItem ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                                  <span className="text-xs">{subItem}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeLeftPanel === "configuration" && (
              <>
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">Configuration</h3>
                  <button
                    onClick={() => setActiveLeftPanel(null)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">Configuration options coming soon...</p>
                </div>
              </>
            )}
            </div>
            
            {/* Save and Submit Buttons */}
            <div className="p-3 border-t border-border bg-card space-y-2 shrink-0">
              <button
                onClick={() => {
                  setChatMessages(prev => [...prev, {
                    role: "system",
                    content: "Your forecast has been saved successfully!"
                  }]);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsRecalculating(true);
                  setTimeout(() => {
                    setIsRecalculating(false);
                    setChatMessages(prev => [...prev, {
                      role: "system",
                      content: "Your forecast has been submitted successfully!"
                    }]);
                  }, 2000);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "hsl(174, 62%, 47%)" }}
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Center Panel - Chat */}
        <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
          <div className="p-3 border-b border-border bg-card flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-sm text-foreground">EDGE Chat</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <div className="max-w-2xl mx-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-primary/10 text-foreground ml-12"
                        : "bg-muted text-foreground mr-12"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {msg.showCharts && msg.chartType === "forecast" && renderForecastCharts()}
                  {msg.showCharts && msg.chartType === "metric" && renderMetricChart()}
                  {msg.showCharts && msg.chartType === "prevalence" && renderPrevalenceChart()}
                  {msg.showCharts && msg.chartType === "diagnosis" && renderDiagnosisChart()}
                  {msg.showCharts && msg.chartType === "treatment" && renderTreatmentChart()}
                  {msg.showCharts && msg.chartType === "moaMix" && renderMoaMixChart()}
                  {msg.showCharts && msg.chartType === "channelMix" && renderChannelMixChart()}
                  {msg.showCharts && msg.chartType === "adherence" && renderAdherenceChart()}
                  {msg.showCharts && msg.chartType === "gtn" && renderGtnChart()}
                  {msg.showAgentSteps && msg.agentSteps && renderAgentSteps(msg.agentSteps)}
                  {msg.showInsights && msg.insights && renderInsights(msg.insights)}
                  {msg.showClarifications && msg.clarifications && renderClarifications(msg.clarifications)}
                  {msg.showConfirmation && renderConfirmation()}
                  
                  {msg.showActualizeComplete && msg.actualizeMetricOptions && (
                    <div className="flex flex-wrap gap-2 mr-12 mt-3">
                      {msg.actualizeMetricOptions.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => {
                            setSelectedMetric(option);
                            setChatMessages(prev => [...prev, 
                              { role: "user", content: option },
                              { 
                                role: "system", 
                                content: `Here's the ${option} trend analysis:`,
                                showCharts: true,
                                chartType: "metric"
                              }
                            ]);
                          }}
                          className="px-4 py-2 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {msg.showOptions && msg.options && (
                    <div className="flex flex-wrap gap-2 mr-12">
                      {msg.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(option)}
                          className="px-4 py-2 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                ))}
                
                {/* Expanded Insights from Population Growth Acceleration */}
                {expandedRecommendation === "population-growth" && (
                  <div className="space-y-2 mr-12">
                    {/* Warning Insight Card */}
                    <div className="rounded-lg p-3 bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-900">
                          Your vials are significantly higher than patients, which highlights incomplete patient capture rate
                        </p>
                      </div>
                    </div>
                    
                    {/* Success Insight Card */}
                    <div className="rounded-lg p-3 bg-emerald-50 border border-emerald-200">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-emerald-900">
                          Your Q4 sales for 2025 are 12% higher than Q4-24 sales which can be due to launch of PFS
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedSubActivity === "Market assumptions" && renderMarketShareContent()}
                <div ref={chatEndRef} />
            </div>
          </div>
          <div className="p-4 border-t border-border bg-card shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a command or ask a question..."
                className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-muted-foreground text-xs mt-2">
              Chat window to share commands and adjust the forecasting assumptions
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`flex flex-col border-l border-border transition-all duration-300 min-h-0 ${isRightPanelCollapsed ? 'w-10' : 'w-96'}`}>
          {/* Collapse Toggle */}
          <div className="bg-card p-2 flex items-center justify-between border-b border-border">
            {!isRightPanelCollapsed && (
              <span className="text-xs font-medium text-muted-foreground ml-1">Panel</span>
            )}
            <button
              onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              className="p-1 hover:bg-muted rounded transition-colors ml-auto"
              title={isRightPanelCollapsed ? "Expand panel" : "Close panel"}
            >
              {isRightPanelCollapsed ? (
                <PanelRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {!isRightPanelCollapsed && (
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Scenario Comparison Section */}
              <div className="border-b border-border">
                <div
                  className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium"
                  style={{ backgroundColor: "hsl(174, 50%, 92%)", color: "hsl(0, 0%, 15%)" }}
                >
                  <button
                    onClick={() => toggleMetricSection("scenario-comparison")}
                    className="flex items-center gap-2 flex-1"
                  >
                    {expandedMetricSections.includes("scenario-comparison") ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>Scenario Comparison</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedYear}
                      onChange={(e) => { e.stopPropagation(); setSelectedYear(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/80 border border-border rounded px-1.5 py-0.5 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year} className="bg-card text-foreground">
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSectionView("scenario-comparison", "chart"); }}
                        className={`p-1 rounded transition-colors ${sectionViews["scenario-comparison"] === "chart" ? "bg-primary text-primary-foreground" : "hover:bg-black/10"}`}
                        title="Chart View"
                      >
                        <LineChartIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSectionView("scenario-comparison", "table"); }}
                        className={`p-1 rounded transition-colors ${sectionViews["scenario-comparison"] === "table" ? "bg-primary text-primary-foreground" : "hover:bg-black/10"}`}
                        title="Table View"
                      >
                        <Table className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedMetricSections.includes("scenario-comparison") && (
                  <div className="bg-card">
                    {sectionViews["scenario-comparison"] === "table" ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left px-2 py-1.5 font-medium text-foreground border-b border-r border-border min-w-[160px]">Metric</th>
                              <th className="text-center px-2 py-1.5 font-medium text-foreground border-b border-r border-border">Current Scenario</th>
                              <th className="text-center px-2 py-1.5 font-medium text-foreground border-b border-border">
                                <select
                                  value={selectedBaseScenario}
                                  onChange={(e) => setSelectedBaseScenario(e.target.value)}
                                  className="bg-card border border-border rounded px-1 py-0.5 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  {baseScenarioOptions.map((option) => (
                                    <option key={option} value={option} className="bg-card text-foreground">
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {metricsData.map((row, idx) => (
                              <tr key={idx} className="border-b border-border hover:bg-muted/30">
                                <td className={`px-2 py-1 border-r border-border ${row.indent ? 'pl-4' : ''} ${row.isBold ? 'font-semibold text-foreground' : ''} ${row.isItalic ? 'italic text-muted-foreground' : 'text-foreground'}`}>
                                  {row.metric}
                                </td>
                                <td className="text-center px-2 py-1 border-r border-border text-foreground">
                                  {row.currentScenario}
                                </td>
                                <td className="text-center px-2 py-1 text-foreground">
                                  {row.baseLE3}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3">
                        <div className="mb-2">
                          <select
                            value={selectedChartMetric}
                            onChange={(e) => setSelectedChartMetric(e.target.value)}
                            className="bg-card border border-border rounded px-2 py-1 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary w-full"
                          >
                            {chartMetricOptions.map((option) => (
                              <option key={option} value={option} className="bg-card text-foreground">
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                              data={scenarioChartData}
                              margin={{ top: 10, right: 10, left: -5, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis 
                                tick={{ fontSize: 10 }} 
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(value) => {
                                  if (selectedChartMetric === "Net Revenue") return `$${value}M`;
                                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                  return value;
                                }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: "hsl(var(--card))", 
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                  fontSize: "11px"
                                }}
                                formatter={(value: number) => {
                                  if (selectedChartMetric === "Net Revenue") return [`$${value}M`, ""];
                                  return [value.toLocaleString(), ""];
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              <Line 
                                type="monotone" 
                                dataKey="current" 
                                name="Current Scenario" 
                                stroke="hsl(174, 62%, 47%)" 
                                strokeWidth={2}
                                dot={{ fill: "hsl(174, 62%, 47%)", strokeWidth: 0, r: 3 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="base" 
                                name={selectedBaseScenario} 
                                stroke="hsl(210, 80%, 55%)" 
                                strokeWidth={2}
                                dot={{ fill: "hsl(210, 80%, 55%)", strokeWidth: 0, r: 3 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Insights Section - Collapsible */}
              <div className="border-b border-border">
                {/* Collapsible Header */}
                <div className="px-3 py-2 flex items-center justify-between bg-gradient-to-r from-primary/10 to-muted/50 text-foreground">
                  <button
                    onClick={() => toggleMetricSection("ask-edge")}
                    className="flex items-center gap-2 flex-1"
                  >
                    {expandedMetricSections.includes("ask-edge") ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">Insights</span>
                  </button>
                  <span className="text-xs font-medium text-primary border border-primary/30 rounded-full px-2.5 py-0.5 bg-primary/5">
                    Online
                  </span>
                </div>
                
                {expandedMetricSections.includes("ask-edge") && (
                  <div className="bg-card">
                    {/* Recommendations Section */}
                    <div className="px-4 py-3">
                      {/* High Impact Card */}
                      <div className="mb-2">
                        <div 
                          onClick={() => setExpandedRecommendation("population-growth")}
                          className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-white bg-rose-500 rounded px-1.5 py-0.5 flex items-center gap-1">
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                  </svg>
                                  High Impact
                                </span>
                                <span className="text-sm font-medium text-foreground">Actuals vs Previous Forecast</span>
                              </div>
                            </div>
                            {expandedRecommendation === "population-growth" ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Low Impact Card */}
                      <div className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                Low Impact
                              </span>
                              <span className="text-sm font-medium text-foreground">Impact on Assumptions</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Baseline Share Dialog */}
      <Dialog open={baselineDialogOpen} onClose={() => setBaselineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>Enter Baseline Share - Cohort {currentCohort} ({currentShareType === "class" ? "Class" : "Brand"})</span>
          <button onClick={() => setBaselineDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </DialogTitle>
        <DialogContent>
          <div className="pt-4">
            <TextField
              label="Baseline Share (%)"
              type="number"
              value={baselineValue}
              onChange={(e) => setBaselineValue(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter percentage value"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setBaselineDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveBaseline} 
            variant="contained"
            sx={{ backgroundColor: "hsl(174, 62%, 47%)", "&:hover": { backgroundColor: "hsl(174, 62%, 40%)" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Events Dialog */}
      <Dialog open={eventsDialogOpen} onClose={() => setEventsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>Enter Events - Cohort {currentCohort} ({currentShareType === "class" ? "Class" : "Brand"})</span>
          <button onClick={() => setEventsDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </DialogTitle>
        <DialogContent>
          <div className="pt-4 space-y-3">
            {eventValues.map((event, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <TextField
                  label={`Event ${idx + 1}`}
                  value={event}
                  onChange={(e) => {
                    const newEvents = [...eventValues];
                    newEvents[idx] = e.target.value;
                    setEventValues(newEvents);
                  }}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter event name"
                />
                {eventValues.length > 1 && (
                  <button 
                    onClick={() => setEventValues(eventValues.filter((_, i) => i !== idx))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <Button
              onClick={() => setEventValues([...eventValues, ""])}
              variant="outlined"
              size="small"
            >
              + Add Event
            </Button>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setEventsDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEvents} 
            variant="contained"
            sx={{ backgroundColor: "hsl(174, 62%, 47%)", "&:hover": { backgroundColor: "hsl(174, 62%, 40%)" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tableau Dashboard Modal */}
      <Dialog
        open={showTableauModal}
        onClose={() => setShowTableauModal(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: "90vw",
            height: "85vh",
            maxWidth: "90vw",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))"
        }}>
          <span className="font-semibold">Fetch Latest Actuals - Tableau Dashboard</span>
          <button 
            onClick={() => setShowTableauModal(false)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogTitle>
        <DialogContent sx={{ padding: "24px", height: "calc(100% - 64px)", overflow: "auto" }}>
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Revenue Actuals Chart */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Revenue Actuals vs Forecast</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { month: "Jan", actuals: 42, forecast: 45 },
                  { month: "Feb", actuals: 48, forecast: 47 },
                  { month: "Mar", actuals: 51, forecast: 50 },
                  { month: "Apr", actuals: 55, forecast: 54 },
                  { month: "May", actuals: 58, forecast: 60 },
                  { month: "Jun", actuals: 62, forecast: 63 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="actuals" fill="hsl(var(--primary))" name="Actuals" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forecast" fill="hsl(var(--muted-foreground))" name="Forecast" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Patient Volume Chart */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Patient Volume Trends</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { month: "Jan", patients: 1200, target: 1150 },
                  { month: "Feb", patients: 1350, target: 1300 },
                  { month: "Mar", patients: 1480, target: 1450 },
                  { month: "Apr", patients: 1620, target: 1600 },
                  { month: "May", patients: 1780, target: 1750 },
                  { month: "Jun", patients: 1920, target: 1900 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Patients" />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Market Share Chart */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Market Share by Region</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={[
                  { region: "North", share: 28 },
                  { region: "South", share: 24 },
                  { region: "East", share: 22 },
                  { region: "West", share: 18 },
                  { region: "Central", share: 8 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="region" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="share" fill="hsl(var(--primary))" name="Market Share %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sales Performance Chart */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Sales Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={[
                  { month: "Jan", sales: 85, returns: 5 },
                  { month: "Feb", sales: 92, returns: 4 },
                  { month: "Mar", sales: 98, returns: 6 },
                  { month: "Apr", sales: 105, returns: 5 },
                  { month: "May", sales: 112, returns: 7 },
                  { month: "Jun", sales: 118, returns: 6 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth={2} name="Sales" />
                  <Area type="monotone" dataKey="returns" fill="hsl(var(--destructive) / 0.3)" stroke="hsl(var(--destructive))" strokeWidth={2} name="Returns" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actualize Forecast Modal */}
      <Dialog
        open={showActualizeModal}
        onClose={() => setShowActualizeModal(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: "90vw",
            height: "85vh",
            maxWidth: "90vw",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))"
        }}>
          <span className="font-semibold">Actualize Forecast</span>
          <button 
            onClick={() => setShowActualizeModal(false)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogTitle>
        <DialogContent sx={{ padding: "24px", height: "calc(100% - 120px)", overflow: "auto" }}>
          {renderForecastCharts()}
        </DialogContent>
        <DialogActions sx={{ 
          padding: "16px 24px", 
          borderTop: "1px solid hsl(var(--border))",
          gap: "12px"
        }}>
          <Button 
            onClick={() => setShowActualizeModal(false)} 
            sx={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowActualizeModal(false);
              setChatMessages(prev => [...prev, {
                role: "system",
                content: "🎉 Forecast actualized successfully with the latest data!"
              }]);
            }}
            variant="contained"
            sx={{ backgroundColor: "hsl(var(--primary))", "&:hover": { backgroundColor: "hsl(var(--primary) / 0.9)" } }}
          >
            Save & Actualize
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recalculating Model Modal */}
      {isRecalculating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-8 shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold text-foreground">Recalculating Model</h3>
            <p className="text-sm text-muted-foreground">Processing assumptions across all stages...</p>
          </div>
        </div>
      )}

      {/* Generic Curve Modal Component */}
      {[
        { show: showPrevalenceCurveModal, setShow: setShowPrevalenceCurveModal, form: prevalenceCurveForm, setForm: setPrevalenceCurveForm, hasCustom: hasPrevalenceCustomCurve, setHasCustom: setHasPrevalenceCustomCurve, rowData: prevalenceRowData, setRowData: setPrevalenceRowData, setSelectedIndex: setSelectedPrevalenceCurveIndex, setConfirmed: setPrevalenceCurveConfirmed, title: "Prevalence", customLabel: "Custom Prevalence Curve", customData: { "2020": "0.018%", "2021": "0.020%", "2022": "0.023%", "2023": "0.027%", "2024": "0.032%", "2025": "0.038%", "2026": "0.044%", "2027": "0.049%", "2028": "0.053%", "2029": "0.056%", "2030": "0.058%" } },
        { show: showDiagnosisCurveModal, setShow: setShowDiagnosisCurveModal, form: diagnosisCurveForm, setForm: setDiagnosisCurveForm, hasCustom: hasDiagnosisCustomCurve, setHasCustom: setHasDiagnosisCustomCurve, rowData: diagnosisRowData, setRowData: setDiagnosisRowData, setSelectedIndex: setSelectedDiagnosisCurveIndex, setConfirmed: setDiagnosisCurveConfirmed, title: "Diagnosis Rate", customLabel: "Custom Diagnosis Curve", customData: { "2020": "42.0%", "2021": "44.5%", "2022": "47.0%", "2023": "50.0%", "2024": "53.5%", "2025": "57.0%", "2026": "60.5%", "2027": "63.5%", "2028": "66.0%", "2029": "68.0%", "2030": "70.0%" } },
        { show: showTreatmentCurveModal, setShow: setShowTreatmentCurveModal, form: treatmentCurveForm, setForm: setTreatmentCurveForm, hasCustom: hasTreatmentCustomCurve, setHasCustom: setHasTreatmentCustomCurve, rowData: treatmentRowData, setRowData: setTreatmentRowData, setSelectedIndex: setSelectedTreatmentCurveIndex, setConfirmed: setTreatmentCurveConfirmed, title: "Treatment Rate", customLabel: "Custom Treatment Curve", customData: { "2020": "65.0%", "2021": "67.5%", "2022": "70.0%", "2023": "73.0%", "2024": "76.5%", "2025": "80.0%", "2026": "83.0%", "2027": "85.5%", "2028": "87.5%", "2029": "89.0%", "2030": "90.0%" } },
        { show: showMoaMixCurveModal, setShow: setShowMoaMixCurveModal, form: moaMixCurveForm, setForm: setMoaMixCurveForm, hasCustom: hasMoaMixCustomCurve, setHasCustom: setHasMoaMixCustomCurve, rowData: moaMixRowData, setRowData: setMoaMixRowData, setSelectedIndex: setSelectedMoaMixCurveIndex, setConfirmed: setMoaMixCurveConfirmed, title: "MOA Mix", customLabel: "Custom MOA Mix Curve", customData: { "2020": "60.0%", "2021": "63.0%", "2022": "66.0%", "2023": "69.0%", "2024": "72.0%", "2025": "75.0%", "2026": "78.0%", "2027": "80.5%", "2028": "82.5%", "2029": "84.0%", "2030": "85.0%" } },
        { show: showChannelMixCurveModal, setShow: setShowChannelMixCurveModal, form: channelMixCurveForm, setForm: setChannelMixCurveForm, hasCustom: hasChannelMixCustomCurve, setHasCustom: setHasChannelMixCustomCurve, rowData: channelMixRowData, setRowData: setChannelMixRowData, setSelectedIndex: setSelectedChannelMixCurveIndex, setConfirmed: setChannelMixCurveConfirmed, title: "Channel Mix", customLabel: "Custom Channel Mix Curve", customData: { "2020": "52.0%", "2021": "55.0%", "2022": "58.5%", "2023": "62.0%", "2024": "66.0%", "2025": "70.0%", "2026": "74.0%", "2027": "77.5%", "2028": "80.5%", "2029": "83.0%", "2030": "85.0%" } },
        { show: showAdherenceCurveModal, setShow: setShowAdherenceCurveModal, form: adherenceCurveForm, setForm: setAdherenceCurveForm, hasCustom: hasAdherenceCustomCurve, setHasCustom: setHasAdherenceCustomCurve, rowData: adherenceRowData, setRowData: setAdherenceRowData, setSelectedIndex: setSelectedAdherenceCurveIndex, setConfirmed: setAdherenceCurveConfirmed, title: "Adherence", customLabel: "Custom Adherence Curve", customData: { "2020": "79.0%", "2021": "81.0%", "2022": "83.0%", "2023": "85.0%", "2024": "87.0%", "2025": "89.0%", "2026": "91.0%", "2027": "92.5%", "2028": "93.5%", "2029": "94.5%", "2030": "95.0%" } },
        { show: showGtnCurveModal, setShow: setShowGtnCurveModal, form: gtnCurveForm, setForm: setGtnCurveForm, hasCustom: hasGtnCustomCurve, setHasCustom: setHasGtnCustomCurve, rowData: gtnRowData, setRowData: setGtnRowData, setSelectedIndex: setSelectedGtnCurveIndex, setConfirmed: setGtnCurveConfirmed, title: "GTN %", customLabel: "Custom GTN Curve", customData: { "2020": "11.0%", "2021": "11.5%", "2022": "12.0%", "2023": "12.5%", "2024": "13.0%", "2025": "13.5%", "2026": "14.0%", "2027": "14.5%", "2028": "15.0%", "2029": "15.5%", "2030": "16.0%" } },
      ].map((config, idx) => (
        <Dialog 
          key={idx}
          open={config.show} 
          onClose={() => config.setShow(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {config.hasCustom ? `Update ${config.title} Curve` : `Create ${config.title} Curve`}
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4 pt-2">
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                size="small"
                value={config.form.startDate}
                onChange={(e) => config.setForm((prev: typeof config.form) => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              
              {/* Start Value with Toggle */}
              <div className="flex items-center gap-2">
                <ToggleButtonGroup
                  value={config.form.startValueType}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      config.setForm((prev: typeof config.form) => ({ ...prev, startValueType: newValue }));
                    }
                  }}
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
                  value={config.form.startValue}
                  onChange={(e) => config.setForm((prev: typeof config.form) => ({ ...prev, startValue: e.target.value }))}
                  placeholder={config.form.startValueType === "percentage" ? "Enter %" : "Enter value"}
                />
              </div>

              {/* Peak Value with Toggle */}
              <div className="flex items-center gap-2">
                <ToggleButtonGroup
                  value={config.form.peakValueType}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      config.setForm((prev: typeof config.form) => ({ ...prev, peakValueType: newValue }));
                    }
                  }}
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
                  value={config.form.peakValue}
                  onChange={(e) => config.setForm((prev: typeof config.form) => ({ ...prev, peakValue: e.target.value }))}
                  placeholder={config.form.peakValueType === "percentage" ? "Enter %" : "Enter value"}
                />
              </div>

              <TextField
                label="Time to Reach Peak Value"
                type="number"
                fullWidth
                size="small"
                value={config.form.timeToReachPeak}
                onChange={(e) => config.setForm((prev: typeof config.form) => ({ ...prev, timeToReachPeak: e.target.value }))}
                placeholder="Enter time in months"
                helperText="Time in months"
              />
              
              {/* Uptake Curve Dropdown */}
              <FormControl fullWidth size="small">
                <InputLabel>Uptake Curve</InputLabel>
                <Select
                  value={config.form.uptakeCurve}
                  label="Uptake Curve"
                  onChange={(e) => config.setForm((prev: typeof config.form) => ({ ...prev, uptakeCurve: e.target.value }))}
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
              onClick={() => config.setShow(false)}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                const customCurve: { label: string; [key: string]: string } = {
                  label: config.customLabel,
                  ...config.customData
                };
                
                if (config.hasCustom) {
                  config.setRowData((prev: typeof config.rowData) => [prev[0], customCurve]);
                } else {
                  config.setRowData((prev: typeof config.rowData) => [...prev, customCurve]);
                  config.setHasCustom(true);
                }
                
                config.setSelectedIndex(null);
                config.setConfirmed(false);
                
                config.setShow(false);
                config.setForm(defaultCurveForm);
              }}
              sx={{
                backgroundColor: 'hsl(174, 62%, 47%)',
                '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
              }}
            >
              {config.hasCustom ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </Layout>
  );
};

export default Testpage;
