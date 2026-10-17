import './energy-overview-core.js?rev=20261017';
customElements.whenDefined('myhome-energy-overview-v4').then(()=>{
class MyHomeEnergyOverviewV5 extends customElements.get('myhome-energy-overview-v4'){
 build(){super.build();const s=document.createElement('style');s.textContent=':host(.today) .node.grid .value,:host(.today) .node.battery .value{font-size:12px;font-weight:550;opacity:.85}:host(.today) .node.grid .sub,:host(.today) .node.battery .sub{font-size:13px;font-weight:650;opacity:1;line-height:1.35}@container(max-width:390px){:host(.today) .node.grid .value,:host(.today) .node.battery .value{font-size:10px}:host(.today) .node.grid .sub,:host(.today) .node.battery .sub{font-size:11px}}';this.shadowRoot.append(s);}
 update(){super.update();if(this.mode!=='today'||!this._hass)return;for(const [k,i,o]of [['grid','importDay','exportDay'],['battery','chargeDay','dischargeDay']]){const n=this.shadowRoot.querySelector('[data-node='+k+']');if(n){n.querySelector('.value').textContent=this.energy(i)+' in';n.querySelector('.sub').textContent=this.energy(o)+' out';}}}
}
if(!customElements.get('myhome-energy-overview-v5'))customElements.define('myhome-energy-overview-v5',MyHomeEnergyOverviewV5);
});
