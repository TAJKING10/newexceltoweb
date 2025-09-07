/**
 * Supabase View Service
 * Handles saving, loading, updating, and deleting payslip views to/from the saved_payslip_views table
 */

import { supabase } from '../supabaseClient';
import { PayslipTemplate } from '../types/PayslipTypes';

export interface DatabaseView {
  id?: string;
  view_name: string;
  payslip_data: any;
  view_type?: string;
  is_default?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

class SupabaseViewService {

  /**
   * Get all saved payslip views for template builder
   */
  async getAllViews(): Promise<{ success: boolean; data?: PayslipTemplate[]; error?: string }> {
    try {
      console.log('🔄 Starting getAllViews process...');
      
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      
      // Use existing user ID from database for development
      const userId = user?.id || 'b4b0ab7d-5f64-4098-9b4d-0bf063af5b79';
      console.log('👤 Using user ID for view loading:', userId, user ? '(authenticated)' : '(development fallback)');

      console.log('📂 Loading all saved payslip views for template builder');

      const { data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading all views:', error);
        return { success: false, error: error.message };
      }

      console.log('📋 Raw database results:', data?.length || 0, 'records found');
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No views found in database');
        return { success: true, data: [] };
      }

      const templates: PayslipTemplate[] = [];
      
      for (const item of data) {
        console.log('🔧 Processing view:', item.view_name, 'with type:', typeof item.payslip_data);
        
        try {
          // Convert saved_payslip_views format to PayslipTemplate format
          let payslipData: any;
          if (typeof item.payslip_data === 'string') {
            payslipData = JSON.parse(item.payslip_data);
          } else {
            payslipData = item.payslip_data;
          }
          
          // Transform the view data into a template format
          const template: PayslipTemplate = {
            id: item.id || `view-${Date.now()}`,
            name: item.view_name,
            version: '1.0',
            description: `Template from saved view: ${item.view_name}`,
            type: (item.view_type === 'advanced' ? 'advanced' : 'basic') as 'basic' | 'advanced',
            compatibleViews: ['basic', 'excel'],
            header: payslipData.header || {
              id: 'header-' + Date.now(),
              title: 'PAYSLIP',
              subtitle: 'Employee Pay Statement',
              companyInfo: {
                name: 'Company Name',
                address: 'Company Address',
                phone: 'Phone Number',
                email: 'Email Address'
              }
            },
            subHeaders: payslipData.subHeaders || [],
            sections: payslipData.sections || [],
            tables: payslipData.tables || [],
            globalFormulas: payslipData.globalFormulas || {},
            styling: payslipData.styling || {
              fontFamily: 'Arial, sans-serif',
              fontSize: 14,
              primaryColor: '#1565c0',
              secondaryColor: '#f5f5f5',
              borderStyle: 'solid'
            },
            layout: payslipData.layout || {
              columnsPerRow: 2,
              sectionSpacing: 20,
              printOrientation: 'portrait'
            },
            isEditable: true,
            createdDate: new Date(item.created_at || Date.now()),
            lastModified: new Date(item.updated_at || Date.now())
          };
          
          templates.push(template);
        } catch (parseError) {
          console.error('❌ Error parsing payslip_data for:', item.view_name, parseError);
          // Skip this view and continue with others
        }
      }
      
      console.log(`✅ Successfully loaded ${templates.length} views as templates from database`);
      console.log('📋 Template names:', templates.map(template => template.name));
      return { success: true, data: templates };

    } catch (error: any) {
      console.error('❌ Error in getAllViews:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Save a template as a payslip view
   */
  async saveView(template: PayslipTemplate): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('🔄 Starting saveView process...');
      
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      
      // Use existing user ID from database for development
      const userId = user?.id || 'b4b0ab7d-5f64-4098-9b4d-0bf063af5b79';
      console.log('👤 Using user ID:', userId, user ? '(authenticated)' : '(development fallback)');

      // Prepare data for saving
      const saveData: Partial<DatabaseView> = {
        view_name: template.name,
        payslip_data: {
          header: template.header,
          subHeaders: template.subHeaders || [],
          sections: template.sections || [],
          tables: template.tables || [],
          globalFormulas: template.globalFormulas || {},
          styling: template.styling,
          layout: template.layout,
          type: template.type,
          description: template.description,
          version: template.version,
          compatibleViews: template.compatibleViews
        },
        view_type: template.type || 'basic',
        is_default: false,
        user_id: userId
      };

      console.log('💾 Attempting to save view:', {
        name: template.name,
        id: template.id,
        type: template.type
      });

      // Check if view already exists by name
      const { data: existingViews, error: fetchError } = await supabase
        .from('saved_payslip_views')
        .select('id, view_name')
        .eq('user_id', userId)
        .eq('view_name', template.name);

      if (fetchError) {
        console.error('Error checking existing views:', fetchError);
        return { success: false, error: fetchError.message };
      }

      let result;
      if (existingViews && existingViews.length > 0) {
        // Update existing record
        console.log('📝 Updating existing view record with ID:', existingViews[0].id);
        
        const { data, error } = await supabase
          .from('saved_payslip_views')
          .update(saveData)
          .eq('id', existingViews[0].id)
          .select('id')
          .single();

        result = { data, error };
      } else {
        // Insert new record
        console.log('📝 Inserting new view record for template:', template.name);
        
        const { data, error } = await supabase
          .from('saved_payslip_views')
          .insert([saveData])
          .select('id')
          .single();

        result = { data, error };
      }

      if (result.error) {
        console.error('❌ Database operation failed:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Successfully saved view to database with ID:', result.data?.id);
      return { success: true, id: result.data?.id };

    } catch (error: any) {
      console.error('❌ Error in saveView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load a specific view by ID
   */
  async loadView(viewId: string): Promise<{ success: boolean; data?: PayslipTemplate; error?: string }> {
    try {
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      const userId = user?.id || 'b4b0ab7d-5f64-4098-9b4d-0bf063af5b79';

      console.log('📂 Loading view with ID:', viewId);

      const { data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('id', viewId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error loading view:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('ℹ️ No view found with this ID');
        return { success: false, error: 'View not found' };
      }

      // Convert view to template format
      let payslipData: any;
      if (typeof data.payslip_data === 'string') {
        payslipData = JSON.parse(data.payslip_data);
      } else {
        payslipData = data.payslip_data;
      }

      const template: PayslipTemplate = {
        id: data.id,
        name: data.view_name,
        version: payslipData.version || '1.0',
        description: `Template from saved view: ${data.view_name}`,
        type: (data.view_type === 'advanced' ? 'advanced' : 'basic') as 'basic' | 'advanced',
        compatibleViews: payslipData.compatibleViews || ['basic', 'excel'],
        header: payslipData.header || {
          id: 'header-' + Date.now(),
          title: 'PAYSLIP',
          subtitle: 'Employee Pay Statement',
          companyInfo: {
            name: 'Company Name',
            address: 'Company Address',
            phone: 'Phone Number',
            email: 'Email Address'
          }
        },
        subHeaders: payslipData.subHeaders || [],
        sections: payslipData.sections || [],
        tables: payslipData.tables || [],
        globalFormulas: payslipData.globalFormulas || {},
        styling: payslipData.styling || {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          primaryColor: '#1565c0',
          secondaryColor: '#f5f5f5',
          borderStyle: 'solid'
        },
        layout: payslipData.layout || {
          columnsPerRow: 2,
          sectionSpacing: 20,
          printOrientation: 'portrait'
        },
        isEditable: true,
        createdDate: new Date(data.created_at || Date.now()),
        lastModified: new Date(data.updated_at || Date.now())
      };

      console.log('✅ Successfully loaded view from database:', data.view_name);
      return { success: true, data: template };

    } catch (error: any) {
      console.error('❌ Error in loadView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Update an existing view
   */
  async updateView(viewId: string, template: PayslipTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      const userId = user?.id || 'b4b0ab7d-5f64-4098-9b4d-0bf063af5b79';

      console.log('📝 Updating view:', viewId);

      // Prepare update data
      const updateData: Partial<DatabaseView> = {
        view_name: template.name,
        payslip_data: {
          header: template.header,
          subHeaders: template.subHeaders || [],
          sections: template.sections || [],
          tables: template.tables || [],
          globalFormulas: template.globalFormulas || {},
          styling: template.styling,
          layout: template.layout,
          type: template.type,
          description: template.description,
          version: template.version,
          compatibleViews: template.compatibleViews
        },
        view_type: template.type || 'basic'
      };

      const { error } = await supabase
        .from('saved_payslip_views')
        .update(updateData)
        .eq('id', viewId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating view:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully updated view in database');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in updateView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Delete a view
   */
  async deleteView(viewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user with timeout
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 3000);
      });
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      const userId = user?.id || 'b4b0ab7d-5f64-4098-9b4d-0bf063af5b79';

      console.log('🗑️ Deleting view:', viewId);

      const { error } = await supabase
        .from('saved_payslip_views')
        .delete()
        .eq('id', viewId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting view:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully deleted view from database');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in deleteView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Create a new view from template
   */
  async createNewView(name: string, template: PayslipTemplate): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const newTemplate: PayslipTemplate = {
        ...template,
        id: `new-view-${Date.now()}`,
        name: name,
        description: `New template: ${name}`,
        createdDate: new Date(),
        lastModified: new Date()
      };

      return await this.saveView(newTemplate);

    } catch (error: any) {
      console.error('❌ Error in createNewView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
}

// Export singleton instance
export const supabaseViewService = new SupabaseViewService();