import { createTheme } from '@mui/material/styles';

// Create a theme that uses CSS variables from index.css
export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(174, 62%, 47%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(0, 0%, 96%)',
      contrastText: 'hsl(0, 0%, 15%)',
    },
    error: {
      main: 'hsl(0, 75%, 55%)',
      contrastText: '#ffffff',
    },
    warning: {
      main: 'hsl(38, 92%, 50%)',
      contrastText: '#ffffff',
    },
    success: {
      main: 'hsl(142, 76%, 36%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(0, 0%, 98%)',
      paper: 'hsl(0, 0%, 100%)',
    },
    text: {
      primary: 'hsl(0, 0%, 15%)',
      secondary: 'hsl(0, 0%, 45%)',
    },
    divider: 'hsl(0, 0%, 90%)',
  },
  typography: {
    fontFamily: 'inherit',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '0.5rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: 'hsl(0, 0%, 90%)',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          border: '1px solid hsl(0, 0%, 90%)',
          boxShadow: '0 2px 8px hsla(0, 0%, 0%, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            '& fieldset': {
              borderColor: 'hsl(0, 0%, 90%)',
            },
            '&:hover fieldset': {
              borderColor: 'hsl(174, 62%, 47%)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 40,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: 'hsl(174, 62%, 47%)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.75rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'hsl(0, 0%, 100%)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'hsl(0, 0%, 15%)',
          borderRadius: '0.375rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...muiTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: 'hsl(210, 75%, 55%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(215, 25%, 18%)',
      contrastText: 'hsl(210, 20%, 95%)',
    },
    error: {
      main: 'hsl(0, 75%, 60%)',
      contrastText: '#ffffff',
    },
    warning: {
      main: 'hsl(35, 90%, 60%)',
      contrastText: '#ffffff',
    },
    success: {
      main: 'hsl(145, 65%, 50%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(215, 30%, 8%)',
      paper: 'hsl(215, 25%, 12%)',
    },
    text: {
      primary: 'hsl(210, 20%, 95%)',
      secondary: 'hsl(215, 15%, 65%)',
    },
    divider: 'hsl(215, 25%, 20%)',
  },
});
