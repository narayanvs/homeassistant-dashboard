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
  _art(){
    const defs='<defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".48" stop-color="#e9eef5"/><stop offset="1" stop-color="#aebacb"/></linearGradient><linearGradient id="glass"><stop stop-color="#21364f"/><stop offset="1" stop-color="#0c1b2d"/></linearGradient><linearGradient id="blue"><stop stop-color="#72b8ff"/><stop offset="1" stop-color="#2f80ed"/></linearGradient></defs>';
    const kettle='<ellipse cx="140" cy="225" rx="73" ry="8" fill="#18314c" opacity=".14"/><path d="M181 94C237 91 234 167 190 171" fill="none" stroke="#c6d0dc" stroke-width="18"/><path d="M181 94C225 96 223 157 190 163" fill="none" stroke="#5f728c" stroke-width="6"/><path d="M84 122L50 96L67 141L86 158" fill="url(#body)" stroke="#a2b0c1" stroke-width="2"/><path d="M99 79Q84 104 80 171Q77 211 111 216H170Q198 211 195 179L184 108Q181 84 166 79Z" fill="url(#body)" stroke="#adb9c9" stroke-width="2"/><path d="M104 79H168" stroke="#647a93" stroke-width="6" stroke-linecap="round"/><rect x="120" y="65" width="31" height="12" rx="6" fill="#d4dce7"/><rect x="126" y="112" width="27" height="77" rx="13" fill="url(#glass)"/><path class="water" d="M130 150Q136 146 140 150T149 150V176Q149 184 139 184Q130 184 130 176Z" fill="url(#blue)"/><path d="M132 123H146M132 136H146M132 163H146" stroke="white" opacity=".5" stroke-width="2"/><path d="M89 202Q140 215 187 202" fill="none" stroke="url(#blue)" stroke-width="5" stroke-linecap="round"/><rect x="93" y="216" width="87" height="7" rx="3" fill="#899bb0"/><g class="steam" stroke="var(--eb-blue)" fill="none" stroke-width="4" stroke-linecap="round"><path class="s1" d="M114 57Q102 44 114 32Q123 21 114 10"/><path class="s2" d="M138 52Q125 40 138 26Q147 15 138 5"/><path class="s3" d="M160 57Q148 44 160 32Q169 21 160 10"/></g>';
    const fan='<ellipse cx="140" cy="229" rx="82" ry="7" fill="#18314c" opacity=".14"/><path d="M109 22H171V77H109Z" fill="url(#body)" stroke="#aebaca" stroke-width="2"/><path d="M108 70H172L222 113Q225 124 211 128H69Q55 124 58 113Z" fill="url(#body)" stroke="#aebaca" stroke-width="2"/><rect x="59" y="124" width="163" height="15" rx="7" fill="#90a3ba"/><path d="M77 133H202" stroke="url(#blue)" stroke-width="4" stroke-linecap="round"/><circle cx="140" cy="97" r="28" fill="url(#glass)" stroke="#cfdae8" stroke-width="3"/><g class="blades" style="transform-origin:140px 97px" fill="url(#blue)"><path d="M140 97C112 102 114 74 130 78Q143 78 140 97"/><path d="M140 97C149 70 169 91 156 103Q147 113 140 97"/><path d="M140 97C160 117 132 126 128 109Q126 99 140 97"/></g><circle cx="140" cy="97" r="5" fill="#edf5ff"/><g class="air" fill="none" stroke="var(--eb-blue)" stroke-width="3" stroke-linecap="round"><path class="s1" d="M105 201Q88 183 105 168V150"/><path class="s2" d="M140 205Q125 183 140 168V150"/><path class="s3" d="M175 201Q160 183 175 168V150"/></g><path d="M67 219H213" stroke="#9cacc0" stroke-width="7" stroke-linecap="round"/><ellipse cx="109" cy="216" rx="23" ry="5" fill="none" stroke="#526981" stroke-width="2"/><ellipse cx="175" cy="216" rx="23" ry="5" fill="none" stroke="#526981" stroke-width="2"/>';
    return '<svg viewBox="0 0 280 245" role="img" aria-label="'+(this._config.appliance_type==='kettle'?'Kettle':'Extractor hood')+'">'+defs+(this._config.appliance_type==='kettle'?kettle:fan)+'</svg>';
  }
  _render(){
    if(!this._config||!this._hass)return;
    if(!this.shadowRoot)this.attachShadow({mode:"open"});
    if(!this._built){
      this.shadowRoot.innerHTML='<style>'+
      ':host{display:block;--eb-blue:color-mix(in srgb,#2f80ed 80%,var(--primary-text-color) 20%);font-family:var(--primary-font-family,inherit)}'+
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
    q('ha-card').classList.toggle('running',run);
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

