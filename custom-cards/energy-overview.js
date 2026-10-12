import './energy-overview-controls.js';
customElements.whenDefined('myhome-energy-overview-v5').then(() => {
  class MyHomeEnergyOverviewV6 extends customElements.get('myhome-energy-overview-v5') {
    build() {
      super.build();
      const style = document.createElement('style');
      style.textContent = `.header:before{opacity:.44;mask-image:radial-gradient(ellipse at 40% 45%,#000,transparent 82%);-webkit-mask-image:radial-gradient(ellipse at 40% 45%,#000,transparent 82%)}`;
      this.shadowRoot.append(style);
    }
  }
  if (!customElements.get('myhome-energy-overview-v6')) customElements.define('myhome-energy-overview-v6', MyHomeEnergyOverviewV6);
});
