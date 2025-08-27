import React, { useState } from 'react';
import ExcelAnalyzer from './components/ExcelAnalyzer';
import PayslipGenerator from './components/PayslipGenerator';
import EnhancedPayslipGenerator from './components/EnhancedPayslipGenerator';
import TemplateBuilder from './components/TemplateBuilder';
import AdvancedPayslipGenerator from './components/AdvancedPayslipGenerator';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'analysis' | 'basic' | 'excel' | 'template' | 'advanced'>('analysis');

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    marginRight: '10px',
    marginBottom: '10px',
    backgroundColor: isActive ? '#1565c0' : '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const,
  });

  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        borderBottom: '1px solid #ccc', 
        backgroundColor: '#f8f9fa',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 20px 0', 
          color: '#1565c0',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🚀 Advanced Excel Payslip Platform
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <button 
            onClick={() => setCurrentView('analysis')}
            style={buttonStyle(currentView === 'analysis')}
            title="Analyze your Excel file structure and formulas"
          >
            📊 Analysis
          </button>
          
          <button 
            onClick={() => setCurrentView('template')}
            style={buttonStyle(currentView === 'template')}
            title="Build custom payslip templates with drag & drop"
          >
            🎨 Template Builder
          </button>
          
          <button 
            onClick={() => setCurrentView('advanced')}
            style={buttonStyle(currentView === 'advanced')}
            title="Multi-employee payslips with dynamic sections"
          >
            ⚡ Advanced Generator
          </button>
          
          <button 
            onClick={() => setCurrentView('excel')}
            style={buttonStyle(currentView === 'excel')}
            title="Excel-like grid interface"
          >
            📋 Excel View
          </button>
          
          <button 
            onClick={() => setCurrentView('basic')}
            style={buttonStyle(currentView === 'basic')}
            title="Simple form-based payslip"
          >
            📝 Basic View
          </button>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px 15px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px',
          fontSize: '14px',
          color: '#1565c0'
        }}>
          <strong>✨ New Features:</strong> 
          {currentView === 'template' && ' Expandable sections • Custom fields • Dynamic tables'}
          {currentView === 'advanced' && ' Multi-employee • Repeating sections • Bulk operations'}
          {currentView === 'excel' && ' Formula calculations • Real-time updates • Print ready'}
          {currentView === 'basic' && ' Simple interface • Quick setup • Easy editing'}
          {currentView === 'analysis' && ' Excel structure analysis • Formula parsing • Data extraction'}
        </div>
      </header>
      
      <div>
        {currentView === 'analysis' && (
          <ExcelAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        )}
        
        {currentView === 'template' && (
          <TemplateBuilder />
        )}
        
        {currentView === 'advanced' && (
          <AdvancedPayslipGenerator analysisData={analysisData} />
        )}
        
        {currentView === 'excel' && (
          <EnhancedPayslipGenerator analysisData={analysisData} />
        )}
        
        {currentView === 'basic' && (
          <PayslipGenerator analysisData={analysisData} />
        )}
      </div>
    </div>
  );
}

export default App;
