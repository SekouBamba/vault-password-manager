// Simple Vault Password Manager (client-side)
// Elements
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const generateBtn = document.getElementById('generate');
const saveBtn = document.getElementById('save');
const copyGenBtn = document.getElementById('copy-gen');
const generatedInput = document.getElementById('generated');
const lengthInput = document.getElementById('length');
const lowerCb = document.getElementById('lower');
const upperCb = document.getElementById('upper');
const numbersCb = document.getElementById('numbers');
const symbolsCb = document.getElementById('symbols');
const siteInput = document.getElementById('site');
const userInput = document.getElementById('user');
const entriesDiv = document.getElementById('entries');
const clearAllBtn = document.getElementById('clear-all');
const darkModeCb = document.getElementById('dark-mode');
const autoCopyCb = document.getElementById('auto-copy');
const exportBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-json');
const importArea = document.getElementById('import-area');

const STORAGE_KEY = 'vault_entries_v1';

// Tab switching
tabs.forEach(t=>{
  t.addEventListener('click',()=> {
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const target = t.dataset.target;
    panels.forEach(p=> {
      if(p.id===target) p.classList.add('active'); else p.classList.remove('active');
    });
  });
});

// Utilities
function randChoice(s){ return s[Math.floor(Math.random()*s.length)]; }
function shuffleArray(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// Password generation guaranteeing at least one char from each selected set
function generatePassword(len, sets){
  let all = sets.join('');
  if(!all) return '';
  let pw = [];
  // ensure at least one from each
  for(const s of sets){
    pw.push(randChoice(s));
  }
  // fill rest
  for(let i=pw.length;i<len;i++){
    pw.push(randChoice(all));
  }
  shuffleArray(pw);
  return pw.join('');
}

// Clipboard helpers
async function copyText(text){
  if(!text) return false;
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    ta.remove();
    return false;
  }
}

// Vault persistence
function loadVault(){ 
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveVault(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

// Render entries
function renderVault(){
  const entries = loadVault();
  entriesDiv.innerHTML = '';
  if(entries.length===0){
    entriesDiv.innerHTML = '<p class="small">No saved entries yet.</p>';
    return;
  }
  entries.slice().reverse().forEach((entry, idx)=>{
    const el = document.createElement('div');
    el.className = 'entry';
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('div'); title.textContent = entry.site || 'No label';
    const sub = document.createElement('div'); sub.className='small'; sub.textContent = entry.user || '';
    meta.appendChild(title); meta.appendChild(sub);

    const controls = document.createElement('div'); controls.className='entry-controls';
    const passRow = document.createElement('div'); passRow.className='small'; passRow.textContent = '••••••••';
    passRow.style.marginBottom = '8px';
    const controlRow = document.createElement('div'); controlRow.className='control-row';

    const showBtn = document.createElement('button'); showBtn.className='icon-btn'; showBtn.textContent='Show';
    const copyBtn = document.createElement('button'); copyBtn.className='icon-btn'; copyBtn.textContent='Copy';
    const delBtn = document.createElement('button'); delBtn.className='icon-btn'; delBtn.textContent='Delete';

    controlRow.appendChild(showBtn); controlRow.appendChild(copyBtn); controlRow.appendChild(delBtn);
    controls.appendChild(passRow); controls.appendChild(controlRow);

    // state
    let visible = false;
    showBtn.addEventListener('click', ()=>{
      visible = !visible;
      passRow.textContent = visible ? entry.password : '••••••••';
      showBtn.textContent = visible ? 'Hide' : 'Show';
    });
    copyBtn.addEventListener('click', async ()=>{
      await copyText(entry.password);
      copyBtn.textContent = 'Copied';
      setTimeout(()=>copyBtn.textContent='Copy',900);
    });
    delBtn.addEventListener('click', ()=>{
      const all = loadVault();
      // remove by index from end because we reversed earlier
      const removeIndex = all.length - 1 - idx;
      all.splice(removeIndex,1);
      saveVault(all);
      renderVault();
    });

    el.appendChild(meta); el.appendChild(controls);
    entriesDiv.appendChild(el);
  });
}

// Initial render
renderVault();

// Generate button
generateBtn.addEventListener('click', ()=>{
  const len = Math.max(6, Math.min(128, parseInt(lengthInput.value)||16));
  const sets=[];
  if(lowerCb.checked) sets.push('abcdefghijklmnopqrstuvwxyz');
  if(upperCb.checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if(numbersCb.checked) sets.push('0123456789');
  if(symbolsCb.checked) sets.push('!@#$%^&*()-_=+[]{};:,.<>?/~`');
  const pw = generatePassword(len, sets);
  generatedInput.value = pw;
  if(autoCopyCb.checked) copyText(pw);
});

// Copy from generator
copyGenBtn.addEventListener('click', async ()=>{
  const pw = generatedInput.value;
  if(!pw) return;
  const ok = await copyText(pw);
  copyGenBtn.textContent = 'Copied';
  setTimeout(()=>copyGenBtn.textContent='Copy',900);
});

// Save to vault
saveBtn.addEventListener('click', ()=>{
  const site = siteInput.value.trim();
  const user = userInput.value.trim();
  const password = generatedInput.value || '';
  if(!password){ alert('No generated password to save.'); return; }
  const all = loadVault();
  all.push({site,user,password,created:Date.now()});
  saveVault(all);
  renderVault();
  siteInput.value=''; userInput.value=''; generatedInput.value='';
  // switch to vault tab
  document.getElementById('tab-vault').click();
});

// Clear all
clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Delete all saved entries?')){ localStorage.removeItem(STORAGE_KEY); renderVault(); }
});

// Dark mode toggle
darkModeCb.addEventListener('change', ()=>{
  document.body.classList.toggle('dark', darkModeCb.checked);
  try{ localStorage.setItem('vault_darkmode', JSON.stringify(darkModeCb.checked)); }catch(e){}
});

// load saved settings
(function(){
  try{
    const dm = JSON.parse(localStorage.getItem('vault_darkmode'));
    if(dm) { darkModeCb.checked=true; document.body.classList.add('dark'); }
  }catch(e){}
})();

// Export & Import
exportBtn.addEventListener('click', ()=>{
  const all = loadVault();
  const json = JSON.stringify(all, null, 2);
  // prompt download
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='vault_export.json'; document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
});

importBtn.addEventListener('click', ()=>{
  const raw = importArea.value.trim();
  if(!raw) return alert('Paste exported JSON into the box first.');
  try{
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) throw new Error('Invalid format');
    saveVault(parsed);
    importArea.value='';
    renderVault();
    alert('Imported entries.');
  }catch(e){
    alert('Failed to import JSON: '+e.message);
  }
});

// keyboard: Ctrl+G generates
document.addEventListener('keydown', (e)=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='g'){
    generateBtn.click();
    e.preventDefault();
  }
});
