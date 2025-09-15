export interface HomeAssistant {
  states: { [entity_id: string]: any };
  localize: (key: string, params?: Record<string, any>) => string;
  themes: {
    darkMode: boolean;
    themes: Record<string, any>;
  };
  hassUrl: (path: string) => string;
  connected: boolean;
  connection: any;
}

export interface LovelaceCard {
  hass?: HomeAssistant;
  preview?: boolean;
  setConfig(config: any): void;
  getCardSize(): number;
}

export interface LovelaceCardEditor {
  hass?: HomeAssistant;
  setConfig(config: any): void;
}

export interface CustomPictureElementsCardConfig {
  type: "custom:custom-picture-elements-card";
  title?: string;
  image?: string;
  image_entity?: string;
  camera_image?: string;
  camera_view?: "live" | "auto";
  state_image?: Record<string, string>;
  state_filter?: Record<string, string>;
  aspect_ratio?: string;
  entity?: string;
  elements: LovelaceElementConfig[];
  theme?: string;
  dark_mode_image?: string;
  dark_mode_filter?: string;
}

export interface LovelaceElementConfig {
  type: string;
  style?: Record<string, string>;
  entity?: string;
  title?: string;
  icon?: string;
  image?: string;
  camera_image?: string;
  action?: string;
  service?: string;
  service_data?: Record<string, any>;
  data?: Record<string, any>;
  elements?: LovelaceElementConfig[];
}

export interface LovelaceElement extends HTMLElement {
  hass?: HomeAssistant;
  preview?: boolean;
  setConfig?(config: LovelaceElementConfig): void;
}

export interface StateSpecificConfig {
  [state: string]: string;
}

export interface ActionConfig {
  action: "toggle" | "call-service" | "navigate" | "url" | "more-info" | "none";
  entity?: string;
  service?: string;
  service_data?: Record<string, any>;
  data?: Record<string, any>;
  navigation_path?: string;
  url_path?: string;
  confirmation?: boolean | { text?: string; exemptions?: any[] };
}

export interface ImageEntityAttributes {
  access_token: string;
  entity_picture?: string;
}

export interface ImageEntity {
  entity_id: string;
  state: string;
  attributes: ImageEntityAttributes;
}

export interface PersonEntity {
  entity_id: string;
  state: string;
  attributes: {
    entity_picture?: string;
    [key: string]: any;
  };
}

export interface PictureElementsCardConfig {
  type: "picture-elements";
  title?: string;
  image?: string;
  image_entity?: string;
  camera_image?: string;
  camera_view?: "live" | "auto";
  state_image?: Record<string, string>;
  state_filter?: Record<string, string>;
  aspect_ratio?: string;
  entity?: string;
  elements: LovelaceElementConfig[];
  theme?: string;
  dark_mode_image?: string;
  dark_mode_filter?: string;
}