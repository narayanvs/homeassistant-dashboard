customElements.whenDefined('myhome-energy-nexus-v2').then(()=>{
 class MyHomeEnergyOverviewV4 extends customElements.get('myhome-energy-nexus-v2') {
  build(){super.build();const style=document.createElement('style');style.textContent='.map-note,.unit-note{display:none!important}.header{padding-bottom:12px}.nexus{border-radius:25px}.node{border-radius:18px!important}.detail{border-radius:18px!important}.summary{gap:8px}';this.shadowRoot.append(style);}
 }
 if(!customElements.get('myhome-energy-overview-v4'))customElements.define('myhome-energy-overview-v4',MyHomeEnergyOverviewV4);
});
