import {myhomeTheme} from './theme-mode.js?rev=20261017-light8';
(()=>{
const TZ='Europe/Dublin',cache=new Map(),ranges={day:[7,14,30,90],week:[4,8,12],month:[3,6,12]};
const day=t=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
const shift=(k,n)=>{let d=new Date(k+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
const midnight=k=>{let t=Date.parse(k+'T00:00:00Z');while(day(t-3600000)===k)t-=3600000;return t;};
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const fmt=v=>v===null?'—':v.toLocaleString('en-IE',{maximumFractionDigits:1});
const date=k=>new Date(k+'T12:00:00Z').toLocaleDateString('en-IE',{day:'numeric',month:'short',timeZone:TZ});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=v=>typeof v==='number'?(v<1e11?v*1000:v):Date.parse(v);
const key=(k,m)=>m==='month'?k.slice(0,7)+'-01':m==='week'?shift(k,-((new Date(k+'T12:00:00Z').getUTCDay()+6)%7)):k;
function start(last,mode,n){if(mode==='day')return shift(last,1-n);if(mode==='week')return shift(key(last,mode),-7*(n-1));let d=new Date(last.slice(0,7)+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()-(n-1));return d.toISOString().slice(0,10);}
class GridHistory extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.mode='day';this.count=14;this.direction='import';this.stats={};this.visible=false;this.generation=0;}
 setConfig(c){if(!c.import_statistic||!c.export_statistic)throw Error('ESB statistic IDs required');this.config=c;this.render();}
 getCardSize(){return 5;}
 connectedCallback(){this.observer=new IntersectionObserver(es=>{this.visible=es.some(e=>e.isIntersecting);if(this.visible)this.load();},{rootMargin:'100px'});this.observer.observe(this);}
 disconnectedCallback(){this.observer?.disconnect();this.generation++;this.loading=false;}
 set hass(h){myhomeTheme(this);this.h=h;if(this.visible)this.load();}
 ids(){return {import:[this.config.import_statistic,this.config.reference_import],export:[this.config.export_statistic,this.config.reference_export]};}
 latest(){let ds=['import','export'].map(d=>this.h?.states['sensor.esb_meter_data_'+d+'_latest_complete_day']?.attributes?.latest_complete_day).filter(v=>/^\d{4}-\d{2}-\d{2}$/.test(v||''));return ds.length?ds.sort()[0]:null;}
 async load(force=false){
  if(!this.h||!this.config||this.loading)return;
  const last=this.latest();if(!last){this.error='Awaiting a complete ESB day';this.render();return;}
  const from=start(last,this.mode,this.count),end=shift(last,1),ids=[...new Set(Object.values(this.ids()).flat().filter(Boolean))];
  const sig=JSON.stringify([from,end,ids,this.h.states['sensor.esb_meter_data_last_successful_download']?.state]);
  if(!force&&sig===this.loadedKey&&Date.now()-this.loadedAt<300000)return;
  this.loading=true;this.error=null;this.render();const generation=++this.generation;
  try{
   let hit=cache.get(sig);if(!hit||Date.now()-hit.time>300000){const promise=this.h.callWS({type:'recorder/statistics_during_period',start_time:new Date(midnight(from)).toISOString(),end_time:new Date(midnight(end)-1).toISOString(),statistic_ids:ids,period:'day',types:['change'],units:{energy:'kWh'}});hit={time:Date.now(),promise};cache.set(sig,hit);if(cache.size>12)cache.delete(cache.keys().next().value);promise.catch(()=>cache.delete(sig));}
   const stats=await hit.promise;if(generation!==this.generation)return;
   this.stats=stats;this.first=from;this.last=last;this.loadedAt=Date.now();this.loadedKey=sig;
  }catch(e){if(generation===this.generation)this.error='Recorded history unavailable';}
  finally{if(generation===this.generation){this.loading=false;this.render();}}
 }
 groups(){
  if(!this.first||!this.last)return [];
  const maps=this.ids()[this.direction].map(id=>new Map((this.stats[id]||[]).map(r=>[day(stamp(r.start)),num(r.change)]))),gs=new Map();
  for(let k=this.first;k<=this.last;k=shift(k,1)){const label=key(k,this.mode);if(!gs.has(label))gs.set(label,{key:label,first:k,last:k,days:0,counts:[0,0],values:[0,0],paired:0,matched:[0,0]});const g=gs.get(label);g.last=k;g.days++;const vs=maps.map(m=>m.get(k));vs.forEach((v,i)=>{if(v!==undefined&&v!==null&&v>=0){g.values[i]+=v;g.counts[i]++;}});if(vs.every(v=>v!==undefined&&v!==null&&v>=0)){g.paired++;vs.forEach((v,i)=>g.matched[i]+=v);}}
  return [...gs.values()].map(g=>({...g,values:g.values.map((v,i)=>g.counts[i]?v:null)}));
 }
 render(){
  if(!this.config)return;
  const gs=this.groups(),chosen=gs.find(g=>g.key===this.selected),shown=chosen?[chosen]:gs;
  const counts=[0,1].map(i=>shown.reduce((s,g)=>s+g.counts[i],0)),totals=[0,1].map(i=>counts[i]?shown.reduce((s,g)=>s+(g.values[i]||0),0):null);
  const paired=shown.reduce((s,g)=>s+g.paired,0),matched=[0,1].map(i=>shown.reduce((s,g)=>s+g.matched[i],0)),delta=paired&&matched[0]>0?(matched[1]-matched[0])/matched[0]*100:null;
  const max=Math.max(1,...gs.flatMap(g=>g.values.filter(v=>v!==null)))*1.08,W=360,H=172,L=32,R=6,T=10,B=27,ph=H-T-B,step=(W-L-R)/Math.max(1,gs.length),bw=Math.max(1,Math.min(12,step*.29));let svg='';
  for(let i=0;i<4;i++){const y=T+ph*i/3;svg+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="line"/><text x="${L-6}" y="${y+3}" text-anchor="end" class="axis">${fmt(max*(1-i/3))}</text>`;}
  gs.forEach((g,i)=>{const x=L+step*(i+.5);svg+=`<g data-key="${g.key}" tabindex="0" role="button" aria-label="${esc(date(g.first))}: ESB ${fmt(g.values[0])}, reference ${fmt(g.values[1])} kWh"><rect x="${L+step*i}" y="${T}" width="${step}" height="${ph}" class="hit ${this.selected===g.key?'selected':''}"/>`;g.values.forEach((v,j)=>{if(v===null)return;const h=v===0?1:v/max*ph;svg+=`<rect x="${x+(j?1:-bw-1)}" y="${T+ph-h}" width="${bw}" height="${h}" rx="${Math.min(2,bw/2)}" class="bar ${j?'reference':'esb'}"/>`;});if(g.values.every(v=>v===null))svg+=`<text x="${x}" y="${T+ph-4}" text-anchor="middle" class="axis">—</text>`;if(i%Math.max(1,Math.ceil(gs.length/6))===0||i===gs.length-1){const label=this.mode==='month'?new Date(g.key+'T12:00:00Z').toLocaleDateString('en-IE',{month:'short',timeZone:TZ}):date(g.first);svg+=`<text x="${x}" y="${H-8}" text-anchor="middle" class="axis">${esc(label)}</text>`;}svg+='</g>';});
  const range=chosen?date(chosen.first)+(chosen.first!==chosen.last?' – '+date(chosen.last):''):this.first?date(this.first)+' – '+date(this.last):'Recorded history',ref=this.config.reference_name||'Sigenergy';
  this.shadowRoot.innerHTML=`<style>:host{display:block;min-width:0}*{box-sizing:border-box}ha-card{display:block;width:100%;padding:16px;border-radius:20px;box-shadow:none;font-family:var(--myhome-font-family,Nunito,system-ui,sans-serif);color:var(--primary-text-color);background:linear-gradient(125deg,color-mix(in srgb,var(--myhome-accent,var(--primary-color)) 6%,var(--card-background-color)),var(--card-background-color));border:1px solid color-mix(in srgb,var(--myhome-accent,var(--primary-color)) 13%,transparent);border-top:2px solid color-mix(in srgb,var(--myhome-accent,var(--primary-color)) 30%,transparent)}.head,.controls,.meta,.legend,.foot{display:flex;align-items:center;justify-content:space-between;gap:8px}.head{margin-bottom:12px}.head strong{font-size:14px}.controls{gap:5px}select,button{font:inherit;color:inherit;border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);background:color-mix(in srgb,var(--card-background-color) 85%,transparent);border-radius:9px;padding:5px 7px;font-size:10px;min-height:30px}button{cursor:pointer}.directions{display:flex;gap:5px}.directions .on{color:var(--myhome-accent,var(--primary-color));background:color-mix(in srgb,var(--myhome-accent,var(--primary-color)) 11%,transparent)}.meta,.foot{font-size:10px;color:var(--secondary-text-color);margin-top:9px}.totals{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:13px 0 10px}.totals span{display:block;font-size:10px;color:var(--secondary-text-color);margin-bottom:4px}.totals b{font-size:22px}.totals small{font-size:10px;color:var(--secondary-text-color)}.legend{justify-content:flex-start;font-size:10px;color:var(--secondary-text-color);gap:14px}.dot{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:3px;background:var(--myhome-accent,var(--primary-color))}.muted{opacity:.38}.esb{fill:var(--myhome-accent,var(--primary-color))}.reference{fill:var(--myhome-accent,var(--primary-color));opacity:.38}.axis{fill:var(--secondary-text-color);font:9px var(--myhome-font-family,Nunito,system-ui,sans-serif)}.line{stroke:color-mix(in srgb,var(--primary-text-color) 7%,transparent);stroke-dasharray:3 4}.hit{fill:transparent}.selected{fill:color-mix(in srgb,var(--myhome-accent,var(--primary-color)) 9%,transparent)}svg{display:block;width:100%;height:auto;touch-action:pan-y;margin-top:8px}g[role=button]{cursor:pointer}.empty{padding:32px 0;text-align:center;color:var(--secondary-text-color);font-size:12px}.foot{flex-wrap:wrap;font-size:9px}.clear{padding:0 5px;min-height:23px}@media(max-width:370px){ha-card{padding:13px}.head strong{font-size:13px}.controls{gap:3px}select{padding:5px;max-width:79px}}</style><ha-card><div class="head"><strong>Grid meter history</strong><div class="controls"><select data-period ${this.loading?'disabled':''} aria-label="Group history by">${['day','week','month'].map(m=>`<option value="${m}" ${m===this.mode?'selected':''}>${m[0].toUpperCase()+m.slice(1)}</option>`).join('')}</select><select data-count ${this.loading?'disabled':''} aria-label="History range">${ranges[this.mode].map(n=>`<option value="${n}" ${n===this.count?'selected':''}>${n} ${this.mode==='day'?'days':this.mode==='week'?'weeks':'months'}</option>`).join('')}</select></div></div><div class="directions">${['import','export'].map(d=>`<button data-direction="${d}" class="${d===this.direction?'on':''}" aria-pressed="${d===this.direction}">${d==='import'?'Imported':'Exported'}</button>`).join('')}</div><div class="meta"><span>${esc(range)}</span><span>${this.loading?'Updating…':'kWh'}${chosen?' <button class="clear" data-clear aria-label="Clear selection">×</button>':''}</span></div><div class="totals">${['ESB Networks',ref].map((label,i)=>`<div><span>${esc(label)} · ${counts[i]} days</span><b>${fmt(totals[i])}</b> <small>kWh</small></div>`).join('')}</div><div class="legend"><span><i class="dot"></i>ESB</span><span><i class="dot muted"></i>${esc(ref)}</span></div>${gs.length?`<svg viewBox="0 0 ${W} ${H}" aria-label="Recorded grid ${this.direction} in kWh">${svg}</svg>`:`<div class="empty">${esc(this.error||'Loading recorded history…')}</div>`}<div class="foot"><span>${this.error?esc(this.error):'Recorded totals · through '+esc(this.last?date(this.last):'—')}</span><span>${delta===null?'No matched-day comparison':(delta>0?'+':'')+fmt(delta)+'% · '+paired+' matched days'}</span></div>${this.config.reference_reliable_from&&this.first<this.config.reference_reliable_from?`<div class="foot">Reference history before ${esc(date(this.config.reference_reliable_from))} includes gaps / catch-up readings.</div>`:''}</ha-card>`;
  this.shadowRoot.querySelector('[data-period]').onchange=e=>{this.mode=e.target.value;this.count={day:14,week:8,month:6}[this.mode];this.selected=null;this.load(true);};
  this.shadowRoot.querySelector('[data-count]').onchange=e=>{this.count=Number(e.target.value);this.selected=null;this.load(true);};
  for(const b of this.shadowRoot.querySelectorAll('[data-direction]'))b.onclick=()=>{this.direction=b.dataset.direction;this.selected=null;this.render();};
  for(const g of this.shadowRoot.querySelectorAll('[data-key]')){const choose=()=>{this.selected=this.selected===g.dataset.key?null:g.dataset.key;this.render();};g.onclick=choose;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};}
  const clear=this.shadowRoot.querySelector('[data-clear]');if(clear)clear.onclick=()=>{this.selected=null;this.render();};
 }
}
if(!customElements.get('myhome-grid-meter-history-v2'))customElements.define('myhome-grid-meter-history-v2',GridHistory);
window.customCards=window.customCards||[];window.customCards.push({type:'myhome-grid-meter-history-v2',name:'Grid meter history',description:'Recorded grid energy by day, week or month.'});
})();
