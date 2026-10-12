class MyHomeDeferredGraphV1 extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.loaded=false;this.loading=false;}
 setConfig(c){if(!c.card)throw Error('Graph configuration required');if(this.config&&JSON.stringify(c)===JSON.stringify(this.config))return;this.config=c;this.shadowRoot.innerHTML=`<style>:host{display:block;min-height:${Number(c.height)||220}px;font-family:Nunito,system-ui;color:var(--secondary-text-color)}.waiting{padding:16px;font-size:12px;background:linear-gradient(115deg,color-mix(in srgb,var(--card-background-color) 65%,transparent),transparent);border-radius:20px;min-height:${Number(c.height)||220}px;box-sizing:border-box}.waiting small{display:block;margin-top:10px;font-size:10px;opacity:.6}</style><div class='waiting'></div>`;this.shadowRoot.querySelector('.waiting').textContent=c.card.header?.title||c.card.name||'Trend';this.observe();}
 set hass(h){this._hass=h;if(this.child)this.child.hass=h;}
 connectedCallback(){this.observe();}
 disconnectedCallback(){this.observer?.disconnect();clearTimeout(this.timer);if(this.idle)window.cancelIdleCallback?.(this.idle);this.loading=false;}
 observe(){if(!this.isConnected||!this.config||this.loaded)return;this.observer?.disconnect();this.observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))this.schedule();},{rootMargin:'40px'});this.observer.observe(this);}
 schedule(){if(this.loading||this.loaded)return;this.loading=true;this.timer=setTimeout(()=>{if(window.requestIdleCallback)this.idle=requestIdleCallback(()=>this.load(),{timeout:700});else this.load();},200);}
 async load(){if(!this.isConnected){this.loading=false;return;}try{const helpers=await window.loadCardHelpers();if(!this.isConnected){this.loading=false;return;}const child=helpers.createCardElement(this.config.card);child.hass=this._hass;this.child=child;this.shadowRoot.querySelector('.waiting').replaceWith(child);this.loaded=true;this.observer?.disconnect();}catch(e){this.loading=false;const p=this.shadowRoot.querySelector('.waiting');if(p){p.textContent='Graph unavailable';const b=document.createElement('button');b.textContent='Retry';b.onclick=()=>this.schedule();p.append(b);}}}
 getCardSize(){return Math.ceil((this.config?.height||220)/56);}getGridOptions(){return{columns:'full',rows:'auto'};}
}
if(!customElements.get('myhome-deferred-graph-v1'))customElements.define('myhome-deferred-graph-v1',MyHomeDeferredGraphV1);
customElements.whenDefined('myhome-cycle-detail-card').then(()=>{
 class MyHomeCycleStableV2 extends customElements.get('myhome-cycle-detail-card') {
  setConfig(c){const key=JSON.stringify(c);if(key===this.configKey)return;this.configKey=key;super.setConfig(c);this.updateKey=null;}
  connectedCallback(){super.connectedCallback?.();this._pauseMotion=()=>this.classList.toggle('eb-motion-paused',!this._motionVisible||document.hidden||matchMedia('(prefers-reduced-motion:reduce)').matches);this._motionIO=new IntersectionObserver(es=>{this._motionVisible=es.some(e=>e.isIntersecting);this._pauseMotion();});this._motionIO.observe(this);document.addEventListener('visibilitychange',this._pauseMotion);this._pauseMotion();}
  disconnectedCallback(){super.disconnectedCallback?.();this._motionIO?.disconnect();document.removeEventListener('visibilitychange',this._pauseMotion);}
  _build(){super._build();const style=document.createElement('style');style.textContent=':host{overflow-anchor:none}:host(.eb-motion-paused) *,:host(.eb-motion-paused) *::before,:host(.eb-motion-paused) *::after{animation-play-state:paused!important}';if(this._config.daily_entity||this._config.monthly_entity)style.textContent+='#lastCycle.hidden{display:block!important}';this.shadowRoot.append(style);}
  _update(){if(!this._hass||!this._built)return;const ids=Object.values(this._config).filter(v=>typeof v==='string'&&/^(sensor|binary_sensor|input_boolean|input_datetime|input_number|switch)\./.test(v));const key=ids.map(id=>{const s=this._hass.states[id];return id+':'+s?.state+':'+s?.attributes?.timestamp;}).join('|')+'|'+this._period+'|'+this._hass.themes?.darkMode+'|'+Math.floor(Date.now()/60000);if(key===this.updateKey)return;this.updateKey=key;super._update();}
 }
 if(!customElements.get('myhome-cycle-stable-v2'))customElements.define('myhome-cycle-stable-v2',MyHomeCycleStableV2);
});
