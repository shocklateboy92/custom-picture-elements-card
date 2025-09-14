import{css as e,LitElement as t,nothing as i,html as a}from"lit";import{property as o,state as r,customElement as s}from"lit/decorators";import{classMap as n}from"lit/directives/class-map";import{styleMap as l}from"lit/directives/style-map";function c(e,t,i,a){var o,r=arguments.length,s=r<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,a);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}function d(e,t,i,a){const o=new CustomEvent(t,{detail:i,bubbles:!0,cancelable:!0,composed:!0});return e.dispatchEvent(o),o}function h(e){return e.split(".")[0]}"function"==typeof SuppressedError&&SuppressedError;const p=["closed","locked","off","docked","idle","standby","paused","auto"];var m;!function(e){e[e.Loading=1]="Loading",e[e.Loaded=2]="Loaded",e[e.Error=3]="Error"}(m||(m={}));let g=class extends t{constructor(){super(...arguments),this._imageVisible=!1,this._ratio=null}connectedCallback(){super.connectedCallback(),void 0===this._loadState&&(this._loadState=m.Loading),this.cameraImage&&"live"!==this.cameraView&&this._startIntersectionObserverOrUpdates()}disconnectedCallback(){super.disconnectedCallback(),this._stopUpdateCameraInterval(),this._stopIntersectionObserver(),this._imageVisible=void 0}handleIntersectionCallback(e){this._imageVisible=e[0].isIntersecting}willUpdate(e){if(e.has("hass")){const t=e.get("hass");this._shouldStartCameraUpdates(t)?this._startIntersectionObserverOrUpdates():this.hass.connected||(this._stopUpdateCameraInterval(),this._stopIntersectionObserver(),this._loadState=m.Loading,this._cameraImageSrc=void 0,this._loadedImageSrc=void 0)}e.has("_imageVisible")&&(this._imageVisible?this._shouldStartCameraUpdates()&&this._startUpdateCameraInterval():this._stopUpdateCameraInterval()),e.has("aspectRatio")&&(this._ratio=this.aspectRatio?function(e){const t=e.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);return t?{w:parseFloat(t[1]),h:parseFloat(t[2])}:null}(this.aspectRatio):null),this._loadState!==m.Loading||this.cameraImage||(this._loadState=m.Loaded)}render(){if(!this.hass)return i;const e=Boolean(this._ratio&&this._ratio.w>0&&this._ratio.h>0),t=this.entity?this.hass.states[this.entity]:void 0,o=t?t.state:"unavailable";let r,s=!this.stateImage;if(this.cameraImage)"live"!==this.cameraView&&(r=this._cameraImageSrc);else if(this.stateImage){const e=this.stateImage[o];e?r=e:(r=this.image,s=!0)}else r=this.darkModeImage&&this.hass.themes.darkMode?this.darkModeImage:t&&"image"===h(t.entity_id)&&t.attributes.entity_picture||this.image;r&&(r=this.hass.hassUrl(r));let c=this.filter||"";if(this.hass.themes.darkMode&&this.darkModeFilter&&(c+=this.darkModeFilter),this.stateFilter&&this.stateFilter[o]&&(c+=this.stateFilter[o]),!c&&this.entity){c=(!t||p.includes(o))&&s?"grayscale(100%)":""}return a`
      <div
        style=${l({paddingBottom:e?`${(100*this._ratio.h/this._ratio.w).toFixed(2)}%`:void 0===this._lastImageHeight?"56.25%":void 0,backgroundImage:e&&this._loadedImageSrc?`url("${this._loadedImageSrc}")`:void 0,filter:this._loadState===m.Loaded||"live"===this.cameraView?c:void 0})}
        class="container ${n({ratio:e||void 0===this._lastImageHeight,contain:"contain"===this.fitMode,fill:"fill"===this.fitMode})}"
      >
        ${void 0===r?i:a`
              <img
                id="image"
                src=${r}
                alt=${this.entity||""}
                @error=${this._onImageError}
                @load=${this._onImageLoad}
                style=${l({display:e||this._loadState===m.Loaded?"block":"none"})}
              />
            `}
        ${this._loadState===m.Error?a`<div
              id="brokenImage"
              style=${l({height:e?void 0:`${this._lastImageHeight}px`||"100%"})}
            ></div>`:void 0===r||this._loadState===m.Loading?a`<div
                class="progress-container"
                style=${l({height:e?void 0:`${this._lastImageHeight}px`||"100%"})}
              >
                <div class="spinner">Loading...</div>
              </div>`:""}
      </div>
    `}_shouldStartCameraUpdates(e){return!(e&&e.connected===this.hass.connected||!this.hass.connected||"live"===this.cameraView)}_startIntersectionObserverOrUpdates(){"IntersectionObserver"in window?(this._intersectionObserver||(this._intersectionObserver=new IntersectionObserver(this.handleIntersectionCallback.bind(this))),this._intersectionObserver.observe(this)):(this._imageVisible=!0,this._startUpdateCameraInterval())}_stopIntersectionObserver(){this._intersectionObserver&&this._intersectionObserver.disconnect()}_startUpdateCameraInterval(){this._stopUpdateCameraInterval(),this._updateCameraImageSrc(),this.cameraImage&&this.isConnected&&(this._cameraUpdater=window.setInterval(()=>this._updateCameraImageSrcAtInterval(),1e4))}_stopUpdateCameraInterval(){this._cameraUpdater&&(clearInterval(this._cameraUpdater),this._cameraUpdater=void 0)}_onImageError(){this._loadState=m.Error}async _onImageLoad(e){this._loadState=m.Loaded;const t=e.target;this._ratio&&this._ratio.w>0&&this._ratio.h>0&&(this._loadedImageSrc=t.src),await this.updateComplete,this._lastImageHeight=t.offsetHeight}async _updateCameraImageSrcAtInterval(){return this._loadState===m.Loading&&this._onImageError(),this._updateCameraImageSrc()}async _updateCameraImageSrc(){if(!this.hass||!this.cameraImage)return;this.hass.states[this.cameraImage]?(this._cameraImageSrc=`/api/camera_proxy/${this.cameraImage}`,void 0===this._cameraImageSrc&&this._onImageError()):this._onImageError()}};g.styles=e`
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
  `,c([o({attribute:!1})],g.prototype,"hass",void 0),c([o()],g.prototype,"entity",void 0),c([o()],g.prototype,"image",void 0),c([o({attribute:!1})],g.prototype,"stateImage",void 0),c([o({attribute:!1})],g.prototype,"cameraImage",void 0),c([o({attribute:!1})],g.prototype,"cameraView",void 0),c([o({attribute:!1})],g.prototype,"aspectRatio",void 0),c([o()],g.prototype,"filter",void 0),c([o({attribute:!1})],g.prototype,"stateFilter",void 0),c([o({attribute:!1})],g.prototype,"darkModeImage",void 0),c([o({attribute:!1})],g.prototype,"darkModeFilter",void 0),c([o({attribute:"fit-mode",type:String})],g.prototype,"fitMode",void 0),c([r()],g.prototype,"_imageVisible",void 0),c([r()],g.prototype,"_loadState",void 0),c([r()],g.prototype,"_cameraImageSrc",void 0),c([r()],g.prototype,"_loadedImageSrc",void 0),c([r()],g.prototype,"_lastImageHeight",void 0),g=c([s("custom-image")],g);let u=class extends t{constructor(){super(...arguments),this.preview=!1}static async getConfigElement(){return await Promise.resolve().then(function(){return _}),document.createElement("custom-picture-elements-card-editor")}static getStubConfig(e,t,i){return{type:"custom:custom-picture-elements-card",elements:[{type:"state-badge",entity:(t?.slice(0,1)||i?.slice(0,1)||[])[0]||"",style:{top:"32%",left:"40%"}}],image:"https://demo.home-assistant.io/stub_config/floorplan.png"}}getCardSize(){return 4}setConfig(e){if(!e)throw new Error("Invalid configuration");if(!(e.image||e.image_entity||e.camera_image||e.state_image)||e.state_image&&!e.entity)throw new Error("Image required");if(!Array.isArray(e.elements))throw new Error("Elements required");this._config=e,this._elements=e.elements.map(e=>this._createElement(e))}updated(e){if(super.updated(e),!this._config||!this.hass)return;if(this._elements&&e.has("hass"))for(const e of this._elements)e.hass=this.hass;if(this._elements&&e.has("preview"))for(const e of this._elements)e.preview=this.preview;const t=e.get("hass"),i=e.get("_config");t&&i&&t.themes===this.hass.themes&&i.theme===this._config.theme||function(e,t,i){if(!i||!t||!t[i])return;const a=t[i];Object.keys(a).forEach(t=>{t.startsWith("--")&&e.style.setProperty(t,a[t])})}(this,this.hass.themes,this._config.theme)}render(){if(!this.hass||!this._config)return i;let e=this._config.image;if(this._config.image_entity){const t=this.hass.states[this._config.image_entity];switch(h(this._config.image_entity)){case"image":e=t?.attributes?.entity_picture||this._config.image;break;case"person":t?.attributes?.entity_picture&&(e=t.attributes.entity_picture)}}return a`
      <ha-card .header=${this._config.title}>
        <div id="root">
          <custom-image
            .hass=${this.hass}
            .image=${e}
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
    `}_createElement(e){const t=function(e){const t=document.createElement("div");switch("conditional"!==e.type&&t.classList.add("element"),e.style&&Object.keys(e.style).forEach(i=>{t.style.setProperty(i,e.style[i])}),e.type){case"state-badge":case"state-icon":t.innerHTML="<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>";break;case"state-label":t.innerHTML="<span class=\"state-label\">${stateObj?.state || 'unavailable'}</span>";break;case"icon":t.innerHTML="<ha-icon .icon=${elementConfig.icon}></ha-icon>";break;case"image":t.innerHTML='<img src="${elementConfig.image}" alt="">';break;default:t.innerHTML="<div>Element: ${elementConfig.type}</div>"}return t}(e);return this.hass&&(t.hass=this.hass),t.preview=this.preview,t.addEventListener("ll-rebuild",i=>{i.stopPropagation(),this._rebuildElement(t,e)},{once:!0}),t}_rebuildElement(e,t){const i=this._createElement(t);e.parentElement&&e.parentElement.replaceChild(i,e),this._elements=this._elements.map(t=>t===e?i:t)}};u.styles=e`
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
  `,c([o({attribute:!1})],u.prototype,"hass",void 0),c([o({type:Boolean})],u.prototype,"preview",void 0),c([r()],u.prototype,"_elements",void 0),c([r()],u.prototype,"_config",void 0),u=c([s("custom-picture-elements-card")],u),window.customCards=window.customCards||[],window.customCards.push({type:"custom:custom-picture-elements-card",name:"Custom Picture Elements Card",description:"A customizable picture elements card",documentationURL:"https://github.com/yourusername/custom-picture-elements-card",preview:!0}),console.info("%c  Custom Picture Elements Card %c v1.0.0 ","color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");let v=class extends t{setConfig(e){this._config=e}render(){return this.hass&&this._config?a`
      <div class="card-config">
        <div class="option">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            .value=${this._config.title||""}
            @change=${this._valueChanged}
            data-config-attribute="title"
          />
        </div>

        <div class="option">
          <label for="image">Image URL</label>
          <input
            id="image"
            type="text"
            .value=${this._config.image||""}
            @change=${this._valueChanged}
            data-config-attribute="image"
          />
        </div>

        <div class="option">
          <label for="image_entity">Image Entity</label>
          <input
            id="image_entity"
            type="text"
            .value=${this._config.image_entity||""}
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
            .value=${this._config.camera_image||""}
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
            <option value="auto" ?selected=${"auto"===this._config.camera_view}>Auto</option>
            <option value="live" ?selected=${"live"===this._config.camera_view}>Live</option>
          </select>
        </div>

        <div class="option">
          <label for="aspect_ratio">Aspect Ratio</label>
          <input
            id="aspect_ratio"
            type="text"
            .value=${this._config.aspect_ratio||""}
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
            .value=${this._config.entity||""}
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
            .value=${this._config.theme||""}
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
            .value=${this._config.dark_mode_image||""}
            @change=${this._valueChanged}
            data-config-attribute="dark_mode_image"
          />
        </div>

        <div class="elements-config">
          <h3>Elements</h3>
          <div class="elements-list">
            ${this._config.elements?.map((e,t)=>a`
              <div class="element-config">
                <div class="element-header">
                  <span>Element ${t+1}: ${e.type}</span>
                  <button
                    @click=${()=>this._removeElement(t)}
                    class="remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div class="element-details">
                  <label>Type:</label>
                  <select
                    @change=${e=>this._updateElement(t,"type",e.target.value)}
                  >
                    <option value="state-badge" ?selected=${"state-badge"===e.type}>State Badge</option>
                    <option value="state-icon" ?selected=${"state-icon"===e.type}>State Icon</option>
                    <option value="state-label" ?selected=${"state-label"===e.type}>State Label</option>
                    <option value="icon" ?selected=${"icon"===e.type}>Icon</option>
                    <option value="image" ?selected=${"image"===e.type}>Image</option>
                    <option value="conditional" ?selected=${"conditional"===e.type}>Conditional</option>
                  </select>

                  ${"icon"!==e.type&&"image"!==e.type?a`
                    <label>Entity:</label>
                    <input
                      type="text"
                      .value=${e.entity||""}
                      @change=${e=>this._updateElement(t,"entity",e.target.value)}
                      placeholder="sensor.example"
                    />
                  `:""}

                  ${"icon"===e.type?a`
                    <label>Icon:</label>
                    <input
                      type="text"
                      .value=${e.icon||""}
                      @change=${e=>this._updateElement(t,"icon",e.target.value)}
                      placeholder="mdi:home"
                    />
                  `:""}

                  ${"image"===e.type?a`
                    <label>Image URL:</label>
                    <input
                      type="text"
                      .value=${e.image||""}
                      @change=${e=>this._updateElement(t,"image",e.target.value)}
                    />
                  `:""}

                  <label>Title:</label>
                  <input
                    type="text"
                    .value=${e.title||""}
                    @change=${e=>this._updateElement(t,"title",e.target.value)}
                  />

                  <label>Top Position:</label>
                  <input
                    type="text"
                    .value=${e.style?.top||"50%"}
                    @change=${e=>this._updateElementStyle(t,"top",e.target.value)}
                    placeholder="50%"
                  />

                  <label>Left Position:</label>
                  <input
                    type="text"
                    .value=${e.style?.left||"50%"}
                    @change=${e=>this._updateElementStyle(t,"left",e.target.value)}
                    placeholder="50%"
                  />
                </div>
              </div>
            `)||[]}
          </div>
          <button @click=${this._addElement} class="add-button">
            Add Element
          </button>
        </div>
      </div>
    `:i}_valueChanged(e){if(!this._config||!this.hass)return;const t=e.target,i=t.dataset.configAttribute;if(i){d(this,"config-changed",{config:{...this._config,[i]:t.value||void 0}})}}_addElement(){if(!this._config)return;d(this,"config-changed",{config:{...this._config,elements:[...this._config.elements||[],{type:"state-badge",entity:"",style:{top:"50%",left:"50%"}}]}})}_removeElement(e){if(!this._config)return;const t=[...this._config.elements||[]];t.splice(e,1);d(this,"config-changed",{config:{...this._config,elements:t}})}_updateElement(e,t,i){if(!this._config)return;const a=[...this._config.elements||[]];a[e]={...a[e],[t]:i||void 0};d(this,"config-changed",{config:{...this._config,elements:a}})}_updateElementStyle(e,t,i){if(!this._config)return;const a=[...this._config.elements||[]];a[e]={...a[e],style:{...a[e].style,[t]:i}};d(this,"config-changed",{config:{...this._config,elements:a}})}};v.styles=e`
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
  `,c([o({attribute:!1})],v.prototype,"hass",void 0),c([r()],v.prototype,"_config",void 0),v=c([s("custom-picture-elements-card-editor")],v);var _=Object.freeze({__proto__:null,get CustomPictureElementsCardEditor(){return v}});export{u as CustomPictureElementsCard};
