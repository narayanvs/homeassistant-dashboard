/* Small adapter around the installed sionetta card; upstream file is unmodified. */
customElements.whenDefined("washing-machine-card").then(()=>{
class MyHomeCycleCard extends customElements.get("washing-machine-card"){
  _isRunning(){
    const c=this._config,s=this._st(c.status_entity);
    if(!s||["unknown","unavailable"].includes(s.state))return false;
    if(c.power_entity&&!Number.isFinite(Number.parseFloat(this._st(c.power_entity)?.state)))return false;
    return c.running_states.includes(String(s.state).toLowerCase());
  }
  _applianceState(){
    const c=this._config,s=this._st(c.status_entity);
    if(!s||["unknown","unavailable"].includes(s.state)||(c.power_entity&&!Number.isFinite(Number.parseFloat(this._st(c.power_entity)?.state))))return "nodata";
    if(this._isRunning())return "running";
    return c.plug_entity&&this._st(c.plug_entity)?.state==="off"?"off":"idle";
  }
  _startDate(){
    const stamp=this._st(this._config.last_wash_entity),n=Number(stamp?.attributes?.timestamp);
    if(n>0&&n*1000<=Date.now())return new Date(n*1000);
    return null;
  }
  _update(){
    super._update();
    if(!this._built||!this._hass)return;
    const c=this._config,run=this._isRunning(),state=this._applianceState();
    this._el("hero").style.display=run?"":"none";
    if(!run){
      this._el("dispTime").textContent="--:--";
      this._el("ringTime").textContent="—";
      this._el("ringArc").style.display="none";
    }
    if(run&&!this._startDate()){this._el("dispTime").textContent="--:--";this._el("ringTime").textContent="—";}
    const recorded=c.recorded_entity&&this._st(c.recorded_entity)?.state==="on";
    this._el("lastCycle").classList.toggle("hidden",!recorded||run);
    if(c.appliance_type==="dishwasher"&&state!=="nodata"){
      const raw=this._st(c.status_entity)?.state;
      const names={ready:"Ready",inactive:"Off",delayedstart:"Scheduled",run:"Washing dishes",pause:"Paused",actionrequired:"Needs attention",finished:"Finished",error:"Error",aborting:"Stopping"};
      if(names[raw]){this._el("stState").textContent=names[raw];this._el("badgeText").textContent=(raw==="run"?"RUNNING":names[raw]).toUpperCase();}
    }
  }
}
if(!customElements.get("myhome-cycle-card"))customElements.define("myhome-cycle-card",MyHomeCycleCard);
});

