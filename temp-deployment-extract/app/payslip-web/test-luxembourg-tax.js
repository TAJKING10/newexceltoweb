// Quick test of Luxembourg tax calculations
const { LuxembourgTaxCalculator } = require('./src/utils/luxembourgTaxCalculator.ts');

// Test scenario: €5000 gross salary, single person, no children
console.log('=== Luxembourg Tax Calculator Test ===\n');

const testScenarios = [
  { salary: 3000, taxClass: 1, hasChildren: false, description: '€3,000 - Single, no children' },
  { salary: 5000, taxClass: 1, hasChildren: false, description: '€5,000 - Single, no children' },
  { salary: 5000, taxClass: 2, hasChildren: false, description: '€5,000 - Married, no children' },
  { salary: 5000, taxClass: 1, hasChildren: true, description: '€5,000 - Single parent with children' },
  { salary: 8000, taxClass: 1, hasChildren: false, description: '€8,000 - Single, no children (high earner)' },
];

testScenarios.forEach(scenario => {
  console.log(`📊 ${scenario.description}`);
  console.log('-'.repeat(50));
  
  try {
    const result = LuxembourgTaxCalculator.calculate({
      monthlyGrossSalary: scenario.salary,
      taxClass: scenario.taxClass,
      hasChildren: scenario.hasChildren,
      isOver65: false
    });
    
    console.log(`Gross Salary: €${scenario.salary.toLocaleString()}`);
    console.log(`Income Tax: €${result.incomeTax.toFixed(2)}`);
    console.log(`Social Security Contributions:`);
    console.log(`  - Sickness Insurance: €${result.socialSecurity.sickness.toFixed(2)}`);
    console.log(`  - Pension: €${result.socialSecurity.pension.toFixed(2)}`);
    console.log(`  - Dependency: €${result.socialSecurity.dependency.toFixed(2)}`);
    console.log(`  - Total: €${result.socialSecurity.total.toFixed(2)}`);
    console.log(`NET SALARY: €${result.netSalary.toFixed(2)}`);
    console.log(`Total Cost to Employer: €${result.totalCostToEmployer.toFixed(2)}`);
    
    // Calculate effective tax rate
    const effectiveRate = ((result.incomeTax + result.socialSecurity.total) / scenario.salary * 100);
    console.log(`Effective Tax Rate: ${effectiveRate.toFixed(1)}%`);
    
    console.log('\n');
  } catch (error) {
    console.error(`Error calculating taxes: ${error.message}\n`);
  }
});

console.log('✅ Luxembourg tax calculation test completed!');