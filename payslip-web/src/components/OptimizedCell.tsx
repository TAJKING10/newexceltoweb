import React, { memo, useState, useCallback } from 'react';
import styled from 'styled-components';

interface OptimizedCellProps {
  value: number;
  monthIndex: number;
  rowName: string;
  isCalculated: boolean;
  onCellChange: (monthIndex: number, rowName: string, value: string) => void;
  onCellCommit: (monthIndex: number, rowName: string, value: string) => void;
}

const CellContainer = styled.div<{ isEditable: boolean; isCalculated: boolean }>`
  background-color: ${props => 
    props.isCalculated ? '#f2f2f2' : 
    props.isEditable ? 'white' : '#fafafa'
  };
  color: #333;
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-weight: ${props => props.isCalculated ? 'bold' : 'normal'};
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  &:hover {
    background-color: ${props => props.isEditable ? '#e3f2fd' : 'inherit'};
  }
`;

const CellInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  text-align: center;
  color: inherit;
  
  &:focus {
    outline: 2px solid #1976d2;
    background-color: white;
    color: #333;
  }
`;

const OptimizedCell = memo<OptimizedCellProps>(({
  value,
  monthIndex,
  rowName,
  isCalculated,
  onCellChange,
  onCellCommit
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);
    
    // Only update parent on valid numbers or empty string
    if (newValue === '' || !isNaN(parseFloat(newValue))) {
      onCellChange(monthIndex, rowName, newValue);
    }
  }, [monthIndex, rowName, onCellChange]);

  const handleBlur = useCallback(() => {
    if (isDirty) {
      onCellCommit(monthIndex, rowName, localValue);
      setIsDirty(false);
    }
  }, [isDirty, monthIndex, rowName, localValue, onCellCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  // Update local value when prop changes (from calculations)
  React.useEffect(() => {
    if (!isDirty) {
      setLocalValue(value.toString());
    }
  }, [value, isDirty]);

  if (isCalculated) {
    return (
      <CellContainer isEditable={false} isCalculated={true}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <span>€{value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          <span style={{
            fontSize: '10px',
            color: '#4caf50',
            fontWeight: 'bold'
          }}>🇱🇺</span>
        </div>
      </CellContainer>
    );
  }

  return (
    <CellContainer isEditable={true} isCalculated={false}>
      <CellInput
        type="number"
        step="0.01"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="0.00"
      />
    </CellContainer>
  );
});

OptimizedCell.displayName = 'OptimizedCell';

export default OptimizedCell;