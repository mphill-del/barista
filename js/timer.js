// A wall-clock deadline avoids accumulating interval drift or losing time on navigation.
window.BrewTimer = {
 state:Store.read('timer',null), audio:null, onChange:()=>{}, onFinish:()=>{},
 unlock(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!this.audio)this.audio=new Audio();if(typeof this.audio.resume==='function'){const resumed=this.audio.resume();if(resumed&&typeof resumed.catch==='function')resumed.catch(()=>{})}}catch(error){}},
 remaining(){const s=this.state;return !s?0:s.running?Math.max(0,Math.ceil((s.deadline-Date.now())/1000)):s.remaining},
 save(){Store.write('timer',this.state);this.onChange()},
 start(seconds,label,recipeId,steepIndex=null){this.unlock();this.state={duration:seconds,remaining:seconds,deadline:Date.now()+seconds*1000,running:true,finished:false,label,recipeId,steepIndex};this.save()},
 pause(){if(!this.state)return;this.state.remaining=this.remaining();this.state.running=false;this.save()},
 resume(){if(!this.state)return;this.unlock();this.state.deadline=Date.now()+this.state.remaining*1000;this.state.running=true;this.state.finished=false;this.save()},
 reset(){if(!this.state)return;this.state.remaining=this.state.duration;this.state.running=false;this.state.finished=false;this.save()},
 close(){this.state=null;this.save()},
 tick(){if((this.state&&this.state.running)&&this.remaining()===0){this.state.running=false;this.state.remaining=0;this.state.finished=true;this.save();this.onFinish()}this.onChange()},
 beep(){try{this.unlock();const o=this.audio.createOscillator(),g=this.audio.createGain();o.connect(g);g.connect(this.audio.destination);o.frequency.value=880;g.gain.value=.12;o.start();g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+1.2);o.stop(this.audio.currentTime+1.2)}catch(error){}}
};
setInterval(()=>BrewTimer.tick(),250);
