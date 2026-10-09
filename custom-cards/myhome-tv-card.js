/* Compact, theme-aware Myhome TV card for the Test dashboard. */
class MyhomeTVCard extends HTMLElement {
  setConfig(config) {
    for (const key of ["media_entity", "power_entity", "plug_entity", "daily_entity", "monthly_entity", "remote_hash"]) {
      if (!config[key]) throw new Error("myhome-tv-card: " + key + " is required");
    }
    this._config = config;
    this._build();
    this._update();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._player) this._player.hass = hass;
    this._update();
  }
  connectedCallback() { this._maybePlayer(); this._update(); }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, rows: 5, min_columns: 6 }; }
  _state(id) { return this._hass?.states[id]; }
  _more(id) {
    if (id) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true }));
  }
  _togglePlug() {
    const id = this._config.plug_entity;
    const on = this._state(id)?.state === "on";
    if (on && !window.confirm("Turn off the TV plug? This will cut power to the TV.")) return;
    this._hass?.callService("homeassistant", on ? "turn_off" : "turn_on", { entity_id: id });
  }
  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const css = [
      ":host{display:block;font-family:var(--primary-font-family,inherit);--eb-blue:#9a6426}:host(.eb-dark){--eb-blue:#d5ab6c}",
      "ha-card{display:block;position:relative;box-sizing:border-box;overflow:hidden;padding:15px;border-radius:20px;border:0.5px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color) 95%,#a97332 5%),var(--card-background-color));color:var(--primary-text-color)}",
      "ha-card:before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#a97332,#e0b875)}",
      "header{display:flex;align-items:center;gap:8px;min-width:0}.badge-icon{width:36px;height:36px;display:grid;place-items:center;flex:none;border-radius:11px;background:color-mix(in srgb,var(--card-background-color) 83%,#a97332 17%);color:var(--eb-blue)}.badge-icon ha-icon{--mdc-icon-size:24px}",
      ".title{min-width:0;flex:1}.title strong{display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.title small{display:block;color:var(--secondary-text-color);font-size:11px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "button{font:inherit;color:inherit;cursor:pointer}header button{width:36px;height:36px;flex:none;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--primary-text-color) 12%,transparent);border-radius:11px;background:color-mix(in srgb,var(--card-background-color) 86%,var(--primary-text-color) 14%);padding:0}header button ha-icon{--mdc-icon-size:19px}button:focus-visible{outline:2px solid var(--eb-blue);outline-offset:2px}.plug.on{color:var(--state-light-active-color,#ffba52)}.plug.off{color:var(--secondary-text-color)}",
      ".screen{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;min-height:92px;padding:14px;margin-top:14px;border-radius:17px;border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);background:color-mix(in srgb,var(--card-background-color) 84%,var(--primary-background-color) 16%);cursor:pointer}.screen:before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 22% 48%,color-mix(in srgb,var(--eb-blue) 16%,transparent),transparent 55%);opacity:.3}.screen.playing:before{opacity:1}.screen-icon{position:relative;z-index:1;--mdc-icon-size:48px;color:var(--eb-blue);filter:drop-shadow(0 0 10px color-mix(in srgb,var(--eb-blue) 35%,transparent))}.screen-copy{position:relative;z-index:1;min-width:0}.screen-copy strong{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.screen-copy span{display:block;margin-top:6px;color:var(--secondary-text-color);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.shine{position:absolute;inset:-40% auto -40% -35%;width:25%;transform:skewX(-25deg);background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--eb-blue) 17%,transparent),transparent);opacity:0}.playing .shine{opacity:1;animation:eb-tv-sweep 5s linear infinite}.playing .screen-icon{animation:eb-tv-breathe 2.6s ease-in-out infinite}",
      ".powerline{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:14px 2px 10px;color:var(--secondary-text-color);font-size:12px}.powerline strong{color:var(--primary-text-color);font-size:20px}.stats{display:grid;grid-template-columns:1fr 1fr;gap:9px}.stat{text-align:left;min-width:0;border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);border-radius:13px;background:color-mix(in srgb,var(--card-background-color) 88%,var(--primary-text-color) 12%);padding:10px 12px}.stat small{display:block;color:var(--secondary-text-color);font-size:10px;font-weight:700;letter-spacing:.04em}.stat strong{display:block;margin-top:5px;font-size:16px}.player{margin-top:7px}.player[hidden]{display:none!important}mini-media-player{display:block;--ha-card-background:transparent;--ha-card-border-radius:0;--ha-card-box-shadow:none}",
      "@keyframes eb-tv-sweep{to{left:135%}}@keyframes eb-tv-breathe{50%{opacity:.58;transform:scale(.96)}}@media(prefers-reduced-motion:reduce){.playing .shine,.playing .screen-icon{animation:none}}"
    ].join("");
    root.innerHTML = "<style>" + css + "</style>" +
      "<ha-card><header><span class='badge-icon'><ha-icon icon='mdi:television-play'></ha-icon></span><span class='title'><strong></strong><small></small></span>" +
      "<button class='remote' aria-label='Open LG remote' title='Open LG remote'><ha-icon icon='mdi:remote-tv'></ha-icon></button>" +
      "<button class='history' aria-label='Power history' title='Power history'><ha-icon icon='mdi:chart-bar'></ha-icon></button>" +
      "<button class='plug' aria-label='Toggle TV plug' title='Toggle TV plug'><ha-icon icon='mdi:power-plug'></ha-icon></button></header>" +
      "<div class='screen' role='button' tabindex='0'><span class='shine'></span><ha-icon class='screen-icon' icon='mdi:television'></ha-icon><span class='screen-copy'><strong></strong><span></span></span></div>" +
      "<div class='powerline'><span>Current power</span><strong></strong></div><div class='stats'><button class='stat today'><small>TODAY</small><strong></strong></button><button class='stat month'><small>THIS MONTH</small><strong></strong></button></div><div class='player'></div></ha-card>";
    const q = s => root.querySelector(s);
    q(".title strong").textContent = this._config.name || "TV";
    q(".history").onclick = () => this._more(this._config.power_entity);
    q(".remote").onclick = () => { window.location.hash = this._config.remote_hash; };
    q(".plug").onclick = () => this._togglePlug();
    q(".screen").onclick = () => this._more(this._config.media_entity);
    q(".screen").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._more(this._config.media_entity); } };
    q(".today").onclick = () => this._more(this._config.daily_entity);
    q(".month").onclick = () => this._more(this._config.monthly_entity);
    this._maybePlayer();
  }
  _maybePlayer() {
    if (this._player || this._waiting || !this.shadowRoot) return;
    this._waiting = true;
    customElements.whenDefined("mini-media-player").then(() => {
      if (!this.shadowRoot || this._player) return;
      const player = document.createElement("mini-media-player");
      player.setConfig({ entity: this._config.media_entity, name: this._config.name || "TV", artwork: "none", card_mod: { style: "ha-card { background: transparent !important; border: none !important; box-shadow: none !important; }" } });
      this.shadowRoot.querySelector(".player").appendChild(player);
      this._player = player;
      if (this._hass) player.hass = this._hass;
      this._update();
    }).catch(() => { this._waiting = false; });
  }
  _update() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    this.classList.toggle("eb-dark", !!this._hass?.themes?.darkMode);
    const q = s => this.shadowRoot.querySelector(s), c = this._config;
    const primary = this._state(c.media_entity);
    const primaryAvailable = primary && !["off","standby","unavailable","unknown"].includes(primary.state);
    const media = primaryAvailable ? primary : (c.fallback_entity ? this._state(c.fallback_entity) : primary);
    const state = media?.state || "unknown";
    const appMedia = c.app_entity ? this._state(c.app_entity) : null;
    const appLive = appMedia && !["off", "standby", "unavailable", "unknown"].includes(appMedia.state);
    const appSource = appLive ? appMedia.attributes?.source : null;
    const appTitle = appLive ? appMedia.attributes?.media_title : null;
    const appName = appSource && !/^((logical )?hdmi|live tv|airplay)/i.test(appSource) ? appSource : null;
    const available = !["off","standby","unavailable","unknown"].includes(state);
    const p = Number.parseFloat(this._state(c.power_entity)?.state);
    const inferredUse = state === "on" && Number.isFinite(p) && p >= (c.activity_power_threshold ?? Infinity);
    const playing = state === "playing" || (appLive && appMedia.state === "playing"), animated = playing || inferredUse;
    const plugOn = this._state(c.plug_entity)?.state === "on";
    const source = media?.attributes?.source, title = media?.attributes?.media_title;
    q(".title small").textContent = !available ? "TV unavailable" : playing ? "Playing" : state === "paused" ? "Paused" : inferredUse ? "TV in use" : "TV on";
    q(".screen").classList.toggle("playing", animated);
    q(".screen-icon").setAttribute("icon", animated ? "mdi:television-play" : "mdi:television");
    q(".screen-copy strong").textContent = appTitle || appName || title || (inferredUse ? "TV in use" : available ? "Ready to play" : "TV is off");
    q(".screen-copy span").textContent = appName ? "App: " + appName : available && source ? "Input: " + source + (c.app_entity && !appLive ? " · app unavailable" : "") : (plugOn ? "Plug on" : "Plug off");
    q(".powerline strong").textContent = Number.isFinite(p) ? (p >= 1000 ? (p/1000).toFixed(2) + " kW" : p.toFixed(1) + " W") : "—";
    for (const [key,id] of [["today",c.daily_entity],["month",c.monthly_entity]]) {
      const n = Number.parseFloat(this._state(id)?.state);
      q("." + key + " strong").textContent = Number.isFinite(n) ? n.toFixed(2) + " kWh" : "—";
    }
    q(".plug").classList.toggle("on", plugOn);
    q(".plug").classList.toggle("off", !plugOn);
    q(".plug").querySelector("ha-icon").setAttribute("icon", plugOn ? "mdi:power-plug" : "mdi:power-plug-off");
    q(".plug").title = plugOn ? "Turn off TV plug" : "Turn on TV plug";
    q(".player").hidden = !primaryAvailable;
    if (this._player) this._player.hass = this._hass;
  }
}
if (!customElements.get("myhome-tv-card")) customElements.define("myhome-tv-card", MyhomeTVCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "myhome-tv-card", name: "Myhome TV", description: "Theme-aware TV, power and energy card with remote and plug controls." });
