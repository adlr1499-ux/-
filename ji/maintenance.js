/* ================== Maintenance ================== */

// تحميل القوائم المنسدلة للصيانة
function loadMaintenanceDropdowns() {
    // تحميل قائمة الوحدات
    const unitSelect = document.getElementById('maintenance-unit');
    unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
    units.forEach(u => {
        const floor = floors.find(f => f.id === u.floorId);
        const building = buildings.find(b => b.id === floor?.buildingId);
        const property = properties.find(p => p.id === building?.propertyId);
        unitSelect.innerHTML += `<option value="${u.id}">
            ${u.name} - ${floor?.name} - ${building?.name} - ${property?.name}
        </option>`;
    });
    
    // تحميل قائمة المستأجرين للصيانة على المستأجر
    const tenantSelect = document.getElementById('maintenance-tenant');
    tenantSelect.innerHTML = '<option value="">اختر المستأجر (اختياري)</option>';
    tenants.forEach(t => {
        tenantSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
}

// إضافة طلب صيانة
function addMaintenance(){
    if(!checkPermission(['manager','technician'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    const unitId = parseInt(document.getElementById('maintenance-unit').value);
    const tenantId = parseInt(document.getElementById('maintenance-tenant').value) || null;
    const title = document.getElementById('maintenance-title').value.trim();
    const priority = document.getElementById('maintenance-priority').value;
    const notes = document.getElementById('maintenance-notes').value.trim();
    const cost = parseFloat(document.getElementById('maintenance-cost').value) || 0;
    
    if((!unitId && !tenantId) || !title){ 
        showToast('املأ الحقول المطلوبة','error'); 
        return; 
    }
    
    maintenanceRequests.push({
        id:Date.now(), 
        unitId,
        tenantId,
        title, 
        priority, 
        notes,
        cost,
        status:'pending', 
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    });
    
    saveAllData(); 
    renderMaintenanceList(); 
    showToast('تم إضافة طلب الصيانة','success');
    
    // تفريغ الحقول
    document.getElementById('maintenance-title').value='';
    document.getElementById('maintenance-notes').value='';
    document.getElementById('maintenance-cost').value='';
}

// عرض طلبات الصيانة
function renderMaintenanceList(){
    const list = document.getElementById('maintenance-list');
    list.innerHTML = '';
    
    if (maintenanceRequests.length === 0) {
        list.innerHTML = '<div class="card"><div class="small">لا توجد طلبات صيانة</div></div>';
        return;
    }
    
    // ترتيب الطلبات من الأحدث إلى الأقدم
    const sortedRequests = [...maintenanceRequests].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedRequests.forEach(m => {
        const unit = m.unitId ? units.find(u => u.id === m.unitId) : null;
        const tenant = m.tenantId ? tenants.find(t => t.id === m.tenantId) : null;
        const floor = unit ? floors.find(f => f.id === unit.floorId) : null;
        const building = floor ? buildings.find(b => b.id === floor.buildingId) : null;
        const property = building ? properties.find(p => p.id === building.propertyId) : null;
        
        // ألوان الأولوية
        const priorityColors = {
            'low': 'var(--success)',
            'medium': 'var(--warning)',
            'high': 'var(--danger)'
        };
        
        // ألوان الحالة
        const statusColors = {
            'pending': 'var(--warning)',
            'in-progress': 'var(--accent)',
            'completed': 'var(--success)',
            'cancelled': 'var(--danger)'
        };
        
        const statusTexts = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغى'
        };
        
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '10px';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <strong>${m.date}</strong> - 
                    <span style="color: ${priorityColors[m.priority] || 'var(--muted)'}">${m.title}</span>
                    <div class="small">
                        ${unit ? `الوحدة: ${unit.name}` : ''}
                        ${tenant ? `المستأجر: ${tenant.name}` : ''}
                    </div>
                    ${m.notes ? `<div class="small">${m.notes}</div>` : ''}
                    ${m.cost > 0 ? `<div class="small">التكلفة: ${m.cost.toFixed(2)} ر.س</div>` : ''}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge" style="background: ${statusColors[m.status] || 'var(--muted)'}">
                        ${statusTexts[m.status] || m.status}
                    </span>
                </div>
            </div>
            
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                ${m.status !== 'completed' ? `
                    <button class="btn" onclick="updateMaintenanceStatus(${m.id}, 'in-progress')" style="padding: 4px 8px; font-size: 0.9rem;">
                        قيد التنفيذ
                    </button>
                ` : ''}
                
                ${m.status !== 'completed' ? `
                    <button class="btn" onclick="updateMaintenanceStatus(${m.id}, 'completed')" style="padding: 4px 8px; font-size: 0.9rem; background: var(--success)">
                        إكمال
                    </button>
                ` : ''}
                
                ${m.status !== 'cancelled' ? `
                    <button class="btn ghost" onclick="updateMaintenanceStatus(${m.id}, 'cancelled')" style="padding: 4px 8px; font-size: 0.9rem;">
                        إلغاء
                    </button>
                ` : ''}
                
                <button class="btn ghost" onclick="editMaintenance(${m.id})" style="padding: 4px 8px; font-size: 0.9rem;">
                    تعديل
                </button>
                
                <button class="btn ghost" onclick="deleteMaintenance(${m.id})" style="padding: 4px 8px; font-size: 0.9rem;">
                    حذف
                </button>
            </div>
        `;
        
        list.appendChild(div);
    });
}

// تعديل طلب الصيانة
function editMaintenance(id) {
    if (!checkPermission(['manager','technician'])) {
        showToast('ليس لديك صلاحية', 'error');
        return;
    }

    const request = maintenanceRequests.find(m => m.id === id);
    if (!request) return;

    const editForm = `
        <div class="card">
            <h4>تعديل طلب الصيانة</h4>
            <select class="form-control" id="edit-maintenance-unit">
                <option value="">اختر الوحدة (اختياري)</option>
                ${units.map(u => {
                    const floor = floors.find(f => f.id === u.floorId);
                    const building = buildings.find(b => b.id === floor?.buildingId);
                    const property = properties.find(p => p.id === building?.propertyId);
                    return `<option value="${u.id}" ${u.id === request.unitId ? 'selected' : ''}>
                        ${u.name} - ${floor?.name} - ${building?.name} - ${property?.name}
                    </option>`;
                }).join('')}
            </select>
            
            <select class="form-control" id="edit-maintenance-tenant" style="margin-top:8px">
                <option value="">اختر المستأجر (اختياري)</option>
                ${tenants.map(t => `
                    <option value="${t.id}" ${t.id === request.tenantId ? 'selected' : ''}>${t.name}</option>
                `).join('')}
            </select>
            
            <input type="text" id="edit-maintenance-title" value="${request.title}" class="form-control" placeholder="عنوان المشكلة" style="margin-top:8px">
            
            <select class="form-control" id="edit-maintenance-priority" style="margin-top:8px">
                <option value="low" ${request.priority === 'low' ? 'selected' : ''}>منخفضة</option>
                <option value="medium" ${request.priority === 'medium' ? 'selected' : ''}>متوسطة</option>
                <option value="high" ${request.priority === 'high' ? 'selected' : ''}>عالية</option>
            </select>
            
            <textarea id="edit-maintenance-notes" class="form-control" placeholder="ملاحظات" style="margin-top:8px">${request.notes || ''}</textarea>
            
            <input type="number" id="edit-maintenance-cost" value="${request.cost || ''}" class="form-control" placeholder="التكلفة (ر.س)" style="margin-top:8px">
            
            <select class="form-control" id="edit-maintenance-status" style="margin-top:8px">
                <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                <option value="in-progress" ${request.status === 'in-progress' ? 'selected' : ''}>قيد التنفيذ</option>
                <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>ملغى</option>
            </select>
            
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" onclick="updateMaintenanceRequest(${id})">حفظ التعديلات</button>
                <button class="btn ghost" onclick="renderMaintenanceList()">إلغاء</button>
            </div>
        </div>
    `;

    document.getElementById('maintenance-list').innerHTML = editForm;
}

// تحديث طلب الصيانة
function updateMaintenanceRequest(id) {
    const unitId = parseInt(document.getElementById('edit-maintenance-unit').value) || null;
    const tenantId = parseInt(document.getElementById('edit-maintenance-tenant').value) || null;
    const title = document.getElementById('edit-maintenance-title').value.trim();
    const priority = document.getElementById('edit-maintenance-priority').value;
    const notes = document.getElementById('edit-maintenance-notes').value.trim();
    const cost = parseFloat(document.getElementById('edit-maintenance-cost').value) || 0;
    const status = document.getElementById('edit-maintenance-status').value;
    
    if ((!unitId && !tenantId) || !title) {
        showToast('املأ الحقول المطلوبة', 'error');
        return;
    }

    const request = maintenanceRequests.find(m => m.id === id);
    if (request) {
        request.unitId = unitId;
        request.tenantId = tenantId;
        request.title = title;
        request.priority = priority;
        request.notes = notes;
        request.cost = cost;
        request.status = status;
        
        saveAllData();
        renderMaintenanceList();
        showToast('تم تعديل طلب الصيانة بنجاح', 'success');
    }
}

// تحديث حالة طلب الصيانة
function updateMaintenanceStatus(id, status){
    if(!checkPermission(['manager','technician'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    const request = maintenanceRequests.find(m => m.id === id);
    if (request) { 
        request.status = status;
        if (status === 'completed') {
            request.completedDate = new Date().toISOString().split('T')[0];
        }
        saveAllData(); 
        renderMaintenanceList(); 
        showToast('تم تحديث حالة الطلب','success'); 
    }
}

// حذف طلب الصيانة
function deleteMaintenance(id){
    if(!checkPermission(['manager','technician'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    if(confirm('هل أنت متأكد من حذف طلب الصيانة هذا؟')){
        maintenanceRequests = maintenanceRequests.filter(m => m.id !== id);
        saveAllData(); 
        renderMaintenanceList(); 
        showToast('تم حذف طلب الصيانة','success');
    }
}

function renderMaintenance(){
    loadMaintenanceDropdowns();
    renderMaintenanceList();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('maintenance-unit')) {
        loadMaintenanceDropdowns();
    }
});