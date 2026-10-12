/* Compact monitored-plug card used by the Test dashboard. */
class MyHomePowerDeviceCard extends HTMLElement {
  setConfig(config) {
    if (!config?.power_entity || !config?.plug_entity) throw new Error("power_entity and plug_entity are required");
    this._config = config;
    this._build();
    this._update();
  }

  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return 3; }
  getGridOptions() { return { columns: 12, rows: 3, min_columns: 6 }; }
  _state(id) { return this._hass?.states[id]; }
  _more(id) {
    if (id) this.dispatchEvent(new CustomEvent("hass-more-info", {
      detail: { entityId: id }, bubbles: true, composed: true
    }));
  }
  _toggle() {
    const id = this._config.plug_entity;
    const on = this._state(id)?.state === "on";
    if (on && !window.confirm(this._config.confirm_off_message || `Turn off power to ${this._config.name || "this device"}?`)) return;
    this._hass?.callService("homeassistant", on ? "turn_off" : "turn_on", { entity_id: id });
  }
  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host{display:block;font-family:var(--primary-font-family,inherit);--eb-accent:#9a6426}
        :host(.eb-dark){--eb-accent:#d5ab6c}
        ha-card{box-sizing:border-box;position:relative;overflow:hidden;padding:15px;border-radius:20px;
          border:0.5px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);
          background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color) 96%,var(--eb-accent) 4%),var(--card-background-color));color:var(--primary-text-color)}
        ha-card::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,var(--eb-accent),color-mix(in srgb,var(--eb-accent) 65%,var(--primary-text-color) 35%))}
        header{display:flex;align-items:center;gap:8px;min-width:0}
        .badge-icon{width:36px;height:36px;display:grid;place-items:center;flex:none;border-radius:11px;background:color-mix(in srgb,var(--card-background-color) 85%,var(--eb-accent) 15%);color:var(--eb-accent)}
        .badge-icon ha-icon{--mdc-icon-size:23px}.title{min-width:0;flex:1}.title strong{display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.title small{display:block;margin-top:3px;color:var(--secondary-text-color);font-size:11px}
        button{font:inherit;color:inherit;cursor:pointer}header button{width:36px;height:36px;flex:none;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--primary-text-color) 12%,transparent);border-radius:11px;background:color-mix(in srgb,var(--card-background-color) 86%,var(--primary-text-color) 14%);padding:0}header button ha-icon{--mdc-icon-size:19px}button:focus-visible,.visual:focus-visible{outline:2px solid var(--eb-accent);outline-offset:2px}.plug.on{color:var(--eb-accent)}.plug.off{color:var(--secondary-text-color)}
        .visual{display:flex;align-items:center;gap:13px;min-height:85px;margin-top:13px;padding:11px 14px;border-radius:16px;cursor:pointer;border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);background:color-mix(in srgb,var(--card-background-color) 84%,var(--primary-background-color) 16%)}
        .orb{width:58px;height:58px;flex:none;position:relative;display:grid;place-items:center;border-radius:50%;background:color-mix(in srgb,var(--card-background-color) 82%,var(--eb-accent) 18%);color:var(--eb-accent)}.orb::after{content:"";position:absolute;inset:-3px;border:3px solid transparent;border-top-color:var(--eb-accent);border-right-color:color-mix(in srgb,var(--eb-accent) 55%,transparent);border-radius:50%;opacity:0}.active .orb::after{opacity:1;animation:eb-orbit 3s linear infinite}.active .orb ha-icon{animation:eb-breathe 2.6s ease-in-out infinite}.orb ha-icon{--mdc-icon-size:31px}
        .visual-copy{min-width:0;flex:1}.visual-copy strong{display:block;font-size:20px;white-space:nowrap}.visual-copy span{display:block;margin-top:3px;font-size:12px;color:var(--secondary-text-color)}
        .meter{height:5px;margin:11px 2px 12px;border-radius:6px;overflow:hidden;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent)}.meter span{display:block;width:0;height:100%;border-radius:6px;background:linear-gradient(90deg,color-mix(in srgb,var(--eb-accent) 65%,var(--primary-text-color) 35%),var(--eb-accent));transition:width .5s}
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:9px}.stat{text-align:left;min-width:0;border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);border-radius:13px;background:color-mix(in srgb,var(--card-background-color) 88%,var(--primary-text-color) 12%);padding:10px 12px}.stat small{display:block;color:var(--secondary-text-color);font-size:10px;font-weight:700;letter-spacing:.04em}.stat strong{display:block;margin-top:5px;font-size:16px}
        @keyframes eb-orbit{to{transform:rotate(360deg)}}@keyframes eb-breathe{50%{opacity:.6;transform:scale(.94)}}@media(prefers-reduced-motion:reduce){.active .orb::after,.active .orb ha-icon{animation:none}}
      </style>
      <ha-card><header><span class="badge-icon"><ha-icon></ha-icon></span><span class="title"><strong></strong><small></small></span><button class="history" aria-label="Power history" title="Power history"><ha-icon icon="mdi:chart-bar"></ha-icon></button><button class="plug" aria-label="Toggle plug power"><ha-icon></ha-icon></button></header>
      <div class="visual" role="button" tabindex="0"><span class="orb"><ha-icon></ha-icon></span><span class="visual-copy"><strong></strong><span>Current power</span></span></div>
      <div class="meter"><span></span></div><div class="stats"><button class="stat today"><small>TODAY</small><strong></strong></button><button class="stat month"><small>THIS MONTH</small><strong></strong></button></div></ha-card>`;
    const q = s => root.querySelector(s);
    q(".history").onclick = () => this._more(this._config.power_entity);
    q(".plug").onclick = () => this._toggle();
    q(".visual").onclick = () => this._more(this._config.plug_entity);
    q(".visual").onkeydown = event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._more(this._config.plug_entity); } };
    q(".today").onclick = () => this._more(this._config.daily_entity);
    q(".month").onclick = () => this._more(this._config.monthly_entity);
  }
  _update() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    this.classList.toggle("eb-dark", !!this._hass.themes?.darkMode);
    const q = s => this.shadowRoot.querySelector(s), c = this._config;
    const plug = this._state(c.plug_entity)?.state;
    const power = Number.parseFloat(this._state(c.power_entity)?.state);
    const known = Number.isFinite(power), active = plug === "on" && known && power >= (c.activity_threshold ?? 8);
    const icon = c.icon || "mdi:power-plug";
    q(".badge-icon ha-icon").setAttribute("icon", icon);
    q(".orb ha-icon").setAttribute("icon", icon);
    q(".title strong").textContent = c.name || "Power device";
    q(".title small").textContent = plug === "off" ? "Power off" : !known || plug === "unavailable" ? "Power unavailable" : active ? "In use" : "Standby";
    q(".visual").classList.toggle("active", active);
    q(".visual-copy strong").textContent = known ? (power >= 1000 ? (power / 1000).toFixed(2) + " kW" : power.toFixed(1) + " W") : "—";
    q(".visual-copy span").textContent = active ? "Drawing power now" : plug === "off" ? "Plug off" : "Current power";
    q(".meter span").style.width = known ? Math.min(100, Math.max(0, power / (c.power_max || 500) * 100)) + "%" : "0%";
    q(".plug").classList.toggle("on", plug === "on");
    q(".plug").classList.toggle("off", plug !== "on");
    q(".plug ha-icon").setAttribute("icon", plug === "on" ? "mdi:power-plug" : "mdi:power-plug-off");
    q(".plug").title = plug === "on" ? "Turn off plug" : "Turn on plug";
    for (const [sel, id] of [[".today", c.daily_entity], [".month", c.monthly_entity]]) {
      const n = Number.parseFloat(this._state(id)?.state);
      q(sel).hidden = !id;
      q(sel + " strong").textContent = Number.isFinite(n) ? n.toFixed(2) + " kWh" : "—";
    }
  }
}
if (!customElements.get("myhome-power-device-card")) customElements.define("myhome-power-device-card", MyHomePowerDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "myhome-power-device-card", name: "MyHome Power Device", description: "Theme-aware monitored-plug card" });
