import React, { useState } from 'react';
import ExcelAnalyzer from './components/ExcelAnalyzer';
import PayslipGenerator from './components/PayslipGenerator';
import EnhancedPayslipGenerator from './components/EnhancedPayslipGenerator';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(true);
  const [useEnhanced, setUseEnhanced] = useState(true);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
        <h1 style={{ margin: '0 0 15px 0', color: '#1565c0' }}>Excel Payslip to Web Converter</h1>
        <div>
          <button 
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              backgroundColor: showAnalyzer ? '#007bff' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showAnalyzer ? 'Show Payslip' : 'Show Analysis'}
          </button>
          
          {!showAnalyzer && (
            <button 
              onClick={() => setUseEnhanced(!useEnhanced)}
              style={{ 
                padding: '10px 20px', 
                marginRight: '10px',
                backgroundColor: useEnhanced ? '#ff9800' : '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {useEnhanced ? 'Basic View' : 'Excel View'}
            </button>
          )}
        </div>
      </header>
      
      {showAnalyzer ? (
        <ExcelAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <div>
          {useEnhanced ? (
            <EnhancedPayslipGenerator analysisData={analysisData} />
          ) : (
            <PayslipGenerator analysisData={analysisData} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
