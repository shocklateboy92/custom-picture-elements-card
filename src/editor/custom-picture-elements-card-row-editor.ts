import { mdiClose, mdiContentDuplicate, mdiPencil } from '@mdi/js';
import deepClone from 'deep-clone-simple';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { fireEvent } from '../utils/fire_event';
import { stopPropagation } from '../utils/stop_propagation';
import type { HomeAssistant, LovelaceElementConfig } from '../types';

declare global {
  interface HASSDomEvents {
    'elements-changed': {
      elements: any[];
    };
  }
}

const elementTypes: string[] = [
  'state-badge',
  'state-icon',
  'state-label',
  'icon',
  'image',
  'conditional',
];

@customElement('custom-picture-elements-card-row-editor')
export class CustomPictureElementsCardRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public elements?: LovelaceElementConfig[];

  protected render() {
    if (!this.elements || !this.hass) {
      return nothing;
    }

    return html`
      <h3>Elements</h3>
      <div class="elements">
        ${this.elements.map(
          (element, index) => html`
            <div class="element">
              ${element.type
                ? html`
                    <div class="element-row">
                      <div>
                        <span>${element.type}</span>
                        <span class="secondary"
                          >${this._getSecondaryDescription(element)}</span
                        >
                      </div>
                    </div>
                  `
                : nothing}
              <ha-icon-button
                .label=${'Delete'}
                .path=${mdiClose}
                class="remove-icon"
                .index=${index}
                @click=${this._removeRow}
              ></ha-icon-button>
              <ha-icon-button
                .label=${'Edit'}
                .path=${mdiPencil}
                class="edit-icon"
                .index=${index}
                @click=${this._editRow}
              ></ha-icon-button>
              <ha-icon-button
                .label=${'Duplicate'}
                .path=${mdiContentDuplicate}
                class="duplicate-icon"
                .index=${index}
                @click=${this._duplicateRow}
              ></ha-icon-button>
            </div>
          `
        )}
        <ha-select
          fixedMenuPosition
          naturalMenuWidth
          .label=${'Add Element'}
          .value=${''}
          @closed=${stopPropagation}
          @selected=${this._addElement}
        >
          ${elementTypes.map(
            (element) => html`
              <ha-list-item .value=${element}>${element}</ha-list-item>
            `
          )}
        </ha-select>
      </div>
    `;
  }

  private _getSecondaryDescription(element: LovelaceElementConfig): string {
    if (element.title) return element.title;
    if ((element as any).entity) return (element as any).entity;
    if ((element as any).icon) return (element as any).icon;
    if ((element as any).image) return (element as any).image;
    return 'No configuration';
  }

  private async _addElement(ev: any): Promise<void> {
    const value = ev.target!.value;
    if (value === '') {
      return;
    }

    const stubConfig = { type: value };
    const newElements = this.elements!.concat(stubConfig);
    fireEvent(this, 'elements-changed', { elements: newElements });
    ev.target.value = '';
  }

  private _removeRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;
    if (confirm('Are you sure you want to delete this element?')) {
      const newElements = this.elements!.concat();
      newElements.splice(index, 1);
      fireEvent(this, 'elements-changed', { elements: newElements });
    }
  }

  private _editRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;
    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'element',
        elementConfig: this.elements![index],
      },
    });
  }

  private _duplicateRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;
    const newElements = [...this.elements!, deepClone(this.elements![index])];
    fireEvent(this, 'elements-changed', { elements: newElements });
  }

  static styles = css`
    .element {
      display: flex;
      align-items: center;
    }

    .element-row {
      height: 60px;
      font-size: var(--ha-font-size-l);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-grow: 1;
    }

    .element-row div {
      display: flex;
      flex-direction: column;
    }

    .remove-icon,
    .edit-icon,
    .duplicate-icon {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
    }

    .secondary {
      font-size: var(--ha-font-size-s);
      color: var(--secondary-text-color);
    }

    ha-select {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'custom-picture-elements-card-row-editor': CustomPictureElementsCardRowEditor;
  }
}