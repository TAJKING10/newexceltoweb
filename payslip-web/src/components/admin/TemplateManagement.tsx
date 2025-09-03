import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';
import { InitializeSystem } from './InitializeSystem';

interface Template {
  id: string;
  name: string;
  description?: string;
  template_data: any;
  is_default: boolean;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string; // Added for compatibility
  usage_count?: number;
  creator?: {
    full_name?: string;
    email: string;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const Title = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[5]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary};
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.md}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;
          &:hover { background: ${theme.colors.error.dark}; }
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

const SearchInput = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${theme.spacing[4]};
`;

const TemplateCard = styled.div<{ isDefault?: boolean }>`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 2px solid ${props => props.isDefault ? theme.colors.primary.main : theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.animation.duration.normal};
  position: relative;
  
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
  
  ${props => props.isDefault && `
    background: linear-gradient(135deg, ${theme.colors.primary.light}10, ${theme.colors.primary.light}05);
  `}
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  background: ${theme.colors.gradients.primary};
  color: white;
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TemplateHeader = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const TemplateName = styled.h3`
  margin: 0 0 ${theme.spacing[2]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  padding-right: ${theme.spacing[16]};
`;

const TemplateDescription = styled.p`
  margin: 0 0 ${theme.spacing[2]} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const TemplateMetadata = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[4]} 0;
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const MetadataLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetadataValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const UsageStats = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]};
  margin: ${theme.spacing[4]} 0;
`;

const UsageText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const TemplateActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.border.light};
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  flex: 1;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary.main};
          color: white;
          &:hover { background: ${theme.colors.primary.dark}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error.main};
          color: white;
          &:hover { background: ${theme.colors.error.dark}; }
        `;
      default:
        return `
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.background.tertiary}; }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[16]} ${theme.spacing[8]};
  text-align: center;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.light};
`;

const EmptyIcon = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  margin-bottom: ${theme.spacing[4]};
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${theme.spacing[2]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch templates...');
      
      // Fetch all active templates from payslip_templates
      const { data: templateData, error: templateError } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (templateError) {
        console.error('Error fetching templates:', templateError);
        throw templateError;
      }

      console.log('Raw template data:', templateData);

      if (!templateData || templateData.length === 0) {
        console.log('No templates found');
        setTemplates([]);
        return;
      }

      // Get usage counts and creator info for each template
      const templatesWithUsage = await Promise.all(
        templateData.map(async (template) => {
          // Get usage count
          const { count } = await supabase
            .from('payslips')
            .select('*', { count: 'exact', head: true })
            .eq('template_id', template.id);

          // Try to get creator info if owner_id exists
          let creator = null;
          if (template.owner_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', template.owner_id)
              .single();
            creator = profileData;
          }

          return {
            ...template,
            usage_count: count || 0,
            created_by: template.owner_id,
            creator: creator || { full_name: 'Unknown', email: 'unknown@example.com' }
          };
        })
      );

      console.log('Templates with usage data:', templatesWithUsage);
      setTemplates(templatesWithUsage);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Set empty array on error so we don't show loading forever
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      // First, remove default status from all templates
      await supabase
        .from('payslip_templates')
        .update({ is_default: false })
        .neq('id', '');

      // Then set the selected template as default
      const { error } = await supabase
        .from('payslip_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error setting default template:', error);
      alert(`Error setting default template: ${error.message}`);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('payslip_templates')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          template_data: template.template_data,
          is_default: false,
          is_active: true,
          owner_id: template.created_by
        });

      if (error) throw error;

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      alert(`Error duplicating template: ${error.message}`);
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Instead of hard deleting, mark as inactive
      const { error } = await supabase
        .from('payslip_templates')
        .update({ is_active: false })
        .eq('id', template.id);

      if (error) throw error;

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(`Error deleting template: ${error.message}`);
    }
  };

  const handleExportTemplate = async (template: Template) => {
    try {
      const templateData = {
        name: template.name,
        description: template.description,
        template_data: template.template_data,
        exported_at: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Error exporting template');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner>Loading templates...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>Template Management ({templates.length} templates)</Title>
        <Actions>
          <SearchInput
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" onClick={() => window.location.href = '/template-builder'}>
            🎨 Create New Template
          </Button>
          <Button variant="primary" onClick={fetchTemplates}>
            🔄 Refresh
          </Button>
        </Actions>
      </Header>

      {filteredTemplates.length === 0 ? (
        searchTerm ? (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyTitle>No Templates Found</EmptyTitle>
            <EmptyDescription>
              No templates match your search criteria. Try adjusting your search terms.
            </EmptyDescription>
          </EmptyState>
        ) : (
          <InitializeSystem />
        )
      ) : (
        <TemplateGrid>
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} isDefault={template.is_default}>
              {template.is_default && <DefaultBadge>Default</DefaultBadge>}
              
              <TemplateHeader>
                <TemplateName>{template.name}</TemplateName>
                <TemplateDescription>
                  {template.description || 'No description provided'}
                </TemplateDescription>
              </TemplateHeader>

              <TemplateMetadata>
                <MetadataItem>
                  <MetadataLabel>Created By</MetadataLabel>
                  <MetadataValue>
                    {template.creator?.full_name || template.creator?.email || 'Unknown'}
                  </MetadataValue>
                </MetadataItem>
                
                <MetadataItem>
                  <MetadataLabel>Created Date</MetadataLabel>
                  <MetadataValue>
                    {new Date(template.created_at).toLocaleDateString()}
                  </MetadataValue>
                </MetadataItem>
                
                <MetadataItem>
                  <MetadataLabel>Last Updated</MetadataLabel>
                  <MetadataValue>
                    {new Date(template.updated_at).toLocaleDateString()}
                  </MetadataValue>
                </MetadataItem>
                
                <MetadataItem>
                  <MetadataLabel>Template ID</MetadataLabel>
                  <MetadataValue style={{ fontFamily: theme.typography.fontFamily.mono, fontSize: '11px' }}>
                    {template.id.slice(0, 8)}...
                  </MetadataValue>
                </MetadataItem>
              </TemplateMetadata>

              <UsageStats>
                <UsageText>
                  📊 Used in <strong>{template.usage_count || 0}</strong> payslips
                </UsageText>
              </UsageStats>

              <TemplateActions>
                {!template.is_default && (
                  <SmallButton 
                    variant="primary"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    Set as Default
                  </SmallButton>
                )}
                
                <SmallButton 
                  variant="secondary"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  Duplicate
                </SmallButton>
                
                <SmallButton 
                  variant="secondary"
                  onClick={() => handleExportTemplate(template)}
                >
                  Export
                </SmallButton>
                
                {!template.is_default && (
                  <SmallButton 
                    variant="danger"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    Delete
                  </SmallButton>
                )}
              </TemplateActions>
            </TemplateCard>
          ))}
        </TemplateGrid>
      )}
    </Container>
  );
};