export function fireEvent<T>(
  node: HTMLElement,
  type: string,
  detail?: T,
  options?: {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
  }
): Event {
  const event = new CustomEvent(type, {
    detail,
    bubbles: options?.bubbles ?? true,
    cancelable: options?.cancelable ?? true,
    composed: options?.composed ?? true,
  });
  node.dispatchEvent(event);
  return event;
}

export function applyThemesOnElement(
  element: HTMLElement,
  themes: any,
  theme?: string
): void {
  if (!theme || !themes || !themes[theme]) {
    return;
  }

  const themeStyles = themes[theme];
  Object.keys(themeStyles).forEach((key) => {
    if (key.startsWith('--')) {
      element.style.setProperty(key, themeStyles[key]);
    }
  });
}

export function computeDomain(entityId: string): string {
  return entityId.split('.')[0];
}

export const STATES_OFF = [
  'closed',
  'locked',
  'off',
  'docked',
  'idle',
  'standby',
  'paused',
  'auto',
];

export const UNAVAILABLE = 'unavailable';