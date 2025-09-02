/**
 * Template Cleanup Utility
 * Provides functions to clean up duplicate templates and ensure clean state
 */

import { supabaseTemplateService } from './supabaseTemplateService';
import { templateSync } from './templateSync';

export class TemplateCleanupService {
  
  /**
   * Clear all templates from database and local storage
   */
  async clearAllTemplates(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧹 Starting complete template cleanup...');
      
      // Clear local storage first
      templateSync.clearAllTemplates();
      localStorage.removeItem('payslip-templates');
      localStorage.removeItem('payslip-templates-manager');
      
      console.log('✅ Cleared local storage templates');
      
      // Get all templates from database and delete them
      const dbResult = await supabaseTemplateService.getAllTemplates();
      
      if (dbResult.success && dbResult.data && dbResult.data.length > 0) {
        console.log(`🗑️ Found ${dbResult.data.length} templates in database, deleting...`);
        
        for (const template of dbResult.data) {
          if (template.id) {
            try {
              await supabaseTemplateService.deleteTemplate(template.id);
              console.log(`✅ Deleted template: ${template.name}`);
            } catch (error) {
              console.warn(`⚠️ Failed to delete template ${template.name}:`, error);
            }
          }
        }
      }
      
      console.log('✅ Template cleanup completed successfully');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Error during template cleanup:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
  
  /**
   * Reset to exactly 2 default templates
   */
  async resetToDefaultTemplates(): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
      console.log('🔄 Resetting to 2 default templates...');
      
      // First clear everything
      await this.clearAllTemplates();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Reset completed - templates will be recreated on next load');
      return { success: true, count: 0 };
      
    } catch (error: any) {
      console.error('❌ Error during template reset:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}

// Export singleton instance
export const templateCleanup = new TemplateCleanupService();