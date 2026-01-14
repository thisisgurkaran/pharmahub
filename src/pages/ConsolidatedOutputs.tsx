import { Layout } from "@/components/Layout";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { Filter } from "lucide-react";
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

const ConsolidatedOutputs = () => {
  const [tabValue, setTabValue] = useState(0);
  const years = [2024, 2025, 2026];

  const revenueData = {
    gMG: [95, 34, 50],
    CIPD: [75, 147, 85],
    Myositis: [135, 75, 175],
  };

  const patientsData = {
    gMG: [34, 147, 50],
    CIPD: [75, 75, 85],
    Myositis: [75, 135, 175],
  };

  const activePatientsData = {
    gMG: [85, 75, 34],
    CIPD: [175, 95, 147],
    Myositis: [135, 135, 75],
  };

  const grossRevenueData = {
    gMG: [55, 54, 170],
    CIPD: [175, 187, 85],
    Myositis: [125, 65, 55],
  };

  const newPatientShareData = {
    years: [2024, 2025, 2026],
    gMG: [65, 60, 55],
    CIPD: [55, 50, 42],
    Myositis: [40, 35, 30],
  };

  const totalPatientShareData = {
    years: [2024, 2025, 2026],
    gMG: [80, 75, 70],
    CIPD: [55, 52, 48],
    Myositis: [52, 50, 45],
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <div className="flex items-center justify-between">
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Consolidated Outputs" />
                <Tab label="Change Drivers" />
              </Tabs>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">View by:</span>
                <ButtonGroup size="small" variant="outlined">
                  <Button variant="contained">Indication</Button>
                  <Button>Asset</Button>
                  <Button>Region</Button>
                </ButtonGroup>
              </div>
            </div>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Consolidated Outputs</h2>
                <IconButton size="small">
                  <Filter className="w-4 h-4" />
                </IconButton>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Net Revenue */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - Net Revenue
                    </h3>
                    <div className="h-64">
                      <BarChart
                        xAxis={[{ data: years, scaleType: "band" }]}
                        series={[
                          { data: revenueData.gMG, label: "gMG", stack: "total", color: "#13547A" },
                          { data: revenueData.CIPD, label: "CIPD", stack: "total", color: "#40A9FF" },
                          { data: revenueData.Myositis, label: "Myositis", stack: "total", color: "#80D0FF" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cumulative Net Patients */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - Cumulative Net Patients
                    </h3>
                    <div className="h-64">
                      <BarChart
                        xAxis={[{ data: years, scaleType: "band" }]}
                        series={[
                          { data: patientsData.gMG, label: "gMG", stack: "total", color: "#13547A" },
                          { data: patientsData.CIPD, label: "CIPD", stack: "total", color: "#40A9FF" },
                          { data: patientsData.Myositis, label: "Myositis", stack: "total", color: "#80D0FF" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Active Patients */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - Active Patients
                    </h3>
                    <div className="h-64">
                      <BarChart
                        xAxis={[{ data: years, scaleType: "band" }]}
                        series={[
                          { data: activePatientsData.gMG, label: "gMG", stack: "total", color: "#13547A" },
                          { data: activePatientsData.CIPD, label: "CIPD", stack: "total", color: "#40A9FF" },
                          { data: activePatientsData.Myositis, label: "Myositis", stack: "total", color: "#80D0FF" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gross Revenue */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - Gross Revenue
                    </h3>
                    <div className="h-64">
                      <BarChart
                        xAxis={[{ data: years, scaleType: "band" }]}
                        series={[
                          { data: grossRevenueData.gMG, label: "gMG", stack: "total", color: "#13547A" },
                          { data: grossRevenueData.CIPD, label: "CIPD", stack: "total", color: "#40A9FF" },
                          { data: grossRevenueData.Myositis, label: "Myositis", stack: "total", color: "#80D0FF" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* New Patient Share */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - New Patient Share
                    </h3>
                    <div className="h-64">
                      <LineChart
                        xAxis={[{ data: newPatientShareData.years, scaleType: "point" }]}
                        series={[
                          { data: newPatientShareData.gMG, label: "gMG", color: "#13547A", curve: "linear" },
                          { data: newPatientShareData.CIPD, label: "CIPD", color: "#40A9FF", curve: "linear" },
                          { data: newPatientShareData.Myositis, label: "Myositis", color: "#80D0FF", curve: "linear" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Total Patient Share */}
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      FinPlan 2026 - Total Patient Share
                    </h3>
                    <div className="h-64">
                      <LineChart
                        xAxis={[{ data: totalPatientShareData.years, scaleType: "point" }]}
                        series={[
                          { data: totalPatientShareData.gMG, label: "gMG", color: "#13547A", curve: "linear" },
                          { data: totalPatientShareData.CIPD, label: "CIPD", color: "#40A9FF", curve: "linear" },
                          { data: totalPatientShareData.Myositis, label: "Myositis", color: "#80D0FF", curve: "linear" },
                        ]}
                        height={250}
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div className="py-12 text-center text-muted-foreground">
              Change Drivers content will be displayed here
            </div>
          </TabPanel>
        </div>
      </div>
    </Layout>
  );
};

export default ConsolidatedOutputs;
