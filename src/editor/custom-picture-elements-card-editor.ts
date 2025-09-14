import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { HomeAssistant, LovelaceCardEditor, CustomPictureElementsCardConfig } from '../types';
import { fireEvent } from '../utils/dom-utils';

@customElement('custom-picture-elements-card-editor')
export class CustomPictureElementsCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: CustomPictureElementsCardConfig;

  public setConfig(config: CustomPictureElementsCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="card-config">
        <div class="option">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            .value=${this._config.title || ''}
            @change=${this._valueChanged}
            data-config-attribute="title"
          />
        </div>

        <div class="option">
          <label for="image">Image URL</label>
          <input
            id="image"
            type="text"
            .value=${this._config.image || ''}
            @change=${this._valueChanged}
            data-config-attribute="image"
          />
        </div>

        <div class="option">
          <label for="image_entity">Image Entity</label>
          <input
            id="image_entity"
            type="text"
            .value=${this._config.image_entity || ''}
            @change=${this._valueChanged}
            data-config-attribute="image_entity"
            placeholder="image.example or person.john"
          />
        </div>

        <div class="option">
          <label for="camera_image">Camera Entity</label>
          <input
            id="camera_image"
            type="text"
            .value=${this._config.camera_image || ''}
            @change=${this._valueChanged}
            data-config-attribute="camera_image"
            placeholder="camera.example"
          />
        </div>

        <div class="option">
          <label for="camera_view">Camera View</label>
          <select
            id="camera_view"
            @change=${this._valueChanged}
            data-config-attribute="camera_view"
          >
            <option value="auto" ?selected=${this._config.camera_view === 'auto'}>Auto</option>
            <option value="live" ?selected=${this._config.camera_view === 'live'}>Live</option>
          </select>
        </div>

        <div class="option">
          <label for="aspect_ratio">Aspect Ratio</label>
          <input
            id="aspect_ratio"
            type="text"
            .value=${this._config.aspect_ratio || ''}
            @change=${this._valueChanged}
            data-config-attribute="aspect_ratio"
            placeholder="16:9"
          />
        </div>

        <div class="option">
          <label for="entity">State Entity</label>
          <input
            id="entity"
            type="text"
            .value=${this._config.entity || ''}
            @change=${this._valueChanged}
            data-config-attribute="entity"
            placeholder="sensor.example"
          />
        </div>

        <div class="option">
          <label for="theme">Theme</label>
          <input
            id="theme"
            type="text"
            .value=${this._config.theme || ''}
            @change=${this._valueChanged}
            data-config-attribute="theme"
            placeholder="theme_name"
          />
        </div>

        <div class="option">
          <label for="dark_mode_image">Dark Mode Image URL</label>
          <input
            id="dark_mode_image"
            type="text"
            .value=${this._config.dark_mode_image || ''}
            @change=${this._valueChanged}
            data-config-attribute="dark_mode_image"
          />
        </div>

        <div class="elements-config">
          <h3>Elements</h3>
          <div class="elements-list">
            ${this._config.elements?.map((element, index) => html`
              <div class="element-config">
                <div class="element-header">
                  <span>Element ${index + 1}: ${element.type}</span>
                  <button
                    @click=${() => this._removeElement(index)}
                    class="remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div class="element-details">
                  <label>Type:</label>
                  <select
                    @change=${(e) => this._updateElement(index, 'type', e.target.value)}
                  >
                    <option value="state-badge" ?selected=${element.type === 'state-badge'}>State Badge</option>
                    <option value="state-icon" ?selected=${element.type === 'state-icon'}>State Icon</option>
                    <option value="state-label" ?selected=${element.type === 'state-label'}>State Label</option>
                    <option value="icon" ?selected=${element.type === 'icon'}>Icon</option>
                    <option value="image" ?selected=${element.type === 'image'}>Image</option>
                    <option value="conditional" ?selected=${element.type === 'conditional'}>Conditional</option>
                  </select>

                  ${element.type !== 'icon' && element.type !== 'image' ? html`
                    <label>Entity:</label>
                    <input
                      type="text"
                      .value=${element.entity || ''}
                      @change=${(e) => this._updateElement(index, 'entity', e.target.value)}
                      placeholder="sensor.example"
                    />
                  ` : ''}

                  ${element.type === 'icon' ? html`
                    <label>Icon:</label>
                    <input
                      type="text"
                      .value=${element.icon || ''}
                      @change=${(e) => this._updateElement(index, 'icon', e.target.value)}
                      placeholder="mdi:home"
                    />
                  ` : ''}

                  ${element.type === 'image' ? html`
                    <label>Image URL:</label>
                    <input
                      type="text"
                      .value=${element.image || ''}
                      @change=${(e) => this._updateElement(index, 'image', e.target.value)}
                    />
                  ` : ''}

                  <label>Title:</label>
                  <input
                    type="text"
                    .value=${element.title || ''}
                    @change=${(e) => this._updateElement(index, 'title', e.target.value)}
                  />

                  <label>Top Position:</label>
                  <input
                    type="text"
                    .value=${element.style?.top || '50%'}
                    @change=${(e) => this._updateElementStyle(index, 'top', e.target.value)}
                    placeholder="50%"
                  />

                  <label>Left Position:</label>
                  <input
                    type="text"
                    .value=${element.style?.left || '50%'}
                    @change=${(e) => this._updateElementStyle(index, 'left', e.target.value)}
                    placeholder="50%"
                  />
                </div>
              </div>
            `) || []}
          </div>
          <button @click=${this._addElement} class="add-button">
            Add Element
          </button>
        </div>
      </div>
    `;
  }

  private _valueChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const configAttribute = target.dataset.configAttribute;

    if (configAttribute) {
      const newConfig = {
        ...this._config,
        [configAttribute]: target.value || undefined,
      };

      fireEvent(this, 'config-changed', { config: newConfig });
    }
  }

  private _addElement(): void {
    if (!this._config) return;

    const newElement = {
      type: 'state-badge',
      entity: '',
      style: {
        top: '50%',
        left: '50%',
      },
    };

    const newConfig = {
      ...this._config,
      elements: [...(this._config.elements || []), newElement],
    };

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _removeElement(index: number): void {
    if (!this._config) return;

    const newElements = [...(this._config.elements || [])];
    newElements.splice(index, 1);

    const newConfig = {
      ...this._config,
      elements: newElements,
    };

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateElement(index: number, property: string, value: string): void {
    if (!this._config) return;

    const newElements = [...(this._config.elements || [])];
    newElements[index] = {
      ...newElements[index],
      [property]: value || undefined,
    };

    const newConfig = {
      ...this._config,
      elements: newElements,
    };

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateElementStyle(index: number, property: string, value: string): void {
    if (!this._config) return;

    const newElements = [...(this._config.elements || [])];
    newElements[index] = {
      ...newElements[index],
      style: {
        ...newElements[index].style,
        [property]: value,
      },
    };

    const newConfig = {
      ...this._config,
      elements: newElements,
    };

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }

    .option {
      margin-bottom: 16px;
    }

    .option label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .option input,
    .option select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }

    .elements-config {
      margin-top: 24px;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }

    .elements-config h3 {
      margin: 0 0 16px 0;
      color: var(--primary-text-color);
    }

    .element-config {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .element-header {
      background-color: var(--secondary-background-color);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .element-header span {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .element-details {
      padding: 16px;
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 8px;
      align-items: center;
    }

    .element-details label {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .element-details input,
    .element-details select {
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .add-button,
    .remove-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .add-button {
      background-color: var(--primary-color);
      color: white;
    }

    .remove-button {
      background-color: var(--error-color, #f44336);
      color: white;
      padding: 4px 12px;
      font-size: 12px;
    }

    .add-button:hover,
    .remove-button:hover {
      opacity: 0.8;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-picture-elements-card-editor': CustomPictureElementsCardEditor;
  }
}