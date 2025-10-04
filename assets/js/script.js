const locales = {};
const defaultLang = 'en';
const localeFiles = {
  en: 'assets/locales/en.json',
  pt: 'assets/locales/pt.json'
};

function el(id){ return document.getElementById(id) }

async function loadLocale(lang){
  if(locales[lang]) return locales[lang];
  const path = localeFiles[lang];
  if(!path) return {};
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    locales[lang] = json;
    return json;
  }catch(e){
    console.error('Failed to load locale', lang, e);
    return {};
  }
}

function safeSetText(id, value){
  const node = el(id);
  if(!node) return;
  if(value === undefined || value === null) return;
  node.textContent = value;
}

function safeSetHTML(id, value){
  const node = el(id);
  if(!node) return;
  if(value === undefined || value === null) return;
  node.innerHTML = value;
}

function applyLocale(data){
  if(!data) return;
  document.documentElement.lang = data.lang || defaultLang;

  safeSetText('site-title', data.appName || 'Bullseye ');
  safeSetText('site-subtitle', data.policyTitle || 'Privacy Policy');

  safeSetText('heading-intro', data.introTitle || 'Introduction');
  safeSetText('intro', data.introText || '');

  safeSetText('heading-data', data.dataTitle || 'Data We Collect');
  // dataList can be an array of strings
  if(Array.isArray(data.dataList)){
    const listNode = el('data-list');
    if(listNode) listNode.innerHTML = data.dataList.map(i=>`<li>${i}</li>`).join('');
  }

  safeSetText('heading-use', data.useTitle || 'How We Use Data');
  safeSetText('use', data.useText || '');

  safeSetText('heading-rights', data.rightsTitle || 'Your Rights');
  if(data.rightsText) safeSetHTML('rights', (data.rightsText+'').replace(/\n/g,'<br>'));

  if(data.contactEmail){
    const c = el('contact-email');
    if(c){
      // If it's an anchor, set href, otherwise set text
      if(c.tagName && c.tagName.toLowerCase() === 'a'){
        c.textContent = data.contactEmail;
        c.href = `mailto:${data.contactEmail}`;
      }else{
        c.textContent = data.contactEmail;
      }
    }else{
      // fallback: try to insert into sidebar or footer
      const sidebar = document.querySelector('.sidebar');
      const footer = document.querySelector('.foot');
      const container = sidebar || footer || document.body;
      // avoid duplicating fallback
      let fb = el('contact-email-fallback');
      if(!fb){
        fb = document.createElement('div');
        fb.id = 'contact-email-fallback';
        fb.style.marginTop = '0.5rem';
        fb.style.wordBreak = 'break-word';
        if(sidebar) fb.style.fontSize = '0.95rem';
        container.appendChild(fb);
      }
      // make it a clickable mailto link inside the fallback
      fb.innerHTML = `<strong>Contact:</strong> <a href="mailto:${data.contactEmail}">${data.contactEmail}</a>`;
    }
  }

  safeSetText('footer-note', data.footerNote || 'All rights reserved.');
  safeSetText('year', (new Date()).getFullYear());
}

function setActiveLangButton(lang){
  document.querySelectorAll('.lang-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

async function setLang(lang){
  const data = await loadLocale(lang).catch(()=>null);
  if(data) applyLocale(data);
  setActiveLangButton(lang);
  try{ localStorage.setItem('bull_lang', lang); }catch(e){}
}

document.addEventListener('DOMContentLoaded', async ()=>{
  // wire buttons
  document.querySelectorAll('.lang-btn').forEach(b=>{
    b.addEventListener('click', ()=> setLang(b.dataset.lang));
  });

  const saved = (()=>{
    try{ return localStorage.getItem('bull_lang'); }catch(e){ return null }
  })() || (navigator.language ? navigator.language.slice(0,2) : null) || defaultLang;
  const pick = Object.keys(localeFiles).includes(saved) ? saved : defaultLang;
  await setLang(pick);
});
