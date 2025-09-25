/**
 * Supabase Template Service
 * Handles saving, loading, updating, and deleting templates to/from the payslip_templates table
 */

import { supabase } from '../supabaseClient';
import { PayslipTemplate } from '../types/PayslipTypes';

export interface DatabaseTemplate {
  id?: string;
  name: string;
  description?: string;
  template_data: PayslipTemplate;
  is_default?: boolean;
  is_active?: boolean;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

class SupabaseTemplateService {

  /**
   * Save a template to the database
   */
  async saveTemplate(template: PayslipTemplate): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('🔄 Starting saveTemplate process...');
      
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      
      // Use existing user ID from database for development
      const userId = user?.id || '918f60d4-81c2-462c-9f55-4d32b740c06c';
      console.log('👤 Using user ID:', userId, user ? '(authenticated)' : '(development fallback)');

      // Prepare data for saving
      const saveData: Partial<DatabaseTemplate> = {
        name: template.name,
        description: template.description || `Template created on ${new Date().toLocaleDateString()}`,
        template_data: template,
        is_default: false,
        is_active: true,
        owner_id: userId
      };

      console.log('💾 Attempting to save template:', {
        name: template.name,
        id: template.id,
        type: template.type
      });

      // Check if template already exists by matching template internal ID in the JSONB data
      const { data: existingTemplates, error: fetchError } = await supabase
        .from('payslip_templates')
        .select('id, template_data')
        .eq('owner_id', userId);

      if (fetchError) {
        console.error('Error checking existing templates:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // Find existing template by matching the internal template ID
      const existingTemplate = existingTemplates?.find(dbTemplate => 
        dbTemplate.template_data && 
        typeof dbTemplate.template_data === 'object' &&
        (dbTemplate.template_data as any).id === template.id
      );

      let result;
      if (existingTemplate) {
        // Update existing record
        console.log('📝 Updating existing template record with DB ID:', existingTemplate.id);
        
        const { data, error } = await supabase
          .from('payslip_templates')
          .update(saveData)
          .eq('id', existingTemplate.id)
          .select('id')
          .single();

        result = { data, error };
      } else {
        // Insert new record
        console.log('📝 Inserting new template record for template ID:', template.id);
        
        const { data, error } = await supabase
          .from('payslip_templates')
          .insert([saveData])
          .select('id')
          .single();

        result = { data, error };
      }

      if (result.error) {
        console.error('❌ Database operation failed:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Successfully saved template to database with ID:', result.data?.id);
      return { success: true, id: result.data?.id };

    } catch (error: any) {
      console.error('❌ Error in saveTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load a specific template by ID
   */
  async loadTemplate(templateId: string): Promise<{ success: boolean; data?: PayslipTemplate; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading template with ID:', templateId);

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('id', templateId)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error loading template:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('ℹ️ No template found with this ID');
        return { success: false, error: 'Template not found' };
      }

      console.log('✅ Successfully loaded template from database:', data.name);
      return { success: true, data: data.template_data };

    } catch (error: any) {
      console.error('❌ Error in loadTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load template by name (fallback method)
   */
  async loadTemplateByName(templateName: string): Promise<{ success: boolean; data?: PayslipTemplate; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading template by name:', templateName);

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('name', templateName)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error loading template by name:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No template found with this name');
        return { success: false, error: 'Template not found' };
      }

      console.log('✅ Successfully loaded template from database by name');
      return { success: true, data: data[0].template_data };

    } catch (error: any) {
      console.error('❌ Error in loadTemplateByName:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Get all templates for current user
   */
  async getAllTemplates(): Promise<{ success: boolean; data?: PayslipTemplate[]; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading all templates for user');

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading all templates:', error);
        return { success: false, error: error.message };
      }

      const templates = (data || []).map(item => item.template_data as PayslipTemplate);
      
      console.log(`✅ Successfully loaded ${templates.length} templates from database`);
      return { success: true, data: templates };

    } catch (error: any) {
      console.error('❌ Error in getAllTemplates:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: Partial<PayslipTemplate>): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📝 Updating template:', templateId);

      // First get the current template data
      const { data: currentData, error: fetchError } = await supabase
        .from('payslip_templates')
        .select('template_data')
        .eq('id', templateId)
        .eq('owner_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current template data:', fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!currentData) {
        return { success: false, error: 'Template not found' };
      }

      // Merge the updates with current template data
      const updatedTemplateData = {
        ...currentData.template_data,
        ...updates,
        lastModified: new Date()
      };

      // Prepare database update
      const updateData: Partial<DatabaseTemplate> = {
        template_data: updatedTemplateData,
        name: updatedTemplateData.name,
        description: updatedTemplateData.description || currentData.template_data.description
      };

      const { error } = await supabase
        .from('payslip_templates')
        .update(updateData)
        .eq('id', templateId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('❌ Error updating template:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully updated template in database');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in updateTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Delete a template (soft delete by setting is_active to false)
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('🗑️ Deleting template:', templateId);

      const { error } = await supabase
        .from('payslip_templates')
        .update({ is_active: false })
        .eq('id', templateId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('❌ Error deleting template:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully deleted template from database');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in deleteTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(templateId: string, newName: string): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Load the template to duplicate
      const { success, data: templateData, error } = await this.loadTemplate(templateId);
      
      if (!success || !templateData) {
        return { success: false, error: error || 'Template not found' };
      }

      // Create a new template with duplicated data
      const duplicatedTemplate: PayslipTemplate = {
        ...templateData,
        id: `duplicate-${Date.now()}`,
        name: newName,
        description: `Copy of ${templateData.name}`,
        createdDate: new Date(),
        lastModified: new Date()
      };

      // Save the duplicated template
      return await this.saveTemplate(duplicatedTemplate);

    } catch (error: any) {
      console.error('❌ Error in duplicateTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Get template metadata (without full template data)
   */
  async getTemplateMetadata(): Promise<{ success: boolean; data?: Partial<DatabaseTemplate>[]; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('id, name, description, is_default, is_active, created_at, updated_at')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading template metadata:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error: any) {
      console.error('❌ Error in getTemplateMetadata:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Search templates by name or description
   */
  async searchTemplates(searchTerm: string): Promise<{ success: boolean; data?: PayslipTemplate[]; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('🔍 Searching templates for:', searchTerm);

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching templates:', error);
        return { success: false, error: error.message };
      }

      const templates = (data || []).map(item => item.template_data as PayslipTemplate);
      
      console.log(`✅ Found ${templates.length} templates matching search term`);
      return { success: true, data: templates };

    } catch (error: any) {
      console.error('❌ Error in searchTemplates:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Set a template as default
   */
  async setDefaultTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('⭐ Setting template as default:', templateId);

      // First, unset any existing default templates
      await supabase
        .from('payslip_templates')
        .update({ is_default: false })
        .eq('owner_id', user.id)
        .eq('is_default', true);

      // Set the new default template
      const { error } = await supabase
        .from('payslip_templates')
        .update({ is_default: true })
        .eq('id', templateId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('❌ Error setting default template:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully set default template');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in setDefaultTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Get the default template
   */
  async getDefaultTemplate(): Promise<{ success: boolean; data?: PayslipTemplate; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_default', true)
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('❌ Error loading default template:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No default template found');
        return { success: false, error: 'No default template found' };
      }

      console.log('✅ Successfully loaded default template');
      return { success: true, data: data[0].template_data };

    } catch (error: any) {
      console.error('❌ Error in getDefaultTemplate:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
}

// Export singleton instance
export const supabaseTemplateService = new SupabaseTemplateService();