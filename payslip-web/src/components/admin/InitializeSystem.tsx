import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

const Container = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
  max-width: 600px;
  margin: ${theme.spacing[4]} auto;
`;

const Title = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-align: center;
`;

const Description = styled.p`
  margin: 0 0 ${theme.spacing[6]} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  width: 100%;
  margin-bottom: ${theme.spacing[3]};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary};
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.md}; }
        `;
      default:
        return `
          background: white;
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border.light};
          &:hover { background: ${theme.colors.background.secondary}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover { transform: none; }
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.sm};
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `background: ${theme.colors.success.light}20; color: ${theme.colors.success.dark}; border: 1px solid ${theme.colors.success.light};`;
      case 'error':
        return `background: ${theme.colors.error.light}20; color: ${theme.colors.error.dark}; border: 1px solid ${theme.colors.error.light};`;
      default:
        return `background: ${theme.colors.primary.light}20; color: ${theme.colors.primary.dark}; border: 1px solid ${theme.colors.primary.light};`;
    }
  }}
`;

export const InitializeSystem: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const defaultTemplates = [
    {
      name: 'Standard Payslip Template',
      description: 'Professional standard payslip template with all essential fields including employee information, earnings, deductions, and net pay calculation.',
      is_default: true,
      template_data: {
        sections: [
          {
            id: 'header',
            type: 'header',
            title: 'PAYSLIP',
            fields: [
              { id: 'company_name', label: 'Company Name', type: 'text', value: 'Your Company Name' },
              { id: 'company_address', label: 'Company Address', type: 'textarea', value: 'Company Address\nCity, Country' },
              { id: 'pay_period', label: 'Pay Period', type: 'text', value: 'Monthly' }
            ]
          },
          {
            id: 'employee_info',
            type: 'section',
            title: 'Employee Information',
            fields: [
              { id: 'employee_name', label: 'Employee Name', type: 'text', required: true },
              { id: 'employee_id', label: 'Employee ID', type: 'text', required: true },
              { id: 'department', label: 'Department', type: 'text' },
              { id: 'position', label: 'Position', type: 'text' },
              { id: 'hire_date', label: 'Hire Date', type: 'date' }
            ]
          },
          {
            id: 'earnings',
            type: 'section',
            title: 'Earnings',
            fields: [
              { id: 'basic_salary', label: 'Basic Salary', type: 'currency', required: true },
              { id: 'overtime', label: 'Overtime', type: 'currency', value: 0 },
              { id: 'allowances', label: 'Allowances', type: 'currency', value: 0 },
              { id: 'bonuses', label: 'Bonuses', type: 'currency', value: 0 }
            ]
          },
          {
            id: 'deductions',
            type: 'section',
            title: 'Deductions',
            fields: [
              { id: 'tax', label: 'Income Tax', type: 'currency', value: 0 },
              { id: 'social_security', label: 'Social Security', type: 'currency', value: 0 },
              { id: 'health_insurance', label: 'Health Insurance', type: 'currency', value: 0 },
              { id: 'other_deductions', label: 'Other Deductions', type: 'currency', value: 0 }
            ]
          },
          {
            id: 'net_pay',
            type: 'calculation',
            title: 'Net Pay Summary',
            fields: [
              { id: 'gross_pay', label: 'Gross Pay', type: 'calculated', formula: 'earnings.sum' },
              { id: 'total_deductions', label: 'Total Deductions', type: 'calculated', formula: 'deductions.sum' },
              { id: 'net_pay_amount', label: 'Net Pay', type: 'calculated', formula: 'gross_pay - total_deductions' }
            ]
          }
        ],
        styles: {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          headerColor: '#2c3e50',
          sectionColor: '#34495e',
          borderColor: '#bdc3c7'
        }
      }
    },
    {
      name: 'Simple Payslip',
      description: 'Basic and clean payslip template with minimal fields - perfect for small businesses.',
      is_default: false,
      template_data: {
        sections: [
          {
            id: 'header',
            type: 'header',
            title: 'EMPLOYEE PAYSLIP',
            fields: [
              { id: 'company_name', label: 'Company', type: 'text', value: 'Company Name' },
              { id: 'pay_date', label: 'Pay Date', type: 'date', required: true }
            ]
          },
          {
            id: 'employee',
            type: 'section',
            title: 'Employee Details',
            fields: [
              { id: 'name', label: 'Name', type: 'text', required: true },
              { id: 'id', label: 'ID', type: 'text', required: true },
              { id: 'position', label: 'Position', type: 'text' }
            ]
          },
          {
            id: 'payment',
            type: 'section',
            title: 'Payment Details',
            fields: [
              { id: 'salary', label: 'Gross Salary', type: 'currency', required: true },
              { id: 'deductions', label: 'Total Deductions', type: 'currency', value: 0 },
              { id: 'net_salary', label: 'Net Salary', type: 'calculated', formula: 'salary - deductions' }
            ]
          }
        ],
        styles: {
          fontFamily: 'Helvetica, sans-serif',
          fontSize: '14px',
          headerColor: '#3498db',
          sectionColor: '#2c3e50'
        }
      }
    },
    {
      name: 'Corporate Payslip',
      description: 'Comprehensive corporate template with detailed breakdowns and tax calculations.',
      is_default: false,
      template_data: {
        sections: [
          {
            id: 'company_header',
            type: 'header',
            title: 'EMPLOYEE COMPENSATION STATEMENT',
            fields: [
              { id: 'company_name', label: 'Company Name', type: 'text', value: 'Corporate Inc.' },
              { id: 'company_address', label: 'Address', type: 'textarea', value: 'Corporate Address\nCity, State, ZIP' },
              { id: 'payroll_period', label: 'Payroll Period', type: 'text' }
            ]
          },
          {
            id: 'employee_details',
            type: 'section',
            title: 'Employee Information',
            fields: [
              { id: 'full_name', label: 'Full Name', type: 'text', required: true },
              { id: 'employee_number', label: 'Employee Number', type: 'text', required: true },
              { id: 'department', label: 'Department', type: 'text' },
              { id: 'job_title', label: 'Job Title', type: 'text' }
            ]
          },
          {
            id: 'earnings_detailed',
            type: 'section',
            title: 'Earnings Breakdown',
            fields: [
              { id: 'base_salary', label: 'Base Salary', type: 'currency', required: true },
              { id: 'overtime_regular', label: 'Overtime (1.5x)', type: 'currency', value: 0 },
              { id: 'commission', label: 'Commission', type: 'currency', value: 0 },
              { id: 'bonus_performance', label: 'Performance Bonus', type: 'currency', value: 0 },
              { id: 'allowances', label: 'Allowances', type: 'currency', value: 0 }
            ]
          },
          {
            id: 'deductions_detailed',
            type: 'section',
            title: 'Deductions Breakdown',
            fields: [
              { id: 'federal_tax', label: 'Federal Income Tax', type: 'currency', value: 0 },
              { id: 'state_tax', label: 'State Income Tax', type: 'currency', value: 0 },
              { id: 'social_security_tax', label: 'Social Security Tax', type: 'currency', value: 0 },
              { id: 'medicare_tax', label: 'Medicare Tax', type: 'currency', value: 0 },
              { id: 'health_premium', label: 'Health Insurance Premium', type: 'currency', value: 0 },
              { id: 'retirement_401k', label: '401(k) Contribution', type: 'currency', value: 0 }
            ]
          },
          {
            id: 'summary',
            type: 'calculation',
            title: 'Pay Summary',
            fields: [
              { id: 'gross_earnings', label: 'Gross Earnings', type: 'calculated', formula: 'earnings_detailed.sum' },
              { id: 'total_deductions', label: 'Total Deductions', type: 'calculated', formula: 'deductions_detailed.sum' },
              { id: 'net_pay', label: 'Net Pay', type: 'calculated', formula: 'gross_earnings - total_deductions' }
            ]
          }
        ],
        styles: {
          fontFamily: 'Times New Roman, serif',
          fontSize: '11px',
          headerColor: '#1a365d',
          sectionColor: '#2d3748',
          borderColor: '#cbd5e0'
        }
      }
    }
  ];

  const initializeTemplates = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Check if templates already exist
      const { data: existingTemplates, error: checkError } = await supabase
        .from('templates')
        .select('id, name');

      if (checkError) {
        throw new Error(`Error checking existing templates: ${checkError.message}`);
      }

      if (existingTemplates && existingTemplates.length > 0) {
        setMessage({
          type: 'info',
          text: `Found ${existingTemplates.length} existing template(s). No new templates created.`
        });
        setLoading(false);
        return;
      }

      // Get current user as template creator
      const { data: { user } } = await supabase.auth.getUser();
      
      let createdCount = 0;
      let errorCount = 0;

      // Insert default templates
      for (const template of defaultTemplates) {
        try {
          const templateData = {
            ...template,
            created_by: user?.id || null
          };

          const { error } = await supabase
            .from('templates')
            .insert(templateData);

          if (error) {
            console.error('Error creating template:', template.name, error);
            errorCount++;
          } else {
            createdCount++;
          }
        } catch (err) {
          console.error('Error inserting template:', template.name, err);
          errorCount++;
        }
      }

      if (createdCount > 0) {
        setMessage({
          type: 'success',
          text: `🎉 Successfully created ${createdCount} default template(s)! ${errorCount > 0 ? `(${errorCount} failed)` : ''}`
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ Failed to create templates. Please check the console for details.`
        });
      }

    } catch (error: any) {
      console.error('Error initializing templates:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // This would create sample employees, payslips, etc.
      // For now, just show a success message
      setTimeout(() => {
        setMessage({
          type: 'info',
          text: 'Sample data initialization is not yet implemented. Use the Employee Management section to add employees manually.'
        });
        setLoading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Error initializing sample data:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🚀 Initialize System</Title>
      <Description>
        Set up your payslip system with default templates and sample data to get started quickly.
      </Description>

      {message && (
        <StatusMessage type={message.type}>
          {message.text}
        </StatusMessage>
      )}

      <Button 
        variant="primary" 
        onClick={initializeTemplates}
        disabled={loading}
      >
        {loading ? '🔄 Creating Templates...' : '🎨 Create Default Templates'}
      </Button>

      <Button 
        variant="secondary" 
        onClick={initializeSampleData}
        disabled={loading}
      >
        {loading ? '🔄 Initializing...' : '👥 Initialize Sample Data'}
      </Button>
    </Container>
  );
};