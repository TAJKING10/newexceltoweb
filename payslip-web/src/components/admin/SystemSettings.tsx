import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { theme } from '../../styles/theme';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Section = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing[4]} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: start;
  padding: ${theme.spacing[4]} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[1]};
`;

const SettingDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  margin-bottom: ${theme.spacing[2]};
`;

const SettingValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`;

const SettingActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-left: ${theme.spacing[4]};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${theme.animation.duration.normal};
  border: none;
  
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
          border: 1px solid ${theme.colors.border.light};
          &:hover { background: ${theme.colors.background.tertiary}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing[4]};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const ModalTitle = styled.h4`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.lg};
  cursor: pointer;
  color: ${theme.colors.text.tertiary};
  padding: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    setting_value: '',
    description: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: AdminSetting) => {
    setEditingId(setting.id);
    setFormData({
      setting_value: JSON.stringify(setting.setting_value),
      description: setting.description || ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setFormLoading(true);
    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(formData.setting_value);
      } catch {
        // If it's not valid JSON, treat as string
        parsedValue = formData.setting_value;
      }

      const { error } = await supabase
        .from('admin_settings')
        .update({
          setting_value: parsedValue,
          description: formData.description || null
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchSettings();
      setEditingId(null);
    } catch (error: any) {
      console.error('Error updating setting:', error);
      alert(`Error updating setting: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ setting_value: '', description: '' });
  };

  const formatSettingValue = (value: any): string => {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return JSON.stringify(value, null, 2);
  };

  const getSettingDisplayName = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return <LoadingSpinner>Loading system settings...</LoadingSpinner>;
  }

  return (
    <Container>
      <Section>
        <SectionTitle>System Configuration</SectionTitle>
        {settings.map(setting => (
          <SettingItem key={setting.id}>
            <SettingInfo>
              <SettingLabel>
                {getSettingDisplayName(setting.setting_key)}
              </SettingLabel>
              {setting.description && (
                <SettingDescription>
                  {setting.description}
                </SettingDescription>
              )}
              <SettingValue>
                {formatSettingValue(setting.setting_value)}
              </SettingValue>
            </SettingInfo>
            <SettingActions>
              <Button 
                variant="secondary" 
                onClick={() => handleEdit(setting)}
              >
                Edit
              </Button>
            </SettingActions>
          </SettingItem>
        ))}
      </Section>

      <Modal isOpen={editingId !== null}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              Edit Setting: {editingId ? getSettingDisplayName(
                settings.find(s => s.id === editingId)?.setting_key || ''
              ) : ''}
            </ModalTitle>
            <CloseButton onClick={handleCancel}>×</CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSave}>
            <FormGroup>
              <Label>Value (JSON format)</Label>
              <Textarea
                required
                value={formData.setting_value}
                onChange={(e) => setFormData({
                  ...formData,
                  setting_value: e.target.value
                })}
                placeholder='{"key": "value"} or "string value"'
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
                placeholder="Setting description"
              />
            </FormGroup>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={formLoading}
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};