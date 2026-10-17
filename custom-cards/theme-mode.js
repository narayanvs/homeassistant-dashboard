/* Rendered theme adaptation. No entity, service or preference changes. */
const scheduled=new WeakSet();
const palette={'#f3cf67':'#977000','#f2c572':'#977000','#efc66e':'#977000','#d9b778':'#8b6526','#d9b77f':'#8b6526','#d5ab6c':'#8b6526','#61d7bf':'#147d70','#62d9b5':'#147d70','#85cbb3':'#237d69','#65b39b':'#237d69','#94f6c7':'#087b62','#ca88f7':'#8845b5','#b4a0ed':'#7750b2','#b8a1f5':'#7750b2','#849dff':'#4962c5','#b5d8e0':'#456c7a','#8ac5da':'#32728e','#88c6ed':'#32728e','#e4b968':'#8b6526','#e9bd78':'#8b6526','#ee9b90':'#b74539','#f1988e':'#b74539'};
Object.assign(palette,{'#e7ce6e':'#c39c2d','#bb95ec':'#9365c4','#82aceb':'#5d8ad3','#8996f2':'#696ed3','#5ed4c0':'#29ab99','#efab77':'#d18b56','#f4be57':'#b77a15','#62bbf0':'#227faa','#b896f1':'#8052b5','#5ed5ac':'#198f6c','#fa9270':'#c65f40'});
const rules=Object.entries(palette).map(([from,to])=>`:host([data-myhome-mode="light"]) [stroke="${from}"]{stroke:${to}!important}:host([data-myhome-mode="light"]) [fill="${from}"]{fill:${to}!important}:host([data-myhome-mode="light"]) [style*="color:${from}"],:host([data-myhome-mode="light"]) [style*="color: ${from}"]{color:${to}!important}`).join('\n');
const stopRules=Object.entries(palette).map(([from,to])=>`:host([data-myhome-mode="light"]) [stop-color="${from}"]{stop-color:${to}!important}`).join('\n');
const variableRules=Object.entries(palette).flatMap(([from,to])=>['--c','--series','--band'].map(v=>`:host([data-myhome-mode="light"]) [style*="${v}:${from}"],:host([data-myhome-mode="light"]) [style*="${v}: ${from}"]{${v}:${to}!important}`)).join('\n');
const css=`
:host([data-myhome-mode="light"]){--gold:#8b6526;--mint:#147d70;--myhome-chart-grid:#63798b35;--myhome-chart-ink:#263b4a;--myhome-track:#526b8222}
:host([data-myhome-mode="light"]) .panel,:host([data-myhome-mode="light"]) .nexus,:host([data-myhome-mode="light"]) .shell,:host([data-myhome-mode="light"]) .card{box-shadow:0 8px 22px #273a5010}
:host([data-myhome-mode="light"]) svg text{fill:var(--primary-text-color,#243442)}
:host([data-myhome-mode="light"]) .grid line,:host([data-myhome-mode="light"]) .grid path,:host([data-myhome-mode="light"]) .axis line{stroke:var(--myhome-chart-grid)!important}
:host([data-myhome-mode="light"]) .muted,:host([data-myhome-mode="light"]) .sub,:host([data-myhome-mode="light"]) .hint{color:var(--secondary-text-color,#526779)}
/* House scene remains transparent; daylight alpha assets replace dark artwork. */
:host([data-myhome-mode="light"]) .scene{background:transparent!important;box-shadow:none!important;isolation:isolate}
:host([data-myhome-mode="light"]) .label .title{fill:#405463!important}
:host([data-myhome-mode="light"]) .label .value{fill:#172b3b!important}
:host([data-myhome-mode="light"]) .label .sub{fill:#4c626f!important}
:host([data-myhome-mode="light"]) .label text{filter:none!important;paint-order:stroke;stroke:var(--primary-background-color,#f5f8fb);stroke-width:2px;stroke-opacity:.7;stroke-linejoin:round}
:host([data-myhome-mode="light"]) .label .plate{fill:transparent!important;stroke:none!important}
:host([data-myhome-mode="light"]) .leader{stroke:#3a5366!important;stroke-opacity:.55!important}
:host([data-myhome-mode="light"]) .leader-end{fill:#3a5366!important}
:host([data-myhome-mode="light"]) .weather{color:var(--primary-text-color,#172b3b)!important}
:host([data-myhome-mode="light"]) .weather small{color:var(--secondary-text-color,#4c626f)!important}
:host([data-myhome-mode="light"]) .icon-button{background:color-mix(in srgb,var(--card-background-color,#fff) 85%,transparent)!important;color:var(--primary-text-color,#172b3b)!important;border-color:color-mix(in srgb,var(--primary-text-color) 15%,transparent)!important}
:host([data-myhome-mode="light"]) .alternative-house,:host([data-myhome-mode="light"]) .architecture{filter:none!important}
:host([data-myhome-mode="light"]) .sky{opacity:.8!important}
:host([data-myhome-mode="light"]) .wx-canvas{mix-blend-mode:multiply;opacity:1}
:host([data-myhome-mode="light"]) .flow-bed{stroke:var(--myhome-accent,#278c85)!important;opacity:.58!important}
:host([data-myhome-mode="light"]) .flow-lit{filter:drop-shadow(0 0 1px #fff)!important}
${rules}
${variableRules}
${stopRules}
:host([data-myhome-mode="light"]) .sheet-hero img{opacity:1;mask-image:var(--myhome-banner-mask)!important;-webkit-mask-image:var(--myhome-banner-mask)!important;filter:var(--myhome-banner-filter,none)}
:host([data-myhome-mode="light"]) .sheet-hero:after{background:linear-gradient(0deg,var(--page),transparent 78%);opacity:1}
:host([data-myhome-mode="light"]){--myhome-accent:var(--myhome-ui-accent,#3e7b91)!important;--solar:#bb841a;--home:#287faf;--grid:#8255b8;--battery:#218c70;--ev:#c56748}
:host([data-myhome-mode="light"]) .node{border-color:color-mix(in srgb,var(--color) 40%,transparent)!important}
:host([data-myhome-mode="light"]) .stream{stroke-width:4.5;filter:none}
:host([data-myhome-mode="light"]) .arc{stroke:var(--myhome-ui-accent)!important}
:host([data-myhome-mode="light"]) .esb{fill:var(--myhome-ui-accent)!important}
:host([data-myhome-mode="light"]) .reference{fill:var(--myhome-ui-accent)!important;opacity:.5}
:host([data-myhome-mode="light"]) .header:before{inset:-20px -6px -12px -16px;opacity:.46;mask-image:linear-gradient(to bottom,transparent,black 18%,black 48%,transparent 100%),linear-gradient(90deg,transparent,black 10%,black 65%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent,black 18%,black 48%,transparent 100%),linear-gradient(90deg,transparent,black 10%,black 65%,transparent 100%);mask-composite:intersect;-webkit-mask-composite:source-in}
`;
function update(el){
 const root=el.shadowRoot;if(!root||!el.isConnected)return;
 let style=root.querySelector('style[data-myhome-theme]');if(!style){style=document.createElement('style');style.dataset.myhomeTheme='';style.textContent=css;root.append(style);}
 const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;background-color:var(--primary-background-color,transparent);color:var(--primary-text-color,inherit)';root.append(probe);const c=getComputedStyle(probe),bg=c.backgroundColor.match(/[\d.]+/g)?.map(Number),fg=c.color.match(/[\d.]+/g)?.map(Number);const ink=c.color;probe.remove();const lum=a=>a[0]*.2126+a[1]*.7152+a[2]*.0722;const light=bg?.length>=3&&(bg.length<4||bg[3]>0)?lum(bg)>128:fg?.length>=3?lum(fg)<128:false;el.dataset.myhomeMode=light?'light':'dark';
 const parent=el.parentElement||el.getRootNode().host,pc=parent?getComputedStyle(parent):c,accent=pc.getPropertyValue('--myhome-accent').trim()||pc.getPropertyValue('--primary-color').trim()||'#69bdb7';el.style.setProperty('--myhome-ui-accent',`color-mix(in srgb,${accent} 70%,#213c55 30%)`);
 if(el.portal){el.portal.style.setProperty('--nav-text',ink);el.portal.style.setProperty('--nav-muted',`color-mix(in srgb,${ink} 72%,transparent)`);el.portal.style.setProperty('--nav-active',light?`color-mix(in srgb,${accent} 55%,#16384b 45%)`:ink);el.portal.style.setProperty('--nav-active-bg',`color-mix(in srgb,${accent} ${light?'22':'18'}%,transparent)`);}
 let ancestor=el;while(ancestor){if(['HUI-VIEW','HUI-SECTIONS-VIEW'].includes(ancestor.tagName)){if(light){ancestor.style.setProperty('--myhome-banner-mask','linear-gradient(to bottom,black 0%,black 62%,transparent 100%)');ancestor.style.setProperty('--myhome-banner-filter','brightness(1.08) saturate(1.08)');}else{ancestor.style.removeProperty('--myhome-banner-mask');ancestor.style.removeProperty('--myhome-banner-filter');}break;}ancestor=ancestor.parentElement||ancestor.getRootNode()?.host;}

 for(const im of root.querySelectorAll('.alternative-house image,.architecture image,img[src*="/myhome-scene-v1/house-"]')){const attr=im.tagName.toLowerCase()==='img'?'src':'href';const href=im.getAttribute(attr)||'';if(!href.includes('/myhome-scene-v1/house-'))continue;const target=light?href.replace(/(?<!-light)\.png(?:\?.*)?$/,'-light.png'):href.replace(/-light\.png(?:\?.*)?$/,'.png');if(target!==href)im.setAttribute(attr,target);}
}
export function myhomeTheme(el){if(scheduled.has(el))return;scheduled.add(el);queueMicrotask(()=>{scheduled.delete(el);update(el);});}
