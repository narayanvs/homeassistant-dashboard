import './device-art.js?rev=20261017';
/* MyHome companion appliance cards. Original SVG/CSS, for kettle and extractor. */
class MyHomeSmallApplianceCard extends HTMLElement {
  setConfig(c) { if (!c.power_entity || !c.status_entity) throw new Error("Power and status entities are required"); this._config=c; this._built=false; if(this._hass)this._render(); }
  set hass(h) { this._hass=h; this._render(); }
  connectedCallback(){this._timer=setInterval(()=>this._update(),1000);}
  disconnectedCallback(){clearInterval(this._timer);}
  getCardSize(){return 5;}
  getGridOptions(){return {columns:12,rows:7,min_columns:6};}
  _state(id){return this._hass?.states[id];}
  _more(id){if(id)this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:id},bubbles:true,composed:true}));}
  _art(){return '<myhome-device-art kind="'+(this._config.appliance_type==='kettle'?'kettle':'extractor')+'" style="height:100%;width:100%"></myhome-device-art>';}
  _render(){
    if(!this._config||!this._hass)return;
    if(!this.shadowRoot)this.attachShadow({mode:"open"});
    if(!this._built){
      this.shadowRoot.innerHTML='<style>'+
      ':host{display:block;--eb-blue:color-mix(in srgb,#2f80ed 80%,var(--primary-text-color) 20%);font-family:var(--myhome-font-family,var(--primary-font-family,inherit))}'+
      'ha-card{display:block;overflow:hidden;border-radius:20px;border:0.5px solid rgba(255,255,255,.06);background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color) 95%,#2f80ed 5%),var(--card-background-color));color:var(--primary-text-color);position:relative;padding:18px;box-sizing:border-box}'+
      'ha-card:before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,#2f80ed,#75bdff)}header{display:flex;align-items:center;gap:10px}.icon{background:color-mix(in srgb,var(--card-background-color) 85%,#2f80ed 15%);border-radius:12px;padding:8px;color:var(--eb-blue)}h3{font-size:16px;margin:0;flex:1}.badge{font-size:10px;letter-spacing:.7px;font-weight:800;border-radius:20px;padding:6px 9px;background:var(--secondary-background-color);color:var(--secondary-text-color)}.running .badge{background:color-mix(in srgb,var(--card-background-color) 80%,#2f80ed 20%);color:var(--eb-blue)}button{border:0;background:transparent;color:inherit;cursor:pointer;min-width:44px;min-height:44px;border-radius:10px}button:focus-visible{outline:2px solid var(--eb-blue)}.art{height:210px;text-align:center;margin:12px 0}.art svg{height:100%;max-width:100%}.panel{display:flex;align-items:center;gap:16px;background:color-mix(in srgb,var(--secondary-background-color) 70%,var(--card-background-color) 30%);border:1px solid var(--divider-color);border-radius:18px;padding:14px}.ring{width:76px;height:76px;border-radius:50%;border:5px solid var(--divider-color);display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0}.running .ring{border-color:var(--eb-blue);border-right-color:var(--divider-color)}.clock{font-weight:800;font-size:18px}.caption{font-size:8px;letter-spacing:1px;color:var(--secondary-text-color);margin-top:3px}.info{flex:1;min-width:0}.status{font-weight:700;font-size:14px;margin-bottom:10px}.powerline{display:flex;justify-content:space-between;gap:6px;font-size:12px;color:var(--secondary-text-color)}.power{font-weight:800;color:var(--primary-text-color);font-size:17px}.bar{height:7px;background:var(--divider-color);border-radius:8px;margin-top:8px;overflow:hidden}.fill{height:100%;background:linear-gradient(90deg,#77baff,#2f80ed);width:0;transition:width .5s}.stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.stat{text-align:left;background:color-mix(in srgb,var(--secondary-background-color) 70%,var(--card-background-color) 30%);padding:12px;border:1px solid var(--divider-color);border-radius:14px}.stat small{display:block;font-size:10px;letter-spacing:.5px;color:var(--secondary-text-color);margin-bottom:6px}.stat strong{font-size:17px}.stat span{color:var(--eb-blue);font-size:11px}.steam,.air{opacity:.12}.running .steam,.running .air{opacity:.85}.running .blades{animation:spin 1.4s linear infinite}.running .s1{animation:rise 2s ease-in-out infinite}.running .s2{animation:rise 2s .65s ease-in-out infinite}.running .s3{animation:rise 2s 1.3s ease-in-out infinite}.running .water{animation:glow 2s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes rise{0%{opacity:.1;transform:translateY(6px)}50%{opacity:.9}100%{opacity:0;transform:translateY(-10px)}}@keyframes glow{50%{opacity:.5}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}'+
      '</style><ha-card><header><ha-icon class="icon"></ha-icon><h3></h3><span class="badge"></span><button class="history" aria-label="Power history"><ha-icon icon="mdi:chart-bar"></ha-icon></button></header><div class="art">'+this._art()+'</div><div class="panel"><div class="ring"><span class="clock">—</span><span class="caption">ELAPSED</span></div><div class="info"><div class="status"></div><div class="powerline"><span>Current power</span><span class="power"></span></div><div class="bar"><div class="fill"></div></div></div></div><div class="stats"><button class="stat today"><small>TODAY</small><strong></strong> <span>kWh</span></button><button class="stat month"><small>THIS MONTH</small><strong></strong> <span>kWh</span></button></div></ha-card>';
      const q=s=>this.shadowRoot.querySelector(s);
      q('h3').textContent=this._config.name;
      q('.icon').setAttribute('icon',this._config.appliance_type==='kettle'?'mdi:kettle-outline':'mdi:fan');
      q('.history').onclick=()=>this._more(this._config.power_entity);
      q('.today').onclick=()=>this._more(this._config.daily_entity);
      q('.month').onclick=()=>this._more(this._config.monthly_entity);
      this._built=true;
    } this._update();
  }
  _update(){
    if(!this._built||!this._hass||!this.isConnected)return;
    const c=this._config,q=s=>this.shadowRoot.querySelector(s),p=Number.parseFloat(this._state(c.power_entity)?.state);
    const status=this._state(c.status_entity)?.state,known=Number.isFinite(p)&&['on','off'].includes(status),run=known&&status==='on';
    q('ha-card').classList.toggle('running',run);const art=q('myhome-device-art');if(art)art.active=run;
    q('.art').style.display=run?'':'none';
    q('.badge').textContent=!known?'NO DATA':run?'RUNNING':'IDLE';
    q('.status').textContent=!known?'Power data unavailable':run?(c.appliance_type==='kettle'?'Heating water':'Extracting'):'Ready';
    q('.power').textContent=Number.isFinite(p)?(p>=1000?(p/1000).toFixed(2)+' kW':p.toFixed(1)+' W'):'—';
    q('.fill').style.width=(Number.isFinite(p)?Math.min(100,Math.max(0,p/(c.power_max||3000)*100)):0)+'%';
    const start=Number(this._state(c.started_entity)?.attributes?.timestamp)*1000,secs=Math.max(0,Math.floor((Date.now()-start)/1000));
    q('.clock').textContent=run&&start>1e12&&start<=Date.now()?Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0'):'—';
    q('.caption').textContent=run?'ELAPSED':'IDLE';
    for(const [sel,id]of [['.today',c.daily_entity],['.month',c.monthly_entity]]){const n=Number.parseFloat(this._state(id)?.state);q(sel+' strong').textContent=Number.isFinite(n)?n.toFixed(2):'—';q(sel).hidden=!id;}
  }
}
if(!customElements.get("myhome-small-appliance-card"))customElements.define("myhome-small-appliance-card",MyHomeSmallApplianceCard);
window.customCards=window.customCards||[];
window.customCards.push({type:"myhome-small-appliance-card",name:"MyHome kettle / extractor",description:"Theme-aware illustrated appliance, elapsed session and measured energy."});

