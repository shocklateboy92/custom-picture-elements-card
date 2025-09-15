export const computeDomain = (entityId: string): string => {
  return entityId.split('.')[0];
};