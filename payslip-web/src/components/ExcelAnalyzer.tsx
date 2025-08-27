import React, { useState, useEffect } from 'react';
import { excelReader, CellData } from '../utils/excelReader';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Section = styled.div`
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 5px;
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
  font-size: 12px;
`;

interface Props {
  onAnalysisComplete?: (data: any) => void;
}

const ExcelAnalyzer: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [formulas, setFormulas] = useState<{ address: string; formula: string }[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [range, setRange] = useState<string>('');

  useEffect(() => {
    loadAndAnalyzeExcel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndAnalyzeExcel = async () => {
    try {
      setLoading(true);
      await excelReader.loadFile('/payslip.xlsx');
      
      const allCells = excelReader.getAllCells();
      const allFormulas = excelReader.getFormulas();
      const data = excelReader.getDataAsJson();
      const sheetRange = excelReader.getRange();
      
      setCells(allCells);
      setFormulas(allFormulas);
      setRawData(data);
      setRange(sheetRange);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          cells: allCells,
          formulas: allFormulas,
          data,
          range: sheetRange
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Container>Loading and analyzing Excel file...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <Container>
      <Title>Payslip Excel Analysis</Title>
      
      <Section>
        <Title>Sheet Information</Title>
        <p><strong>Range:</strong> {range}</p>
        <p><strong>Total Cells:</strong> {cells.length}</p>
        <p><strong>Formulas Found:</strong> {formulas.length}</p>
      </Section>

      <Section>
        <Title>Formulas</Title>
        {formulas.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Cell</th>
                <th>Formula</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map((formula, index) => (
                <tr key={index}>
                  <td>{formula.address}</td>
                  <td><code>{formula.formula}</code></td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No formulas found in the worksheet.</p>
        )}
      </Section>

      <Section>
        <Title>Cell Data (First 20 cells with values)</Title>
        <Table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Value</th>
              <th>Type</th>
              <th>Formula</th>
            </tr>
          </thead>
          <tbody>
            {cells.slice(0, 20).map((cell, index) => (
              <tr key={index}>
                <td>{cell.address}</td>
                <td>{String(cell.value)}</td>
                <td>{cell.type}</td>
                <td>{cell.formula ? <code>{cell.formula}</code> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Raw Data Structure</Title>
        <CodeBlock>
          {JSON.stringify(rawData.slice(0, 10), null, 2)}
        </CodeBlock>
      </Section>
    </Container>
  );
};

export default ExcelAnalyzer;