import { Layout } from "@/components/Layout";
import { Plus, Search, Filter, Lock, Eye, FileCheck, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

interface ScenarioData {
  id: string;
  name: string;
  lastUpdatedBy: string;
  indication: string;
  forecastCycle: string;
  netRevenue: string;
  status: "published" | "in-use" | "locked";
}

interface NewScenarioForm {
  name: string;
  description: string;
  region: string;
  therapyArea: string;
  asset: string;
  indication: string;
  cycle: string;
}

interface FilterForm {
  region: string;
  therapyArea: string;
  asset: string;
  indication: string;
  cycle: string;
}

const Scenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filters, setFilters] = useState<FilterForm>({
    region: "",
    therapyArea: "",
    asset: "",
    indication: "",
    cycle: "",
  });
  const [newScenario, setNewScenario] = useState<NewScenarioForm>({
    name: "",
    description: "",
    region: "",
    therapyArea: "",
    asset: "",
    indication: "",
    cycle: "",
  });
  const navigate = useNavigate();

  const handleCreateScenario = () => {
    console.log("Creating scenario:", newScenario);
    setIsCreateModalOpen(false);
    
    // Navigate to scenario detail page with Setup tab
    const params = new URLSearchParams({
      name: newScenario.name || 'New Scenario',
      indication: newScenario.indication || 'CIDP',
      cycle: newScenario.cycle || 'FinPlan 2026',
      region: newScenario.region || 'United States',
    });
    navigate(`/scenario/new?${params.toString()}`);
    
    setNewScenario({
      name: "",
      description: "",
      region: "",
      therapyArea: "",
      asset: "",
      indication: "",
      cycle: "",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      region: "",
      therapyArea: "",
      asset: "",
      indication: "",
      cycle: "",
    });
  };

  const handleSaveFilters = () => {
    console.log("Applying filters:", filters);
    setIsFilterOpen(false);
  };

  const scenarios: ScenarioData[] = [
    { id: "1", name: "LE4 CIDP 2025 US Base_LE4_2025", lastUpdatedBy: "Bryan Feraric", indication: "CIDP", forecastCycle: "FinPlan 26", netRevenue: "$2B", status: "published" },
    { id: "2", name: "LE4 2025 CIDP US Best Case_LE4_2025", lastUpdatedBy: "Sarah Johnson", indication: "CIDP", forecastCycle: "Outlook 0", netRevenue: "$2.5B", status: "in-use" },
    { id: "3", name: "Base_Case_AT_CIDP_Draft 1_LE4_2025", lastUpdatedBy: "Michael Chen", indication: "CIDP", forecastCycle: "Outlook 1", netRevenue: "$1.8B", status: "in-use" },
    { id: "4", name: "Supply Case_AT_CIDP_Draft 1_LE4_2025", lastUpdatedBy: "Emily Davis", indication: "CIDP", forecastCycle: "Outlook 3", netRevenue: "$2.2B", status: "locked" },
    { id: "5", name: "Base_Case_BE_CIDP_Draft 1_LE4_2025", lastUpdatedBy: "James Wilson", indication: "CIDP", forecastCycle: "FinPlan 26", netRevenue: "$1.9B", status: "published" },
    { id: "6", name: "Supply Chain BE CIDP_Draft 1_LE4_2025", lastUpdatedBy: "Anna Martinez", indication: "CIDP", forecastCycle: "Outlook 0", netRevenue: "$2.1B", status: "in-use" },
    { id: "7", name: "Canada_CIDP_Base_LE4_2025", lastUpdatedBy: "Robert Brown", indication: "CIDP", forecastCycle: "Outlook 1", netRevenue: "$1.7B", status: "in-use" },
    { id: "8", name: "China_Base_LE4_2025", lastUpdatedBy: "Lisa Wang", indication: "gMG", forecastCycle: "FinPlan 26", netRevenue: "$3B", status: "locked" },
    { id: "9", name: "France_Base_LE4_2025", lastUpdatedBy: "Pierre Dupont", indication: "gMG", forecastCycle: "Outlook 3", netRevenue: "$2.3B", status: "locked" },
    { id: "10", name: "France_Supply_Chain_LE4_2025", lastUpdatedBy: "Marie Laurent", indication: "gMG", forecastCycle: "Outlook 0", netRevenue: "$2.4B", status: "in-use" },
    { id: "11", name: "China_Base_LE4_2025", lastUpdatedBy: "Wei Zhang", indication: "gMG", forecastCycle: "Outlook 1", netRevenue: "$2.9B", status: "locked" },
    { id: "12", name: "Supply Chain BE CIDP_Draft 1_LE4_2025", lastUpdatedBy: "Thomas Anderson", indication: "CIDP", forecastCycle: "FinPlan 26", netRevenue: "$2.2B", status: "in-use" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <FileCheck className="w-4 h-4 text-primary" />;
      case "in-use":
        return <Eye className="w-4 h-4 text-warning" />;
      case "locked":
        return <Lock className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">FP&A Forecasting Hub</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Last sign-in 18 Jan 2025 13:01
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Scenarios</h2>
            <Button
              variant="contained"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
              sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 42%)' } }}
            >
              Create New Scenario
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <IconButton onClick={() => setIsFilterOpen(true)} size="small">
              <Filter className="w-4 h-4" />
            </IconButton>
            <TextField
              placeholder="Search by Scenario"
              size="small"
              sx={{ flex: 1, maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </InputAdornment>
                ),
              }}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">Sort by</span>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="recent">Recently Added</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="revenue">Net Revenue</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">In Use</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground w-12"></th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Last Updated By</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Indication</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Forecast Cycle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground w-32">Net $</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr 
                  key={scenario.id} 
                  className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <td className="py-3 px-4">{getStatusIcon(scenario.status)}</td>
                  <td className="py-3 px-4 text-primary font-medium hover:underline">{scenario.name}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{scenario.lastUpdatedBy}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{scenario.indication}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{scenario.forecastCycle}</td>
                  <td className="py-3 px-4 font-semibold text-foreground">{scenario.netRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selectedScenario && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card sx={{ width: '100%', maxWidth: 450, p: 3, position: 'relative' }}>
              <IconButton
                onClick={() => setSelectedScenario(null)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
              >
                <X className="w-5 h-5" />
              </IconButton>

              <Typography variant="h6" fontWeight="bold" mb={3}>
                {selectedScenario.name}
              </Typography>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="small" startIcon={<Lock className="w-4 h-4" />}>
                    Lock
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<FileCheck className="w-4 h-4" />}>
                    Publish
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<Plus className="w-4 h-4" />}>
                    Clone
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Call Net Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{selectedScenario.netRevenue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cumulative Net Patients</p>
                    <p className="text-2xl font-bold text-foreground">$10.0K</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Region</p>
                    <p className="text-sm font-semibold text-foreground">United States</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Therapy Area</p>
                    <p className="text-sm font-semibold text-foreground">Neurology</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Asset</p>
                    <p className="text-sm font-semibold text-foreground">Vyvgart</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Indication</p>
                    <p className="text-sm font-semibold text-foreground">CIDP</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cycle</p>
                    <p className="text-sm font-semibold text-foreground">FinPlan 2026</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year</p>
                    <p className="text-sm font-semibold text-foreground">2026</p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Description</p>
                    <button className="text-xs text-primary hover:underline">View History</button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    LE4 CIDP 2026 US Base_LE4_2026<br />
                    Bryan Feraric Jul 16, 2025, 04:37:07 P.M.
                  </p>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-2">Next Best Action</p>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Perform Scenario Comparison with{" "}
                        <span className="font-semibold">LE4 CIDP 2025 US High_LE4_2025</span> to
                        understand drivers of variance
                      </span>
                    </li>
                    <li>
                      <button className="text-primary hover:underline text-left">View Details</button>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Compare scenario with <span className="font-semibold">LE4 CIDP 2025 Germany</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setSelectedScenario(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => navigate(`/scenario/${selectedScenario.id}`)}
                  sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 42%)' } }}
                >
                  Update
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Create New Scenario Modal */}
        <Dialog 
          open={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            New Scenario
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4 pt-2">
              <TextField
                fullWidth
                label="Scenario Name"
                placeholder="Enter Scenario Name"
                value={newScenario.name}
                onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Enter Description"
                  multiline
                  rows={8}
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                />

                <div className="space-y-3">
                  <FormControl fullWidth>
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={newScenario.region}
                      label="Region"
                      onChange={(e) => setNewScenario({ ...newScenario, region: e.target.value })}
                    >
                      <MenuItem value="us">United States</MenuItem>
                      <MenuItem value="eu">Europe</MenuItem>
                      <MenuItem value="canada">Canada</MenuItem>
                      <MenuItem value="china">China</MenuItem>
                      <MenuItem value="japan">Japan</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Therapy Area</InputLabel>
                    <Select
                      value={newScenario.therapyArea}
                      label="Therapy Area"
                      onChange={(e) => setNewScenario({ ...newScenario, therapyArea: e.target.value })}
                    >
                      <MenuItem value="neurology">Neurology</MenuItem>
                      <MenuItem value="oncology">Oncology</MenuItem>
                      <MenuItem value="immunology">Immunology</MenuItem>
                      <MenuItem value="cardiology">Cardiology</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Asset</InputLabel>
                    <Select
                      value={newScenario.asset}
                      label="Asset"
                      onChange={(e) => setNewScenario({ ...newScenario, asset: e.target.value })}
                    >
                      <MenuItem value="vyvgart">Vyvgart</MenuItem>
                      <MenuItem value="asset2">Asset 2</MenuItem>
                      <MenuItem value="asset3">Asset 3</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Indication</InputLabel>
                    <Select
                      value={newScenario.indication}
                      label="Indication"
                      onChange={(e) => setNewScenario({ ...newScenario, indication: e.target.value })}
                    >
                      <MenuItem value="cidp">CIDP</MenuItem>
                      <MenuItem value="mg">Myasthenia Gravis</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Cycle</InputLabel>
                    <Select
                      value={newScenario.cycle}
                      label="Cycle"
                      onChange={(e) => setNewScenario({ ...newScenario, cycle: e.target.value })}
                    >
                      <MenuItem value="finplan2025">FinPlan 2025</MenuItem>
                      <MenuItem value="finplan2026">FinPlan 2026</MenuItem>
                      <MenuItem value="le4">LE4</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleCreateScenario}
              sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 42%)' } }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Drawer */}
        <Drawer
          anchor="left"
          open={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          PaperProps={{ sx: { width: 400, p: 3 } }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">Filters</Typography>
            <IconButton onClick={() => setIsFilterOpen(false)}>
              <X className="w-5 h-5" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={filters.region}
                label="Region"
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              >
                <MenuItem value="">Select Region</MenuItem>
                <MenuItem value="us">United States</MenuItem>
                <MenuItem value="eu">Europe</MenuItem>
                <MenuItem value="canada">Canada</MenuItem>
                <MenuItem value="china">China</MenuItem>
                <MenuItem value="japan">Japan</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Therapy Area</InputLabel>
              <Select
                value={filters.therapyArea}
                label="Therapy Area"
                onChange={(e) => setFilters({ ...filters, therapyArea: e.target.value })}
              >
                <MenuItem value="">Select Therapy Area</MenuItem>
                <MenuItem value="neurology">Neurology</MenuItem>
                <MenuItem value="oncology">Oncology</MenuItem>
                <MenuItem value="immunology">Immunology</MenuItem>
                <MenuItem value="cardiology">Cardiology</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Asset</InputLabel>
              <Select
                value={filters.asset}
                label="Asset"
                onChange={(e) => setFilters({ ...filters, asset: e.target.value })}
              >
                <MenuItem value="">Select Asset</MenuItem>
                <MenuItem value="vyvgart">Vyvgart</MenuItem>
                <MenuItem value="asset2">Asset 2</MenuItem>
                <MenuItem value="asset3">Asset 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Indication</InputLabel>
              <Select
                value={filters.indication}
                label="Indication"
                onChange={(e) => setFilters({ ...filters, indication: e.target.value })}
              >
                <MenuItem value="">Select Indication</MenuItem>
                <MenuItem value="cidp">CIDP</MenuItem>
                <MenuItem value="mg">Myasthenia Gravis</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Cycle</InputLabel>
              <Select
                value={filters.cycle}
                label="Cycle"
                onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
              >
                <MenuItem value="">Select Cycle</MenuItem>
                <MenuItem value="finplan2025">FinPlan 2025</MenuItem>
                <MenuItem value="finplan2026">FinPlan 2026</MenuItem>
                <MenuItem value="le4">LE4</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: "auto", pt: 4 }}>
            <Button variant="text" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveFilters}
              sx={{ backgroundColor: 'hsl(174, 62%, 47%)', '&:hover': { backgroundColor: 'hsl(174, 62%, 42%)' } }}
            >
              Save
            </Button>
          </Box>
        </Drawer>
      </div>
    </Layout>
  );
};

export default Scenarios;
