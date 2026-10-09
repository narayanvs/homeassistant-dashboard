import './myhome-comet-v26.js?v=met20261008';
const quiet=Base=>class extends Base{_build(){super._build();const style=document.createElement('style');style.textContent='.settings-note{display:none!important}';this.shadowRoot.append(style);}};
customElements.define('myhome-quiet-live-v27',quiet(customElements.get('myhome-comet-live-v26')));
customElements.define('myhome-quiet-test-v27',quiet(customElements.get('myhome-comet-test-v26')));
