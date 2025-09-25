# Excel Payslip to Web Converter

A React.js application that converts Excel payslip functionality into a fully functional web application. This project reads Excel files, analyzes their structure and formulas, and creates an interactive web-based payslip generator with the same calculations and functionality.

## Features

### 🔥 Core Functionality
- **Excel File Analysis**: Automatically reads and analyzes Excel files to understand structure and formulas
- **Formula Conversion**: Converts Excel formulas to JavaScript for real-time calculations
- **Interactive Grid**: Excel-like grid interface for editing payslip data
- **Real-time Calculations**: Automatic calculation of derived values (taxes, deductions, net salary)
- **Print Support**: Professional print layout for generating physical payslips
- **Data Export**: Save payslip data as JSON for backup or integration

### 💼 Payslip Features
- Employee information management
- Multiple salary components (basic salary, allowances, overtime)
- Automatic tax calculations
- Social security deductions
- Health insurance and other deductions
- Gross and net salary calculations
- Professional payslip layout

### 🎨 User Interface
- **Excel View**: Grid-based interface that mimics Excel appearance
- **Basic View**: Traditional form-based interface
- **Analysis View**: Shows Excel file structure, formulas, and cell data
- Print-optimized styling
- Responsive design

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Styled-components with CSS Grid
- **Excel Processing**: SheetJS (xlsx library)
- **Formula Parsing**: Custom JavaScript formula parser
- **Build Tool**: Create React App

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:8080](http://localhost:8080) to view the application.

## Usage

### 1. Excel File Analysis
- The application automatically loads and analyzes the `payslip.xlsx` file
- View the structure, formulas, and data in the Analysis tab
- Understand how Excel calculations are converted to JavaScript

### 2. Payslip Generation
- Switch to the Payslip view to start generating payslips
- Choose between Excel View (grid-based) and Basic View (form-based)
- Edit employee information and salary components
- Watch calculations update in real-time

### 3. Printing and Export
- Use the Print button for professional payslip printing
- Save data as JSON for backup or integration with other systems
- Print layout automatically optimizes for paper output

## Formula Support

The application supports common Excel formulas including:
- **SUM**: Addition of ranges or individual cells
- **Basic Arithmetic**: +, -, *, /, ^ (exponentiation)
- **Percentage Calculations**: Tax rates, social security
- **Conditional Logic**: IF statements (basic support)

### Example Formulas Converted:
```excel
=B10+B11+B12+B13+B14  → Gross Salary Calculation
=B15*0.15              → Income Tax (15% of gross)
=B10*0.07              → Social Security (7% of basic)
=B15-B22               → Net Salary (Gross - Deductions)
```

## Available Scripts

### `npm start`
Runs the app in development mode on port 8080.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
