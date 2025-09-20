/* ================== Reports ================== */
function renderFullReports(){
  // Update statistics
  document.getElementById('stat-properties').textContent = properties.length;
  document.getElementById('stat-buildings').textContent = buildings.length;
  document.getElementById('stat-floors').textContent = floors.length;
  document.getElementById('stat-units').textContent = units.length;
  document.getElementById('stat-contracts').textContent = contracts.length;
  
  // Render unit map
  const map=document.getElementById('unit-map');
  map.innerHTML='';
  units.forEach(u=>{
    const contract=contracts.find(c=>c.unitId===u.id);
    let status='status-maint';
    if(contract){
      const today=new Date();
      const end=new Date(contract.end);
      if(today>end) status='status-overdue';
      else if((end-today)/(1000*60*60*24)<30) status='status-expiring';
      else status='status-good';
    }
    const div=document.createElement('div');
    div.className=`unit-tile ${status}`;
    div.innerHTML=`<div class="unit-name">${u.name}</div><div class="small">${contract?'مشغولة':'شاغرة'}</div>`;
    div.onclick=()=>{ 
      switchTab('contracts'); 
      if(contract) {
        showContractDetails(contract.id);
      }
    };
    map.appendChild(div);
  });
  
  // Render alerts
  const alerts=document.getElementById('alerts-list');
  alerts.innerHTML='';
  contracts.forEach(c=>{
    const today=new Date();
    const end=new Date(c.end);
    if(today>end){
      const unit=units.find(u=>u.id===c.unitId);
      const tenant=tenants.find(t=>t.id===c.tenantId);
      alerts.innerHTML+=`<div style="color:var(--danger);margin-bottom:4px">عقد منتهي: ${tenant?tenant.name:'?'} — ${unit?unit.name:'?'}</div>`;
    }else if((end-today)/(1000*60*60*24)<30){
      const unit=units.find(u=>u.id===c.unitId);
      const tenant=tenants.find(t=>t.id===c.tenantId);
      alerts.innerHTML+=`<div style="color:var(--warning);margin-bottom:4px">عقد ينتهي قريباً: ${tenant?tenant.name:'?'} — ${unit?unit.name:'?'}</div>`;
    }
  });
  
  // Render payments log
  const paymentsLog=document.getElementById('payments-log');
  paymentsLog.innerHTML='';
  contracts.forEach(c=>{
    c.installments.filter(i=>i.status==='paid').forEach(inst=>{
      const unit=units.find(u=>u.id===c.unitId);
      const tenant=tenants.find(t=>t.id===c.tenantId);
      paymentsLog.innerHTML+=`<div style="margin-bottom:4px">${inst.dueDate}: ${tenant?tenant.name:'?'} — ${unit?unit.name:'?'} — ${inst.amount} ر.س</div>`;
    });
  });
  
  // Render tenant statement select
  const tenantSelect=document.getElementById('tenant-select');
  tenantSelect.innerHTML='<option value="">اختر مستأجر</option>';
  tenants.forEach(t=>{
    tenantSelect.innerHTML+=`<option value="${t.id}">${t.name}</option>`;
  });
}

function renderTenantStatement(){
  const tenantId=parseInt(document.getElementById('tenant-select').value);
  if(!tenantId) return;
  const tenant=tenants.find(t=>t.id===tenantId);
  const statement=document.getElementById('tenant-statement');
  statement.innerHTML='';
  if(!tenant) return;
  
  let html=`<div class="statement-header">
    <h4>كشف حساب: ${tenant.name}</h4>
    <div class="small">${tenant.phone} — ${tenant.email}</div>
  </div>`;
  
  // Get contracts for this tenant
  const tenantContracts=contracts.filter(c=>c.tenantId===tenantId);
  let totalDue=0, totalPaid=0;
  tenantContracts.forEach(c=>{
    c.installments.forEach(inst=>{
      if(inst.status==='paid') totalPaid+=inst.amount;
      else totalDue+=inst.amount;
    });
  });
  
  html+=`<div class="statement-summary">
    <div class="summary-card paid"><div class="small">المدفوع</div><div style="font-weight:800;font-size:1.2rem">${totalPaid.toFixed(2)} ر.س</div></div>
    <div class="summary-card overdue"><div class="small">المستحق</div><div style="font-weight:800;font-size:1.2rem">${totalDue.toFixed(2)} ر.س</div></div>
    <div class="summary-card pending"><div class="small">الإجمالي</div><div style="font-weight:800;font-size:1.2rem">${(totalPaid+totalDue).toFixed(2)} ر.س</div></div>
  </div>`;
  
  html+='<table class="statement-table"><thead><tr><th>التاريخ</th><th>الوحدة</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>';
  tenantContracts.forEach(c=>{
    const unit=units.find(u=>u.id===c.unitId);
    c.installments.forEach(inst=>{
      html+=`<tr><td>${inst.dueDate}</td><td>${unit?unit.name:'?'}</td><td>${inst.amount.toFixed(2)} ر.س</td><td><span class="badge ${inst.status}">${inst.status}</span></td></tr>`;
    });
  });
  html+='</tbody></table>';
  
  statement.innerHTML=html;
}

function printFullReport(){
  // Logic for printing the full report
  window.print();
}

function applyReportFilters(){
  // Logic for applying report filters
  renderFullReports();
  showToast('تم تطبيق الفلتر','success');
}

// إضافة هذه الدوال الناقصة إذا لم تكن موجودة
function renderReports(){
  renderFullReports();
}