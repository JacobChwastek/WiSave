import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const WiSaveTheme = definePreset(Aura, {
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            secondary: {
              background: 'var(--color-secondary-100)',
              hoverBackground: 'var(--color-secondary-200)',
              activeBackground: 'var(--color-secondary-300)',
              borderColor: 'var(--color-divider)',
              hoverBorderColor: 'var(--color-secondary-400)',
              color: 'var(--color-secondary-700)',
              hoverColor: 'var(--color-secondary-800)',
              activeColor: 'var(--color-secondary-900)',
            },
            success: {
              background: 'var(--color-accent-500)',
              hoverBackground: 'var(--color-accent-600)',
              activeBackground: 'var(--color-accent-700)',
              borderColor: 'var(--color-accent-500)',
              hoverBorderColor: 'var(--color-accent-600)',
              color: 'var(--color-secondary-50)',
              hoverColor: 'var(--color-secondary-50)',
              activeColor: 'var(--color-secondary-50)',
            },
          },
          outlined: {
            secondary: {
              hoverBackground: 'var(--color-secondary-100)',
              activeBackground: 'var(--color-secondary-200)',
              borderColor: 'var(--color-divider)',
              color: 'var(--color-secondary-700)',
            },
            success: {
              hoverBackground: 'rgba(194, 120, 20, 0.1)',
              activeBackground: 'rgba(194, 120, 20, 0.2)',
              borderColor: 'var(--color-accent-600)',
              color: 'var(--color-accent-700)',
            },
          },
          text: {
            secondary: {
              hoverBackground: 'var(--color-secondary-100)',
              activeBackground: 'var(--color-secondary-200)',
              color: 'var(--color-secondary-600)',
            },
            success: {
              hoverBackground: 'rgba(194, 120, 20, 0.1)',
              activeBackground: 'rgba(194, 120, 20, 0.2)',
              color: 'var(--color-accent-700)',
            },
          },
        },
        dark: {
          root: {
            secondary: {
              background: 'transparent',
              hoverBackground: 'var(--color-dark-primary-700)',
              activeBackground: 'var(--color-dark-primary-600)',
              borderColor: 'var(--color-dark-primary-500)',
              hoverBorderColor: 'var(--color-dark-primary-400)',
              color: 'var(--color-dark-secondary-100)',
              hoverColor: 'var(--color-dark-secondary-50)',
              activeColor: 'var(--color-dark-secondary-50)',
            },
            success: {
              background: 'var(--color-accent-500)',
              hoverBackground: 'var(--color-accent-600)',
              activeBackground: 'var(--color-accent-700)',
              borderColor: 'var(--color-accent-500)',
              hoverBorderColor: 'var(--color-accent-600)',
              color: 'var(--color-dark-primary-950)',
              hoverColor: 'var(--color-dark-primary-950)',
              activeColor: 'var(--color-dark-primary-950)',
            },
          },
          outlined: {
            secondary: {
              hoverBackground: 'var(--color-dark-primary-700)',
              activeBackground: 'var(--color-dark-primary-600)',
              borderColor: 'var(--color-dark-primary-400)',
              color: 'var(--color-dark-secondary-100)',
            },
            success: {
              hoverBackground: 'rgba(234, 170, 50, 0.12)',
              activeBackground: 'rgba(234, 170, 50, 0.2)',
              borderColor: 'var(--color-accent-500)',
              color: 'var(--color-accent-400)',
            },
          },
          text: {
            secondary: {
              hoverBackground: 'var(--color-dark-primary-700)',
              activeBackground: 'var(--color-dark-primary-600)',
              color: 'var(--color-dark-secondary-200)',
            },
            success: {
              hoverBackground: 'rgba(234, 170, 50, 0.15)',
              activeBackground: 'rgba(234, 170, 50, 0.25)',
              color: 'var(--color-accent-400)',
            },
          },
        },
      },
    },
    inputtext: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-secondary-50)',
            disabledBackground: 'var(--color-secondary-100)',
            filledBackground: 'var(--color-secondary-50)',
            filledHoverBackground: 'var(--color-secondary-100)',
            filledFocusBackground: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            hoverBorderColor: 'var(--color-secondary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            invalidBorderColor: '#ef4444',
            color: 'var(--color-secondary-900)',
            disabledColor: 'var(--color-secondary-400)',
            placeholderColor: 'var(--color-secondary-400)',
            invalidPlaceholderColor: '#f87171',
            shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        },
        dark: {
          root: {
            background: 'var(--color-dark-primary-900)',
            disabledBackground: 'var(--color-dark-primary-800)',
            filledBackground: 'var(--color-dark-primary-800)',
            filledHoverBackground: 'var(--color-dark-primary-700)',
            filledFocusBackground: 'var(--color-dark-primary-700)',
            borderColor: 'var(--color-dark-primary-500)',
            hoverBorderColor: 'var(--color-dark-primary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            invalidBorderColor: '#ef4444',
            color: 'var(--color-dark-secondary-50)',
            disabledColor: 'var(--color-dark-secondary-400)',
            placeholderColor: 'var(--color-dark-secondary-400)',
            invalidPlaceholderColor: '#fca5a5',
            shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  
    textarea: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            hoverBorderColor: 'var(--color-secondary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            color: 'var(--color-secondary-900)',
            placeholderColor: 'var(--color-secondary-400)',
          },
        },
        dark: {
          root: {
            background: 'var(--color-dark-primary-900)',
            borderColor: 'var(--color-dark-primary-500)',
            hoverBorderColor: 'var(--color-dark-primary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            color: 'var(--color-dark-secondary-50)',
            placeholderColor: 'var(--color-dark-secondary-400)',
          },
        },
      },
    },
    select: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-secondary-50)',
            disabledBackground: 'var(--color-secondary-100)',
            borderColor: 'var(--color-divider)',
            hoverBorderColor: 'var(--color-secondary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            invalidBorderColor: '#ef4444',
            color: 'var(--color-secondary-900)',
            disabledColor: 'var(--color-secondary-400)',
            placeholderColor: 'var(--color-secondary-400)',
            shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
          dropdown: {
            color: 'var(--color-secondary-500)',
          },
          overlay: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-800)',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          },
          option: {
            focusBackground: 'var(--color-secondary-100)',
            selectedBackground: 'var(--color-accent-500)',
            selectedFocusBackground: 'var(--color-accent-600)',
            color: 'var(--color-secondary-800)',
            focusColor: 'var(--color-secondary-900)',
            selectedColor: 'var(--color-secondary-50)',
            selectedFocusColor: 'var(--color-secondary-50)',
          },
          optionGroup: {
            background: 'var(--color-secondary-50)',
            color: 'var(--color-secondary-600)',
          },
          clearIcon: {
            color: 'var(--color-secondary-400)',
          },
        },
        dark: {
          root: {
            background: 'var(--color-dark-primary-900)',
            disabledBackground: 'var(--color-dark-primary-800)',
            borderColor: 'var(--color-dark-primary-500)',
            hoverBorderColor: 'var(--color-dark-primary-400)',
            focusBorderColor: 'var(--color-accent-500)',
            invalidBorderColor: '#ef4444',
            color: 'var(--color-dark-secondary-50)',
            disabledColor: 'var(--color-dark-secondary-400)',
            placeholderColor: 'var(--color-dark-secondary-400)',
            shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          },
          dropdown: {
            color: 'var(--color-dark-secondary-200)',
          },
          overlay: {
            background: 'var(--color-dark-primary-800)',
            borderColor: 'var(--color-dark-divider-strong)',
            color: 'var(--color-dark-secondary-100)',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
          },
          option: {
            focusBackground: 'var(--color-dark-primary-700)',
            selectedBackground: 'var(--color-accent-600)',
            selectedFocusBackground: 'var(--color-accent-500)',
            color: 'var(--color-dark-secondary-100)',
            focusColor: 'var(--color-dark-secondary-50)',
            selectedColor: 'var(--color-dark-primary-950)',
            selectedFocusColor: 'var(--color-dark-primary-950)',
          },
          optionGroup: {
            background: 'var(--color-dark-primary-800)',
            color: 'var(--color-dark-secondary-300)',
          },
          clearIcon: {
            color: 'var(--color-dark-secondary-300)',
          },
        },
      },
    },
    datepicker: {
      colorScheme: {
        light: {
          panel: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-800)',
            shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          },
          header: {
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-900)',
          },
          dropdown: {
            background: 'var(--color-secondary-100)',
            color: 'var(--color-secondary-700)',
          },
          date: {
            hoverBackground: 'var(--color-secondary-100)',
            selectedBackground: 'var(--color-accent-500)',
            rangeSelectedBackground: 'var(--color-accent-400)',
            color: 'var(--color-secondary-800)',
            hoverColor: 'var(--color-secondary-900)',
            selectedColor: 'var(--color-secondary-50)',
            rangeSelectedColor: 'var(--color-secondary-50)',
          },
          buttonbar: {
            borderColor: 'var(--color-divider)',
          },
          timePicker: {
            borderColor: 'var(--color-divider)',
          },
        },
        dark: {
          panel: {
            background: 'var(--color-dark-primary-800)',
            borderColor: 'var(--color-dark-divider-strong)',
            color: 'var(--color-dark-secondary-100)',
            shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
          },
          header: {
            background: 'var(--color-dark-primary-900)',
            borderColor: 'var(--color-dark-divider-strong)',
            color: 'var(--color-dark-secondary-50)',
          },
          dropdown: {
            background: 'var(--color-dark-primary-700)',
            color: 'var(--color-dark-secondary-100)',
          },
          date: {
            hoverBackground: 'var(--color-dark-primary-700)',
            selectedBackground: 'var(--color-accent-500)',
            rangeSelectedBackground: 'var(--color-accent-600)',
            color: 'var(--color-dark-secondary-100)',
            hoverColor: 'var(--color-dark-secondary-50)',
            selectedColor: 'var(--color-dark-primary-950)',
            rangeSelectedColor: 'var(--color-dark-primary-950)',
          },
          buttonbar: {
            borderColor: 'var(--color-dark-divider-strong)',
          },
          timePicker: {
            borderColor: 'var(--color-dark-divider-strong)',
          },
        },
      },
    },
    chip: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-secondary-100)',
            color: 'var(--color-secondary-700)',
            borderRadius: '0.375rem',
          },
          icon: {
            color: 'var(--color-secondary-500)',
          },
          removeIcon: {
            color: 'var(--color-secondary-400)',
          },
        },
        dark: {
          root: {
            background: 'var(--color-dark-primary-700)',
            color: 'var(--color-dark-secondary-100)',
            borderRadius: '0.375rem',
          },
          icon: {
            color: 'var(--color-dark-secondary-200)',
          },
          removeIcon: {
            color: 'var(--color-dark-secondary-300)',
          },
        },
      },
    },
    iconfield: {
      colorScheme: {
        light: {
          icon: {
            color: 'var(--color-secondary-400)',
          },
        },
        dark: {
          icon: {
            color: 'var(--color-dark-secondary-400)',
          },
        },
      },
    },
    paginator: {
      colorScheme: {
        light: {
          root: {
            background: 'var(--color-secondary-50)',
            color: 'var(--color-secondary-600)',
          },
          navButton: {
            width: '1.75rem',
            height: '1.75rem',
            background: 'transparent',
            hoverBackground: 'var(--color-secondary-100)',
            selectedBackground: 'var(--color-accent-500)',
            color: 'var(--color-secondary-600)',
            hoverColor: 'var(--color-secondary-800)',
            selectedColor: 'var(--color-secondary-50)',
            borderRadius: '0.375rem',
          },
        },
        dark: {
          root: {
            background: 'var(--color-dark-primary-900)',
            color: 'var(--color-dark-secondary-200)',
          },
          navButton: {
            width: '1.75rem',
            height: '1.75rem',
            background: 'transparent',
            hoverBackground: 'var(--color-dark-primary-700)',
            selectedBackground: 'var(--color-accent-600)',
            color: 'var(--color-dark-secondary-200)',
            hoverColor: 'var(--color-dark-secondary-50)',
            selectedColor: 'var(--color-dark-primary-950)',
            borderRadius: '0.375rem',
          },
        },
      },
    },
    datatable: {
      colorScheme: {
        light: {
          root: {
            borderColor: 'var(--color-divider)',
          },
          header: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-900)',
            padding: '1rem 1.25rem',
          },
          headerCell: {
            background: 'var(--color-secondary-50)',
            hoverBackground: 'var(--color-secondary-100)',
            selectedBackground: 'var(--color-secondary-200)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-700)',
            hoverColor: 'var(--color-secondary-900)',
            selectedColor: 'var(--color-accent-700)',
            padding: '0.875rem 1rem',
            focusRing: {
              width: '2px',
              style: 'solid',
              color: 'var(--color-accent-500)',
              offset: '-2px',
            },
          },
          columnTitle: {
            fontWeight: '600',
          },
          row: {
            background: 'var(--color-secondary-50)',
            hoverBackground: 'var(--color-secondary-50)',
            selectedBackground: 'rgba(194, 120, 20, 0.08)',
            color: 'var(--color-secondary-800)',
            hoverColor: 'var(--color-secondary-900)',
            selectedColor: 'var(--color-secondary-900)',
            stripedBackground: 'var(--color-secondary-50)',
            focusRing: {
              width: '0',
              style: 'none',
              color: 'transparent',
              offset: '0',
            },
          },
          bodyCell: {
            borderColor: 'var(--color-secondary-100)',
            padding: '0.875rem 1rem',
            selectedBorderColor: 'var(--color-accent-500)',
          },
          footerCell: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-700)',
            padding: '0.875rem 1rem',
          },
          columnFooter: {
            fontWeight: '600',
          },
          footer: {
            background: 'var(--color-secondary-50)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-secondary-700)',
            padding: '1rem 1.25rem',
          },
          rowToggleButton: {
            hoverBackground: 'var(--color-secondary-100)',
            selectedHoverBackground: 'var(--color-secondary-200)',
            color: 'var(--color-secondary-500)',
            hoverColor: 'var(--color-secondary-800)',
            selectedHoverColor: 'var(--color-accent-600)',
            size: '2rem',
            borderRadius: '50%',
          },
          sortIcon: {
            color: 'var(--color-secondary-400)',
            hoverColor: 'var(--color-secondary-700)',
            size: '0.875rem',
          },
          loadingIcon: {
            size: '2rem',
          },
          filter: {
            inlineGap: '0.5rem',
            overlaySelect: {
              background: 'var(--color-secondary-50)',
              borderColor: 'var(--color-divider)',
              color: 'var(--color-secondary-700)',
            },
            rule: {
              borderColor: 'var(--color-divider)',
            },
            constraintList: {
              padding: '0.5rem',
              gap: '0.25rem',
            },
            constraint: {
              focusBackground: 'var(--color-secondary-100)',
              selectedBackground: 'var(--color-accent-500)',
              selectedFocusBackground: 'var(--color-accent-600)',
              color: 'var(--color-secondary-700)',
              focusColor: 'var(--color-secondary-900)',
              selectedColor: 'var(--color-secondary-50)',
              selectedFocusColor: 'var(--color-secondary-50)',
              separator: {
                borderColor: 'var(--color-divider)',
              },
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
            },
          },
          paginatorTop: {
            borderColor: 'transparent',
          },
          paginatorBottom: {
            borderColor: 'transparent',
          },
        },
        dark: {
          root: {
            borderColor: 'var(--color-dark-divider)',
          },
          header: {
            background: 'var(--color-dark-primary-900)',
            borderColor: 'var(--color-dark-divider)',
            color: 'var(--color-dark-secondary-50)',
            padding: '1rem 1.25rem',
          },
          headerCell: {
            background: 'var(--color-dark-primary-850)',
            hoverBackground: 'var(--color-dark-primary-750)',
            selectedBackground: 'var(--color-dark-primary-700)',
            borderColor: 'var(--color-dark-divider)',
            color: 'var(--color-dark-secondary-100)',
            hoverColor: 'var(--color-dark-secondary-50)',
            selectedColor: 'var(--color-accent-400)',
            padding: '0.875rem 1rem',
            focusRing: {
              width: '2px',
              style: 'solid',
              color: 'var(--color-accent-500)',
              offset: '-2px',
            },
          },
          columnTitle: {
            fontWeight: '600',
          },
          row: {
            background: 'var(--color-dark-primary-800)',
            hoverBackground: 'var(--color-dark-primary-750)',
            selectedBackground: 'hsla(35, 74%, 49%, 0.12)',
            color: 'var(--color-dark-secondary-100)',
            hoverColor: 'var(--color-dark-secondary-50)',
            selectedColor: 'var(--color-dark-secondary-50)',
            stripedBackground: 'var(--color-dark-primary-850)',
            focusRing: {
              width: '0',
              style: 'none',
              color: 'transparent',
              offset: '0',
            },
          },
          bodyCell: {
            borderColor: 'var(--color-dark-divider)',
            padding: '0.875rem 1rem',
            selectedBorderColor: 'var(--color-accent-600)',
          },
          footerCell: {
            background: 'var(--color-dark-primary-850)',
            borderColor: 'var(--color-dark-divider)',
            color: 'var(--color-dark-secondary-100)',
            padding: '0.875rem 1rem',
          },
          columnFooter: {
            fontWeight: '600',
          },
          footer: {
            background: 'var(--color-dark-primary-900)',
            borderColor: 'var(--color-dark-divider)',
            color: 'var(--color-dark-secondary-100)',
            padding: '1rem 1.25rem',
          },
          rowToggleButton: {
            hoverBackground: 'var(--color-dark-primary-700)',
            selectedHoverBackground: 'var(--color-dark-primary-600)',
            color: 'var(--color-dark-secondary-200)',
            hoverColor: 'var(--color-dark-secondary-50)',
            selectedHoverColor: 'var(--color-accent-400)',
            size: '2rem',
            borderRadius: '50%',
          },
          sortIcon: {
            color: 'var(--color-dark-secondary-400)',
            hoverColor: 'var(--color-dark-secondary-100)',
            size: '0.875rem',
          },
          loadingIcon: {
            size: '2rem',
          },
          filter: {
            inlineGap: '0.5rem',
            overlaySelect: {
              background: 'var(--color-dark-primary-800)',
              borderColor: 'var(--color-dark-divider-strong)',
              color: 'var(--color-dark-secondary-100)',
            },
            rule: {
              borderColor: 'var(--color-dark-divider-strong)',
            },
            constraintList: {
              padding: '0.5rem',
              gap: '0.25rem',
            },
            constraint: {
              focusBackground: 'var(--color-dark-primary-700)',
              selectedBackground: 'var(--color-accent-500)',
              selectedFocusBackground: 'var(--color-accent-600)',
              color: 'var(--color-dark-secondary-100)',
              focusColor: 'var(--color-dark-secondary-50)',
              selectedColor: 'var(--color-dark-primary-950)',
              selectedFocusColor: 'var(--color-dark-primary-950)',
              separator: {
                borderColor: 'var(--color-dark-divider-strong)',
              },
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
            },
          },
          paginatorTop: {
            borderColor: 'transparent',
          },
          paginatorBottom: {
            borderColor: 'transparent',
          },
        },
      },
    },
    divider: {
      colorScheme: {
        light: {
          root: {
            borderColor: 'var(--color-divider)',
          },
          content: {
            background: 'var(--color-secondary-50)',
            color: 'var(--color-secondary-600)',
          },
        },
        dark: {
          root: {
            borderColor: 'var(--color-dark-divider)',
          },
          content: {
            background: 'var(--color-dark-primary-800)',
            color: 'var(--color-dark-secondary-300)',
          },
        },
      },
    },
    buttongroup: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '0.5rem',
          },
        },
        dark: {
          root: {
            borderRadius: '0.5rem',
          },
        },
      },
    },
  },
  semantic: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
      950: 'var(--color-primary-950)',
    },
    colorScheme: {
      light: {
        primary: {
          color: 'var(--color-primary-500)',
          contrastColor: 'var(--color-secondary-900)',
          hoverColor: 'var(--color-primary-600)',
          activeColor: 'var(--color-primary-700)',
        },
      },
      dark: {
        primary: {         
           50: '#e7e9ec',
          100: '#c2c8d2',
          200: '#9ea9ba',
          300: '#7a8aa2',
          400: '#475b7f',
          500: '#14213d',
          600: '#111c34',
          700: '#0e172b',
          800: '#0b1222',
          900: '#080d19',
          950: '#04060d',
          color: '#14213d',
          contrastColor: 'var(--color-secondary-50)',
          hoverColor: '#1d2e54',
          activeColor: '#263b6b',
        },
      },
    },
  },
  primitive: {},
});

export default WiSaveTheme;
