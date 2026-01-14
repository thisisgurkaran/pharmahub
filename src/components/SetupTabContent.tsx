import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// Dropdown options
const sellingModelOptions = ['LRD', 'Direct', 'Distributor'];
const pnlResponsibilityOptions = ['DACH', 'EMEA', 'North', 'South', 'APAC', 'Benelux'];
const clusterOptions = ['Big5', 'Nordics', 'Parts & markets', 'Distributor EM', 'Distributor SSE', 'Distributor MEA', 'Distributor AP', 'RoW'];
const skuClassificationOptions = ['DE', 'FR', 'IT', 'ES', 'UK', 'BE', 'NL', 'CH', 'AT', 'US', 'CA', 'JP', 'AU'];
const currencyOptions = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'DKK', 'SEK', 'NOK', 'AUD', 'CAD'];

const SetupTabContent = () => {
  // Model Setup State
  const [modelSetup, setModelSetup] = useState({
    modelStartYear: '2022',
    dosingType: 'Duration Based',
    enableFreeOfChargeVials: 'On',
    programCode: 'ARGX113CIDP',
  });

  // Country Configuration
  const [countryConfig, setCountryConfig] = useState({
    country: 'Germany',
    sellingModel: 'LRD',
    pnlResponsibility: 'DACH',
    cluster: 'Big5',
    skuClassification: 'DE',
    currency: 'EUR',
  });

  // MoA Configuration (including Vials Conversion Factors)
  const [moaConfig, setMoaConfig] = useState([
    { id: 1, name: 'MoA 1', moa: 'IV', status: 'On', programCode: '1', conversionFactor: '400' },
    { id: 2, name: 'MoA 2', moa: 'SC', status: 'On', programCode: '2', conversionFactor: '1008' },
    { id: 3, name: 'MoA 3', moa: 'SC PFS', status: 'On', programCode: '3', conversionFactor: '1000' },
    { id: 4, name: 'MoA 4', moa: 'SC Autoinjector', status: 'Off', programCode: '4', conversionFactor: '1000' },
  ]);

  // Epidemiology Layers
  const [epiLayers, setEpiLayers] = useState([
    { id: 1, name: 'Layer 1', inputMetric: 'Population (QTY)', calculatedMetric: '', toggle: 'On' },
    { id: 2, name: 'Layer 2', inputMetric: 'Adult Population (%)', calculatedMetric: 'Adult Population (QTY)', toggle: 'On' },
    { id: 3, name: 'Layer 3', inputMetric: 'Prevalence (%)', calculatedMetric: 'Prevalent Patients (QTY)', toggle: 'On' },
    { id: 4, name: 'Layer 4', inputMetric: 'Diagnosed (%)', calculatedMetric: 'Diagnosed (QTY)', toggle: 'On' },
    { id: 5, name: 'Layer 5', inputMetric: 'Treated (%)', calculatedMetric: 'Treated (QTY)', toggle: 'On' },
    { id: 6, name: 'Layer 6', inputMetric: '', calculatedMetric: '', toggle: 'Off' },
    { id: 7, name: 'Layer 7', inputMetric: '', calculatedMetric: '', toggle: 'Off' },
  ]);

  // Patient Cohorts
  const [patientCohorts, setPatientCohorts] = useState([
    { id: 1, name: 'Cohort 1', cohortName: '2L (QTY)', toggle: 'On' },
    { id: 2, name: 'Cohort 2', cohortName: 'Not eligible to IvIG (QTY)', toggle: 'On' },
    { id: 3, name: 'Cohort 3', cohortName: 'Switching from IvIg/SCIg (QTY)', toggle: 'On' },
    { id: 4, name: 'Cohort 4', cohortName: '', toggle: 'Off' },
    { id: 5, name: 'Cohort 5', cohortName: '', toggle: 'Off' },
    { id: 6, name: 'Cohort 6', cohortName: '', toggle: 'Off' },
  ]);

  const addEpiLayer = () => {
    const newId = epiLayers.length + 1;
    setEpiLayers([...epiLayers, { id: newId, name: `Layer ${newId}`, inputMetric: '', calculatedMetric: '', toggle: 'Off' }]);
  };

  const removeEpiLayer = (id: number) => {
    if (epiLayers.length > 1) {
      setEpiLayers(epiLayers.filter(layer => layer.id !== id));
    }
  };

  const addPatientCohort = () => {
    const newId = patientCohorts.length + 1;
    setPatientCohorts([...patientCohorts, { id: newId, name: `Cohort ${newId}`, cohortName: '', toggle: 'Off' }]);
  };

  const removePatientCohort = (id: number) => {
    if (patientCohorts.length > 1) {
      setPatientCohorts(patientCohorts.filter(cohort => cohort.id !== id));
    }
  };

  const yearOptions = Array.from({ length: 19 }, (_, i) => 2022 + i);

  const headerCellStyle = { 
    backgroundColor: 'hsl(174, 62%, 47%)', 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: '0.75rem',
    padding: '8px',
    border: '1px solid hsl(174, 62%, 40%)'
  };
  
  const labelCellStyle = { 
    fontWeight: 500, 
    fontSize: '0.75rem',
    padding: '6px 8px',
    border: '1px solid hsl(var(--border))'
  };
  
  const inputCellStyle = { 
    padding: '4px', 
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))'
  };

  return (
    <div className="space-y-6">
      {/* Model Setup Section */}
      <Card sx={{ border: '1px solid hsl(var(--border))' }}>
        <CardContent sx={{ p: 2 }}>
          <h2 className="text-lg font-bold mb-4">Model Setup</h2>
          
          {/* Model Start Year */}
          <div className="grid grid-cols-[200px_240px] gap-4 items-center mb-4">
            <label className="text-xs font-medium">Model Start Year</label>
            <Select
              value={modelSetup.modelStartYear}
              onChange={(e) => setModelSetup({ ...modelSetup, modelStartYear: e.target.value })}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
          </div>

          {/* Dosing Type */}
          <div className="grid grid-cols-[200px_240px] gap-4 items-center mb-4">
            <label className="text-xs font-medium">Dosing Type</label>
            <Select
              value={modelSetup.dosingType}
              onChange={(e) => setModelSetup({ ...modelSetup, dosingType: e.target.value })}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="Duration Based">Duration Based</MenuItem>
              <MenuItem value="Cycle Based">Cycle Based</MenuItem>
            </Select>
          </div>

          {/* Enable Free of Charge Vials */}
          <div className="grid grid-cols-[200px_240px] gap-4 items-center mb-4">
            <label className="text-xs font-medium">Enable Free of Charge Vials</label>
            <Select
              value={modelSetup.enableFreeOfChargeVials}
              onChange={(e) => setModelSetup({ ...modelSetup, enableFreeOfChargeVials: e.target.value })}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="On">On</MenuItem>
              <MenuItem value="Off">Off</MenuItem>
            </Select>
          </div>

          {/* Program Code */}
          <div className="grid grid-cols-[200px_240px] gap-4 items-center mb-6">
            <label className="text-xs font-medium">Program Code</label>
            <TextField
              value={modelSetup.programCode}
              onChange={(e) => setModelSetup({ ...modelSetup, programCode: e.target.value })}
              size="small"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '6px 8px' } }}
            />
          </div>

          {/* Country Configuration Table */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Country</TableCell>
                  <TableCell sx={headerCellStyle}>Select the Selling Model</TableCell>
                  <TableCell sx={headerCellStyle}>Select the P&L Responsibility</TableCell>
                  <TableCell sx={headerCellStyle}>Select the Cluster</TableCell>
                  <TableCell sx={headerCellStyle}>Select the SKU Classification</TableCell>
                  <TableCell sx={headerCellStyle}>Select the Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={labelCellStyle}>{countryConfig.country}</TableCell>
                  <TableCell sx={inputCellStyle}>
                    <Select value={countryConfig.sellingModel} onChange={(e) => setCountryConfig({ ...countryConfig, sellingModel: e.target.value })} size="small" fullWidth sx={{ fontSize: '0.7rem' }}>
                      {sellingModelOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell sx={inputCellStyle}>
                    <Select value={countryConfig.pnlResponsibility} onChange={(e) => setCountryConfig({ ...countryConfig, pnlResponsibility: e.target.value })} size="small" fullWidth sx={{ fontSize: '0.7rem' }}>
                      {pnlResponsibilityOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell sx={inputCellStyle}>
                    <Select value={countryConfig.cluster} onChange={(e) => setCountryConfig({ ...countryConfig, cluster: e.target.value })} size="small" fullWidth sx={{ fontSize: '0.7rem' }}>
                      {clusterOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell sx={inputCellStyle}>
                    <Select value={countryConfig.skuClassification} onChange={(e) => setCountryConfig({ ...countryConfig, skuClassification: e.target.value })} size="small" fullWidth sx={{ fontSize: '0.7rem' }}>
                      {skuClassificationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell sx={inputCellStyle}>
                    <Select value={countryConfig.currency} onChange={(e) => setCountryConfig({ ...countryConfig, currency: e.target.value })} size="small" fullWidth sx={{ fontSize: '0.7rem' }}>
                      {currencyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* MoA Configuration Table */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>MoA</TableCell>
                  <TableCell sx={headerCellStyle}>MoA</TableCell>
                  <TableCell sx={headerCellStyle}>Indicate MoA Status</TableCell>
                  <TableCell sx={headerCellStyle}>Program Code</TableCell>
                  <TableCell sx={headerCellStyle}>Equivalized Vials Conversion Factors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moaConfig.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell sx={labelCellStyle}>{row.name}</TableCell>
                    <TableCell sx={inputCellStyle}>
                      <Select
                        value={row.moa}
                        onChange={(e) => {
                          const updated = [...moaConfig];
                          updated[idx].moa = e.target.value;
                          setMoaConfig(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="IV">IV</MenuItem>
                        <MenuItem value="SC">SC</MenuItem>
                        <MenuItem value="SC PFS">SC PFS</MenuItem>
                        <MenuItem value="SC Autoinjector">SC Autoinjector</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      <Select
                        value={row.status}
                        onChange={(e) => {
                          const updated = [...moaConfig];
                          updated[idx].status = e.target.value;
                          setMoaConfig(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="On">On</MenuItem>
                        <MenuItem value="Off">Off</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={inputCellStyle}>{row.programCode}</TableCell>
                    <TableCell sx={inputCellStyle}>
                      <TextField
                        value={row.conversionFactor}
                        onChange={(e) => {
                          const updated = [...moaConfig];
                          updated[idx].conversionFactor = e.target.value;
                          setMoaConfig(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '4px 8px' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Epidemiology Setup Section */}
      <Card sx={{ border: '1px solid hsl(var(--border))' }}>
        <CardContent sx={{ p: 2 }}>
          <h2 className="text-lg font-bold mb-4">Epidemiology Setup</h2>
          
          {/* Epidemiology Layers Table */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Epidemiology Layers</TableCell>
                  <TableCell sx={headerCellStyle}>Input Metric</TableCell>
                  <TableCell sx={headerCellStyle}>Calculated Metric</TableCell>
                  <TableCell sx={headerCellStyle}>Toggle</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epiLayers.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell sx={labelCellStyle}>{row.name}</TableCell>
                    <TableCell sx={inputCellStyle}>
                      <TextField
                        value={row.inputMetric}
                        onChange={(e) => {
                          const updated = [...epiLayers];
                          updated[idx].inputMetric = e.target.value;
                          setEpiLayers(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '4px 8px' } }}
                      />
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      {row.calculatedMetric}
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      <Select
                        value={row.toggle}
                        onChange={(e) => {
                          const updated = [...epiLayers];
                          updated[idx].toggle = e.target.value;
                          setEpiLayers(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="On">On</MenuItem>
                        <MenuItem value="Off">Off</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      <button
                        onClick={() => removeEpiLayer(row.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        disabled={epiLayers.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <button
            onClick={addEpiLayer}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 mb-6"
          >
            <Plus className="w-4 h-4" /> Add Layer
          </button>

          {/* Patient Cohorts Table */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Patient Cohort</TableCell>
                  <TableCell sx={headerCellStyle}>Cohort Name</TableCell>
                  <TableCell sx={headerCellStyle}>Toggle</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patientCohorts.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell sx={labelCellStyle}>{row.name}</TableCell>
                    <TableCell sx={inputCellStyle}>
                      <TextField
                        value={row.cohortName}
                        onChange={(e) => {
                          const updated = [...patientCohorts];
                          updated[idx].cohortName = e.target.value;
                          setPatientCohorts(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '4px 8px' } }}
                      />
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      <Select
                        value={row.toggle}
                        onChange={(e) => {
                          const updated = [...patientCohorts];
                          updated[idx].toggle = e.target.value;
                          setPatientCohorts(updated);
                        }}
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="On">On</MenuItem>
                        <MenuItem value="Off">Off</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={inputCellStyle}>
                      <button
                        onClick={() => removePatientCohort(row.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        disabled={patientCohorts.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <button
            onClick={addPatientCohort}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            <Plus className="w-4 h-4" /> Add Cohort
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupTabContent;
