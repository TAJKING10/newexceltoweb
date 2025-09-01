/**
 * Supabase Payslip Service
 * Handles saving and loading payslip views to/from the saved_payslip_views table
 */

import { supabase } from '../supabaseClient';

export interface SavedPayslipView {
  id?: string;
  view_name: string;
  view_type: 'annual' | 'excel' | 'basic';
  description?: string;
  person_id?: string;
  person_name: string;
  person_email?: string;
  person_type: 'employee' | 'customer' | 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'other';
  employee_id?: string;
  department?: string;
  position?: string;
  template_id?: string;
  template_name?: string;
  payslip_year: number;
  payslip_month?: number;
  pay_period_start?: string;
  pay_period_end?: string;
  generation_date?: string;
  payslip_data: any;
  header_data?: any;
  sub_headers?: any[];
  monthly_data?: any;
  totals?: any;
  custom_rows?: any[];
  groups?: any[];
  calculated_values?: any;
  tax_class?: number;
  has_children?: boolean;
  gross_salary?: number;
  net_salary?: number;
  total_deductions?: number;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  created_by?: string;
  updated_by?: string;
  owner_id?: string;
  is_template?: boolean;
  is_approved?: boolean;
  approved_by?: string;
  approval_date?: string;
  status?: 'draft' | 'pending' | 'approved' | 'archived';
  is_public?: boolean;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

class SupabasePayslipService {

  /**
   * Save annual payslip view to database
   */
  async saveAnnualPayslipView(payslipData: any, selectedPerson: any, selectedTemplate: any): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Generate view name
      const viewName = `${selectedPerson?.personalInfo?.fullName || selectedPerson?.name || 'Unknown'} - Annual ${payslipData.year || new Date().getFullYear()}`;

      // Prepare data for saving
      const saveData: Partial<SavedPayslipView> = {
        view_name: viewName,
        view_type: 'annual',
        description: `Annual payslip report for ${selectedPerson?.personalInfo?.fullName || selectedPerson?.name || 'Unknown'} - ${payslipData.year || new Date().getFullYear()}`,
        person_id: selectedPerson?.id || null,
        person_name: selectedPerson?.personalInfo?.fullName || selectedPerson?.name || 'Unknown',
        person_email: selectedPerson?.personalInfo?.email || selectedPerson?.email || null,
        person_type: selectedPerson?.type || 'employee',
        employee_id: selectedPerson?.workInfo?.personId || selectedPerson?.employeeId || null,
        department: selectedPerson?.workInfo?.department || selectedPerson?.department || null,
        position: selectedPerson?.workInfo?.position || selectedPerson?.position || null,
        template_id: selectedTemplate?.id || null, // Now accepts text template IDs directly
        template_name: selectedTemplate?.name || null,
        payslip_year: payslipData.year || new Date().getFullYear(),
        generation_date: new Date().toISOString().split('T')[0],
        payslip_data: payslipData,
        header_data: payslipData.headerData || {},
        sub_headers: payslipData.subHeaders || [],
        monthly_data: payslipData.monthlyData || {},
        totals: payslipData.totals || {},
        custom_rows: payslipData.customRows || [],
        groups: payslipData.groups || [],
        calculated_values: payslipData.calculatedValues || {},
        tax_class: payslipData.taxClass || 1,
        has_children: payslipData.hasChildren || false,
        gross_salary: payslipData.totals?.grossTotal || null,
        net_salary: payslipData.totals?.netTotal || null,
        total_deductions: payslipData.totals?.deductionsTotal || null,
        company_name: payslipData.headerData?.companyName || null,
        company_address: payslipData.headerData?.companyAddress || null,
        company_phone: payslipData.headerData?.companyPhone || null,
        company_email: payslipData.headerData?.companyEmail || null,
        created_by: user.id,
        owner_id: user.id,
        status: 'draft',
        is_template: false,
        is_approved: false,
        is_public: false,
        is_favorite: false
      };

      console.log('💾 Attempting to save payslip data:', {
        person: selectedPerson?.personalInfo?.fullName || selectedPerson?.name,
        year: payslipData.year,
        template: selectedTemplate?.name,
        templateId: selectedTemplate?.id
      });

      // Check if a view already exists for this person and year
      const { data: existingViews, error: fetchError } = await supabase
        .from('saved_payslip_views')
        .select('id')
        .eq('owner_id', user.id)
        .eq('person_name', saveData.person_name)
        .eq('payslip_year', saveData.payslip_year)
        .eq('view_type', 'annual');

      if (fetchError) {
        console.error('Error checking existing views:', fetchError);
        return { success: false, error: fetchError.message };
      }

      let result;
      if (existingViews && existingViews.length > 0) {
        // Update existing record
        saveData.updated_by = user.id;
        console.log('📝 Updating existing record with ID:', existingViews[0].id);
        
        const { data, error } = await supabase
          .from('saved_payslip_views')
          .update(saveData)
          .eq('id', existingViews[0].id)
          .select('id')
          .single();

        result = { data, error };
      } else {
        // Insert new record
        console.log('📝 Inserting new record');
        
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

      console.log('✅ Successfully saved annual payslip view to database with ID:', result.data?.id);
      return { success: true, id: result.data?.id };

    } catch (error: any) {
      console.error('❌ Error in saveAnnualPayslipView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load annual payslip view from database
   */
  async loadAnnualPayslipView(personId: string, year: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading payslip data for person:', personId, 'year:', year);

      // Try multiple approaches to find the saved data
      let data, error;
      
      // First try: exact person_id match
      ({ data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('owner_id', user.id)
        .eq('person_id', personId)
        .eq('payslip_year', year)
        .eq('view_type', 'annual')
        .order('updated_at', { ascending: false })
        .limit(1));

      // If no exact match, try loading by any matching criteria for this user/year
      if ((!data || data.length === 0) && !error) {
        console.log('📂 No exact person_id match, trying broader search...');
        ({ data, error } = await supabase
          .from('saved_payslip_views')
          .select('*')
          .eq('owner_id', user.id)
          .eq('payslip_year', year)
          .eq('view_type', 'annual')
          .order('updated_at', { ascending: false })
          .limit(1));
      }

      if (error) {
        console.error('❌ Error loading payslip view:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No saved data found for this person and year');
        return { success: false, error: 'No saved data found' };
      }

      const savedView = data[0];
      console.log('✅ Successfully loaded annual payslip view from database:', {
        view_name: savedView.view_name,
        person_name: savedView.person_name,
        saved_person_id: savedView.person_id,
        requested_person_id: personId,
        year: savedView.payslip_year
      });
      return { success: true, data: savedView.payslip_data };

    } catch (error: any) {
      console.error('❌ Error in loadAnnualPayslipView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load annual payslip view by person name (fallback when person_id is not available)
   */
  async loadAnnualPayslipViewByName(personName: string, year: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading payslip data for person name:', personName, 'year:', year);

      const { data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('owner_id', user.id)
        .eq('person_name', personName)
        .eq('payslip_year', year)
        .eq('view_type', 'annual')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error loading payslip view by name:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No saved data found for this person name and year');
        return { success: false, error: 'No saved data found' };
      }

      const savedView = data[0];
      console.log('✅ Successfully loaded annual payslip view from database by name');
      return { success: true, data: savedView.payslip_data };

    } catch (error: any) {
      console.error('❌ Error in loadAnnualPayslipViewByName:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Load the most recent annual payslip view for current user and year (fallback method)
   */
  async loadMostRecentAnnualPayslipView(year: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📂 Loading most recent payslip data for year:', year);

      const { data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('owner_id', user.id)
        .eq('payslip_year', year)
        .eq('view_type', 'annual')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error loading most recent payslip view:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No saved data found for this year');
        return { success: false, error: 'No saved data found' };
      }

      const savedView = data[0];
      console.log('✅ Successfully loaded most recent annual payslip view:', {
        view_name: savedView.view_name,
        person_name: savedView.person_name,
        year: savedView.payslip_year
      });
      return { success: true, data: savedView.payslip_data };

    } catch (error: any) {
      console.error('❌ Error in loadMostRecentAnnualPayslipView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Get all saved annual payslip views for current user
   */
  async getAllAnnualPayslipViews(): Promise<{ success: boolean; data?: SavedPayslipView[]; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('saved_payslip_views')
        .select('*')
        .eq('owner_id', user.id)
        .eq('view_type', 'annual')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading all payslip views:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error: any) {
      console.error('❌ Error in getAllAnnualPayslipViews:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Delete annual payslip view
   */
  async deleteAnnualPayslipView(viewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('saved_payslip_views')
        .delete()
        .eq('id', viewId)
        .eq('owner_id', user.id); // Ensure user can only delete their own views

      if (error) {
        console.error('❌ Error deleting payslip view:', error);
        return { success: false, error: error.message };
      }

      console.log('🗑️ Successfully deleted annual payslip view');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error in deleteAnnualPayslipView:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
}

// Export singleton instance
export const supabasePayslipService = new SupabasePayslipService();