// Professional ERP color scheme
export const COLORS = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Gray scale (sidebar uses 800-900)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937', // Sidebar dark gray
    900: '#111827', // Sidebar darker gray
  },
  
  // Status colors
  success: {
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    500: '#3b82f6',
    600: '#2563eb',
  },
  
  // Backgrounds
  background: {
    light: '#ffffff',
    dark: '#111827',
    card: '#ffffff',
    sidebar: '#1f2937', // Dark gray sidebar
  },
  
  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af',
    inverted: '#ffffff',
  },
  
  // Borders
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#4b5563',
  },
} as const;

export type ColorTheme = typeof COLORS;