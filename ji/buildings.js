/* ================== Buildings ================== */
function addBuilding(){
  const propId = parseInt(document.getElementById('select-property-for-building').value);
  const name = document.getElementById('building-name').value.trim();
  if(!propId||!name){ showToast('اختر عقاراً وأدخل اسم المبنى','error'); return; }
  buildings.push({id:Date.now(), propertyId:propId, name});
  document.getElementById('building-name').value='';
  saveAllData();
  renderBuildings();
  refreshDashboard();
  showToast('تم إضافة المبنى','success');
}
function renderBuildings(){
  const propSelect = document.getElementById('select-property-for-building');
  propSelect.innerHTML = '<option value="">اختر عقاراً</option>';
  properties.forEach(p=>{
    propSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
  
  const list = document.getElementById('buildings-list');
  list.innerHTML = '';
  buildings.forEach(b=>{
    const prop = properties.find(p=>p.id===b.propertyId);
    const count = floors.filter(f=>f.buildingId===b.id).length;
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<strong>${b.name}</strong><div class="small">${prop?.name||'?'} — ${count} طابق</div>`;
    list.appendChild(el);
  });
}