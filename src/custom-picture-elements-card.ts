import { css, html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceElement,
  LovelaceElementConfig,
  CustomPictureElementsCardConfig,
} from './types';
import { applyThemesOnElement, computeDomain } from './utils/dom-utils';
import { createStyledCustomElement } from './utils/create-styled-element';
import './components/custom-image';

@customElement('custom-picture-elements-card')
export class CustomPictureElementsCard extends LitElement implements LovelaceCard {
  public static async getConfigElement() {
    // Editor will be loaded dynamically when needed
    await import('./editor/custom-picture-elements-card-editor');
    return document.createElement('custom-picture-elements-card-editor');
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ type: Boolean }) public preview = false;

  @state() private _elements?: LovelaceElement[];

  public static getStubConfig(
    hass?: HomeAssistant,
    entities?: string[],
    entitiesFallback?: string[]
  ): CustomPictureElementsCardConfig {
    const foundEntities = entities?.slice(0, 1) || entitiesFallback?.slice(0, 1) || [];

    return {
      type: 'custom:custom-picture-elements-card',
      elements: [
        {
          type: 'state-badge',
          entity: foundEntities[0] || '',
          style: {
            top: '32%',
            left: '40%',
          },
        },
      ],
      image: 'https://demo.home-assistant.io/stub_config/floorplan.png',
    };
  }

  @state() private _config?: CustomPictureElementsCardConfig;

  public getCardSize(): number {
    return 4;
  }

  public setConfig(config: CustomPictureElementsCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    } else if (
      !(
        config.image ||
        config.image_entity ||
        config.camera_image ||
        config.state_image
      ) ||
      (config.state_image && !config.entity)
    ) {
      throw new Error('Image required');
    } else if (!Array.isArray(config.elements)) {
      throw new Error('Elements required');
    }

    this._config = config;

    this._elements = config.elements.map((element) => {
      const cardElement = this._createElement(element);
      return cardElement;
    });
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    if (this._elements && changedProps.has('hass')) {
      for (const element of this._elements) {
        element.hass = this.hass;
      }
    }

    if (this._elements && changedProps.has('preview')) {
      for (const element of this._elements) {
        element.preview = this.preview;
      }
    }

    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    const oldConfig = changedProps.get('_config') as
      | CustomPictureElementsCardConfig
      | undefined;

    if (
      !oldHass ||
      !oldConfig ||
      oldHass.themes !== this.hass.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this.hass.themes, this._config.theme);
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    let image: string | undefined = this._config.image;
    if (this._config.image_entity) {
      const stateObj = this.hass.states[this._config.image_entity];
      const domain: string = computeDomain(this._config.image_entity);
      switch (domain) {
        case 'image':
          // Simplified image entity handling
          image = stateObj?.attributes?.entity_picture || this._config.image;
          break;
        case 'person':
          if (stateObj?.attributes?.entity_picture) {
            image = stateObj.attributes.entity_picture;
          }
          break;
      }
    }

    return html`
      <ha-card .header=${this._config.title}>
        <div id="root">
          <custom-image
            .hass=${this.hass}
            .image=${image}
            .stateImage=${this._config.state_image}
            .stateFilter=${this._config.state_filter}
            .cameraImage=${this._config.camera_image}
            .cameraView=${this._config.camera_view}
            .entity=${this._config.entity}
            .aspectRatio=${this._config.aspect_ratio}
            .darkModeFilter=${this._config.dark_mode_filter}
            .darkModeImage=${this._config.dark_mode_image}
          ></custom-image>
          ${this._elements}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    #root {
      position: relative;
    }

    .element {
      position: absolute;
      transform: translate(-50%, -50%);
    }

    ha-card {
      overflow: hidden;
      height: 100%;
      box-sizing: border-box;
    }

    /* Fallback for ha-card if not available */
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(
        --ha-card-box-shadow,
        0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.15)
      );
      color: var(--primary-text-color);
      display: block;
      transition: all 0.3s ease-out 0s;
      position: relative;
    }

    /* Header styling if ha-card is not available */
    .header {
      color: var(--ha-card-header-color, --primary-text-color);
      font-family: var(--ha-card-header-font-family, inherit);
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: normal;
      margin-top: 0;
      margin-bottom: 0;
      padding: 24px 16px 16px;
      display: block;
    }
  `;

  private _createElement(
    elementConfig: LovelaceElementConfig
  ): LovelaceElement {
    const element = createStyledCustomElement(elementConfig);
    if (this.hass) {
      element.hass = this.hass;
    }
    element.preview = this.preview;
    element.addEventListener(
      'll-rebuild',
      (ev) => {
        ev.stopPropagation();
        this._rebuildElement(element, elementConfig);
      },
      { once: true }
    );
    return element;
  }

  private _rebuildElement(
    elToReplace: LovelaceElement,
    config: LovelaceElementConfig
  ): void {
    const newCardEl = this._createElement(config);
    if (elToReplace.parentElement) {
      elToReplace.parentElement.replaceChild(newCardEl, elToReplace);
    }
    this._elements = this._elements!.map((curCardEl) =>
      curCardEl === elToReplace ? newCardEl : curCardEl
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-picture-elements-card': CustomPictureElementsCard;
  }
}

// Register the card
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'custom:custom-picture-elements-card',
  name: 'Custom Picture Elements Card',
  description: 'A customizable picture elements card',
  documentationURL: 'https://github.com/yourusername/custom-picture-elements-card',
  preview: true,
});

console.info(
  `%c  Custom Picture Elements Card %c v1.0.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);