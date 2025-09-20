/* ================== Contracts ================== */

function renderContracts(){
    const list = document.getElementById('contracts-list');
    if (!list) return;
    list.innerHTML = '';
    contracts.forEach(c => {
        const tenant = tenants.find(t => t.id === c.tenantId);
        const unit = units.find(u => u.id === c.unitId);
        if (!unit) return;
        const totalAmount = c.installments.reduce((sum, inst) => sum + inst.amount, 0);
        const totalPaid = c.installments.reduce((sum, inst) => sum + (inst.amount - inst.remaining), 0);

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <strong>${unit.name}</strong> - ${tenant ? tenant.name : 'مستأجر غير معروف'}
            </div>
            <div class="card-body">
                <div>المبلغ الإجمالي: <span style="font-weight:bold">${totalAmount.toFixed(2)} ر.س</span></div>
                <div>المدفوع: <span style="font-weight:bold;color:var(--success)">${totalPaid.toFixed(2)} ر.س</span></div>
                <div>المتبقي: <span style="font-weight:bold;color:var(--danger)">${(totalAmount - totalPaid).toFixed(2)} ر.س</span></div>
                <div>تاريخ البدء: ${c.start}</div>
                <div>تاريخ الانتهاء: ${c.end}</div>
                <div style="margin-top:10px">
                    <button class="btn btn-primary" onclick="showContractDetails(${c.id})">التفاصيل</button>
                    <button class="btn btn-danger" onclick="deleteContract(${c.id})">حذف</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function showContractDetails(id){
    const contract = contracts.find(c => c.id === id);
    if (!contract) return;
    const tenant = tenants.find(t => t.id === contract.tenantId);
    const unit = units.find(u => u.id === contract.unitId);

    document.getElementById('contract-details-modal-title').textContent = `تفاصيل عقد ${unit?.name || '؟'}`;
    document.getElementById('contract-details-tenant').textContent = `المستأجر: ${tenant?.name || '?'}`;
    document.getElementById('contract-details-start').textContent = `تاريخ البدء: ${contract.start}`;
    document.getElementById('contract-details-end').textContent = `تاريخ الانتهاء: ${contract.end}`;
    document.getElementById('contract-details-total').textContent = `إجمالي المبلغ: ${contract.installments.reduce((acc, inst) => acc + inst.amount, 0).toFixed(2)} ر.س`;

    renderPayments(contract.id);

    document.getElementById('contract-details-modal').style.display = 'block';
}

function renderPayments(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    const list = document.getElementById('contract-payments-list');
    list.innerHTML = '';

    contract.installments.forEach(p => {
        const remaining = p.remaining !== undefined ? p.remaining : p.amount;
        const div = document.createElement('div');
        div.className = 'card payment-card';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>دفعة #${p.id}</strong> - <span style="font-size:0.9rem">${p.dueDate}</span>
                    <div style="font-size:1.2rem; font-weight:bold;">${remaining.toFixed(2)} ر.س</div>
                </div>
                <div class="row" style="margin-top:10px;justify-content:flex-end">
                  ${remaining > 0 ? `<button class="btn" onclick="showPaymentModal('${p.id}',${p.amount},${remaining})">سداد</button>` : ''}
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}


function deleteContract(id) {
    if (!checkPermission(['manager'])) {
        showToast('ليس لديك صلاحية', 'error');
        return;
    }
    if (confirm('هل أنت متأكد من حذف هذا العقد؟')) {
        contracts = contracts.filter(c => c.id !== id);
        saveAllData();
        renderContracts();
        refreshDashboard();
        showToast('تم حذف العقد بنجاح', 'success');
    }
}

// Function to add a contract
function addContract() {
    if (!checkPermission(['manager'])) {
        showToast('ليس لديك صلاحية', 'error');
        return;
    }
    const unitId = parseInt(document.getElementById('contract-unit').value);
    const tenantId = parseInt(document.getElementById('contract-tenant').value);
    const start = document.getElementById('contract-start-date').value;
    const end = document.getElementById('contract-end-date').value;
    const amount = parseFloat(document.getElementById('contract-total-amount').value);
    const interval = document.getElementById('contract-payment-interval').value;

    if (!unitId || !tenantId || !start || !end || isNaN(amount) || amount <= 0) {
        showToast('املأ الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }

    const installments = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let currentDate = new Date(startDate);

    let totalMonths = 0;
    while (currentDate <= endDate) {
        totalMonths++;
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const installmentCount = totalMonths / (interval === 'monthly' ? 1 : 12);
    const installmentAmount = amount / installmentCount;

    currentDate = new Date(start);

    for(let i=0; i<installmentCount; i++){
        installments.push({
            id: Date.now() + i,
            amount: installmentAmount,
            remaining: installmentAmount, // This is the new field
            dueDate: currentDate.toISOString().split('T')[0],
            status: 'pending'
        });
        if(interval === 'monthly'){
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
    }

    const newContract = {
        id: Date.now(),
        unitId,
        tenantId,
        start,
        end,
        installments
    };
    contracts.push(newContract);

    // update unit status
    const unit = units.find(u => u.id === unitId);
    if(unit) unit.status = 'occupied';

    saveAllData();
    renderContracts();
    refreshDashboard();
    showToast('تم إضافة العقد بنجاح', 'success');
    document.getElementById('add-contract-form').reset();
}