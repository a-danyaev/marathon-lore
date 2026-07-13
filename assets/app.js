(function(){
  if(!(window.PAGE && window.PAGE.slug==='index')) return;
  var m=/^#(en|es|de|ru)-(s\d+|arms)$/.exec(window.location.hash||'');
  if(!m) return;
  var LEGACY_PAGES={s2:'timeline',s3:'colony',s4:'runners',s5:'classes',arms:'arsenal',s6:'factions',s7:'rampancy',s8:'aliens',s9:'zones',s10:'seasons',s11:'trilogy',s12:'deep-cuts',s13:'canon'};
  var slug=LEGACY_PAGES[m[2]];
  if(!slug) return;
  window.location.replace('pages/'+slug+'.html?lang='+m[1]+window.location.hash);
})();

document.querySelectorAll('.terminal-bar').forEach(function(bar){
  bar.setAttribute('role','button');bar.setAttribute('tabindex','0');bar.setAttribute('aria-expanded','false');
  function toggle(){var open=bar.parentElement.classList.toggle('open');bar.setAttribute('aria-expanded',open?'true':'false');}
  bar.addEventListener('click',toggle);
  bar.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
});

var VALID_LANGS=['en','es','de','ru'];

var FEEDBACK_TEXT={en:'Feedback',es:'Comentarios',de:'Feedback',ru:'Написать автору'};
var FEEDBACK_TITLE={en:'Spotted an error? Contact the author on Reddit',es:'¿Viste un error? Contacta con el autor en Reddit',de:'Fehler entdeckt? Kontaktiere den Autor auf Reddit',ru:'Нашёл неточность? Напиши автору на Reddit'};

function rewriteLinks(l){
  document.querySelectorAll('a[href]').forEach(function(a){
    var href=a.getAttribute('href');
    if(!href) return;
    if(/^https?:\/\//i.test(href)) return;
    if(href.indexOf('mailto:')===0) return;
    if(href.charAt(0)==='#') return;
    var base=href.split('?')[0];
    a.setAttribute('href', base+'?lang='+l);
  });
}

function setLang(l){
  if(VALID_LANGS.indexOf(l)===-1) l='en';
  document.body.setAttribute('data-lang',l);
  document.documentElement.lang=l;
  if(window.PAGE && window.PAGE.titles && window.PAGE.titles[l]){
    document.title=window.PAGE.titles[l];
  }
  var fb=document.getElementById('feedback-btn');
  if(fb){
    fb.textContent=FEEDBACK_TEXT[l]||FEEDBACK_TEXT.en;
    fb.title=FEEDBACK_TITLE[l]||FEEDBACK_TITLE.en;
  }
  document.querySelectorAll('[data-setlang]').forEach(function(b){
    var active=b.getAttribute('data-setlang')===l;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',active?'true':'false');
  });
  try{ localStorage.setItem('ml_lang', l); }catch(e){}
  rewriteLinks(l);
}

function initLang(){
  var params=new URLSearchParams(window.location.search);
  var fromUrl=params.get('lang');
  var fromStorage=null;
  try{ fromStorage=localStorage.getItem('ml_lang'); }catch(e){}
  var l='en';
  if(fromUrl && VALID_LANGS.indexOf(fromUrl)!==-1){ l=fromUrl; }
  else if(fromStorage && VALID_LANGS.indexOf(fromStorage)!==-1){ l=fromStorage; }
  setLang(l);
}

document.querySelectorAll('[data-setlang]').forEach(function(btn){
  btn.addEventListener('click',function(){
    setLang(btn.getAttribute('data-setlang'));
    window.scrollTo({top:0});
  });
});

initLang();

function setSpoilers(state){
  document.body.classList.toggle('hide-spoilers', state==='off');
  var btn=document.getElementById('spoiler-toggle');
  if(btn){
    btn.textContent='SPOILERS: '+(state==='off'?'OFF':'ON');
    btn.setAttribute('aria-pressed', state==='off'?'false':'true');
  }
  try{ localStorage.setItem('ml_spoilers', state); }catch(e){}
}

function initSpoilers(){
  var state=null;
  try{ state=localStorage.getItem('ml_spoilers'); }catch(e){}
  if(state!=='on' && state!=='off') state='on';
  setSpoilers(state);
}

var spoilerBtn=document.getElementById('spoiler-toggle');
if(spoilerBtn){
  spoilerBtn.addEventListener('click',function(){
    var hidden=document.body.classList.contains('hide-spoilers');
    setSpoilers(hidden?'on':'off');
  });
}
initSpoilers();
