import { useState, useCallback, useMemo } from 'react';
import TemplateIntegrationService from '../../application/services/TemplateIntegrationService';

const useTemplateCustomization = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateType, setTemplateType] = useState('characters');
  const [customizationContext, setCustomizationContext] = useState({});
  const [presetCustomizations, setPresetCustomizations] = useState({});

  const integrationService = useMemo(() => new TemplateIntegrationService(), []);

  const openCustomizationDialog = useCallback((template, type, context = {}, presets = {}) => {
    setSelectedTemplate(template);
    setTemplateType(type);
    setCustomizationContext(context);
    setPresetCustomizations(presets);
    setIsDialogOpen(true);
  }, []);

  const closeCustomizationDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateType('characters');
    setCustomizationContext({});
    setPresetCustomizations({});
  }, []);

  const handleTemplateConfirm = useCallback((customizedTemplate) => {
    // Apply the template customizations
    const appliedTemplate = integrationService.applyTemplateToEntity(
      customizedTemplate,
      customizedTemplate,
      customizationContext
    );

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('templateCustomized', {
      detail: {
        template: appliedTemplate,
        type: templateType,
        originalTemplate: selectedTemplate
      }
    }));

    closeCustomizationDialog();
    return appliedTemplate;
  }, [customizationContext, templateType, selectedTemplate, integrationService, closeCustomizationDialog]);

  const getEnhancedContext = useCallback((editorType, editorData) => {
    return integrationService.enhanceEditorContext(editorType, editorData);
  }, [integrationService]);

  return {
    isDialogOpen,
    selectedTemplate,
    templateType,
    customizationContext,
    presetCustomizations,
    openCustomizationDialog,
    closeCustomizationDialog,
    handleTemplateConfirm,
    getEnhancedContext
  };
};

export default useTemplateCustomization;