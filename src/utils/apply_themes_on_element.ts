// Minimal implementation of applyThemesOnElement for the custom card
export const applyThemesOnElement = (
  element: HTMLElement,
  themes: any,
  selectedTheme?: string
) => {
  // Simple theme application - just set CSS variables if theme exists
  if (!selectedTheme || !themes?.themes?.[selectedTheme]) {
    return;
  }

  const themeVars = themes.themes[selectedTheme];
  if (themeVars) {
    Object.keys(themeVars).forEach((key) => {
      element.style.setProperty(`--${key}`, themeVars[key]);
    });
  }
};