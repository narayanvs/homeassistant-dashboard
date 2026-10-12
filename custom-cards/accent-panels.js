/* Test-only subclasses: style custom outer surfaces, leave their contents alone. */
const names=["myhome-active-appliances-v1","myhome-thermal-studio-v3","myhome-tv-card","myhome-power-device-card","myhome-outdoor-forecast-v1","myhome-outdoor-weather-v2","myhome-energy-overview-v6","myhome-energy-statistics-v13","myhome-power-metrics-v4","myhome-energy-facts-v2","myhome-solar-outlook-v2","myhome-energy-health-balance-v1","myhome-energy-usage-v2","myhome-security-feed-v1","myhome-tesla-v4","myhome-lab-health-v1","myhome-lab-speedtest-v1","myhome-thermal-home-v2","myhome-house-temperature-v1","myhome-cycle-stable-v2","myhome-small-appliance-motion-card"];
for(const name of names)customElements.whenDefined(name).then(()=>{

const decorative=new Set(['myhome-energy-facts-v2','myhome-energy-health-balance-v1','myhome-thermal-studio-v3','myhome-thermal-home-v2','myhome-lab-health-v1','myhome-power-device-card']);
const accentCSS=decorative.has(name)?`:host{--accent:var(--myhome-accent,#85cbb3)!important}ha-card,.panel{--accent:var(--myhome-accent,#85cbb3)!important}.fact{--color:var(--myhome-accent,#85cbb3)!important}`:name==='myhome-solar-outlook-v2'?`:host{--gold:#f2c572!important;--violet:#b8a1f5!important}.headline strong,.inspect b{color:var(--primary-text-color)!important}`:name==='myhome-outdoor-forecast-v1'?`ha-icon{color:var(--myhome-accent,#d9b77f)!important}.range{background:linear-gradient(90deg,var(--myhome-accent-deep,#88bfca),var(--myhome-accent,#d9b77f))!important}`:'';

const neutralCSS=['myhome-energy-facts-v2','myhome-energy-health-balance-v1'].includes(name)?'strong{color:var(--primary-text-color)!important}':'';
const styled='accent-'+name;if(customElements.get(styled))return;
class AccentPanel extends customElements.get(name){
 setConfig(c){super.setConfig(c);this._accentFrame();}
 set hass(h){super.hass=h;this._accentFrame();}
 connectedCallback(){super.connectedCallback?.();this._accentFrame();}
 _accentFrame(){const root=this.shadowRoot;if(!root||root.querySelector('style[data-outer-accent]'))return;const style=document.createElement('style');style.dataset.outerAccent='';style.textContent=`:host > .panel,:host > .nexus,:host > .shell,:host > .card,:host > ha-card{border:1px solid color-mix(in srgb,var(--myhome-accent,#d5ab6c) 13%,transparent)!important;border-top:2px solid color-mix(in srgb,var(--myhome-accent,#d5ab6c) 30%,transparent)!important;box-sizing:border-box;}`+accentCSS+neutralCSS;root.append(style);}
}customElements.define(styled,AccentPanel);});