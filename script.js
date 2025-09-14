
// Slider implementation (robust prev/next/dots)
const slidesEl = document.getElementById('slides');
const slides = Array.from(document.querySelectorAll('.slide'));
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const dotsWrap = document.getElementById('dots');
let idx = 0, auto = null, autoDelay = 4000;

function updateView(){
  if(!slidesEl) return;
  slidesEl.style.transform = `translateX(-${idx * 100}%)`;
  // update dots
  if(dotsWrap){
    Array.from(dotsWrap.children).forEach((b,i)=> b.classList.toggle('active', i===idx));
  }
}

function go(n){
  if(!slides || slides.length===0) return;
  idx = ((n % slides.length) + slides.length) % slides.length;
  updateView();
}

function nextSlide(){ go(idx+1); }
function prevSlide(){ go(idx-1); }

function buildDots(){
  if(!dotsWrap) return;
  dotsWrap.innerHTML='';
  slides.forEach((s,i)=>{
    const b = document.createElement('button');
    if(i===idx) b.classList.add('active');
    b.addEventListener('click', ()=>{ go(i); resetAuto(); });
    dotsWrap.appendChild(b);
  });
}

function resetAuto(){
  if(auto) clearInterval(auto);
  auto = setInterval(()=>{ nextSlide(); }, autoDelay);
}

// initial build
buildDots();
updateView();
resetAuto();

// events
if(next) next.addEventListener('click', ()=>{ nextSlide(); resetAuto(); });
if(prev) prev.addEventListener('click', ()=>{ prevSlide(); resetAuto(); });

// swipe support
let startX = null;
const vp = document.getElementById('viewport');
if(vp){
  vp.addEventListener('pointerdown', (e)=>{ startX = e.clientX; vp.setPointerCapture(e.pointerId); });
  vp.addEventListener('pointerup', (e)=>{ if(startX===null) return; const dx = e.clientX - startX; if(Math.abs(dx) > 40){ if(dx < 0) nextSlide(); else prevSlide(); resetAuto(); } startX = null; });
  vp.addEventListener('pointercancel', ()=> startX = null);
}

// Custom skin wiring - non-destructive, uses existing audio sources
(function(){
  try{
    var audio = document.getElementById('player') || document.querySelector('audio');
    if(!audio) return;
    var play = document.getElementById('skinPlay');
    var prev = document.getElementById('skinPrev');
    var next = document.getElementById('skinNext');
    var progress = document.getElementById('skinProgress');
    var cur = document.getElementById('skinCur');
    var dur = document.getElementById('skinDur');
    var title = document.getElementById('skinTitle');
    var vol = document.getElementById('skinVol');
    // build pool from sources
    var pool = [];
    try{
      var srcs = audio.querySelectorAll('source');
      for(var i=0;i<srcs.length;i++){ pool.push(srcs[i].getAttribute('src')); }
      // fallback: window injected list
      if(!pool.length && window.__tsarkei_available_tracks) pool = window.__tsarkei_available_tracks.slice();
    }catch(e){ console.error(e); }
    var idx = pool.length? 0 : -1;
    function fmt(t){ if(isNaN(t)) return '0:00'; var m=Math.floor(t/60), s=Math.floor(t%60); return m+':'+(s<10?'0'+s:s); }
    function setIndex(i){
      if(!pool.length) return;
      idx = ((i%pool.length)+pool.length)%pool.length;
      audio.src = pool[idx];
      try{ audio.load(); }catch(e){}
      if(title) title.textContent = pool[idx].replace(/^.*\//,'');
    }
    // initialize
    if(idx===-1){
      // try to pick first loaded source
      if(audio.currentSrc) { if(title) title.textContent = decodeURIComponent(audio.currentSrc.replace(/^.*\//,'')); }
    } else {
      setIndex(0);
    }
    // events
    audio.addEventListener('timeupdate', function(){ if(audio.duration){ progress.value = (audio.currentTime/audio.duration)*100; if(cur) cur.textContent = fmt(audio.currentTime); if(dur) dur.textContent = fmt(audio.duration); } });
    audio.addEventListener('loadedmetadata', function(){ if(dur) dur.textContent = fmt(audio.duration); if(title && audio.currentSrc) title.textContent = decodeURIComponent(audio.currentSrc.replace(/^.*\//,'')); });
    if(play){
      play.addEventListener('click', function(){ 
        try{
          if(audio.paused){ audio.play().then(function(){ if(play) play.textContent='⏸'; }).catch(function(){ if(play) play.textContent='⏸'; }); }
          else { audio.pause(); if(play) play.textContent='▶'; }
        }catch(e){ console.error(e); }
      });
    }
    if(next){
      next.addEventListener('click', function(){ if(!pool.length) return; setIndex(idx+1); try{ audio.play().catch(function(){}); }catch(e){} if(play) play.textContent='⏸'; });
    }
    if(prev){
      prev.addEventListener('click', function(){ if(!pool.length) return; setIndex(idx-1); try{ audio.play().catch(function(){}); }catch(e){} if(play) play.textContent='⏸'; });
    }
    if(progress){
      progress.addEventListener('input', function(){ if(audio.duration) audio.currentTime = (progress.value/100)*audio.duration; });
    }
    if(vol){
      vol.addEventListener('input', function(){ try{ audio.volume = Number(vol.value); }catch(e){} });
      // initialize volume value to audio volume
      try{ if(!isNaN(audio.volume)) vol.value = audio.volume; }catch(e){}
    }
    // user gesture helper
    function oneClick(){ try{ if(audio.paused){ audio.play().catch(()=>{}); } }catch(e){} document.removeEventListener('click', oneClick); }
    document.addEventListener('click', oneClick);
    // expose for debug
    window.__tsarkei_custom_skin = { pool: pool };
  }catch(e){ console.error('skin wiring error', e); }
})(); 

