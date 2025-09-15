import memoizeOne from 'memoize-one';
import type { CSSResultGroup } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  any,
  array,
  assert,
  assign,
  object,
  optional,
  string,
  type,
} from 'superstruct';
import { fireEvent } from '../utils/fire_event';
import type {
  HomeAssistant,
  LovelaceCardEditor,
  PictureElementsCardConfig,
} from '../types';
import './custom-picture-elements-card-row-editor';

const genericElementConfigStruct = type({
  type: string(),
});

const cardConfigStruct = assign(
  object({
    type: string(),
  }),
  object({
    image: optional(string()),
    camera_image: optional(string()),
    camera_view: optional(string()),
    elements: array(genericElementConfigStruct),
    title: optional(string()),
    state_filter: optional(any()),
    theme: optional(string()),
    dark_mode_image: optional(string()),
    dark_mode_filter: optional(any()),
  })
);

@customElement('custom-picture-elements-card-editor')
export class CustomPictureElementsCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: PictureElementsCardConfig;

  @state() private _subElementEditorConfig?: any;

  public setConfig(config: PictureElementsCardConfig): void {
    assert(config, cardConfigStruct);
    this._config = config;
  }

  private _schema = memoizeOne(
    (localize: any) =>
      [
        {
          name: '',
          type: 'expandable',
          title: 'Card Options',
          schema: [
            { name: 'title', selector: { text: {} } },
            { name: 'image', selector: { image: {} } },
            { name: 'dark_mode_image', selector: { image: {} } },
            {
              name: 'camera_image',
              selector: { entity: { domain: 'camera' } },
            },
            {
              name: 'camera_view',
              selector: {
                select: {
                  options: ['auto', 'live'].map((value) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                  })),
                  mode: 'dropdown',
                },
              },
            },
            { name: 'theme', selector: { theme: {} } },
            { name: 'state_filter', selector: { object: {} } },
            { name: 'dark_mode_filter', selector: { object: {} } },
          ],
        },
      ] as const
  );

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    if (this._subElementEditorConfig) {
      return this._renderElementEditor();
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema(this.hass.localize)}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._formChanged}
      ></ha-form>
      <custom-picture-elements-card-row-editor
        .hass=${this.hass}
        .elements=${this._config.elements}
        @elements-changed=${this._elementsChanged}
        @edit-detail-element=${this._editDetailElement}
      ></custom-picture-elements-card-row-editor>
    `;
  }

  private _renderElementEditor() {
    if (!this._subElementEditorConfig || !this.hass) {
      return nothing;
    }

    const elementConfig = this._subElementEditorConfig.elementConfig || { type: 'state-icon' };
    const elementSchema = [
      { name: 'type', selector: { select: {
        options: [
          { value: 'state-badge', label: 'State Badge' },
          { value: 'state-icon', label: 'State Icon' },
          { value: 'state-label', label: 'State Label' },
          { value: 'icon', label: 'Icon' },
          { value: 'image', label: 'Image' },
          { value: 'conditional', label: 'Conditional' },
        ]
      }}},
      { name: 'entity', selector: { entity: {} }},
      { name: 'icon', selector: { icon: {} }},
      { name: 'title', selector: { text: {} }},
      { name: 'style', selector: { object: {} }},
    ];

    return html`
      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <ha-icon-button
            .path=${'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z'}
            @click=${this._goBack}
            style="margin-right: 8px;"
          ></ha-icon-button>
          <h3 style="margin: 0;">Edit Element: ${elementConfig.type || 'New Element'}</h3>
        </div>
        <ha-alert alert-type="info" style="margin-bottom: 16px;">
          Configure the element properties below. An entity is required for state-based elements.
        </ha-alert>
        <ha-form
          .hass=${this.hass}
          .data=${elementConfig}
          .schema=${elementSchema}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._elementFormChanged}
        ></ha-form>
      </div>
    `;
  }

  private _elementFormChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._subElementEditorConfig) {
      return;
    }

    const newElementConfig = ev.detail.value;
    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: newElementConfig,
    };

    // Update the main config
    if (this._config && this._subElementEditorConfig.type === 'element') {
      const newElements = [...this._config.elements];
      newElements[this._subElementEditorConfig.index!] = newElementConfig;

      fireEvent(this, 'config-changed', {
        config: { ...this._config, elements: newElements }
      });
    }
  }

  private _formChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }

  private _elementsChanged(ev: CustomEvent): void {
    ev.stopPropagation();

    const oldLength = this._config?.elements?.length || 0;
    const config = {
      ...this._config,
      elements: ev.detail.elements,
    };

    fireEvent(this, 'config-changed', { config });

    const newLength = ev.detail.elements?.length || 0;
    if (newLength === oldLength + 1) {
      const index = newLength - 1;
      this._subElementEditorConfig = {
        index,
        type: 'element',
        elementConfig: { ...ev.detail.elements[index] },
      };
    }
  }

  private _editDetailElement(ev: CustomEvent): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;

    if (configValue === 'element') {
      const newConfigElements = this._config.elements!.concat();
      if (!value) {
        newConfigElements.splice(this._subElementEditorConfig!.index!, 1);
        this._goBack();
      } else {
        newConfigElements[this._subElementEditorConfig!.index!] = value;
      }

      this._config = { ...this._config!, elements: newConfigElements };
    }

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig!,
      elementConfig: value,
    };

    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }

  private _computeLabelCallback = (schema: any) => {
    switch (schema.name) {
      case 'dark_mode_image':
      case 'state_filter':
      case 'dark_mode_filter':
        return schema.name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
      default:
        return schema.name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  static get styles(): CSSResultGroup {
    return [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-picture-elements-card-editor': CustomPictureElementsCardEditor;
  }
}
