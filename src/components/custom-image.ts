import { css, html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { classMap } from 'lit/directives/class-map';
import { styleMap } from 'lit/directives/style-map';
import { HomeAssistant, StateSpecificConfig } from '../types';
import { STATES_OFF, UNAVAILABLE, computeDomain } from '../utils/dom-utils';

const UPDATE_INTERVAL = 10000;
const DEFAULT_FILTER = 'grayscale(100%)';
const MAX_IMAGE_WIDTH = 640;
const ASPECT_RATIO_DEFAULT = 9 / 16;

const enum LoadState {
  Loading = 1,
  Loaded = 2,
  Error = 3,
}

function parseAspectRatio(aspectRatio: string): { w: number; h: number } | null {
  const match = aspectRatio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  return {
    w: parseFloat(match[1]),
    h: parseFloat(match[2]),
  };
}

@customElement('custom-image')
export class CustomImage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property() public entity?: string;

  @property() public image?: string;

  @property({ attribute: false }) public stateImage?: StateSpecificConfig;

  @property({ attribute: false }) public cameraImage?: string;

  @property({ attribute: false }) public cameraView?: 'live' | 'auto';

  @property({ attribute: false }) public aspectRatio?: string;

  @property() public filter?: string;

  @property({ attribute: false }) public stateFilter?: StateSpecificConfig;

  @property({ attribute: false }) public darkModeImage?: string;

  @property({ attribute: false }) public darkModeFilter?: string;

  @property({ attribute: 'fit-mode', type: String }) public fitMode?:
    | 'cover'
    | 'contain'
    | 'fill';

  @state() private _imageVisible? = false;

  @state() private _loadState?: LoadState;

  @state() private _cameraImageSrc?: string;

  @state() private _loadedImageSrc?: string;

  @state() private _lastImageHeight?: number;

  private _intersectionObserver?: IntersectionObserver;

  private _cameraUpdater?: number;

  private _ratio: {
    w: number;
    h: number;
  } | null = null;

  public connectedCallback(): void {
    super.connectedCallback();
    if (this._loadState === undefined) {
      this._loadState = LoadState.Loading;
    }
    if (this.cameraImage && this.cameraView !== 'live') {
      this._startIntersectionObserverOrUpdates();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopUpdateCameraInterval();
    this._stopIntersectionObserver();
    this._imageVisible = undefined;
  }

  protected handleIntersectionCallback(entries: IntersectionObserverEntry[]) {
    this._imageVisible = entries[0].isIntersecting;
  }

  public willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('hass')) {
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

      if (this._shouldStartCameraUpdates(oldHass)) {
        this._startIntersectionObserverOrUpdates();
      } else if (!this.hass!.connected) {
        this._stopUpdateCameraInterval();
        this._stopIntersectionObserver();
        this._loadState = LoadState.Loading;
        this._cameraImageSrc = undefined;
        this._loadedImageSrc = undefined;
      }
    }
    if (changedProps.has('_imageVisible')) {
      if (this._imageVisible) {
        if (this._shouldStartCameraUpdates()) {
          this._startUpdateCameraInterval();
        }
      } else {
        this._stopUpdateCameraInterval();
      }
    }
    if (changedProps.has('aspectRatio')) {
      this._ratio = this.aspectRatio
        ? parseAspectRatio(this.aspectRatio)
        : null;
    }
    if (this._loadState === LoadState.Loading && !this.cameraImage) {
      this._loadState = LoadState.Loaded;
    }
  }

  protected render() {
    if (!this.hass) {
      return nothing;
    }
    const useRatio = Boolean(
      this._ratio && this._ratio.w > 0 && this._ratio.h > 0
    );
    const stateObj = this.entity ? this.hass.states[this.entity] : undefined;
    const entityState = stateObj ? stateObj.state : UNAVAILABLE;

    // Figure out image source to use
    let imageSrc: string | undefined;
    let imageFallback = !this.stateImage;

    if (this.cameraImage) {
      if (this.cameraView !== 'live') {
        imageSrc = this._cameraImageSrc;
      }
    } else if (this.stateImage) {
      const stateImage = this.stateImage[entityState];

      if (stateImage) {
        imageSrc = stateImage;
      } else {
        imageSrc = this.image;
        imageFallback = true;
      }
    } else if (this.darkModeImage && this.hass.themes.darkMode) {
      imageSrc = this.darkModeImage;
    } else if (stateObj && computeDomain(stateObj.entity_id) === 'image') {
      // Simplified - in real implementation would need to handle image entities
      imageSrc = stateObj.attributes.entity_picture || this.image;
    } else {
      imageSrc = this.image;
    }

    if (imageSrc) {
      imageSrc = this.hass.hassUrl(imageSrc);
    }

    // Figure out filter to use
    let filter = this.filter || '';

    if (this.hass.themes.darkMode && this.darkModeFilter) {
      filter += this.darkModeFilter;
    }

    if (this.stateFilter && this.stateFilter[entityState]) {
      filter += this.stateFilter[entityState];
    }

    if (!filter && this.entity) {
      const isOff = !stateObj || STATES_OFF.includes(entityState);
      filter = isOff && imageFallback ? DEFAULT_FILTER : '';
    }

    return html`
      <div
        style=${styleMap({
          paddingBottom: useRatio
            ? `${((100 * this._ratio!.h) / this._ratio!.w).toFixed(2)}%`
            : this._lastImageHeight === undefined
              ? '56.25%'
              : undefined,
          backgroundImage:
            useRatio && this._loadedImageSrc
              ? `url("${this._loadedImageSrc}")`
              : undefined,
          filter:
            this._loadState === LoadState.Loaded || this.cameraView === 'live'
              ? filter
              : undefined,
        })}
        class="container ${classMap({
          ratio: useRatio || this._lastImageHeight === undefined,
          contain: this.fitMode === 'contain',
          fill: this.fitMode === 'fill',
        })}"
      >
        ${imageSrc === undefined
          ? nothing
          : html`
              <img
                id="image"
                src=${imageSrc}
                alt=${this.entity || ''}
                @error=${this._onImageError}
                @load=${this._onImageLoad}
                style=${styleMap({
                  display:
                    useRatio || this._loadState === LoadState.Loaded
                      ? 'block'
                      : 'none',
                })}
              />
            `}
        ${this._loadState === LoadState.Error
          ? html`<div
              id="brokenImage"
              style=${styleMap({
                height: !useRatio
                  ? `${this._lastImageHeight}px` || '100%'
                  : undefined,
              })}
            ></div>`
          : imageSrc === undefined || this._loadState === LoadState.Loading
            ? html`<div
                class="progress-container"
                style=${styleMap({
                  height: !useRatio
                    ? `${this._lastImageHeight}px` || '100%'
                    : undefined,
                })}
              >
                <div class="spinner">Loading...</div>
              </div>`
            : ''}
      </div>
    `;
  }

  protected _shouldStartCameraUpdates(oldHass?: HomeAssistant): boolean {
    return !!(
      (!oldHass || oldHass.connected !== this.hass!.connected) &&
      this.hass!.connected &&
      this.cameraView !== 'live'
    );
  }

  private _startIntersectionObserverOrUpdates(): void {
    if ('IntersectionObserver' in window) {
      if (!this._intersectionObserver) {
        this._intersectionObserver = new IntersectionObserver(
          this.handleIntersectionCallback.bind(this)
        );
      }
      this._intersectionObserver.observe(this);
    } else {
      this._imageVisible = true;
      this._startUpdateCameraInterval();
    }
  }

  private _stopIntersectionObserver(): void {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
  }

  private _startUpdateCameraInterval(): void {
    this._stopUpdateCameraInterval();
    this._updateCameraImageSrc();
    if (this.cameraImage && this.isConnected) {
      this._cameraUpdater = window.setInterval(
        () => this._updateCameraImageSrcAtInterval(),
        UPDATE_INTERVAL
      );
    }
  }

  private _stopUpdateCameraInterval(): void {
    if (this._cameraUpdater) {
      clearInterval(this._cameraUpdater);
      this._cameraUpdater = undefined;
    }
  }

  private _onImageError(): void {
    this._loadState = LoadState.Error;
  }

  private async _onImageLoad(ev: Event): Promise<void> {
    this._loadState = LoadState.Loaded;
    const imgEl = ev.target as HTMLImageElement;
    if (this._ratio && this._ratio.w > 0 && this._ratio.h > 0) {
      this._loadedImageSrc = imgEl.src;
    }
    await this.updateComplete;
    this._lastImageHeight = imgEl.offsetHeight;
  }

  private async _updateCameraImageSrcAtInterval(): Promise<void> {
    if (this._loadState === LoadState.Loading) {
      this._onImageError();
    }
    return this._updateCameraImageSrc();
  }

  private async _updateCameraImageSrc(): Promise<void> {
    if (!this.hass || !this.cameraImage) {
      return;
    }

    const cameraState = this.hass.states[this.cameraImage];

    if (!cameraState) {
      this._onImageError();
      return;
    }

    // Simplified camera thumbnail logic - in real implementation would use proper API
    this._cameraImageSrc = `/api/camera_proxy/${this.cameraImage}`;

    if (this._cameraImageSrc === undefined) {
      this._onImageError();
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    .container {
      transition: filter 0.2s linear;
      height: 100%;
    }

    img {
      display: block;
      height: 100%;
      width: 100%;
      object-fit: cover;
    }

    .progress-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner {
      color: var(--primary-text-color, #212121);
    }

    .ratio {
      position: relative;
      width: 100%;
      height: 0;
      background-position: center;
      background-size: cover;
    }

    .ratio.fill {
      background-size: 100% 100%;
    }

    .ratio.contain {
      background-size: contain;
      background-repeat: no-repeat;
    }

    .fill img {
      object-fit: fill;
    }

    .contain img {
      object-fit: contain;
    }

    .ratio img,
    .ratio div {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .ratio img {
      visibility: hidden;
    }

    #brokenImage {
      background: grey center/36px no-repeat;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M21,5V6.59L19.59,5H21M19,9.5V3.5A0.5,0.5 0 0,0 18.5,3H5.5A0.5,0.5 0 0,0 5,3.5V9.5A0.5,0.5 0 0,0 5.5,10H18.5A0.5,0.5 0 0,0 19,9.5Z'/%3E%3C/svg%3E");
    }
  `;
}