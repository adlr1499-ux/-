/* Data structures */
let properties = JSON.parse(localStorage.getItem('re_properties') || '[]'); // projects
let buildings = JSON.parse(localStorage.getItem('re_buildings') || '[]');
let floors = JSON.parse(localStorage.getItem('re_floors') || '[]');
let units = JSON.parse(localStorage.getItem('re_units') || '[]');
let tenants = JSON.parse(localStorage.getItem('re_tenants') || '[]');
let contracts = JSON.parse(localStorage.getItem('re_contracts') || '[]');
let expenses = JSON.parse(localStorage.getItem('re_expenses') || '[]');
let maintenanceRequests = JSON.parse(localStorage.getItem('re_maintenance') || '[]');

/* ======= Helper saving/loading ======= */
function saveAllData(){
    localStorage.setItem('re_users', JSON.stringify(users));
    localStorage.setItem('re_properties', JSON.stringify(properties));
    localStorage.setItem('re_buildings', JSON.stringify(buildings));
    localStorage.setItem('re_floors', JSON.stringify(floors));
    localStorage.setItem('re_units', JSON.stringify(units));
    localStorage.setItem('re_tenants', JSON.stringify(tenants));
    localStorage.setItem('re_contracts', JSON.stringify(contracts));
    localStorage.setItem('re_expenses', JSON.stringify(expenses));
    localStorage.setItem('re_maintenance', JSON.stringify(maintenanceRequests));
    localStorage.setItem('re_accounting_settings', JSON.stringify(accountingSettings));
  showToast('تم الحفظ محلياً','success');
}
function loadAll(){
  users = JSON.parse(localStorage.getItem('re_users') || '[]');
  properties = JSON.parse(localStorage.getItem('re_properties') || '[]');
  buildings = JSON.parse(localStorage.getItem('re_buildings') || '[]');
  floors = JSON.parse(localStorage.getItem('re_floors') || '[]');
  units = JSON.parse(localStorage.getItem('re_units') || '[]');
  tenants = JSON.parse(localStorage.getItem('re_tenants') || '[]');
  contracts = JSON.parse(localStorage.getItem('re_contracts') || '[]');
  expenses = JSON.parse(localStorage.getItem('re_expenses') || '[]');
  maintenanceRequests = JSON.parse(localStorage.getItem('re_maintenance') || '[]');
}
function exportAll(){
  const data = {
    users, properties, buildings, floors, units, tenants, contracts, expenses, maintenanceRequests
  };
  const blob = new Blob([JSON.stringify(data)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `realestate-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  showToast('تم التصدير','success');
}
function openBackup(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        const data = JSON.parse(ev.target.result);
        if(confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟')){
          users = data.users || [];
          properties = data.properties || [];
          buildings = data.buildings || [];
          floors = data.floors || [];
          units = data.units || [];
          tenants = data.tenants || [];
          contracts = data.contracts || [];
          expenses = data.expenses || [];
          maintenanceRequests = data.maintenanceRequests || [];
          saveAllData();
          location.reload();
        }
      }catch(err){ showToast('ملف غير صالح','error'); }
    };
    reader.readAsText(file);
  };
  input.click();
}
/* ======= استيراد ذكي من Excel ======= */
function smartImportFromExcel(excelData) {
    if (!checkPermission(['manager'])) {
        showToast('ليس لديك صلاحية للاستيراد', 'error');
        return;
    }

    if (!confirm('سيتم استيراد/تحديث البيانات من Excel. هل أنت متأكد؟')) return;

    try {
        let importedCount = {
            properties: 0,
            buildings: 0,
            floors: 0,
            units: 0,
            tenants: 0,
            contracts: 0
        };

        // معالجة كل صف من بيانات Excel
        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length < 12) continue;

            const [
                propertyName, buildingName, floorName, , 
                unitName, unitType, tenantName, tenantRecord, 
                activity, phone, startDate, annualRent
            ] = row;

            // 1. العقار (منع التكرار)
            let property = properties.find(p => p.name === propertyName);
            if (!property && propertyName) {
                property = { id: Date.now() + i, name: propertyName };
                properties.push(property);
                importedCount.properties++;
            }

            // 2. المبنى (منع التكرار)
            let building = buildings.find(b => b.name === buildingName && b.propertyId === property?.id);
            if (!building && buildingName && property) {
                building = { 
                    id: Date.now() + i + 1000, 
                    propertyId: property.id, 
                    name: buildingName 
                };
                buildings.push(building);
                importedCount.buildings++;
            }

            // 3. الطابق (منع التكرار)
            let floor = floors.find(f => f.name === floorName && f.buildingId === building?.id);
            if (!floor && floorName && building) {
                floor = { 
                    id: Date.now() + i + 2000, 
                    buildingId: building.id, 
                    name: floorName 
                };
                floors.push(floor);
                importedCount.floors++;
            }

            // 4. الوحدة (تحديث إذا موجودة)
            let unit = units.find(u => u.name === unitName && u.floorId === floor?.id);
            if (unitName && floor) {
                if (unit) {
                    // تحديث البيانات الموجودة
                    unit.type = unitType || unit.type;
                } else {
                    // إضافة وحدة جديدة
                    unit = {
                        id: Date.now() + i + 3000,
                        floorId: floor.id,
                        name: unitName,
                        type: unitType || "محل",
                        area: "0",
                        status: "vacant"
                    };
                    units.push(unit);
                    importedCount.units++;
                }
            }

            // 5. المستأجر (تحديث إذا موجود)
            let tenant = tenants.find(t => t.name === tenantName || t.phone === phone);
            if (tenantName) {
                if (tenant) {
                    // تحديث البيانات الموجودة
                    tenant.phone = phone || tenant.phone;
                    tenant.record = tenantRecord || tenant.record;
                    tenant.activity = activity || tenant.activity;
                } else {
                    // إضافة مستأجر جديد
                    tenant = {
                        id: Date.now() + i + 4000,
                        name: tenantName,
                        phone: phone || '',
                        email: '',
                        record: tenantRecord || '',
                        activity: activity || ''
                    };
                    tenants.push(tenant);
                    importedCount.tenants++;
                }

                // 6. العقد (تحديث إذا موجود)
                if (startDate && annualRent && unit) {
                    const contractStart = new Date(startDate);
                    const contractEnd = new Date(contractStart);
                    contractEnd.setFullYear(contractStart.getFullYear() + 1);

                    let contract = contracts.find(c => 
                        c.unitId === unit.id && c.tenantId === tenant.id
                    );

                    if (contract) {
                        // تحديث العقد الموجود
                        contract.start = contractStart.toISOString().split('T')[0];
                        contract.end = contractEnd.toISOString().split('T')[0];
                        contract.amount = parseFloat(annualRent) || 0;
                    } else {
                        // إضافة عقد جديد
                        contract = {
                            id: Date.now() + i + 5000,
                            unitId: unit.id,
                            tenantId: tenant.id,
                            start: contractStart.toISOString().split('T')[0],
                            end: contractEnd.toISOString().split('T')[0],
                            amount: parseFloat(annualRent) || 0,
                            interval: "quarterly",
                            installments: []
                        };
                        contracts.push(contract);
                        importedCount.contracts++;
                    }

                    // توليد الأقساط للعقد الجديد
                    if (contract.installments.length === 0) {
                        generateInstallments(contract);
                    }
                }
            }
        }

        saveAllData();
        refreshAllUI();

        // عرض تقرير الاستيراد
        const report = `
            تم الاستيراد بنجاح:
            - العقارات: ${importedCount.properties}
            - المباني: ${importedCount.buildings}
            - الطوابق: ${importedCount.floors}
            - الوحدات: ${importedCount.units}
            - المستأجرين: ${importedCount.tenants}
            - العقود: ${importedCount.contracts}
        `;
        
        showToast(report, 'success');

    } catch (error) {
        showToast('خطأ في الاستيراد: ' + error.message, 'error');
        console.error('Import error:', error);
    }
}

/* ======= محول Excel إلى JSON ======= */
function excelToJsonConverter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // هنا يمكنك استخدام مكتبة مثل SheetJS لقراءة Excel
                // لكن لتبسيط الأمور، سنفترض أن الملف CSV
                const text = event.target.result;
                const rows = text.split('\n').map(row => row.split(','));
                
                smartImportFromExcel(rows);
                
            } catch (error) {
                showToast('خطأ في قراءة الملف: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
/* ======= محول مرن للعناوين ======= */
function flexibleHeaderMapper(headers) {
    const mapping = {};
    
    headers.forEach((header, index) => {
        const headerText = header ? header.trim().toLowerCase() : '';
        
        if (headerText.includes('عقار') || headerText.includes('property')) mapping.property = index;
        else if (headerText.includes('مبنى') || headerText.includes('building')) mapping.building = index;
        else if (headerText.includes('طابق') || headerText.includes('floor')) mapping.floor = index;
        else if (headerText.includes('وحدة') || headerText.includes('unit')) mapping.unit = index;
        else if (headerText.includes('نوع') || headerText.includes('type')) mapping.type = index;
        else if (headerText.includes('مستأجر') || headerText.includes('tenant')) mapping.tenant = index;
        else if (headerText.includes('سجل') || headerText.includes('record')) mapping.record = index;
        else if (headerText.includes('نشاط') || headerText.includes('activity')) mapping.activity = index;
        else if (headerText.includes('جوال') || headerText.includes('phone')) mapping.phone = index;
        else if (headerText.includes('تاريخ') || headerText.includes('start')) mapping.startDate = index;
        else if (headerText.includes('إيجار') || headerText.includes('rent')) mapping.rent = index;
    });
    
    return mapping;
}