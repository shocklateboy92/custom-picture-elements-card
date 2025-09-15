export function fireEvent(
  node: HTMLElement,
  type: string,
  detail?: any,
  options?: {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
  }
): Event {
  const event = new CustomEvent(type, {
    bubbles: options?.bubbles !== false,
    cancelable: options?.cancelable !== false,
    composed: options?.composed !== false,
    detail,
  });
  node.dispatchEvent(event);
  return event;
}
