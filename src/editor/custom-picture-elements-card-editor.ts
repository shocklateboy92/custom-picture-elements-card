import memoizeOne from "memoize-one";
import type { CSSResultGroup } from "lit";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  any,
  array,
  assert,
  assign,
  object,
  optional,
  string,
  type,
} from "superstruct";
import { fireEvent } from "../utils/fire_event";
import type { HomeAssistant, LovelaceCardEditor, PictureElementsCardConfig, LovelaceElementConfig } from "../types";

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

@customElement("custom-picture-elements-card-editor")
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
          name: "",
          type: "expandable",
          title: "Card Options",
          schema: [
            { name: "title", selector: { text: {} } },
            { name: "image", selector: { image: {} } },
            { name: "dark_mode_image", selector: { image: {} } },
            {
              name: "camera_image",
              selector: { entity: { domain: "camera" } },
            },
            {
              name: "camera_view",
              selector: {
                select: {
                  options: ["auto", "live"].map((value) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                  })),
                  mode: "dropdown",
                },
              },
            },
            { name: "theme", selector: { theme: {} } },
            { name: "state_filter", selector: { object: {} } },
            { name: "dark_mode_filter", selector: { object: {} } },
          ],
        },
        {
          name: "",
          type: "expandable",
          title: "Elements",
          schema: [
            {
              name: "elements",
              selector: {
                list: {
                  add: {
                    type: "select",
                    options: [
                      { value: "state-badge", label: "State Badge" },
                      { value: "state-icon", label: "State Icon" },
                      { value: "state-label", label: "State Label" },
                      { value: "icon", label: "Icon" },
                      { value: "image", label: "Image" },
                      { value: "conditional", label: "Conditional" },
                    ],
                  },
                  schema: [
                    { name: "type", selector: { select: {
                      options: [
                        { value: "state-badge", label: "State Badge" },
                        { value: "state-icon", label: "State Icon" },
                        { value: "state-label", label: "State Label" },
                        { value: "icon", label: "Icon" },
                        { value: "image", label: "Image" },
                        { value: "conditional", label: "Conditional" },
                      ]
                    }}},
                    { name: "entity", selector: { entity: {} } },
                    { name: "icon", selector: { icon: {} } },
                    { name: "image", selector: { image: {} } },
                    { name: "title", selector: { text: {} } },
                    {
                      name: "style",
                      selector: {
                        object: {
                          schema: [
                            { name: "top", selector: { text: {} } },
                            { name: "left", selector: { text: {} } },
                            { name: "transform", selector: { text: {} } },
                            { name: "background", selector: { text: {} } },
                            { name: "color", selector: { text: {} } },
                            { name: "font-size", selector: { text: {} } },
                            { name: "border-radius", selector: { text: {} } },
                            { name: "padding", selector: { text: {} } },
                            { name: "margin", selector: { text: {} } },
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      ] as const
  );

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    if (this._subElementEditorConfig) {
      return html`
        <hui-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </hui-sub-element-editor>
      `;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema(this.hass.localize)}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._formChanged}
      ></ha-form>
    `;
  }

  private _formChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    fireEvent(this, "config-changed", { config: ev.detail.value });
  }

  private _elementsChanged(ev: CustomEvent): void {
    ev.stopPropagation();

    const oldLength = this._config?.elements?.length || 0;
    const config = {
      ...this._config,
      elements: ev.detail.elements as LovelaceElementConfig[],
    };

    fireEvent(this, "config-changed", { config });

    const newLength = ev.detail.elements?.length || 0;
    if (newLength === oldLength + 1) {
      const index = newLength - 1;
      this._subElementEditorConfig = {
        index,
        type: "element",
        elementConfig: { ...ev.detail.elements[index] },
      };
    }
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;

    if (configValue === "element") {
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

    fireEvent(this, "config-changed", { config: this._config });
  }

  private _editDetailElement(ev: any): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }

  private _computeLabelCallback = (schema: any) => {
    switch (schema.name) {
      case "dark_mode_image":
      case "state_filter":
      case "dark_mode_filter":
        return schema.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      default:
        return schema.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  static get styles(): CSSResultGroup {
    return [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "custom-picture-elements-card-editor": CustomPictureElementsCardEditor;
  }
}