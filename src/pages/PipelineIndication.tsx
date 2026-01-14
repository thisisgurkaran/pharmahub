import { Layout } from "@/components/Layout";
import { useSearchParams, useParams } from "react-router-dom";
import ActualsDataGrid from "@/components/ActualsDataGrid";
import ChartWithDataGrid from "@/components/ChartWithDataGrid";
import MarketShareDataGrid from "@/components/MarketShareDataGrid";
import VolumeConversionDataGrid from "@/components/VolumeConversionDataGrid";
import RevenueDataGrid from "@/components/RevenueDataGrid";
import PatientSegmentsSection from "@/components/PatientSegmentsSection";
import SetupTabContent from "@/components/SetupTabContent";
import SummarySection from "@/components/SummarySection";
import ComparisonSection from "@/components/ComparisonSection";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import { ChevronDown, ChevronUp, Filter, Search, PanelLeftClose, PanelLeft, ArrowRight, ArrowLeft, Calculator } from "lucide-react";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PipelineIndication = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  
  // Get scenario info from URL params or use defaults
  const scenarioName = searchParams.get('name') || 'LE4 CIDP 2025 US Base';
  const indication = searchParams.get('indication') || 'CIDP';
  const cycle = searchParams.get('cycle') || 'LE4_2025';
  const region = searchParams.get('region') || 'Germany';

  const [tabValue, setTabValue] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [expandedYears, setExpandedYears] = useState<string[]>(["2025"]);
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [startPeriod, setStartPeriod] = useState("Jan-21");
  const [endPeriod, setEndPeriod] = useState("Dec-30");
  const [startYear, setStartYear] = useState("2020");
  const [endYear, setEndYear] = useState("2030");
  const [forecastType, setForecastType] = useState("market");
  const [comparisonCycle, setComparisonCycle] = useState("lrp");
  const [comparisonScenario, setComparisonScenario] = useState("finplan2026");
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  // Generate period options based on period type
  const generatePeriodOptions = () => {
    const options: string[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (periodType === "monthly") {
      for (let year = 2020; year <= 2035; year++) {
        const shortYear = year.toString().slice(-2);
        for (const month of months) {
          options.push(`${month}-${shortYear}`);
        }
      }
    } else if (periodType === "quarterly") {
      for (let year = 2020; year <= 2035; year++) {
        const shortYear = year.toString().slice(-2);
        for (let q = 1; q <= 4; q++) {
          options.push(`Q${q}-${shortYear}`);
        }
      }
    } else {
      for (let year = 2020; year <= 2035; year++) {
        options.push(year.toString());
      }
    }
    return options;
  };

  const periodOptions = generatePeriodOptions();

  // Handle period type change
  const handlePeriodTypeChange = (newType: "monthly" | "quarterly" | "annual") => {
    setPeriodType(newType);
    // Reset to default values for the new period type
    if (newType === "monthly") {
      setStartPeriod("Jan-21");
      setEndPeriod("Dec-30");
    } else if (newType === "quarterly") {
      setStartPeriod("Q1-21");
      setEndPeriod("Q4-30");
    } else {
      setStartPeriod("2021");
      setEndPeriod("2030");
    }
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleCalculate = () => {
    console.log("Calculating forecast...");
    // Add calculation logic here
  };

  const prevalenceData = {
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    current: [1500, 1400, 1900, 2100, 1700, 2300, 2600, 2500, 2200, 2800, 2600],
  };

  const diagnosisData = {
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    current: [65, 68, 70, 72, 71, 73, 75, 74, 76, 78, 77],
  };


  return (
    <Layout>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Sidebar - Hidden by default */}
        {showChatSidebar && (
          <div className="w-80 bg-card border-r border-border p-6 min-h-screen">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-foreground mb-2">Welcome back, Wouter!</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I have fetched the latest set of assumptions used in the scenario FinPlan 2026.
                  These were refreshed on 1st September. I have published them along with my
                  synthesized findings for your review in the right panel.
                </p>
              </div>

              <div>
                <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                  What would you like to explore today?
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <TextField
                  fullWidth
                  placeholder="Enter your query"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}>
                          <ChevronUp className="w-4 h-4" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 pr-8 overflow-hidden flex flex-col">
          {/* Header with Scenario Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconButton
                  size="small"
                  onClick={() => setShowChatSidebar(!showChatSidebar)}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  {showChatSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </IconButton>
                <h1 className="text-2xl font-bold text-foreground">In Market Indication Forecast</h1>
              </div>
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <Select value={forecastType} onChange={(e) => setForecastType(e.target.value)}>
                  <MenuItem value="market">In Market Indication Forecast</MenuItem>
                  <MenuItem value="pipeline">Pipeline Indication Forecast</MenuItem>
                </Select>
              </FormControl>
            </div>
            {/* Scenario Info Banner */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
              <div><span className="font-medium text-muted-foreground">Scenario:</span> <span className="text-foreground">{scenarioName}</span></div>
              <div><span className="font-medium text-muted-foreground">Country:</span> <span className="text-foreground">{region}</span></div>
              <div><span className="font-medium text-muted-foreground">Indication:</span> <span className="text-foreground">{indication}</span></div>
              <div><span className="font-medium text-muted-foreground">Forecast Cycle:</span> <span className="text-foreground">{cycle}</span></div>
            </div>
          </div>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Setup" />
              <Tab label="Model Flow" />
              <Tab label="Actual" />
              <Tab label="Epidemiology" />
              <Tab label="Market Share" />
              <Tab label="Conversion" />
              <Tab label="Revenue" />
              <Tab label="Summary" />
              <Tab label="Comparison" />
              <Tab label="Output" />
            </Tabs>
          </Box>

          {/* Setup Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Setup</h2>
                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(1)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <SetupTabContent />
            </div>
          </TabPanel>

          {/* Model Flow Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Model Flow</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(0)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(2)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className="py-12 text-center text-muted-foreground">
                Model flow diagram will be displayed here
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Actuals Data</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(1)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(3)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <ActualsDataGrid />
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Epi Assumptions</h2>
                <div className="flex items-center gap-4">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Calculator className="w-4 h-4" />}
                    onClick={handleCalculate}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Calculate
                  </Button>
                  <span className="text-sm text-foreground">Period</span>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                      <MenuItem value="2020">2020</MenuItem>
                      <MenuItem value="2021">2021</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select value={endYear} onChange={(e) => setEndYear(e.target.value)}>
                      <MenuItem value="2030">2030</MenuItem>
                      <MenuItem value="2035">2035</MenuItem>
                    </Select>
                  </FormControl>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setTabValue(2)}
                      startIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setTabValue(4)}
                      endIcon={<ArrowRight className="w-4 h-4" />}
                      sx={{
                        backgroundColor: 'hsl(174, 62%, 47%)',
                        '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              {/* Total CIDP Prevalence Chart */}
              <ChartWithDataGrid
                title="Total CIDP Prevalence (%)"
                chartData={[
                  { year: 2020, value: 12 },
                  { year: 2021, value: 14 },
                  { year: 2022, value: 15 },
                  { year: 2023, value: 17 },
                  { year: 2024, value: 18 },
                  { year: 2025, value: 20 },
                  { year: 2026, value: 22 },
                  { year: 2027, value: 24 },
                  { year: 2028, value: 25 },
                  { year: 2029, value: 27 },
                  { year: 2030, value: 28 }
                ]}
                chartColor="#40A9FF"
                legendItems={[
                  { label: "Current Scenario Values", color: "#40A9FF" }
                ]}
                initialGridData={[
                  { label: "Total CIDP Prevalence (%)", "2020": "12.0%", "2021": "14.0%", "2022": "15.0%", "2023": "17.0%", "2024": "18.0%", "2025": "20.0%", "2026": "22.0%", "2027": "24.0%", "2028": "25.0%", "2029": "27.0%", "2030": "28.0%" },
                  { label: "CIDP Prevalent Patients", "2020": "45,000", "2021": "46,200", "2022": "47,500", "2023": "48,800", "2024": "50,100", "2025": "51,500", "2026": "52,900", "2027": "54,400", "2028": "55,900", "2029": "57,500", "2030": "59,100" }
                ]}
                showRecommendations={true}
              />

              {/* CIDP Diagnosis Rate Chart */}
              <ChartWithDataGrid
                title="CIDP Diagnosis Rate (%)"
                chartData={diagnosisData.years.map((year, i) => ({ year, value: diagnosisData.current[i] }))}
                chartColor="#40A9FF"
                legendItems={[
                  { label: "Current Scenario Values", color: "#40A9FF" }
                ]}
                initialGridData={[
                  { label: "CIDP Diagnosis Rate (%)", "2020": "65.0%", "2021": "68.0%", "2022": "70.0%", "2023": "72.0%", "2024": "71.0%", "2025": "73.0%", "2026": "75.0%", "2027": "74.0%", "2028": "76.0%", "2029": "78.0%", "2030": "77.0%" },
                  { label: "CIDP Diagnosed Patients", "2020": "29,250", "2021": "31,416", "2022": "33,250", "2023": "35,136", "2024": "35,571", "2025": "37,595", "2026": "39,675", "2027": "40,256", "2028": "42,484", "2029": "44,850", "2030": "45,507" }
                ]}
                showRecommendations={false}
              />

              {/* CIDP Treatment Rate Chart */}
              <ChartWithDataGrid
                title="CIDP Treatment Rate (%)"
                chartData={[
                  { year: 2020, value: 45 },
                  { year: 2021, value: 48 },
                  { year: 2022, value: 52 },
                  { year: 2023, value: 55 },
                  { year: 2024, value: 58 },
                  { year: 2025, value: 60 },
                  { year: 2026, value: 63 },
                  { year: 2027, value: 65 },
                  { year: 2028, value: 68 },
                  { year: 2029, value: 70 },
                  { year: 2030, value: 72 }
                ]}
                chartColor="#40A9FF"
                legendItems={[
                  { label: "Current Scenario Values", color: "#40A9FF" }
                ]}
                initialGridData={[
                  { label: "CIDP Treatment Rate (%)", "2020": "45.0%", "2021": "48.0%", "2022": "52.0%", "2023": "55.0%", "2024": "58.0%", "2025": "60.0%", "2026": "63.0%", "2027": "65.0%", "2028": "68.0%", "2029": "70.0%", "2030": "72.0%" },
                  { label: "CIDP Treated Patients", "2020": "13,163", "2021": "15,080", "2022": "17,290", "2023": "19,325", "2024": "20,631", "2025": "22,557", "2026": "24,995", "2027": "26,166", "2028": "28,889", "2029": "31,395", "2030": "32,765" }
                ]}
                showRecommendations={false}
              />

              {/* Patient Segments Section */}
              <PatientSegmentsSection />
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Market Share</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(3)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(5)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <MarketShareDataGrid />
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Conversion</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(4)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(6)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <VolumeConversionDataGrid />
            </div>
          </TabPanel>

          {/* Revenue Tab */}
          <TabPanel value={tabValue} index={6}>
            <RevenueDataGrid onBack={() => setTabValue(5)} onNext={() => setTabValue(7)} />
          </TabPanel>

          <TabPanel value={tabValue} index={7}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Summary</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(6)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(8)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Period Controls Row */}
              <div className="flex items-center gap-4">
                <ButtonGroup size="small" variant="outlined">
                  <Button 
                    variant={periodType === "monthly" ? "contained" : "outlined"}
                    onClick={() => handlePeriodTypeChange("monthly")}
                    sx={periodType === "monthly" ? { backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } } : {}}
                  >
                    Monthly
                  </Button>
                  <Button 
                    variant={periodType === "quarterly" ? "contained" : "outlined"}
                    onClick={() => handlePeriodTypeChange("quarterly")}
                    sx={periodType === "quarterly" ? { backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } } : {}}
                  >
                    Quarterly
                  </Button>
                  <Button 
                    variant={periodType === "annual" ? "contained" : "outlined"}
                    onClick={() => handlePeriodTypeChange("annual")}
                    sx={periodType === "annual" ? { backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' } } : {}}
                  >
                    Annual
                  </Button>
                </ButtonGroup>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">Start Date</span>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
                      {periodOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">End Date</span>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
                      {periodOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Summary Sections */}
              <SummarySection 
                periodType={periodType} 
                startPeriod={startPeriod} 
                endPeriod={endPeriod} 
              />
            </div>
          </TabPanel>

          {/* Comparison Tab */}
          <TabPanel value={tabValue} index={8}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Comparison</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setTabValue(7)}
                    startIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setTabValue(9)}
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      backgroundColor: 'hsl(174, 62%, 47%)',
                      '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <ComparisonSection periodType={periodType} />
            </div>
          </TabPanel>

          {/* Output Tab */}
          <TabPanel value={tabValue} index={9}>
            <div className="py-12 text-center text-muted-foreground">
              Output content will be displayed here
            </div>
          </TabPanel>
        </div>
      </div>
    </Layout>
  );
};

export default PipelineIndication;
