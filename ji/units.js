/* ================== Units ================== */

// تحميل القوائم المنسدلة للوحدات
function loadUnitDropdowns() {
    // تحديث قائمة العقارات
    const propertySelect = document.getElementById('filter-property');
    propertySelect.innerHTML = '<option value="">جميع العقارات</option>';
    properties.forEach(p => {
        propertySelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
    
    // تحديث قائمة المباني بناءً على العقار المحدد
    propertySelect.onchange = function() {
        const propertyId = parseInt(this.value);
        const buildingSelect = document.getElementById('filter-building');
        buildingSelect.innerHTML = '<option value="">جميع المباني</option>';
        
        const filteredBuildings = propertyId ? 
            buildings.filter(b => b.propertyId === propertyId) : 
            buildings;
            
        filteredBuildings.forEach(b => {
            buildingSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
        });
        
        // تحديث قائمة الطوابق تلقائياً
        buildingSelect.onchange();
    };
    
    // تحديث قائمة الطوابق بناءً على المبنى المحدد
    const buildingSelect = document.getElementById('filter-building');
    buildingSelect.onchange = function() {
        const buildingId = parseInt(this.value);
        const floorSelect = document.getElementById('filter-floor');
        floorSelect.innerHTML = '<option value="">جميع الطوابق</option>';
        
        const filteredFloors = buildingId ? 
            floors.filter(f => f.buildingId === buildingId) : 
            floors;
            
        filteredFloors.forEach(f => {
            floorSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
        });
        
        // تحديث قائمة الوحدات تلقائياً
        filterUnits();
    };
    
    // تحميل أولي للمباني
    propertySelect.onchange();
}

// إضافة وحدة جديدة
function addUnit(){
    if(!checkPermission(['manager','accountant'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    const floorId=parseInt(document.getElementById('select-floor-for-unit').value);
    const name=document.getElementById('unit-name').value.trim();
    const type=document.getElementById('unit-type').value;
    const area=document.getElementById('unit-area').value;
    
    if(!floorId||!name){ 
        showToast('اختر طابقاً وأدخل اسم الوحدة','error'); 
        return; 
    }
    
    // التحقق من عدم تكرار اسم الوحدة في نفس الطابق
    const existingUnit = units.find(u => u.floorId === floorId && u.name === name);
    if (existingUnit) {
        showToast('اسم الوحدة موجود مسبقاً في هذا الطابق','error');
        return;
    }
    
    units.push({
        id: Date.now(), 
        floorId, 
        name, 
        type, 
        area, 
        status: 'vacant',
        createdAt: new Date().toISOString()
    });
    
    document.getElementById('unit-name').value='';
    document.getElementById('unit-area').value='';
    saveAllData();
    renderUnits();
    refreshDashboard();
    showToast('تم إضافة الوحدة','success');
}

// عرض الوحدات مع الفلترة
function renderUnits(){
    const floorSelect = document.getElementById('select-floor-for-unit');
    floorSelect.innerHTML = '<option value="">اختر طابقاً</option>';
    
    floors.forEach(f => {
        const building = buildings.find(b => b.id === f.buildingId);
        const prop = properties.find(p => p.id === building?.propertyId);
        floorSelect.innerHTML += `<option value="${f.id}">${f.name} - ${building?.name} - ${prop?.name}</option>`;
    });
    
    // تطبيق الفلترة
    const filterProperty = parseInt(document.getElementById('filter-property')?.value || 0);
    const filterBuilding = parseInt(document.getElementById('filter-building')?.value || 0);
    const filterFloor = parseInt(document.getElementById('filter-floor')?.value || 0);
    
    let filteredUnits = units;
    
    if (filterFloor) {
        filteredUnits = filteredUnits.filter(u => u.floorId === filterFloor);
    } else if (filterBuilding) {
        const buildingFloors = floors.filter(f => f.buildingId === filterBuilding).map(f => f.id);
        filteredUnits = filteredUnits.filter(u => buildingFloors.includes(u.floorId));
    } else if (filterProperty) {
        const propertyBuildings = buildings.filter(b => b.propertyId === filterProperty).map(b => b.id);
        const propertyFloors = floors.filter(f => propertyBuildings.includes(f.buildingId)).map(f => f.id);
        filteredUnits = filteredUnits.filter(u => propertyFloors.includes(u.floorId));
    }
    
    const list = document.getElementById('units-list');
    list.innerHTML = '';
    
    if (filteredUnits.length === 0) {
        list.innerHTML = '<div class="card"><div class="small">لا توجد وحدات</div></div>';
        return;
    }
    
    filteredUnits.forEach(u => {
        const floor = floors.find(f => f.id === u.floorId);
        const building = buildings.find(b => b.id === floor?.buildingId);
        const prop = properties.find(p => p.id === building?.propertyId);
        const contract = contracts.find(c => c.unitId === u.id && new Date(c.end) > new Date());
        const status = contract ? 'مشغولة' : 'شاغرة';
        
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
            <strong>${u.name}</strong>
            <div class="small">${u.type} - ${u.area || '0'}m² - ${status}</div>
            <div class="small">${floor?.name} - ${building?.name} - ${prop?.name}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" onclick="editUnit(${u.id})">تعديل</button>
                <button class="btn ghost" onclick="deleteUnit(${u.id})">حذف</button>
            </div>
        `;
        list.appendChild(el);
    });
}

// فلترة الوحدات
function filterUnits() {
    renderUnits();
}

// تعديل الوحدة
function editUnit(unitId) {
    if (!checkPermission(['manager'])) {
        showToast('ليس لديك صلاحية', 'error');
        return;
    }

    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    const editForm = `
        <div class="card">
            <h4>تعديل الوحدة: ${unit.name}</h4>
            <select class="form-control" id="edit-unit-floor">
                ${floors.map(f => {
                    const building = buildings.find(b => b.id === f.buildingId);
                    const prop = properties.find(p => p.id === building?.propertyId);
                    return `<option value="${f.id}" ${f.id === unit.floorId ? 'selected' : ''}>
                        ${f.name} - ${building?.name} - ${prop?.name}
                    </option>`;
                }).join('')}
            </select>
            <input type="text" id="edit-unit-name" value="${unit.name}" class="form-control" placeholder="اسم الوحدة" style="margin-top:8px">
            <select class="form-control" id="edit-unit-type" style="margin-top:8px">
                <option value="شقة" ${unit.type === 'شقة' ? 'selected' : ''}>شقة</option>
                <option value="محل" ${unit.type === 'محل' ? 'selected' : ''}>محل</option>
                <option value="فيلا" ${unit.type === 'فيلا' ? 'selected' : ''}>فيلا</option>
                <option value="مكتب" ${unit.type === 'مكتب' ? 'selected' : ''}>مكتب</option>
                <option value="كشك" ${unit.type === 'كشك' ? 'selected' : ''}>كشك</option>
            </select>
            <input type="number" id="edit-unit-area" value="${unit.area || ''}" class="form-control" placeholder="المساحة (م²)" style="margin-top:8px">
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" onclick="updateUnit(${unitId})">حفظ التعديلات</button>
                <button class="btn ghost" onclick="renderUnits()">إلغاء</button>
            </div>
        </div>
    `;

    document.getElementById('units-list').innerHTML = editForm;
}

// تحديث الوحدة
function updateUnit(unitId) {
    const newName = document.getElementById('edit-unit-name').value.trim();
    const newFloorId = parseInt(document.getElementById('edit-unit-floor').value);
    const newType = document.getElementById('edit-unit-type').value;
    const newArea = document.getElementById('edit-unit-area').value;
    
    if (!newName || !newFloorId) {
        showToast('املأ جميع الحقول المطلوبة', 'error');
        return;
    }

    const unit = units.find(u => u.id === unitId);
    if (unit) {
        // التحقق من عدم تكرار الاسم في الطابق الجديد
        if (unit.name !== newName || unit.floorId !== newFloorId) {
            const existingUnit = units.find(u => u.floorId === newFloorId && u.name === newName && u.id !== unitId);
            if (existingUnit) {
                showToast('اسم الوحدة موجود مسبقاً في هذا الطابق', 'error');
                return;
            }
        }
        
        unit.name = newName;
        unit.floorId = newFloorId;
        unit.type = newType;
        unit.area = newArea;
        saveAllData();
        renderUnits();
        showToast('تم تعديل الوحدة بنجاح', 'success');
    }
}

// حذف الوحدة
function deleteUnit(id){
    if(!checkPermission(['manager'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    // التحقق من وجود عقود مرتبطة بالوحدة
    const unitContracts = contracts.filter(c => c.unitId === id);
    if (unitContracts.length > 0) {
        showToast('لا يمكن حذف وحدة مرتبطة بعقود','error');
        return;
    }
    
    if(confirm('هل أنت متأكد من حذف هذه الوحدة؟')){
        units = units.filter(u => u.id !== id);
        saveAllData();
        renderUnits();
        refreshDashboard();
        showToast('تم حذف الوحدة','success');
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('filter-property')) {
        loadUnitDropdowns();
    }
});