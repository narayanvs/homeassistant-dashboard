import './energy-overview-controls.js?rev=20261017-light8';
customElements.whenDefined('myhome-energy-overview-v5').then(() => {
  class MyHomeEnergyOverviewV6 extends customElements.get('myhome-energy-overview-v5') {
    build() {
      super.build();
      this.toggleAttribute("separate-header",!!this.config.separate_header);
      const style = document.createElement('style');
      style.textContent = `.header:before{opacity:.44;mask-image:radial-gradient(ellipse at 40% 45%,#000,transparent 82%);-webkit-mask-image:radial-gradient(ellipse at 40% 45%,#000,transparent 82%)}`;
      style.textContent+=`:host([separate-header]) .header:before{display:none!important}:host([separate-header]) .header{min-height:52px;padding:0 0 12px}:host([separate-header]) .header .eyebrow,:host([separate-header]) .header h1,:host([separate-header]) .header .back{display:none}:host([separate-header]) .header .status{margin:0}:host([separate-header]) .header .actions{margin-left:auto}`;
      this.shadowRoot.append(style);
    }
  }
  if (!customElements.get('myhome-energy-overview-v6')) customElements.define('myhome-energy-overview-v6', MyHomeEnergyOverviewV6);
});
