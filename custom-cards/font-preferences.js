/* Dashboard-scoped typography. No external font downloads or HA state helpers. */
(()=>{
 const key='myhome.live.font.v1';
 const fonts=[
  {id:'rounded',name:'Rounded · Nunito',family:'Nunito, ui-rounded, system-ui, sans-serif'},
  {id:'system',name:'System',family:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
  {id:'arial',name:'Clean · Arial',family:'Arial, Helvetica, sans-serif'},
  {id:'humanist',name:'Humanist · Trebuchet',family:'"Trebuchet MS", Arial, sans-serif'},
  {id:'serif',name:'Classic · Georgia',family:'Georgia, "Times New Roman", serif'}
 ];
 const read=()=>{try{return fonts.find(f=>f.id===localStorage.getItem(key))||fonts[0];}catch{return fonts[0];}};
 const choose=id=>{const f=fonts.find(x=>x.id===id)||fonts[0];try{localStorage.setItem(key,f.id);}catch{}window.dispatchEvent(new CustomEvent('myhome-font-change',{detail:{id:f.id}}));};
 const addPicker=container=>{
  if(container.querySelector('.font-choice-row'))return;
  const row=document.createElement('label');row.className='font-choice-row';row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 4px;font-size:11px;color:var(--secondary-text-color)';
  const name=document.createElement('span');name.textContent='Dashboard font';const select=document.createElement('select');select.setAttribute('aria-label','Dashboard font');select.style.cssText='max-width:190px;min-height:36px;padding:7px 10px;border-radius:10px;border:1px solid color-mix(in srgb,var(--primary-text-color) 12%,transparent);background:var(--card-background-color);color:var(--primary-text-color);font:inherit';
  for(const f of fonts){const o=document.createElement('option');o.value=f.id;o.textContent=f.name;o.style.fontFamily=f.family;select.append(o);}select.value=read().id;select.addEventListener('change',()=>choose(select.value));row.append(name,select);container.append(row);
 };
 window.myhomeTypography={fonts,read,choose,addPicker};
 class FontScope extends HTMLElement{
  setConfig(){this.style.display='none';}set hass(value){}getCardSize(){return 0;}
  connectedCallback(){this.style.display='none';this.changed=()=>this.apply();this.storage=e=>{if(e.key===key)this.apply();};window.addEventListener('myhome-font-change',this.changed);window.addEventListener('storage',this.storage);this.apply();}
  apply(){if(!this.view){let e=this;while(e){if(['HUI-VIEW','HUI-SECTIONS-VIEW'].includes(e.tagName)){this.view=e;break;}e=e.parentElement||e.getRootNode()?.host;}}if(!this.view)return;const f=read();const names=['--myhome-font-family','--primary-font-family','--ha-font-family-body','--ha-font-family-heading','--mdc-typography-font-family','--paper-font-common-base_-_font-family','font-family'];if(!this.original)this.original=Object.fromEntries(names.map(n=>[n,this.view.style.getPropertyValue(n)]));for(const n of names)this.view.style.setProperty(n,f.family);this.view.style.fontFamily=f.family;}
  disconnectedCallback(){window.removeEventListener('myhome-font-change',this.changed);window.removeEventListener('storage',this.storage);if(this.view&&this.original){for(const [n,v]of Object.entries(this.original))v?this.view.style.setProperty(n,v):this.view.style.removeProperty(n);}this.view=null;this.original=null;}
 }
 if(!customElements.get('myhome-font-scope'))customElements.define('myhome-font-scope',FontScope);
})();
