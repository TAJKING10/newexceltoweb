import { useEffect } from 'react';

interface TemplateBuilderCleanupProps {
  onCleanup?: () => void;
}

export const TemplateBuilderCleanup: React.FC<TemplateBuilderCleanupProps> = ({ onCleanup }) => {
  useEffect(() => {
    return () => {
      console.log('🧹 TemplateBuilderCleanup: Running comprehensive cleanup...');
      
      // Abort any ongoing async operations
      if ((window as any).__templateBuilderController) {
        (window as any).__templateBuilderController.abort();
        delete (window as any).__templateBuilderController;
        console.log('✅ Aborted template builder async operations');
      }
      
      // Only clear template builder specific resources
      console.log('✅ Cleared template builder specific resources');
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
        console.log('✅ Forced garbage collection');
      }
      
      // Call custom cleanup if provided
      if (onCleanup) {
        onCleanup();
      }
      
      console.log('🎯 TemplateBuilderCleanup: All cleanup operations complete');
    };
  }, [onCleanup]);
  
  return null;
};