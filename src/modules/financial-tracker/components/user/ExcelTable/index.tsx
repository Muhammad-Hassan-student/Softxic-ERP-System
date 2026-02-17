'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useSocket } from '../../../hooks/useSocket';
import { usePermissions } from '../../../hooks/usePermission'; // Fixed: usePermissions (with 's')
import { useConcurrency } from '../../../hooks/useConcurrency';
import TableCell from './TableCell';
import TableHeader from './TableHeader';
import BlankRow from './BlankRow';
import { ICustomField } from '../../../models/custom-field.model';
import { IRecord } from '../../../models/record.model';

// ==================== TYPE DEFINITIONS ====================

// Module type
type ModuleType = 're' | 'expense';

// Frontend record type (without Mongoose document methods)
interface IRecordFrontend {
  _id: string;
  data: Record<string, any>;  // Plain object, not Map
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  module: ModuleType;
  entity: string;
}

// Socket event data interfaces
interface RecordCreatedEvent {
  recordId: string;
  data: Record<string, any>;
  version: number;
  createdBy: string;
  createdAt: string;
}

interface RecordUpdatedEvent {
  recordId: string;
  data: Record<string, any>;
  version: number;
  changes?: Array<{ field: string; oldValue: any; newValue: any }>;
}

interface RecordDeletedEvent {
  recordId: string;
}

// Conflict data for useConcurrency hook
interface ConflictData {
  recordId: string;
  latestRecord: Record<string, any>; // This matches what useConcurrency expects
  message: string;
}

// Props interface
interface ExcelTableProps {
  module: ModuleType;
  entity: string;
  fields: ICustomField[];
  initialRecords: IRecord[];
  totalCount: number;
  onSave: (recordId: string, data: Record<string, any>, version: number) => Promise<void>;
  onCreate: (data: Record<string, any>) => Promise<string>;
  onDelete: (recordId: string) => Promise<void>;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// ==================== CONVERTER FUNCTIONS ====================

/**
 * Convert IRecord (with Map) to IRecordFrontend (with plain object)
 */
const recordToFrontend = (record: IRecord): IRecordFrontend => {
  // Convert Map to plain object
  const dataObject: Record<string, any> = {};
  
  // Check if data exists and is a Map
  if (record.data && typeof (record.data as any).forEach === 'function') {
    (record.data as Map<string, any>).forEach((value, key) => {
      dataObject[key] = value;
    });
  }

  // Ensure module is the correct type
  const moduleValue = record.module as string;
  const typedModule: ModuleType = (moduleValue === 're' || moduleValue === 'expense') 
    ? moduleValue as ModuleType 
    : 're'; // Default to 're' if invalid

  return {
    _id: record._id?.toString() || '',
    data: dataObject,
    version: record.version || 1,
    status: record.status || 'draft',
    createdBy: record.createdBy?.toString() || '',
    updatedBy: record.updatedBy?.toString() || '',
    createdAt: record.createdAt?.toString() || new Date().toISOString(),
    updatedAt: record.updatedAt?.toString() || new Date().toISOString(),
    isDeleted: record.isDeleted || false,
    module: typedModule,
    entity: record.entity || ''
  };
};

/**
 * Convert array of IRecord to IRecordFrontend[]
 */
const recordsToFrontend = (records: IRecord[]): IRecordFrontend[] => {
  return records.map(recordToFrontend);
};

// ==================== MAIN COMPONENT ====================

const ExcelTable: React.FC<ExcelTableProps> = ({
  module,
  entity,
  fields,
  initialRecords,
  totalCount,
  onSave,
  onCreate,
  onDelete,
  hasMore = false,
  onLoadMore
}) => {
  // ==================== STATE ====================
  
  // Store records as frontend type (plain objects)
  const [records, setRecords] = useState<IRecordFrontend[]>(() => 
    recordsToFrontend(initialRecords)
  );
  
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    fieldKey: string;
  } | null>(null);
  
  const [pendingChanges, setPendingChanges] = useState<Map<string, Record<string, any>>>(new Map());
  
  // ==================== REFS ====================
  
  const tableRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // ==================== CUSTOM HOOKS ====================
  
  const { canCreate, canEdit, canDelete, canEditColumn } = usePermissions(module, entity);
  const { handleVersionConflict } = useConcurrency(module, entity);
  const { socket, isConnected } = useSocket(module, entity);

  // ==================== VIRTUALIZATION ====================
  
  const rowVirtualizer = useVirtualizer({
    count: records.length + 1, // +1 for blank row
    getScrollElement: () => tableRef.current,
    estimateSize: () => 45,
    overscan: 5
  });

  // ==================== DERIVED DATA ====================
  
  const visibleFields = React.useMemo(
    () =>
      fields
        .filter((f) => f.isEnabled && f.visible)
        .sort((a, b) => a.order - b.order),
    [fields]
  );

  const virtualRows = rowVirtualizer.getVirtualItems();

  // ==================== WEBSOCKET HANDLERS ====================
  
  useEffect(() => {
    if (!socket) return;

    const handleRecordCreated = (data: RecordCreatedEvent) => {
      setRecords((prev) => {
        // Check if record already exists (prevent duplicates)
        if (prev.some((r) => r._id === data.recordId)) {
          return prev;
        }

        const newRecord: IRecordFrontend = {
          _id: data.recordId,
          data: data.data,
          version: data.version,
          status: 'draft',
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          isDeleted: false,
          module: module,
          entity: entity
        };

        return [newRecord, ...prev];
      });
    };

    const handleRecordUpdated = (data: RecordUpdatedEvent) => {
      setRecords((prev) =>
        prev.map((r) =>
          r._id === data.recordId
            ? { ...r, data: data.data, version: data.version }
            : r
        )
      );
    };

    const handleRecordDeleted = (data: RecordDeletedEvent) => {
      setRecords((prev) => prev.filter((r) => r._id !== data.recordId));
    };

    // Fix: Transform the data to match what useConcurrency expects
    const handleVersionConflictEvent = (data: any) => {
      // Transform IRecordFrontend to Record<string, any>
      const conflictData: ConflictData = {
        recordId: data.recordId,
        latestRecord: data.latestRecord as Record<string, any>,
        message: data.message
      };
      handleVersionConflict(conflictData);
    };

    socket.on('recordCreated', handleRecordCreated);
    socket.on('recordUpdated', handleRecordUpdated);
    socket.on('recordDeleted', handleRecordDeleted);
    socket.on('versionConflict', handleVersionConflictEvent);

    return () => {
      socket.off('recordCreated', handleRecordCreated);
      socket.off('recordUpdated', handleRecordUpdated);
      socket.off('recordDeleted', handleRecordDeleted);
      socket.off('versionConflict', handleVersionConflictEvent);
    };
  }, [socket, handleVersionConflict, module, entity]);

  // Update records when initialRecords changes
  useEffect(() => {
    setRecords(recordsToFrontend(initialRecords));
  }, [initialRecords]);

  // ==================== SAVE HANDLERS ====================
  
  const debouncedSave = useCallback(
    (recordId: string, data: Record<string, any>, version: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        onSave(recordId, data, version).catch(console.error);
        setPendingChanges((prev) => {
          const next = new Map(prev);
          next.delete(recordId);
          return next;
        });
      }, 500);
    },
    [onSave]
  );

  const handleCellChange = useCallback(
    (recordId: string, fieldKey: string, value: any, version: number) => {
      setRecords((prev) =>
        prev.map((r) => {
          if (r._id === recordId) {
            const newData = { ...r.data, [fieldKey]: value };

            // Track pending changes
            setPendingChanges((p) => new Map(p).set(recordId, newData));

            // Debounced save
            debouncedSave(recordId, newData, version);

            return { ...r, data: newData };
          }
          return r;
        })
      );
    },
    [debouncedSave]
  );

  // ==================== ROW OPERATIONS ====================
  
  const handleCreateBlankRow = useCallback(
    async (data: Record<string, any>) => {
      try {
        await onCreate(data);
        // Record will be added via socket
      } catch (error) {
        console.error('Failed to create record:', error);
      }
    },
    [onCreate]
  );

  const handleDelete = useCallback(
    async (recordId: string) => {
      if (!canDelete) return;

      if (confirm('Are you sure you want to delete this record?')) {
        await onDelete(recordId);
      }
    },
    [canDelete, onDelete]
  );

  // ==================== KEYBOARD HANDLERS ====================
  
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      recordId: string,
      fieldKey: string,
      rowIndex: number,
      colIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        if (e.shiftKey) {
          // Move up
          if (rowIndex > 0) {
            const prevRecord = records[rowIndex - 1];
            if (prevRecord) {
              setEditingCell({
                recordId: prevRecord._id,
                fieldKey
              });
            }
          }
        } else {
          // Move down or create new
          if (rowIndex === records.length - 1 && canCreate) {
            // Last row, create new blank
            handleCreateBlankRow({});
          } else if (rowIndex < records.length - 1) {
            const nextRecord = records[rowIndex + 1];
            if (nextRecord) {
              setEditingCell({
                recordId: nextRecord._id,
                fieldKey
              });
            }
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();

        if (e.shiftKey) {
          // Move left
          if (colIndex > 0) {
            setEditingCell({
              recordId,
              fieldKey: visibleFields[colIndex - 1].fieldKey
            });
          }
        } else {
          // Move right
          if (colIndex < visibleFields.length - 1) {
            setEditingCell({
              recordId,
              fieldKey: visibleFields[colIndex + 1].fieldKey
            });
          }
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      } else if (e.key === 'Delete' && e.ctrlKey) {
        handleDelete(recordId);
      }
    },
    [records, canCreate, visibleFields, handleCreateBlankRow, handleDelete]
  );

  // ==================== RENDER ====================
  
  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="flex items-center justify-end px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="flex-1 overflow-auto border border-gray-200">
        <div
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          className="relative"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex bg-gray-100 border-b">
            {visibleFields.map((field) => (
              <TableHeader
                key={field.fieldKey}
                field={field}
                width={200}
              />
            ))}
            {canDelete && (
              <div className="w-16 px-4 py-2 text-sm font-medium text-gray-700 border-r">
                Actions
              </div>
            )}
          </div>

          {/* Rows */}
          {virtualRows.map((virtualRow: VirtualItem) => {
            const isBlankRow = virtualRow.index === records.length;
            const record = records[virtualRow.index];

            if (isBlankRow) {
              return canCreate ? (
                <BlankRow
                  key="blank"
                  fields={visibleFields}
                  virtualRow={virtualRow}
                  onCreate={handleCreateBlankRow}
                />
              ) : null;
            }

            if (!record) return null;

            return (
              <div
                key={record._id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`
                }}
                className="flex border-b hover:bg-gray-50"
              >
                {visibleFields.map((field, colIndex) => {
                  const isEditing =
                    editingCell?.recordId === record._id &&
                    editingCell?.fieldKey === field.fieldKey;
                  const canEditField = canEdit && canEditColumn(field.fieldKey);
                  const pendingValue = pendingChanges.get(record._id)?.[field.fieldKey];

                  return (
                    <TableCell
                      key={field.fieldKey}
                      field={field}
                      value={record.data[field.fieldKey]}
                      record={record}
                      isEditing={isEditing}
                      canEdit={canEditField}
                      pendingChanges={pendingValue}
                      onStartEdit={() =>
                        setEditingCell({
                          recordId: record._id,
                          fieldKey: field.fieldKey
                        })
                      }
                      onChange={(value: any) =>
                        handleCellChange(
                          record._id,
                          field.fieldKey,
                          value,
                          record.version
                        )
                      }
                      onKeyDown={(e: React.KeyboardEvent) =>
                        handleKeyDown(
                          e,
                          record._id,
                          field.fieldKey,
                          virtualRow.index,
                          colIndex
                        )
                      }
                    />
                  );
                })}

                {canDelete && (
                  <div className="w-16 px-4 py-2 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="text-red-600 hover:text-red-800"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="px-6 py-4 border-t text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            type="button"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ExcelTable;