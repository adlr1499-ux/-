/* ================== Floors ================== */
function addFloor(){
  const buildingId = parseInt(document.getElementById('select-building-for-floor').value);
  const name = document.getElementById('floor-name').value.trim();
  if(!buildingId||!name){ showToast('اختر مبنى وأدخل اسم الطابق','error'); return; }
  floors.push({id:Date.now(), buildingId, name});
  document.getElementById('floor-name').value='';
  saveAllData();
  renderFloors();
  refreshDashboard();
  showToast('تم إضافة الطابق','success');
}
function renderFloors(){
  const buildingSelect = document.getElementById('select-building-for-floor');
  buildingSelect.innerHTML = '<option value="">اختر مبنى</option>';
  buildings.forEach(b=>{
    const prop = properties.find(p=>p.id===b.propertyId);
    buildingSelect.innerHTML += `<option value="${b.id}">${b.name} (${prop?.name||'?'})</option>`;
  });
  
  const list = document.getElementById('floors-list');
  list.innerHTML = '';
  floors.forEach(f=>{
    const building = buildings.find(b=>b.id===f.buildingId);
    const prop = properties.find(p=>p.id===building?.propertyId);
    const count = units.filter(u=>u.floorId===f.id).length;
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<strong>${f.name}</strong><div class="small">${building?.name||'?'} — ${prop?.name||'?'} — ${count} وحدة</div>`;
    list.appendChild(el);
  });
}