'use client';

import React, { useState } from 'react';
import { ICustomField } from '../../../models/custom-field.model';

interface BlankRowProps {
  fields: ICustomField[];
  virtualRow: any;
  onCreate: (data: Record<string, any>) => Promise<void>;
}

const BlankRow: React.FC<BlankRowProps> = ({
  fields,
  virtualRow,
  onCreate
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const handleKeyDown = async (e: React.KeyboardEvent, fieldKey: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if all required fields are filled
      const requiredFields = fields.filter(f => f.required);
      const missingFields = requiredFields.filter(f => !data[f.fieldKey]);
      
      if (missingFields.length > 0) {
        alert(`Please fill required fields: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }

      setIsCreating(true);
      try {
        await onCreate(data);
        setData({}); // Reset for next row
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleChange = (fieldKey: string, value: any) => {
    setData(prev => ({ ...prev, [fieldKey]: value }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualRow.start}px)`
      }}
      className="flex border-b bg-green-50"
    >
      {fields.map(field => (
        <div
          key={field.fieldKey}
          className="flex-1 min-w-[200px] px-4 py-2 border-r"
          style={{ width: 200 }}
        >
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={data[field.fieldKey] || ''}
            onChange={(e) => handleChange(
              field.fieldKey,
              field.type === 'number' ? Number(e.target.value) : e.target.value
            )}
            onKeyDown={(e) => handleKeyDown(e, field.fieldKey)}
            placeholder={field.label}
            disabled={isCreating}
            className="w-full bg-transparent outline-none placeholder-gray-400"
            autoFocus={fields[0]?.fieldKey === field.fieldKey}
          />
        </div>
      ))}
      <div className="w-16 px-4 py-2 text-xs text-gray-500">
        {isCreating ? 'Creating...' : 'New Row'}
      </div>
    </div>
  );
};

export default BlankRow;