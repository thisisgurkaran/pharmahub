import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule, type ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import CollapsibleSection from "./CollapsibleSection";

ModuleRegistry.registerModules([ClientSideRowModelModule, TextEditorModule, ValidationModule, CellStyleModule]);

interface SummarySectionProps {
  periodType: "monthly" | "quarterly" | "annual";
  startPeriod: string;
  endPeriod: string;
}

const SummarySection = ({ periodType, startPeriod, endPeriod }: SummarySectionProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['detailedSummary']);

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
      // Monthly
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let year = 2022; year <= 2025; year++) {
        for (const month of months) {
          cols.push(`${month}-${year.toString().slice(-2)}`);
        }
      }
    }
    return cols;
  }, [periodType]);


  // Total summary metrics
  const totalSummaryMetrics = [
    { metric: 'New Patients on Therapy', isItalic: false },
    { metric: 'Global LTD Discontinuation Rate %', isItalic: true },
    { metric: 'Discontinuations', isItalic: false },
    { metric: 'Cumulative Net Patients', isItalic: false },
    { metric: 'Gross Vials', isItalic: false },
    { metric: 'Total Adherent Vials', isItalic: false },
    { metric: 'Total Adherent Vials - Free of Charge', isItalic: false },
    { metric: 'Revised Total Adherent Vials', isItalic: false },
    { metric: 'Equivalized Total Adherent Vials (mg)', isItalic: false },
    { metric: 'Equivalized Total Adherent Vials (mg) - Free of Charge', isItalic: false },
    { metric: 'Equivalized Revised Total Adherent Vials (mg)', isItalic: false },
    { metric: 'Gross Revenue', isItalic: false },
    { metric: 'GTN %', isItalic: true },
    { metric: 'Net Revenue - Not Cap Adjusted', isItalic: false },
    { metric: 'Net Revenue', isItalic: false },
  ];

  // Detailed breakdown metrics (each has IV, SC, SC PFS, SC Autoinjector, Total)
  const detailedMetrics = [
    'Gross Vials',
    'Total Adherent Vials',
    'Total Adherent Vials - Free of Charge',
    'Revised Total Adherent Vials',
    'Equivalized Total Adherent Vials (mg)',
    'Equivalized Total Adherent Vials (mg) - Free of Charge',
    'Equivalized Revised Total Adherent Vials (mg)',
    'Gross Revenue',
    'Gross Revenue ($)',
    'GTN %',
    'Net Revenue - Not Cap Adjusted',
    'Net Revenue',
    'Net Revenue - Not Cap Adjusted ($)',
    'Net Revenue ($)',
  ];

  const subMetrics = ['IV', 'SC', 'SC PFS', 'SC Autoinjector', 'Total'];

  // Generate total summary row data - show "Total" only on middle row for vertical centering effect
  const totalSummaryRowData = useMemo(() => {
    const middleIndex = Math.floor(totalSummaryMetrics.length / 2);
    return totalSummaryMetrics.map((item, index) => {
      const row: { [key: string]: string } = { 
        category: index === middleIndex ? 'Total' : '',
        metric: item.metric,
        isItalic: item.isItalic ? 'true' : 'false',
        rowIndex: index.toString(),
        totalRows: totalSummaryMetrics.length.toString()
      };
      generateColumns.slice(0, 12).forEach(col => {
        row[col] = '-';
      });
      return row;
    });
  }, [generateColumns]);

  // Generate detailed breakdown row data - show category only on middle row for vertical centering
  const detailedBreakdownRowData = useMemo(() => {
    const rows: { [key: string]: string }[] = [];
    const middleSubIndex = Math.floor(subMetrics.length / 2);
    
    detailedMetrics.forEach(metric => {
      subMetrics.forEach((sub, index) => {
        const row: { [key: string]: string } = { 
          category: index === middleSubIndex ? metric : '', // Show category only on middle row
          subCategory: sub,
          isTotal: sub === 'Total' ? 'true' : 'false',
          isFirstInGroup: index === 0 ? 'true' : 'false',
          isMiddleInGroup: index === middleSubIndex ? 'true' : 'false'
        };
        generateColumns.slice(0, 12).forEach(col => {
          row[col] = '-';
        });
        rows.push(row);
      });
    });
    
    return rows;
  }, [generateColumns]);

  // Column defs for total summary
  const totalSummaryColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: 'category',
        headerName: '',
        pinned: 'left',
        width: 80,
        cellStyle: { fontWeight: 600, backgroundColor: '#f5f5f5' }
      },
      {
        field: 'metric',
        headerName: '',
        pinned: 'left',
        width: 280,
        cellStyle: (params) => ({
          fontStyle: params.data?.isItalic === 'true' ? 'italic' : 'normal',
          color: params.data?.isItalic === 'true' ? '#666' : '#000',
          backgroundColor: '#fff'
        })
      }
    ];

    generateColumns.slice(0, 12).forEach(col => {
      cols.push({
        field: col,
        headerName: col,
        width: 80,
        cellStyle: { textAlign: 'center' }
      });
    });

    return cols;
  }, [generateColumns]);

  // Column defs for detailed breakdown
  const detailedBreakdownColumnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: 'category',
        headerName: '',
        pinned: 'left',
        width: 280,
        cellStyle: { fontWeight: 500, backgroundColor: '#f5f5f5' }
      },
      {
        field: 'subCategory',
        headerName: '',
        pinned: 'left',
        width: 120,
        cellStyle: (params) => ({
          fontWeight: params.data?.isTotal === 'true' ? 600 : 400,
          fontStyle: params.data?.isTotal === 'true' ? 'italic' : 'normal',
          backgroundColor: params.data?.isTotal === 'true' ? '#e0e0e0' : '#fff'
        })
      }
    ];

    generateColumns.slice(0, 12).forEach(col => {
      cols.push({
        field: col,
        headerName: col,
        width: 80,
        cellStyle: (params) => ({
          textAlign: 'center',
          backgroundColor: params.data?.isTotal === 'true' ? '#e0e0e0' : '#fff'
        })
      });
    });

    return cols;
  }, [generateColumns]);

  const defaultColDef: ColDef = {
    sortable: false,
    filter: false,
    resizable: true,
    suppressMovable: true,
  };

  return (
    <div className="space-y-4">
      {/* Detailed Summary */}
      <CollapsibleSection
        id="detailedSummary"
        title="Detailed Summary"
        isExpanded={expandedSections.includes('detailedSummary')}
        onToggle={toggleSection}
        variant="primary"
      >
        <div className="p-4 space-y-6">
          {/* Currency Note */}
          <p className="text-sm italic text-muted-foreground">All currencies are in EUR</p>

          {/* Total Summary Table */}
          <div>
            <div 
              className="ag-theme-alpine" 
              style={{ width: '100%', height: 480 }}
            >
              <AgGridReact
                rowData={totalSummaryRowData}
                columnDefs={totalSummaryColumnDefs}
                defaultColDef={defaultColDef}
                suppressMovableColumns={true}
              />
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div>
            <div 
              className="ag-theme-alpine" 
              style={{ width: '100%', height: 600 }}
            >
              <AgGridReact
                rowData={detailedBreakdownRowData}
                columnDefs={detailedBreakdownColumnDefs}
                defaultColDef={defaultColDef}
                suppressMovableColumns={true}
                getRowStyle={(params) => {
                  if (params.data?.isTotal === 'true') {
                    return { backgroundColor: '#e0e0e0' };
                  }
                  return undefined;
                }}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default SummarySection;
