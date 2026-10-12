(()=>{
const A='sensor.sigen_plant_daily_pv_energy',F='sensor.myhome_solar_energy_prediction_today',D='input_datetime.myhome_solar_forecast_snapshot_date';
const series=[{id:'solar',entity:A,name:'Generated',chip:'Solar',color:'#efc66e'},{id:'forecast',entity:F,name:'Predicted',chip:'Forecast',color:'#b4a0ed'},{id:'load',entity:'sensor.sigen_plant_daily_load_consumption',name:'Consumed',chip:'Consumed',color:'#ef91c8'},{id:'export',entity:'sensor.sigen_plant_daily_grid_export_energy',name:'Exported',chip:'Exported',color:'#62d4b4'},{id:'import',entity:'sensor.sigen_plant_daily_grid_import_energy',name:'Imported',chip:'Imported',color:'#79aaf7'}];
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const tz='Europe/Dublin', day=t=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v===null?'—':v.toLocaleString('en-IE',{maximumFractionDigits:1});
const cache=new Map();
const midnight=k=>{let t=Date.parse(k+'T00:00:00Z');for(let i=0;i<3&&day(t)!==k;i++)t+=3600000;for(let i=0;i<3&&day(t-3600000)===k;i++)t-=3600000;return t;};
const forecastId='sensor.solcast_pv_forecast_forecast_today';

class EnergyComparison extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.mode='daily';this.selected=null;this.enabled=new Set(['solar','forecast']);this.stats={};this.hours={};this.visible=false;this.loadedAt=0;}
 setConfig(c){this.config=c;this.render();}
 connectedCallback(){this.observer=new IntersectionObserver(es=>{this.visible=es.some(e=>e.isIntersecting);if(this.visible)this.load();},{rootMargin:'150px'});this.observer.observe(this);}
 disconnectedCallback(){this.observer?.disconnect();this.generation=(this.generation||0)+1;}
 set hass(h){this.h=h;if(this.visible)this.load();}
 getCardSize(){return 5;}
 async load(){
 if(!this.h||this.loading||Date.now()-this.loadedAt<300000)return;
 this.loading=true;this.error=null;this.render();const generation=this.generation||0;
 try{
 const now=new Date(),start=midnight(day(now)),from=now.getUTCFullYear()+'-01-01T00:00:00Z';
 const fetchStats=async(period,from,ids)=>{const key=period+from+day(now),hit=cache.get(key);if(hit&&Date.now()-hit.time<300000)return hit.promise;const promise=this.h.callWS({type:'recorder/statistics_during_period',start_time:from,end_time:now.toISOString(),statistic_ids:ids,period,types:period==='hour'?['change']:['change','max']});cache.set(key,{time:Date.now(),promise});try{return await promise;}catch(e){cache.delete(key);throw e;}};
 const [daily,hourly]=await Promise.all([fetchStats('day',from,series.map(s=>s.entity)),fetchStats('hour',new Date(start).toISOString(),series.filter(s=>s.id!=='forecast').map(s=>s.entity))]);
 if(generation!==(this.generation||0))return;
 this.stats=daily;this.hours=hourly;this.loadedAt=Date.now();
 }catch(e){this.error='History unavailable';}finally{this.loading=false;this.render();}
 }
 hourly(){
 const today=day(Date.now()),start=midnight(today),end=midnight(day(start+36*3600000)),now=Date.now(),current=start+Math.floor((now-start)/3600000)*3600000;
 const maps={};
 for(const s of series.filter(s=>s.id!=='forecast')){
 const m=new Map((this.hours[s.entity]||[]).map(r=>[Number(r.start),num(r.change)]));
 const past=Array.from({length:(current-start)/3600000},(_,i)=>m.get(start+i*3600000)),live=num(this.h?.states?.[s.entity]?.state);
 if(live!==null&&live>=0&&past.every(v=>v!==undefined&&v!==null&&v>=0)){const remaining=live-past.reduce((a,b)=>a+b,0);if(remaining>=-.001)m.set(current,Math.max(0,remaining));}
 maps[s.id]=m;
 }
 const forecast=(this.h?.states?.[forecastId]?.attributes?.detailedForecast||[]).filter(r=>day(r.period_start)===today),rows=[];
 for(let t=start;t<end;t+=3600000){const g={key:new Date(t).toISOString(),values:{},complete:t+3600000<=now,today:t===current};
 for(const s of series.filter(s=>s.id!=='forecast')){const v=maps[s.id].get(t);g.values[s.id]=t<=now&&v!==undefined&&v!==null&&v>=0?v:null;}
 let f=0,duration=0;for(const r of forecast){const rt=Date.parse(r.period_start),v=num(r.pv_estimate),overlap=Math.max(0,Math.min(t+3600000,rt+1800000)-Math.max(t,rt));if(v!==null&&v>=0&&overlap){f+=v*overlap/3600000;duration+=overlap;}}
 g.values.forecast=duration===3600000?f:null;rows.push(g);
 }
 return rows;
 }
 groups(){
 if(this.mode==='daily')return this.hourly();
 const today=day(Date.now()),week=new Date(today+'T12:00:00Z');week.setUTCDate(week.getUTCDate()-((week.getUTCDay()+6)%7));const first=week.toISOString().slice(0,10),m=new Map();
 for(const s of series){for(const r of this.stats[s.entity]||[]){const v=num(s.id==='forecast'?r.max:r.change);if(v===null||v<0)continue;const k=day(r.start);if(!m.has(k))m.set(k,{key:k,values:{}});m.get(k).values[s.id]=v;}}
 if(!m.has(today))m.set(today,{key:today,values:{}});
 for(const s of series){const v=num(this.h?.states?.[s.entity]?.state);if(v!==null&&v>=0&&(s.id!=='forecast'||this.h?.states?.[D]?.state===today))m.get(today).values[s.id]=v;}
 const daily=[...m.values()].filter(r=>this.mode==='weekly'?r.key>=first&&r.key<=today:this.mode==='monthly'?r.key.slice(0,7)===today.slice(0,7):r.key.slice(0,4)===today.slice(0,4)).sort((a,b)=>a.key.localeCompare(b.key));
 if(this.mode!=='yearly')return daily.map(r=>({...r,complete:r.key!==today,today:r.key===today}));
 const grouped=new Map();for(const r of daily){const key=r.key.slice(0,7),g=grouped.get(key)||{key,values:{},counts:{},expected:Number(today.slice(0,7)===key?today.slice(8):new Date(Number(key.slice(0,4)),Number(key.slice(5)),0).getDate()),complete:key!==today.slice(0,7),today:key===today.slice(0,7)};for(const s of series){const v=r.values[s.id];if(v!==undefined&&v!==null){g.values[s.id]=(g.values[s.id]||0)+v;g.counts[s.id]=(g.counts[s.id]||0)+1;}}grouped.set(key,g);}return [...grouped.values()];
 }
 label(k){if(this.mode==='daily')return new Date(k).toLocaleTimeString('en-IE',{timeZone:tz,hour:'2-digit',hourCycle:'h23'});if(this.mode==='yearly')return new Date(k+'-15T12:00:00Z').toLocaleDateString('en-IE',{month:'short'});return new Date(k+'T12:00:00Z').toLocaleDateString('en-IE',this.mode==='weekly'?{weekday:'short'}:{day:'numeric'});}
 render(){
 const gs=this.groups(),chosen=gs.find(g=>g.key===this.selected),items=chosen?[chosen]:gs,active=series.filter(s=>this.enabled.has(s.id)),lines=active.some(s=>!['solar','forecast'].includes(s.id));
 const W=600,H=235,L=39,R=10,T=12,B=34,P=W-L-R,Q=H-T-B,slot=P/Math.max(1,gs.length),bw=Math.min(24,slot*.3),max=Math.max(1,...gs.flatMap(g=>active.map(s=>g.values[s.id]??0)))*1.12;
 const x=i=>L+slot*(i+.5),y=v=>T+Q-v/max*Q,base=T+Q;
 let svg='<defs>'+active.map(s=>'<linearGradient id="fill-'+s.id+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+s.color+'" stop-opacity="'+(lines?'.20':'.85')+'"/><stop offset="1" stop-color="'+s.color+'" stop-opacity=".02"/></linearGradient>').join('')+'</defs>';
 for(let i=0;i<4;i++){const v=max*i/3;svg+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" opacity=".08"/><text x="'+(L-8)+'" y="'+(y(v)+3)+'" text-anchor="end" class="axis">'+fmt(v)+'</text>';}
 if(lines){for(const s of active){let segments=[],seg=[];gs.forEach((g,i)=>{const v=g.values[s.id];if(v===null||v===undefined){if(seg.length)segments.push(seg);seg=[];}else seg.push([x(i),y(v)]);});if(seg.length)segments.push(seg);for(const pts of segments){const path='M'+pts.map(p=>p.join(',')).join(' L');if(pts.length>1)svg+='<path d="'+path+' L'+pts.at(-1)[0]+','+base+' L'+pts[0][0]+','+base+' Z" fill="url(#fill-'+s.id+')"/><path d="'+path+'" fill="none" stroke="'+s.color+'" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round" '+(s.id==='forecast'?'stroke-dasharray="5 4"':'')+'/>';else svg+='<circle cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" r="3" fill="'+s.color+'"/>';}}}
 else gs.forEach((g,i)=>{active.forEach((s,j)=>{const v=g.values[s.id];if(v===null||v===undefined)return;const xx=x(i)+(active.length===1?-bw/2:s.id==='forecast'?-bw-2:2);svg+='<rect x="'+xx+'" y="'+y(v)+'" width="'+bw+'" height="'+Math.max(1,base-y(v))+'" rx="3" fill="url(#fill-'+s.id+')" stroke="'+s.color+'" stroke-opacity=".6" '+(s.id==='forecast'?'stroke-dasharray="3 2"':'')+'/>';});});
 gs.forEach((g,i)=>{if(g.key===this.selected)svg+='<line x1="'+x(i)+'" x2="'+x(i)+'" y1="'+T+'" y2="'+base+'" stroke="currentColor" opacity=".3" stroke-dasharray="3 3"/>';svg+='<g data-key="'+esc(g.key)+'" role="button" tabindex="0" aria-label="'+esc(this.label(g.key))+'"><rect x="'+(x(i)-slot*.49)+'" y="'+T+'" width="'+slot*.98+'" height="'+(Q+B)+'" fill="transparent"/>';if(gs.length<17||i%(gs.length>25?3:2)===0)svg+='<text x="'+x(i)+'" y="'+(H-11)+'" text-anchor="middle" class="axis">'+esc(this.label(g.key))+'</text>';svg+='</g>';});
 const range=chosen?(this.mode==='daily'?this.label(chosen.key)+':00–'+this.label(new Date(Date.parse(chosen.key)+3600000).toISOString())+':00':chosen.key):(this.mode==='daily'?day(Date.now()):gs.length?gs[0].key+' — '+gs.at(-1).key:'');
 const totals=active.map(s=>{const values=items.map(g=>g.values[s.id]).filter(v=>v!==undefined&&v!==null),total=values.length?values.reduce((a,b)=>a+b,0):null;let partial=false;if(this.mode==='yearly')partial=items.some(g=>(g.counts[s.id]||0)<g.expected);else if(this.mode!=='daily')partial=values.length<items.length;return '<div><span>'+s.name+(partial?' · partial':'')+'</span><strong style="color:'+s.color+'">'+fmt(total)+' <small>kWh</small></strong></div>';}).join('');
 const paired=items.filter(g=>g.complete&&g.values.solar!==null&&g.values.solar!==undefined&&g.values.forecast!==null&&g.values.forecast!==undefined&&(this.mode!=='yearly'||g.counts.solar===g.expected&&g.counts.forecast===g.expected)),pa=paired.reduce((a,g)=>a+g.values.solar,0),pf=paired.reduce((a,g)=>a+g.values.forecast,0),delta=pf>0?(pa/pf-1)*100:null;
 const forecastCoverage=this.mode==='daily'?'Hourly energy · latest Solcast forecast':items.reduce((n,g)=>n+(this.mode==='yearly'?g.counts.forecast||0:g.values.forecast!==undefined?1:0),0)+' days with forecast';
 this.shadowRoot.innerHTML='<style>:host{display:block}*{box-sizing:border-box}ha-card{display:block;padding:16px;border-radius:20px;color:var(--primary-text-color,#eee);background:linear-gradient(125deg,color-mix(in srgb,var(--card-background-color,#1b2020) 94%,var(--myhome-accent,var(--accent-color,#d5ab6c)) 6%),color-mix(in srgb,var(--card-background-color,#1b2020) 85%,transparent));border:1px solid color-mix(in srgb,var(--myhome-accent,#d5ab6c) 13%,transparent);border-top:2px solid color-mix(in srgb,var(--myhome-accent,#d5ab6c) 30%,transparent);font:12px Nunito,system-ui,sans-serif}.head,.meta,.legend,.totals{display:flex;align-items:center;justify-content:space-between;gap:12px}h3{font-size:14px;margin:0}select{font:inherit;color:inherit;background:color-mix(in srgb,var(--card-background-color,#182020) 75%,transparent);border:1px solid #ffffff14;border-radius:9px;padding:7px 9px;max-width:110px}.meta{font-size:10px;color:var(--secondary-text-color,#9ca6a5);margin:10px 0}.totals{justify-content:flex-start;gap:26px;margin:15px 0 8px}.totals span{display:block;font-size:10px;color:var(--secondary-text-color,#9ca6a5);margin-bottom:3px}.totals strong{font-size:22px;font-weight:700}.totals small{font-size:11px;font-weight:400}.totals .actual{color:#efc66e}.totals .forecast{color:#b4a0ed}.legend{justify-content:flex-start;font-size:10px;color:var(--secondary-text-color,#9ca6a5);gap:16px}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;background:#efc66e}.forecast-dot{background:#b4a0ed}svg{width:100%;height:auto;display:block;overflow:visible;touch-action:pan-y}.axis{fill:var(--secondary-text-color,#9ca6a5);font:10px Nunito,system-ui,sans-serif}g[data-key]{cursor:pointer}.foot{display:flex;justify-content:space-between;gap:12px;font-size:10px;color:var(--secondary-text-color,#9ca6a5);min-height:13px}.empty{padding:38px 0;text-align:center;color:var(--secondary-text-color,#9ca6a5)} .legend{flex-wrap:wrap;gap:6px}.legend button{font:inherit;min-height:30px;padding:5px 8px;border-radius:9px;background:transparent;color:var(--secondary-text-color);border:1px solid #ffffff14;cursor:pointer}.legend button.on{color:var(--primary-text-color);border-color:color-mix(in srgb,var(--series) 40%,transparent);background:color-mix(in srgb,var(--series) 10%,transparent)}.legend i{background:var(--series)}.totals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}.totals.many strong{font-size:19px}.foot{flex-wrap:wrap}svg{min-height:160px}</style><ha-card><div class="head"><h3>Energy · forecast & actual</h3><select aria-label="Comparison period">'+['daily','weekly','monthly','yearly'].map(m=>'<option value="'+m+'" '+(m===this.mode?'selected':'')+'>'+({daily:'Day',weekly:'Week',monthly:'Month',yearly:'Year'}[m])+'</option>').join('')+'</select></div><div class="meta"><span>'+esc(range)+'</span><span>kWh'+(this.loading?' · updating':'')+'</span></div><div class="totals '+(active.length>2?'many':'')+'">'+totals+'</div><div class="legend">'+series.map(s=>'<button data-series="'+s.id+'" aria-pressed="'+this.enabled.has(s.id)+'" class="'+(this.enabled.has(s.id)?'on':'')+'" style="--series:'+s.color+'"><i class="dot"></i>'+s.chip+'</button>').join('')+'</div>'+(gs.length?'<svg viewBox="0 0 '+W+' '+H+'" aria-label="Energy comparison in kWh">'+svg+'</svg>':'<div class="empty">'+(this.error||'Loading energy history…')+'</div>')+'<div class="foot"><span>'+esc(this.error||forecastCoverage)+'</span><span>'+(this.enabled.has('solar')&&this.enabled.has('forecast')&&delta!==null?(delta>=0?'+':'')+fmt(delta)+'% · completed matched '+(this.mode==='daily'?'hours':this.mode==='yearly'?'months':'days'):gs.some(g=>g.today)?'Today in progress':'')+'</span></div></ha-card>';
 this.shadowRoot.querySelector('select').onchange=e=>{this.mode=e.target.value;this.selected=null;this.render();};
 for(const el of this.shadowRoot.querySelectorAll('[data-series]'))el.onclick=()=>{const id=el.dataset.series;if(this.enabled.has(id)){if(this.enabled.size>1)this.enabled.delete(id);}else this.enabled.add(id);this.render();};
 for(const el of this.shadowRoot.querySelectorAll('[data-key]')){const select=()=>{this.selected=this.selected===el.dataset.key?null:el.dataset.key;this.render();};el.onclick=select;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};}
 }
}
if(!customElements.get('myhome-solar-comparison-v3'))customElements.define('myhome-solar-comparison-v3',EnergyComparison);
})();
