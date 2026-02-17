// Export all hooks for easy importing
export * from './usePermission';
export * from './useSocket';
export * from './useConcurrency';
export * from './useRecord';           // Fixed: useRecords (not useRecord)
export * from './useField';             // Fixed: useFields (not useField)
export * from './useDashboard';
export * from './useExport';
export * from './useActivityLog';
export * from './useApproval';

// Re-export types
export type { 
  PermissionScope 
} from './usePermission';

export type { 
  ConflictData 
} from './useConcurrency';

export type { 
  IRecord                                // Fixed: IRecord (not Record)
} from './useRecord';

export type { 
  Field                                  // Fixed: Field (from useFields)
} from './useField';

export type { 
  DashboardStats, 
  CalendarData, 
  DateRange 
} from './useDashboard';

export type { 
  ActivityLog, 
  ActivityFilters 
} from './useActivityLog';

export type { 
  ApprovalRequest 
} from './useApproval';