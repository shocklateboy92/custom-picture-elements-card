import type { LovelaceElementConfig, LovelaceElement } from '../types';

// Simplified element creation that just creates basic elements
export const createHuiElement = (config: LovelaceElementConfig): LovelaceElement => {
  // Handle legacy action-button -> service-button conversion
  if (config.type === "action-button") {
    config = { ...config, type: "service-button" };
  }

  // Create element based on type
  const elementMap: Record<string, string> = {
    'conditional': 'hui-conditional-element',
    'icon': 'hui-icon-element',
    'image': 'hui-image-element',
    'service-button': 'hui-service-button-element',
    'state-badge': 'hui-state-badge-element',
    'state-icon': 'hui-state-icon-element',
    'state-label': 'hui-state-label-element',
  };

  const tagName = elementMap[config.type] || `hui-${config.type}-element`;

  // Create the element - in a real implementation, this would load the actual element
  // For this port, we'll create a basic element that can hold the config
  const element = document.createElement(tagName) as LovelaceElement;

  // Try to set the config if the element supports it
  if ('setConfig' in element && typeof element.setConfig === 'function') {
    element.setConfig(config);
  }

  return element;
};