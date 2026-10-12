/* Atmospheric layers for MyHome. Cached cloud texture, bounded 30 fps, stable DOM. */
import './house-scene-base.js';
const BASE=customElements.get('myhome-live-base-v22'),W=760,H=625,TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const presets={sun:{cloud:.025,warm:1},partial:{cloud:.48,warm:.65},cloud:{cloud:.9},rain:{cloud:1,rain:.65,wet:1},pour:{cloud:1,rain:1,wet:1},snow:{cloud:.65,snow:1},fog:{cloud:0,fog:1},wind:{cloud:.7,wind:1},sleet:{cloud:.9,rain:.55,snow:.45,wet:1,wind:.65,sleet:1},hail:{cloud:.9,hail:1,wet:1},storm:{cloud:1,rain:1,storm:1,wet:1},thunder:{cloud:1,storm:1},night:{cloud:.25,night:1},stars:{cloud:0,night:1},alert:{cloud:.8,wind:.5},unknown:{cloud:.2}};
let cachedCloud;
function texture(){
 if(cachedCloud)return cachedCloud;
 const c=document.createElement('canvas');c.width=768;c.height=320;const ctx=c.getContext('2d'),im=ctx.createImageData(768,320);
 const hash=(x,y)=>{let n=Math.imul(x+17,374761393)+Math.imul(y+43,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
 const noise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);return (hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v;};
 const field=(x,y)=>{let n=0,a=.55,f=.009;for(let k=0;k<6;k++){n+=noise(x*f,y*f)*a;f*=2.1;a*=.52;}return n;};
 for(let y=0;y<320;y++)for(let x=0;x<768;x++){
 const n=field(x,y),edge=Math.pow(Math.max(0,Math.sin(Math.PI*x/768)),.6)*Math.pow(Math.max(0,Math.sin(Math.PI*y/320)),1.2);
 const density=clamp((n*edge-.24)*4.8),light=clamp(.55+(field(x-9,y-14)-n)*5+(160-y)/650);
 const k=(y*768+x)*4;im.data[k]=62+light*164;im.data[k+1]=76+light*157;im.data[k+2]=96+light*145;im.data[k+3]=Math.pow(density,.65)*245;
 }ctx.putImageData(im,0,0);return cachedCloud=c;
}
function glow(c,x,y,rx,ry,color,a){c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${color},${a})`);g.addColorStop(.45,`rgba(${color},${a*.45})`);g.addColorStop(1,`rgba(${color},0)`);c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();}
class MyHomeStudioWeatherV21 extends BASE{
 _build(){
  super._build();const root=this.shadowRoot,scene=root.querySelector('.scene');
  const style=document.createElement('style');style.textContent=`
  .scene>svg{position:relative;z-index:1}.wx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mask-image:radial-gradient(ellipse 85% 78% at 50% 42%,#000 58%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 85% 78% at 50% 42%,#000 58%,transparent 100%)}
  .scene{overflow:visible!important} .header{position:relative;z-index:5} .settings-panel{position:relative;z-index:6} :host(.day):not(.rainy):not(.foggy) .alternative-house{filter:brightness(1.03) saturate(.93)}.wx-canvas{top:-50px!important;left:-20px!important;width:calc(100% + 40px)!important;height:auto!important;aspect-ratio:760/625;mask-image:radial-gradient(ellipse 65% 65% at 50% 48%,#000 32%,transparent 93%);-webkit-mask-image:radial-gradient(ellipse 65% 65% at 50% 48%,#000 32%,transparent 93%)}.wx-back{z-index:0}.wx-front{z-index:2}.scene .weather{z-index:4}
  .scene>svg .sky,.scene>svg .atmosphere,.scene>svg .ground-haze,.scene>svg .rain-streak,.scene>svg .splash,.scene>svg .snowflake,.scene>svg .lightning,.scene>svg .fog-layer,.scene>svg .hail-layer,.scene>svg .wind-layer{display:none!important;animation:none!important}
  .alternative-house,.architecture,.real-car{transition:filter 1.5s!important}
  :host(.rainy) .alternative-house,:host(.thunder) .alternative-house{filter:brightness(.82) saturate(.68)}
  :host(.snowy) .alternative-house{filter:brightness(1.02) saturate(.55)}
  :host(.foggy) .alternative-house{filter:brightness(.94) saturate(.42) contrast(.8)}
  :host(.night) .alternative-house{filter:brightness(.77) saturate(.7)}
  :host(.studio-clear) .weather-cloud{opacity:0!important}:host(.studio-clear) .weather-sun{transform:translate(6px,5px);animation:none}.wx-option{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--secondary-text-color);min-height:40px}.wx-option input{accent-color:var(--gold);width:17px;height:17px}`;root.append(style);
  this._back=document.createElement('canvas');this._front=document.createElement('canvas');
  for(const [c,k]of [[this._back,'back'],[this._front,'front']]){c.className='wx-canvas wx-'+k;c.setAttribute('aria-hidden','true');scene.append(c);}
  this._bg=this._back.getContext('2d');this._fg=this._front.getContext('2d');this._cloud=texture();this._cloudPhoto=new Image();this._cloudPhoto.onload=()=>{this._cloudVariants={};for(const [key,filter]of Object.entries({sun:"sepia(.28) saturate(.65) brightness(1.25)",cloud:"saturate(.15) brightness(.72) contrast(1.25)",rain:"sepia(.3) hue-rotate(165deg) saturate(.8) brightness(.49) contrast(1.45)",night:"sepia(.8) hue-rotate(170deg) saturate(1.3) brightness(.32)",snow:"saturate(.2) brightness(.92)"})){const c=document.createElement("canvas");c.width=960;c.height=410;const ctx=c.getContext("2d");ctx.filter=filter+" blur(1px)";ctx.drawImage(this._cloudPhoto,0,0,960,410);this._cloudVariants[key]=c;}this._draw();};this._cloudPhoto.src="/local/myhome-scene-v1/cloud-studio-v21.png";this._time=7;this._inView=true;
  let seed=4287;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  this._particles=Array.from({length:160},()=>({x:rnd(),y:rnd(),z:rnd(),phase:rnd()*TAU}));this._stars=Array.from({length:100},()=>({x:80+rnd()*620,y:60+rnd()*180,r:.35+rnd()*.9,p:rnd()*TAU}));
  this._motion=matchMedia('(prefers-reduced-motion: reduce)');this._motionChange=()=>this._syncAnimation();this._visibility=()=>this._syncAnimation();
  const picker=root.querySelector('.scene-picker');for(const [id,label]of [['partial','Partly cloudy'],['pour','Heavy rain'],['thunder','Thunder'],['stars','Clear starry sky']]){const b=document.createElement('button');b.type='button';b.dataset.scene=id;b.textContent=label;b.onclick=()=>{this._sceneMode=id;this._savePrefs();this._update();};picker.append(b);}
  let prefs={};try{prefs=JSON.parse(localStorage.getItem('myhome.scene.preferences')||'{}');}catch{}
  if(['partial','pour','thunder','stars'].includes(prefs.weather))this._sceneMode=prefs.weather;this._animateWeather=prefs.weatherMotion!==false;
  const option=document.createElement('label');option.className='wx-option';const input=document.createElement('input');input.type='checkbox';input.checked=this._animateWeather;option.append(input,document.createTextNode('Animate weather'));root.querySelector('.settings-note').before(option);input.onchange=()=>{this._animateWeather=input.checked;this._savePrefs();this._syncAnimation();};
  this._resize=()=>{const scale=Math.min(1.5,devicePixelRatio||1)*(scene.clientWidth||400)/W;for(const c of [this._back,this._front]){c.width=Math.round(W*scale);c.height=Math.round(H*scale);}this._scale=scale;this._draw();};this._resize();if(this.isConnected)this._connectWeather();
 }
 _savePrefs(){super._savePrefs();try{const p=JSON.parse(localStorage.getItem('myhome.scene.preferences')||'{}');p.weatherMotion=this._animateWeather!==false;localStorage.setItem('myhome.scene.preferences',JSON.stringify(p));}catch{}}
 connectedCallback(){super.connectedCallback();if(this._back)this._connectWeather();}
 _connectWeather(){if(this._wxConnected)return;this._wxConnected=true;this._ro=new ResizeObserver(this._resize);this._ro.observe(this.shadowRoot.querySelector('.scene'));this._io=new IntersectionObserver(e=>{this._inView=e[0].isIntersecting;this._syncAnimation();},{rootMargin:'60px'});this._io.observe(this);document.addEventListener('visibilitychange',this._visibility);this._motion.addEventListener('change',this._motionChange);this._syncAnimation();}
 disconnectedCallback(){super.disconnectedCallback();cancelAnimationFrame(this._raf);this._raf=null;this._ro?.disconnect();this._io?.disconnect();document.removeEventListener('visibilitychange',this._visibility);this._motion?.removeEventListener('change',this._motionChange);this._wxConnected=false;}
 _syncAnimation(){cancelAnimationFrame(this._raf);this._raf=null;this._last=0;this._draw();if(this.isConnected&&this._inView&&!document.hidden&&!this._motion.matches&&this._animateWeather)this._raf=requestAnimationFrame(t=>this._tick(t));}
 _tick(t){if(!this.isConnected)return;if(!this._last||t-this._last>=33){this._time+=this._last?Math.min((t-this._last)/1000,.1):0;this._last=t;this._draw();}this._raf=requestAnimationFrame(t=>this._tick(t));}
 _update(){
  const mode=this._sceneMode,extra={partial:'partlycloudy',pour:'pouring',thunder:'lightning',stars:'clear-night'},h=this._hass;
  if(extra[mode]&&h){this._hass={...h,states:{...h.states,'weather.forecast_home_2':{...h.states['weather.forecast_home_2'],state:extra[mode]}}};this._sceneMode='auto';}
  super._update();this._hass=h;this._sceneMode=mode;if(!this._back||!h)return;
  const actual=this._state('weather.forecast_home_2')?.state,map={sunny:'sun','clear-night':'night',partlycloudy:'partial',cloudy:'cloud',rainy:'rain',pouring:'pour',snowy:'snow','snowy-rainy':'sleet',fog:'fog',hail:'hail',windy:'wind','windy-variant':'wind',lightning:'thunder','lightning-rainy':'storm',exceptional:'alert'};
  const key=mode==='auto'?(map[actual]||'unknown'):(presets[mode]?mode:'unknown');const p={cloud:0,warm:0,rain:0,snow:0,fog:0,wind:0,hail:0,storm:0,wet:0,night:0,sleet:0,...presets[key]};
  if(mode==='auto')p.night=this._state('sun.sun')?.state==='below_horizon'||actual==='clear-night'?1:0;
  if(extra[mode]){this.classList.toggle('night',mode==='stars');this.classList.toggle('day',mode!=='stars');this.classList.add('preview-scene');this.shadowRoot.querySelector('#weather-condition').textContent=({partial:'Partly cloudy',pour:'Heavy rain',thunder:'Thunder',stars:'Clear starry sky'}[mode])+' · preview';this.shadowRoot.querySelector('#preview-selection').textContent=mode+' preview';this.shadowRoot.querySelector('#scene-note').textContent='Preview · energy readings remain live';}
  this.shadowRoot.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===mode);b.setAttribute('aria-pressed',String(b.dataset.scene===mode));});
  this.classList.toggle("studio-clear",key==="sun"||key==="stars"||(mode==="auto"&&actual==="clear-night"));this._target=p;if(!this._current)this._current={...p};if(!this._raf){this._current={...p};this._draw();}
 }
 _draw(){
  if(!this._bg||!this._current)return;const p=this._current,t=this._time;for(const k of Object.keys(p))p[k]+=(this._target[k]-p[k])*.045;
  const b=this._bg,f=this._fg;for(const c of [b,f]){c.setTransform(this._scale,0,0,this._scale,0,0);c.clearRect(0,0,W,H);}
  glow(b,400,175,460,300,p.night>.5?'55,79,120':p.warm>.5?'108,151,179':'91,116,142',.12+p.cloud*.12);if(p.warm>.01){
   glow(b,590,112,250,210,'255,215,148',p.warm*.30);
   // Broad, angled shafts keep daylight directional instead of a flat wash.
   b.save();b.globalCompositeOperation='screen';
   for(let j=0;j<4;j++){const ray=b.createLinearGradient(590,80,170+j*95,310);ray.addColorStop(0,`rgba(255,224,177,${p.warm*.07})`);ray.addColorStop(1,'transparent');b.fillStyle=ray;b.beginPath();b.moveTo(575+j*6,100);b.lineTo(70+j*125,360);b.lineTo(145+j*125,360);b.lineTo(592+j*6,100);b.fill();}b.restore();
  }
  const cx=590,cy=112;b.save();b.globalAlpha=p.night>.5?clamp(.95-p.fog*.85-p.cloud*.35):clamp(.22+p.warm*.78-p.rain*.8-p.fog*.9-p.snow*.6-p.storm*.8);
  if(p.night>.5){
   glow(b,cx,cy,65,65,'137,174,230',.19);
   // A true crescent silhouette, with no dark disc painted over the sky.
   b.fillStyle='#d8e6f4';b.beginPath();b.arc(cx,cy,19,Math.PI*.27,Math.PI*1.73);b.bezierCurveTo(cx-2,cy-13,cx-2,cy+13,cx+19*Math.cos(Math.PI*.27),cy+19*Math.sin(Math.PI*.27));b.fill();
  }else{
   glow(b,cx,cy,110,110,'255,177,63',.2+p.warm*.2);
   const g=b.createRadialGradient(cx-5,cy-6,1,cx,cy,21);g.addColorStop(0,'#fff3b1');g.addColorStop(.72,'#ffd36b');g.addColorStop(1,'#f4b444');b.fillStyle=g;b.beginPath();b.arc(cx,cy,21,0,TAU);b.fill();
   if(p.warm>.3){b.strokeStyle=`rgba(255,214,129,${p.warm*.28})`;b.lineWidth=1.2;for(let i=0;i<12;i++){const a=i*TAU/12;b.beginPath();b.moveTo(cx+Math.cos(a)*29,cy+Math.sin(a)*29);b.lineTo(cx+Math.cos(a)*37,cy+Math.sin(a)*37);b.stroke();}}
  }b.restore();
  if(p.night>.01){b.fillStyle='#d9e7f7';for(const s of this._stars){b.globalAlpha=p.night*(1-p.cloud)*(.55+.25*Math.sin(t*.6+s.p));b.beginPath();b.arc(s.x,s.y,s.r,0,TAU);b.fill();}b.globalAlpha=1;}
  const gust=.7+.3*Math.sin(t*.47)+.15*Math.sin(t*.91);
  const palette=p.night>.5?'night':p.rain>.2||p.storm>.2?'rain':p.snow>.2?'snow':p.warm>.3?'sun':'cloud';
  const cloud=this._cloudVariants?.[palette]||this._cloud;
  // Separate small cloud groups with open sky, not one continuous bank.
  for(let i=0;i<7;i++){
   const layer=i%3,speed=(2+layer*2)*(1+p.wind*4);
   const x=((t*speed+i*163+Math.sin(t*.47)*p.wind*9)%1100)-190;
   const y=42+layer*48+Math.sin(i*2.3)*22;
   const width=190+layer*64;
   b.globalAlpha=p.cloud*(.38+layer*.06);
   b.drawImage(cloud,x,y,width,width*.43);
  }b.globalAlpha=1;
  // Keep background atmosphere above the roof: house edge masks must not reveal clouds.
  b.save();b.globalCompositeOperation='destination-in';
  const skyFade=b.createLinearGradient(0,150,0,275);
  skyFade.addColorStop(0,'#000');skyFade.addColorStop(.45,'rgba(0,0,0,.92)');skyFade.addColorStop(1,'transparent');
  b.fillStyle=skyFade;b.fillRect(0,0,W,H);b.restore();
  if(p.wet>.01){glow(b,420,520,330,75,'99,144,165',p.wet*.2);glow(f,460,500,170,40,'228,176,101',p.wet*.06);}
  if(p.fog>.01){
   glow(b,380,360,600,370,'177,191,200',p.fog*.55);
   for(let i=0;i<6;i++){const y=240+i*48+Math.sin(t*.1+i)*18,x=380+Math.sin(t*.07+i)*160;f.globalAlpha=p.fog*.13;f.drawImage(this._cloud,x-500,y-85,1000,190);f.globalAlpha=1;
    glow(f,x,y,540,45+i*8,'193,207,216',p.fog*(.10+i*.022));}
  }
  const motion=this._motion?.matches?0:t;
  for(let i=0;i<this._particles.length;i++){const a=this._particles[i],z=.35+a.z*.65,c=a.z>.55?f:b;
   if(i<130*p.rain){const y=(a.y*780+motion*(280+z*400))%780-80,x=((a.x*960-motion*(65+p.wind*90)*z)%960+960)%960-100;c.strokeStyle=`rgba(181,211,231,${.25+z*.4})`;c.lineWidth=.5+z*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x-3-z*5,y+14+z*29);c.stroke();}
   if(i<150*p.snow){const y=(a.y*740+motion*(19+z*28+p.sleet*95))%740-55,x=(a.x*850+motion*(4+p.wind*90)+Math.sin(motion*.7+a.phase)*(9+z*13))%850-45;c.fillStyle=`rgba(230,241,249,${.35+z*.5})`;c.beginPath();c.ellipse(x,y,.8+z*z*(4-p.sleet*2),1+z*z*(3+p.sleet*3),-.5*p.sleet,0,TAU);c.fill();}
   if(i<70*p.hail){const phase=(a.y+motion*(.5+z*.4))%1,x=(a.x*820-motion*27*z+8200)%820-30,y=phase<.8?phase/.8*520:520-Math.sin((phase-.8)/.2*Math.PI)*22;c.fillStyle=`rgba(213,231,247,${.4+z*.3})`;c.beginPath();c.arc(x,y,1+z*1.6,0,TAU);c.fill();}
   if(i<20*p.wet){const q=(motion*.7+a.phase)%1;f.strokeStyle=`rgba(161,201,217,${(1-q)*.22*p.wet})`;f.lineWidth=.7;f.beginPath();f.ellipse(100+a.x*590,490+a.y*70,2+q*11,1+q*3,0,0,TAU);f.stroke();}}
  if(p.wind>.01){
   for(let i=0;i<18;i++){const x=(t*(95+i*5)+Math.sin(t*.47)*24+i*97)%1100-160,y=210+i*19+Math.sin(t*1.2+i)*16;
    f.strokeStyle=`rgba(179,204,215,${p.wind*(.06+(i%3)*.025)})`;f.lineWidth=.6;f.beginPath();f.moveTo(x,y);f.bezierCurveTo(x+30,y-12,x+60,y+10,x+115,y-4);f.stroke();
    if(i%3===0){f.save();f.translate(x+110,y);f.rotate(t*(1+i*.1));f.fillStyle=`rgba(172,146,102,${p.wind*.5})`;f.beginPath();f.ellipse(0,0,3.5,1.3,0,0,TAU);f.fill();f.restore();}
   }
  }
  if(p.storm>.01&&!this._motion?.matches&&this._animateWeather){
   const phase=t%11,flash=phase>3&&phase<3.7?Math.max(0,Math.sin((phase-3)*19))*Math.exp(-(phase-3)*2):0;
   if(flash){
    glow(b,290,160,490,340,'168,191,244',flash*.75*p.storm);
    const bolt=[[365,-15],[337,34],[354,67],[310,110],[330,129],[282,174],[296,202],[246,258]];
    b.save();b.globalAlpha=flash*p.storm;b.lineJoin='round';b.lineCap='round';
    for(const [width,color]of [[12,'rgba(127,155,255,.14)'],[5,'rgba(177,202,255,.4)'],[1.6,'#eef3ff']]){
     b.strokeStyle=color;b.lineWidth=width;b.beginPath();bolt.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));
     b.moveTo(310,110);b.lineTo(260,124);b.lineTo(231,161);b.lineTo(198,172);
     b.moveTo(337,34);b.lineTo(393,62);b.lineTo(418,101);b.stroke();
    }b.restore();
   }
  }
  // Feather every boundary to transparent, including the top edge on iOS.
  for(const c of [b,f]){c.save();c.globalCompositeOperation='destination-in';const gy=c.createLinearGradient(0,0,0,H);gy.addColorStop(0,'transparent');gy.addColorStop(.14,'#000');gy.addColorStop(.72,'#000');gy.addColorStop(1,'transparent');c.fillStyle=gy;c.fillRect(0,0,W,H);const gx=c.createLinearGradient(0,0,W,0);gx.addColorStop(0,'transparent');gx.addColorStop(.14,'#000');gx.addColorStop(.77,'#000');gx.addColorStop(1,'transparent');c.fillStyle=gx;c.fillRect(0,0,W,H);c.restore();}
 }
}
if(!customElements.get('myhome-live-weather-v22'))customElements.define('myhome-live-weather-v22',MyHomeStudioWeatherV21);
