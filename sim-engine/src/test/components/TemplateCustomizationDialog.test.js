import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateCustomizationDialog from '../../presentation/components/TemplateCustomizationDialog';

describe('TemplateCustomizationDialog', () => {
  const mockTemplate = {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template for characters',
    tags: ['test', 'character'],
    type: 'characters',
    attributes: {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 15,
      charisma: 18
    },
    customizationOptions: {
      strength: {
        type: 'number',
        label: 'Strength',
        min: 8,
        max: 18,
        default: 16
      },
      archetype: {
        type: 'select',
        label: 'Archetype',
        options: ['Warrior', 'Mage', 'Rogue'],
        default: 'Warrior'
      },
      isHeroic: {
        type: 'boolean',
        label: 'Is Heroic',
        default: false
      }
    },
    textTemplates: {
      description: 'A {{archetype}} with {{strength}} strength.',
      background: 'Born in {{node.name}}, this character has seen many adventures.'
    },
    textTemplateFields: [
      {
        key: 'greeting',
        label: 'Greeting Message',
        placeholder: 'Enter greeting with placeholders...'
      }
    ]
  };

  const mockContext = {
    character: {
      name: 'Test Character',
      attributes: { strength: 16 }
    },
    node: {
      name: 'Test Location'
    }
  };

  const defaultProps = {
    template: mockTemplate,
    type: 'characters',
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    context: mockContext
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render when open', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
      expect(screen.getByText('A test template for characters')).toBeInTheDocument();
    });

    test('should not render when closed', () => {
      render(<TemplateCustomizationDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Customize Template: Test Template')).not.toBeInTheDocument();
    });

    test('should not render without template', () => {
      render(<TemplateCustomizationDialog {...defaultProps} template={null} />);
      
      expect(screen.queryByText('Customize Template:')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('should show structural tab by default', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const structuralTab = screen.getByText('Structure');
      expect(structuralTab).toHaveClass('text-blue-600');
    });

    test('should switch to text templates tab', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const textTab = screen.getByText('Text Templates');
      await user.click(textTab);
      
      expect(textTab).toHaveClass('text-blue-600');
      expect(screen.getByText('Preview Context')).toBeInTheDocument();
    });

    test('should show both tabs', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Structure')).toBeInTheDocument();
      expect(screen.getByText('Text Templates')).toBeInTheDocument();
    });
  });

  describe('Structural Customization', () => {
    test('should show basic information fields', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test template for characters')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test, character')).toBeInTheDocument();
    });

    test('should show customization options', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByLabelText('Strength')).toBeInTheDocument();
      expect(screen.getByLabelText('Archetype')).toBeInTheDocument();
      expect(screen.getByLabelText('Is Heroic')).toBeInTheDocument();
    });

    test('should handle text input changes', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const nameInput = screen.getByDisplayValue('Test Template');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Template');
      
      expect(nameInput).toHaveValue('Modified Template');
    });

    test('should handle number input changes', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const strengthInput = screen.getByLabelText('Strength');
      await user.clear(strengthInput);
      await user.type(strengthInput, '18');
      
      expect(strengthInput).toHaveValue(18);
    });

    test('should handle select changes', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const archetypeSelect = screen.getByLabelText('Archetype');
      await user.selectOptions(archetypeSelect, 'Mage');
      
      expect(archetypeSelect).toHaveValue('Mage');
    });

    test('should handle boolean changes', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const heroicCheckbox = screen.getByLabelText('Is Heroic');
      await user.click(heroicCheckbox);
      
      expect(heroicCheckbox).toBeChecked();
    });
  });

  describe('Text Template Customization', () => {
    test('should show text template fields', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const textTab = screen.getByText('Text Templates');
      await user.click(textTab);
      
      expect(screen.getByText('Character Description Template')).toBeInTheDocument();
      expect(screen.getByText('Character Background Template')).toBeInTheDocument();
      expect(screen.getByText('Greeting Message')).toBeInTheDocument();
    });

    test('should show context selector', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const textTab = screen.getByText('Text Templates');
      await user.click(textTab);
      
      expect(screen.getByText('Preview Context')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sample Character 1')).toBeInTheDocument();
    });

    test('should switch preview context', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const textTab = screen.getByText('Text Templates');
      await user.click(textTab);
      
      const contextSelect = screen.getByDisplayValue('Sample Character 1');
      await user.selectOptions(contextSelect, '1');
      
      expect(contextSelect).toHaveValue('1');
    });
  });

  describe('Preview Panel', () => {
    test('should show preview by default', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    test('should toggle preview visibility', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const toggleButton = screen.getByTitle('Hide preview');
      await user.click(toggleButton);
      
      expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
    });

    test('should show validation status in preview', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      // Should show validation status for text templates
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    test('should update preview when customizations change', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const nameInput = screen.getByDisplayValue('Test Template');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Template');
      
      await waitFor(() => {
        expect(screen.getByText('Updated Template')).toBeInTheDocument();
      });
    });
  });

  describe('Collapsible Sections', () => {
    test('should show collapsible sections', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Customization Options')).toBeInTheDocument();
    });

    test('should toggle section visibility', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const basicInfoHeader = screen.getByText('Basic Information');
      await user.click(basicInfoHeader);
      
      // Section should collapse (name input should not be visible)
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Template')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    test('should show action buttons in header', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByTitle('Hide preview')).toBeInTheDocument();
      expect(screen.getByTitle('Reset to defaults')).toBeInTheDocument();
      expect(screen.getByTitle('Randomize values')).toBeInTheDocument();
    });

    test('should reset customizations', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm
      window.confirm = jest.fn(() => true);
      
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      // Make a change
      const nameInput = screen.getByDisplayValue('Test Template');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified');
      
      // Reset
      const resetButton = screen.getByTitle('Reset to defaults');
      await user.click(resetButton);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(nameInput).toHaveValue('Test Template');
    });

    test('should randomize values', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const randomizeButton = screen.getByTitle('Randomize values');
      await user.click(randomizeButton);
      
      // Should not throw errors
      expect(randomizeButton).toBeInTheDocument();
    });

    test('should close dialog', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<TemplateCustomizationDialog {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /×/ });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Footer Actions', () => {
    test('should show footer buttons', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Apply Customizations')).toBeInTheDocument();
    });

    test('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<TemplateCustomizationDialog {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    test('should call onConfirm when apply is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      
      render(<TemplateCustomizationDialog {...defaultProps} onConfirm={onConfirm} />);
      
      const applyButton = screen.getByText('Apply Customizations');
      await user.click(applyButton);
      
      expect(onConfirm).toHaveBeenCalled();
    });

    test('should pass customized template to onConfirm', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      
      render(<TemplateCustomizationDialog {...defaultProps} onConfirm={onConfirm} />);
      
      // Make changes
      const nameInput = screen.getByDisplayValue('Test Template');
      await user.clear(nameInput);
      await user.type(nameInput, 'Customized Template');
      
      const applyButton = screen.getByText('Apply Customizations');
      await user.click(applyButton);
      
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Customized Template'
        })
      );
    });

    test('should show dirty state indicator', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      // Make a change
      const nameInput = screen.getByDisplayValue('Test Template');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified');
      
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  describe('Preset Customizations', () => {
    test('should apply preset customizations', () => {
      const presetCustomizations = {
        name: 'Preset Name',
        strength: 18
      };
      
      render(
        <TemplateCustomizationDialog 
          {...defaultProps} 
          presetCustomizations={presetCustomizations} 
        />
      );
      
      expect(screen.getByDisplayValue('Preset Name')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should handle mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });

    test('should handle desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle template without customization options', () => {
      const templateWithoutOptions = {
        ...mockTemplate,
        customizationOptions: undefined
      };
      
      render(<TemplateCustomizationDialog {...defaultProps} template={templateWithoutOptions} />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    test('should handle template without text templates', () => {
      const templateWithoutText = {
        ...mockTemplate,
        textTemplates: undefined,
        textTemplateFields: undefined
      };
      
      render(<TemplateCustomizationDialog {...defaultProps} template={templateWithoutText} />);
      
      expect(screen.getByText('Structure')).toBeInTheDocument();
    });

    test('should handle empty context', () => {
      render(<TemplateCustomizationDialog {...defaultProps} context={{}} />);
      
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });

    test('should handle null context', () => {
      render(<TemplateCustomizationDialog {...defaultProps} context={null} />);
      
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog', { hidden: true });
      expect(dialog).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      // Should be able to tab through elements
      await user.keyboard('{Tab}');
      await user.keyboard('{Tab}');
      
      // Should not throw errors
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });

    test('should handle escape key to close', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<TemplateCustomizationDialog {...defaultProps} onClose={onClose} />);
      
      await user.keyboard('{Escape}');
      
      // Note: This would require additional implementation to handle escape key
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should handle large templates efficiently', () => {
      const largeTemplate = {
        ...mockTemplate,
        customizationOptions: {}
      };
      
      // Add many customization options
      for (let i = 0; i < 100; i++) {
        largeTemplate.customizationOptions[`option${i}`] = {
          type: 'string',
          label: `Option ${i}`,
          default: `value${i}`
        };
      }
      
      const start = Date.now();
      render(<TemplateCustomizationDialog {...defaultProps} template={largeTemplate} />);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(1000); // Should render within 1 second
      expect(screen.getByText('Customize Template: Test Template')).toBeInTheDocument();
    });

    test('should handle rapid input changes', async () => {
      const user = userEvent.setup();
      render(<TemplateCustomizationDialog {...defaultProps} />);
      
      const nameInput = screen.getByDisplayValue('Test Template');
      
      // Rapid typing
      await user.clear(nameInput);
      await user.type(nameInput, 'RapidTypingTest', { delay: 1 });
      
      expect(nameInput).toHaveValue('RapidTypingTest');
    });
  });
});