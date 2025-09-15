import type { ImageEntity } from '../types';

export const computeImageUrl = (entity: ImageEntity): string =>
  `/api/image_proxy/${entity.entity_id}?token=${entity.attributes.access_token}&state=${entity.state}`;
