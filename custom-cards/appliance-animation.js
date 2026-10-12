/* Test dashboard motion accents and dishwasher details. */
Promise.all([
  customElements.whenDefined("myhome-small-appliance-card"),
  customElements.whenDefined("myhome-cycle-card")
]).then(() => {
  if (!customElements.get("myhome-small-appliance-motion-card")) {
    class MyHomeSmallApplianceMotionCard extends customElements.get("myhome-small-appliance-card") {
      _render() {
        super._render();
        if (!this.shadowRoot) return;
        if (!this.shadowRoot.querySelector("#eb-motion-style")) {
          const style = document.createElement("style");
          style.id = "eb-motion-style";
          style.textContent = ".ring{position:relative}.running .ring::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:5px solid transparent;border-top-color:var(--myhome-accent-deep,#a97332);border-right-color:var(--myhome-accent-soft,#e0b875);animation:eb-orbit 2s linear infinite}.running .art svg{filter:drop-shadow(0 0 7px color-mix(in srgb,var(--myhome-accent-deep,#a97332) 32%,transparent))}button.eb-power{border:1px solid color-mix(in srgb,var(--primary-text-color) 13%,transparent);background:color-mix(in srgb,var(--card-background-color) 85%,var(--primary-text-color) 15%);min-width:40px;min-height:40px;margin-left:2px}button.eb-power.on{color:var(--state-light-active-color,#ffba52)}button.eb-power.off{color:var(--secondary-text-color)}:host{--eb-accent:var(--myhome-accent-deep,#9a6426);--eb-blue:var(--eb-accent)}:host(.eb-dark){--eb-accent:var(--myhome-accent,#d5ab6c)}ha-card{background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color) 96%,var(--eb-accent) 4%),var(--card-background-color))}ha-card:before{background:linear-gradient(90deg,var(--eb-accent),color-mix(in srgb,var(--eb-accent) 72%,var(--primary-text-color) 28%))}.icon{background:color-mix(in srgb,var(--card-background-color) 88%,var(--eb-accent) 12%)}.running .badge{background:color-mix(in srgb,var(--card-background-color) 85%,var(--eb-accent) 15%);color:var(--eb-accent)}.running .ring{border-color:var(--eb-accent);border-right-color:var(--divider-color)}.running .ring::after{border-top-color:var(--eb-accent);border-right-color:color-mix(in srgb,var(--eb-accent) 72%,var(--primary-text-color) 28%)}.fill{background:linear-gradient(90deg,color-mix(in srgb,var(--eb-accent) 75%,var(--primary-text-color) 25%),var(--eb-accent))}svg linearGradient[id=blue] stop:first-child{stop-color:var(--myhome-accent-soft,#e0b875)}svg linearGradient[id=blue] stop:last-child{stop-color:var(--myhome-accent-deep,#a97332)}@keyframes eb-orbit{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.running .ring::after{animation:none}}";
          this.shadowRoot.appendChild(style);
        }
        if (this._config.plug_entity && !this.shadowRoot.querySelector(".eb-power")) {
          const button = document.createElement("button");
          button.className = "eb-power";
          button.type = "button";
          button.setAttribute("aria-label", "Toggle " + this._config.name + " plug");
          button.innerHTML = '<ha-icon icon="mdi:power-plug"></ha-icon>';
          button.onclick = () => {
            const id = this._config.plug_entity;
            const on = this._state(id)?.state === "on";
            if (on && !window.confirm("Turn off the " + this._config.name + " plug?")) return;
            this._hass?.callService("homeassistant", on ? "turn_off" : "turn_on", { entity_id: id });
          };
          this.shadowRoot.querySelector(".history")?.after(button);
        }
        this._update();
      }
      _update() {
        super._update();
        this.classList.toggle("eb-dark", !!this._hass?.themes?.darkMode);
        const button = this.shadowRoot?.querySelector(".eb-power");
        if (!button || !this._hass) return;
        const on = this._state(this._config.plug_entity)?.state === "on";
        button.classList.toggle("on", on);
        button.classList.toggle("off", !on);
        button.querySelector("ha-icon").setAttribute("icon", on ? "mdi:power-plug" : "mdi:power-plug-off");
        button.title = on ? "Turn off " + this._config.name + " plug" : "Turn on " + this._config.name + " plug";
      }
    }
    customElements.define("myhome-small-appliance-motion-card", MyHomeSmallApplianceMotionCard);
  }
  if (!customElements.get("myhome-cycle-detail-card")) {
    class MyHomeCycleDetailCard extends customElements.get("myhome-cycle-card") {
      _build() {
        super._build();
        const root = this.shadowRoot;
        if (!root) return;
        const style = document.createElement("style");
        style.textContent = ":host ha-card::before{display:block;height:4px;background:linear-gradient(90deg,var(--myhome-accent-deep,#a97332),var(--myhome-accent-soft,#e0b875))}.eb-program{margin-top:12px}.eb-program[hidden]{display:none!important}.eb-program-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;color:var(--wm-muted)}.eb-program strong{color:var(--wm-text)}.eb-program-bar{height:7px;border-radius:7px;background:var(--wm-bar-bg);overflow:hidden;margin:9px 0}.eb-program-fill{height:100%;width:0;background:linear-gradient(90deg,var(--myhome-accent-soft,#dbad69),var(--myhome-accent-deep,#a97332));transition:width .5s}.eb-program-meta{font-size:11px;color:var(--wm-muted)}.lc-grid.eb-only-period{grid-template-columns:1fr}.eb-period-toggle{float:right;border:1px solid var(--wm-panel-border);border-radius:999px;background:var(--wm-panel-bg);color:var(--wm-text);padding:4px 10px;font-size:11px;cursor:pointer}.eb-period-stat{cursor:pointer}.eb-no-cycle{font-size:11px;color:var(--wm-muted);margin:8px 0}.eb-no-cycle[hidden]{display:none!important}";
        style.textContent += `
:host(.wm-dark) {
  --wm-grad: linear-gradient(160deg, color-mix(in srgb, var(--card-background-color, #1c1c20) 94%, var(--primary-background-color, #101012)) 0%, var(--card-background-color, #1c1c20) 100%);
  --wm-panel-bg: color-mix(in srgb, var(--card-background-color, #1c1c20) 88%, var(--primary-text-color, #fff));
  --wm-panel-border: color-mix(in srgb, var(--primary-text-color, #fff) 11%, transparent);
  --wm-icon-bg: color-mix(in srgb, var(--card-background-color, #1c1c20) 78%, var(--primary-text-color, #fff));
  --wm-btn-bg: color-mix(in srgb, var(--card-background-color, #1c1c20) 90%, var(--primary-text-color, #fff));
  --wm-btn-border: color-mix(in srgb, var(--primary-text-color, #fff) 13%, transparent);
  --wm-ring-track: color-mix(in srgb, var(--card-background-color, #1c1c20) 68%, var(--primary-text-color, #fff));
  --wm-bar-bg: color-mix(in srgb, var(--card-background-color, #1c1c20) 83%, var(--primary-text-color, #fff));
}
:host(.wm-dark) .machine linearGradient[id$="-body"] stop:nth-child(1) { stop-color: #49515d; }
:host(.wm-dark) .machine linearGradient[id$="-body"] stop:nth-child(2) { stop-color: #343b46; }
:host(.wm-dark) .machine linearGradient[id$="-body"] stop:nth-child(3) { stop-color: #252c36; }
:host(.wm-dark) .machine linearGradient[id$="-ring"] stop:nth-child(1) { stop-color: #4a5565; }
:host(.wm-dark) .machine linearGradient[id$="-ring"] stop:nth-child(2) { stop-color: #303947; }
:host(.wm-dark) .machine rect[stroke="#c7cfda"] { stroke: #657180; }
:host(.wm-dark) .machine circle[stroke="#c2cbd6"], :host(.wm-dark) .machine rect[stroke="#c2cbd6"] { stroke: #647182; }
:host(.wm-dark) .machine circle[fill="#e3e9f0"] { fill: #424e5e; }
:host(.wm-dark) .machine circle[fill="#e9edf3"], :host(.wm-dark) .machine rect[fill="#cfd7e0"], :host(.wm-dark) .machine rect[fill="#dee5ec"], :host(.wm-dark) .machine rect[fill="#dfe5ec"] { fill: #5a6675; }
:host(.wm-dark) .machine rect[fill="#9aa6b4"], :host(.wm-dark) .machine rect[fill="#b7c0cb"] { fill: #778493; }
`;
        style.textContent += "\n:host(.wm-native){--wm-accent:var(--myhome-accent-deep,#9a6426);--wm-btn-on-bg:color-mix(in srgb,var(--card-background-color) 88%,var(--wm-accent) 12%);--wm-btn-on-border:var(--wm-accent)}\n:host(.wm-native-dark){--wm-accent:var(--myhome-accent,#d5ab6c);--wm-btn-on-bg:color-mix(in srgb,var(--card-background-color) 84%,var(--wm-accent) 16%)}\n:host ha-card::before{background:linear-gradient(90deg,var(--wm-accent),color-mix(in srgb,var(--wm-accent) 70%,var(--wm-text) 30%))}\n.machine [stroke=\"#2f80ed\"],.h-icon svg [stroke=\"#2f80ed\"]{stroke:var(--wm-accent)}\n.machine [fill=\"#2f80ed\"],.h-icon svg [fill=\"#2f80ed\"]{fill:var(--wm-accent)}\n.machine [stroke=\"#7eb6ff\"]{stroke:color-mix(in srgb,var(--wm-accent) 70%,white 30%)}\n";
        style.textContent += "\n.h-icon svg{stroke:var(--wm-accent)}\n";
        root.appendChild(style);
        if (this._config.power_switch_entity) {
          const powerButton = document.createElement("div");
          powerButton.className = "h-btn";
          powerButton.id = "ebDishPower";
          powerButton.setAttribute("role", "button");
          powerButton.setAttribute("tabindex", "0");
          powerButton.setAttribute("aria-label", "Toggle dishwasher power");
          powerButton.innerHTML = '<ha-icon icon="mdi:power"></ha-icon>';
          const toggle = () => {
            const id = this._config.power_switch_entity;
            const on = this._st(id)?.state === "on";
            if (on && !window.confirm("Turn off dishwasher power?")) return;
            this._hass?.callService("homeassistant", on ? "turn_off" : "turn_on", { entity_id: id });
          };
          powerButton.addEventListener("click", toggle);
          powerButton.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
          });
          root.querySelector("#chartBtn")?.before(powerButton);
        }
        if (this._config.daily_entity || this._config.monthly_entity) {
          const lc = root.querySelector("#lastCycle");
          const toggle = document.createElement("button");
          toggle.className = "eb-period-toggle";
          toggle.type = "button";
          toggle.setAttribute("aria-label", "Switch between today's and this month's energy");
          toggle.addEventListener("click", (event) => {
            event.stopPropagation();
            this._period = this._period === "month" ? "day" : "month";
            this._update();
          });
          // Keep controls outside the upstream title: its textContent is replaced on every update.
          lc.querySelector(".lc-title").before(toggle);
          const note = document.createElement("div");
          note.className = "eb-no-cycle";
          lc.querySelector(".lc-grid").before(note);
          const stat = document.createElement("div");
          stat.className = "lc-item eb-period-stat";
          stat.innerHTML = '<div class="lc-label"></div><div class="lc-value"></div>';
          stat.addEventListener("click", () => this._moreInfo(this._period === "month" ? this._config.monthly_entity : this._config.daily_entity));
          lc.querySelector(".lc-grid").appendChild(stat);
        }
        if (this._config.appliance_type !== "dishwasher") return;
        const panel = document.createElement("div");
        panel.className = "panel eb-program";
        panel.hidden = true;
        panel.innerHTML = '<div class="eb-program-row"><span>Programme progress</span><strong class="eb-progress-text"></strong></div><div class="eb-program-bar"><div class="eb-program-fill"></div></div><div class="eb-program-meta"></div>';
        root.querySelector("#statusPanel")?.after(panel);
      }
      _update() {
        super._update();
        if (!this._built || !this._hass) return;
        // Follow the active HA card colour; some themes do not set themes.darkMode.
        const probe = document.createElement("span");
        probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;background:var(--card-background-color,var(--primary-background-color))";
        this.shadowRoot.appendChild(probe);
        const match = getComputedStyle(probe).backgroundColor.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
        probe.remove();
        const dark = match
          ? ((Number(match[1]) * 299 + Number(match[2]) * 587 + Number(match[3]) * 114) / 1000 < 140)
          : !!this._hass.themes?.darkMode;
        this.classList.toggle("wm-native", !dark);
        this.classList.toggle("wm-native-dark", dark);
        this.classList.toggle("wm-dark", dark);
        const powerButton = this.shadowRoot?.querySelector("#ebDishPower");
        if (powerButton) {
          const on = this._st(this._config.power_switch_entity)?.state === "on";
          powerButton.classList.toggle("on", on);
          powerButton.title = on ? "Turn off dishwasher power" : "Turn on dishwasher power";
        }
        const lc = this.shadowRoot?.querySelector("#lastCycle");
        if (lc && (this._config.daily_entity || this._config.monthly_entity)) {
          const month = this._period === "month";
          const id = month ? this._config.monthly_entity : this._config.daily_entity;
          const n = Number.parseFloat(this._st(id)?.state);
          const running = this._isRunning();
          const recorded = this._st(this._config.recorded_entity)?.state === "on" && !running;
          lc.classList.remove("hidden");
          lc.querySelector(".lc-grid").classList.toggle("eb-only-period", !recorded);
          lc.querySelector(".eb-period-toggle").textContent = month ? "Month ▾" : "Today ▾";
          lc.querySelector(".eb-period-stat .lc-label").textContent = month ? "THIS MONTH" : "TODAY";
          lc.querySelector(".eb-period-stat .lc-value").textContent = Number.isFinite(n) ? n.toFixed(2) + " kWh" : "—";
          const note = lc.querySelector(".eb-no-cycle");
          note.hidden = recorded;
          note.textContent = running ? "Current cycle in progress" : "No completed cycle recorded yet";
          for (const key of ["lcStart","lcDuration","lcEnergy"]) this._el(key).classList.toggle("hidden", !recorded);
          this._el("lcCost").classList.add("hidden");
        }
        if (this._config.appliance_type !== "dishwasher") return;
        const panel = this.shadowRoot?.querySelector(".eb-program");
        if (!panel) return;
        const run = this._isRunning();
        const n = Number.parseFloat(this._st(this._config.progress_entity)?.state);
        const progress = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
        const rawFinish = this._st(this._config.finish_entity)?.state;
        const finishDate = rawFinish ? new Date(rawFinish) : null;
        const finish = finishDate && Number.isFinite(finishDate.getTime()) ? finishDate.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : null;
        const door = this._st(this._config.door_entity)?.state;
        const meta = [finish ? "Finishes " + finish : null, door === "open" || door === "closed" || door === "locked" ? "Door " + door : null].filter(Boolean).join(" · ");
        panel.hidden = !run || (progress === null && !meta);
        panel.querySelector(".eb-progress-text").textContent = progress === null ? "—" : Math.round(progress) + "%";
        panel.querySelector(".eb-program-fill").style.width = progress === null ? "0%" : progress + "%";
        panel.querySelector(".eb-program-bar").hidden = progress === null;
        panel.querySelector(".eb-program-meta").textContent = meta;
      }
    }
    customElements.define("myhome-cycle-detail-card", MyHomeCycleDetailCard);
  }
});