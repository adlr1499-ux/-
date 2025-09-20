/* ================== Properties ================== */
function addProperty(){
  const name = document.getElementById('prop-name').value.trim();
  if(!name){ showToast('أدخل اسم العقار','error'); return; }
  properties.push({id:Date.now(), name});
  document.getElementById('prop-name').value='';
  saveAllData();
  renderProperties();
  refreshDashboard();
  showToast('تم إضافة العقار','success');
}
function renderProperties(){
  const list = document.getElementById('properties-list');
  list.innerHTML = '';
  properties.forEach(p=>{
    const count = buildings.filter(b=>b.propertyId===p.id).length;
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<strong>${p.name}</strong><div class="small">${count} مبنى</div>`;
    list.appendChild(el);
  });
}