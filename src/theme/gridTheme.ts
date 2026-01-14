// Grid Theme Configuration
// Centralized styling for all data grids in the application

export const gridTheme = {
  // Main section header (e.g., "Patient Conversion", "Volume Conversion")
  sectionHeader: {
    className: "bg-grid-section-primary text-grid-section-primary-foreground",
  },
  
  // Sub-section header (e.g., "Commercial patients", "Dosing Setup")
  subSectionHeader: {
    className: "bg-primary text-primary-foreground",
  },
  
  // Collapsible card with subsection grids
  subSectionCard: {
    className: "border-l-4 border-grid-section-border",
    headerClassName: "bg-grid-section-secondary text-grid-section-secondary-foreground",
  },
  
  // Cell styles for AG Grid
  cells: {
    // Input cells (editable, highlighted yellow)
    input: {
      backgroundColor: 'hsl(45, 100%, 88%)',
      textAlign: 'center' as const,
    },
    // Output cells (read-only, teal tint)
    output: {
      backgroundColor: 'hsl(174, 40%, 92%)',
      textAlign: 'center' as const,
    },
    // Header/label cells in grids
    header: {
      backgroundColor: 'hsl(174, 62%, 35%)',
      color: '#ffffff',
      fontWeight: 500,
    },
    // Default label column (pinned left)
    label: {
      fontWeight: 500,
      backgroundColor: '#ffffff',
    },
    // Center aligned text
    centered: {
      textAlign: 'center' as const,
    },
  },
  
  // MUI component styles (for sx prop)
  mui: {
    sectionCard: {
      backgroundColor: 'hsl(174, 62%, 47%)',
    },
    subSectionCard: {
      borderLeft: '4px solid hsl(174, 62%, 47%)',
    },
    subSectionHeader: {
      backgroundColor: 'hsl(174, 50%, 92%)',
    },
    button: {
      primary: {
        backgroundColor: 'hsl(174, 62%, 47%)',
        '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
      },
      outlined: {
        borderColor: 'hsl(174, 62%, 47%)',
        color: 'hsl(174, 62%, 47%)',
        '&:hover': {
          borderColor: 'hsl(174, 62%, 40%)',
          backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
        },
      },
    },
  },
};

export default gridTheme;
