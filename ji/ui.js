// إضافة إلى ملف ui.js/* ================== UI helpers ================== */
function showToast(msg, type='info'){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show';
  setTimeout(()=>{ t.className = 'toast'; }, 3000);
}
function updateUserLabel(){
  if(currentUser) document.getElementById('current-user').textContent = `${currentUser.username} (${currentUser.role})`;
}
function switchTab(tabName){
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.style.display='none');
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).style.display='block';
    if(tabName==='dashboard') refreshDashboard();
    else if(tabName==='properties') renderProperties();
    else if(tabName==='buildings') renderBuildings();
    else if(tabName==='floors') renderFloors();
    else if(tabName==='units') renderUnits();
    else if(tabName==='tenants') renderTenants();
    else if(tabName==='contracts') renderContracts();
    else if(tabName==='expenses') renderExpenses();
    else if(tabName==='maintenance') renderMaintenance();
    else if(tabName==='reports') renderReports();
    else if(tabName==='users') renderUsers();
    else if(tabName==='accounting') renderAccounting();
}
function refreshAllUI(){
  refreshDashboard();
  renderProperties();
  renderBuildings();
  renderFloors();
  renderUnits();
  renderTenants();
  renderContracts();
  renderExpenses();
  renderMaintenance();
  renderReports();
  renderUsers();
}
function showToast(msg, type='info'){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show';
  if(type==='error') t.style.background='rgba(239,68,68,0.9)';
  else if(type==='success') t.style.background='rgba(16,185,129,0.9)';
  else if(type==='warning') t.style.background='rgba(245,158,11,0.9)';
  else t.style.background='rgba(15,23,42,0.9)';
  setTimeout(()=>{ t.className = 'toast'; }, 3000);
}

function updateUserLabel(){
  if(currentUser) document.getElementById('current-user').textContent = `${currentUser.username} (${currentUser.role})`;
}
function renderAccounting(){
    document.getElementById('accounting-container').innerHTML = renderAccountingUI();
    initAccountingSettings();
}
/* ================== Payment UI ================== */
let currentPaymentId = null;

function showPaymentModal(paymentId, amount, remaining) {
  currentPaymentId = paymentId;
  document.getElementById('modal-due-amount').textContent = `${remaining} ر.س`;
  document.getElementById('modal-payment-amount').value = remaining;
  document.getElementById('modal-payment-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('payment-modal').style.display = 'flex';
}

function closePaymentModal() {
  currentPaymentId = null;
  document.getElementById('payment-modal').style.display = 'none';
}