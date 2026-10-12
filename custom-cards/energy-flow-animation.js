import './energy-flow-colours.js';
function roundedRoute(d){if(/[CQ]/i.test(d))return d;const nums=d.match(/-?\d+(?:\.\d+)?/g)?.map(Number);if(!nums||nums.length%2)return d;const p=[];for(let i=0;i<nums.length;i+=2)p.push([nums[i],nums[i+1]]);if(p.length<3)return d;let out=`M${p[0].join(' ')}`;for(let i=1;i<p.length-1;i++){const[a,b,c]=[p[i-1],p[i],p[i+1]],u=Math.hypot(b[0]-a[0],b[1]-a[1]),v=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(24,u*.32,v*.32);if(!u||!v)continue;const before=[b[0]+(a[0]-b[0])*r/u,b[1]+(a[1]-b[1])*r/u],after=[b[0]+(c[0]-b[0])*r/v,b[1]+(c[1]-b[1])*r/v];out+=` L${before.join(' ')} Q${b.join(' ')} ${after.join(' ')}`;}return out+` L${p.at(-1).join(' ')}`;}
const comet=Base=>class extends Base {
 _build(){super._build();const style=document.createElement('style');style.textContent=`
 .comet{display:none;fill:none;stroke:var(--flow-bright);stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
 :host(.flow-multi) .flow-bed,:host(.flow-multi) .flow-lit,:host(.flow-multi) .flow-halo,:host(.flow-multi) .flow-direction,:host(.flow-multi) .junction{display:none!important}
 :host(.flow-multi) .flow.on .comet{display:block;stroke-dasharray:26 74;stroke-width:6;animation:ebComet 5s linear infinite;opacity:.95;filter:none}
 :host(.flow-multi) .flow.on .comet.halo{stroke:var(--flow-glow);stroke-width:13;opacity:.14}
 :host(.flow-multi) .flow.on .comet.tail{stroke-dasharray:26 74;stroke-width:4;opacity:.65}
 :host(.flow-multi) .flow.on .comet.head{stroke-dasharray:5 95;stroke-width:7;animation-name:ebCometHead;stroke:var(--flow-bright);opacity:1}
 :host(.flow-multi) .flow.reverse .comet.head{animation-name:ebComet}
 @keyframes ebCometHead{from{stroke-dashoffset:-21}to{stroke-dashoffset:-121}}
 :host(.flow-multi) .flow.reverse .comet{animation-direction:reverse}
 :host(:not(.labels-visible)) .comet,:host(.offscreen) .comet,:host(.paused) .comet{animation-play-state:paused!important}
 @keyframes ebComet{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}
 @media(prefers-reduced-motion:reduce){:host(.flow-multi) .flow.on .comet{animation:none!important;stroke-dasharray:26 74;stroke-dashoffset:-42}}
 `;this.shadowRoot.append(style);this._comets();}
 _house(style){super._house(style);this._comets();}
 _flowColor(name){super._flowColor(name);if(this._houseStyle)this._house(this._houseStyle);}
 _comets(){if(!this.shadowRoot)return;for(const group of this.shadowRoot.querySelectorAll('.flow')){const bed=group.querySelector('.flow-bed');if(!bed)continue;let original=bed.getAttribute('d');if(!original)continue;const d=this._flowPalette==='multi'?roundedRoute(original):original;for(const path of group.querySelectorAll('path:not(.comet)'))path.setAttribute('d',d);for(const cls of ['halo','tail','head']){let p=group.querySelector('.comet.'+cls);if(!p){p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class','comet '+cls);p.setAttribute('pathLength','100');group.append(p);}p.setAttribute('d',d);}}}
};
if(!customElements.get('myhome-comet-live-v26'))customElements.define('myhome-comet-live-v26',comet(customElements.get('myhome-spectrum-live-v24')));
if(!customElements.get('myhome-comet-test-v26'))customElements.define('myhome-comet-test-v26',comet(customElements.get('myhome-spectrum-test-v24')));
