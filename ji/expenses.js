/* ================== Expenses ================== */

// تحميل قائمة الوحدات للمصاريف
function loadExpenseUnitsDropdown() {
    const unitSelect = document.getElementById('exp-unit');
    unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
    
    units.forEach(u => {
        const floor = floors.find(f => f.id === u.floorId);
        const building = buildings.find(b => b.id === floor?.buildingId);
        const property = properties.find(p => p.id === building?.propertyId);
        
        unitSelect.innerHTML += `<option value="${u.id}">
            ${u.name} - ${floor?.name} - ${building?.name} - ${property?.name}
        </option>`;
    });
}

function addExpense(){
    if(!checkPermission(['manager','accountant'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    const unitId = parseInt(document.getElementById('exp-unit').value);
    const date = document.getElementById('exp-date').value;
    const amount = parseFloat(document.getElementById('exp-amount').value);
    const type = document.getElementById('exp-type').value.trim();
    const notes = document.getElementById('exp-notes').value.trim();
    
    if(!unitId || !date || !amount || isNaN(amount) || !type){ 
        showToast('املأ الحقول المطلوبة بشكل صحيح','error'); 
        return; 
    }
    
    expenses.push({
        id: Date.now(), 
        unitId, 
        date, 
        amount, 
        type, 
        notes,
        createdAt: new Date().toISOString()
    });
    
    saveAllData(); 
    renderExpensesList(); 
    showToast('تم إضافة المصروف بنجاح','success');
    
    // تفريغ الحقول
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-type').value = '';
    document.getElementById('exp-notes').value = '';
}

function renderExpensesList(){
    const list = document.getElementById('expenses-list');
    list.innerHTML = '';
    
    if (expenses.length === 0) {
        list.innerHTML = '<div class="card"><div class="small">لا توجد مصروفات</div></div>';
        return;
    }
    
    // ترتيب المصروفات من الأحدث إلى الأقدم
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(e => {
        const unit = units.find(u => u.id === e.unitId);
        const floor = floors.find(f => f.id === unit?.floorId);
        const building = buildings.find(b => b.id === floor?.buildingId);
        const property = properties.find(p => p.id === building?.propertyId);
        
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.marginBottom = '8px';
        
        div.innerHTML = `
            <div>
                <strong>${e.date}</strong> - 
                ${unit ? unit.name : 'وحدة غير معروفة'} - 
                ${e.type} - 
                <span style="color:var(--danger)">${e.amount} ر.س</span>
                ${e.notes ? `<div class="small">${e.notes}</div>` : ''}
                <div class="small">${property ? property.name : ''} ${building ? ' > ' + building.name : ''} ${floor ? ' > ' + floor.name : ''}</div>
            </div>
            <button class="btn ghost" onclick="deleteExpense(${e.id})">حذف</button>
        `;
        
        list.appendChild(div);
    });
}

function deleteExpense(id){
    if(!checkPermission(['manager','accountant'])){ 
        showToast('ليس لديك صلاحية','error'); 
        return; 
    }
    
    if(confirm('هل أنت متأكد من حذف هذا المصروف؟')){
        expenses = expenses.filter(e => e.id !== id);
        saveAllData(); 
        renderExpensesList(); 
        showToast('تم حذف المصروف بنجاح','success');
    }
}

function renderExpenses(){
    loadExpenseUnitsDropdown();
    renderExpensesList();
    
    // تعيين تاريخ اليوم افتراضياً
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exp-date').value = today;
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('exp-unit')) {
        loadExpenseUnitsDropdown();
    }
});