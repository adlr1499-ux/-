/* ================== Core Functions ================== */
// ... (Your existing code for ensureDefaultUser, checkPermission, refreshDashboard)

function renderUnitMap(){
    const map = document.getElementById('unit-map');
    if (!map) return;
    map.innerHTML = '';
    
    units.forEach(u => {
        const contract = contracts.find(c => c.unitId === u.id);
        let statusClass = '';
        let statusText = '';
        let detailsText = '';
        const today = new Date().toISOString().split('T')[0];

        if (contract) {
            const contractEnd = new Date(contract.end).toISOString().split('T')[0];
            const hasOverdue = contract.installments.some(p => p.remaining > 0 && p.dueDate < today);
            
            const totalPaid = contract.installments.reduce((sum, p) => sum + (p.amount - p.remaining), 0);
            const totalRemaining = contract.installments.reduce((sum, p) => sum + p.remaining, 0);
            const totalContractValue = contract.installments.reduce((sum, p) => sum + p.amount, 0);
            
            if (hasOverdue) {
                statusClass = 'status-overdue';
                statusText = 'متأخرات';
                detailsText = `المتأخر: ${totalRemaining.toFixed(2)} ر.س`;
            } else if (totalRemaining <= 0) {
                statusClass = 'status-paid';
                statusText = 'تم السداد';
                detailsText = 'لا يوجد مستحقات';
            } else if (today > contractEnd) {
                statusClass = 'status-expiring';
                statusText = 'منتهي';
                detailsText = `المتبقي: ${totalRemaining.toFixed(2)} ر.س`;
            } else {
                statusClass = 'status-occupied';
                statusText = 'مؤجرة';
                detailsText = `المدفوع: ${totalPaid.toFixed(2)} ر.س`;
            }
        } else {
            statusClass = 'status-vacant';
            statusText = 'شاغرة';
        }
        
        const div = document.createElement('div');
        div.className = `unit-tile ${statusClass}`;
        div.innerHTML = `
            <div class="unit-name">${u.name}</div>
            <div class="unit-status">${statusText}</div>
            ${detailsText ? `<div class="unit-details">${detailsText}</div>` : ''}
        `;
        div.onclick = () => showUnitDetails(u.id);
        map.appendChild(div);
    });
}


function showUnitDetails(unitId) {
    const modal = document.getElementById('unit-details-modal');
    const content = document.getElementById('unit-details-content');
    
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const contract = contracts.find(c => c.unitId === unitId);
    
    let html = `<h3>تفاصيل الوحدة: ${unit.name}</h3>`;
    
    if (contract) {
        const tenant = tenants.find(t => t.id === contract.tenantId);
        
        // Calculate totals
        const totalPaid = contract.installments.reduce((sum, p) => sum + (p.amount - p.remaining), 0);
        const totalRemaining = contract.installments.reduce((sum, p) => sum + p.remaining, 0);
        const totalOverdue = contract.installments.reduce((sum, p) => {
            const today = new Date().toISOString().split('T')[0];
            if (p.remaining > 0 && p.dueDate < today) {
                return sum + p.remaining;
            }
            return sum;
        }, 0);
        
        html += `
            <p><strong>العقار:</strong> ${properties.find(p => p.id === buildings.find(b => b.id === floors.find(f => f.id === unit.floorId).buildingId).propertyId).name}</p>
            <p><strong>المبنى:</strong> ${buildings.find(b => b.id === floors.find(f => f.id === unit.floorId).buildingId).name}</p>
            <p><strong>المستأجر:</strong> ${tenant ? tenant.name : 'غير محدد'}</p>
            <p><strong>تاريخ العقد:</strong> ${contract.start} إلى ${contract.end}</p>
            
            <div class="summary">
                <div class="summary-paid">
                    المدفوع: ${totalPaid.toFixed(2)} ر.س
                </div>
                <div class="summary-remaining">
                    المتبقي: ${totalRemaining.toFixed(2)} ر.س
                </div>
                <div class="summary-overdue">
                    المتأخر: ${totalOverdue.toFixed(2)} ر.س
                </div>
            </div>
            
            <h4>تفاصيل الدفعات</h4>
            <table>
                <thead>
                    <tr>
                        <th>تاريخ الاستحقاق</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        contract.installments.forEach(p => {
            let statusText = 'مستحق';
            if (p.remaining <= 0) statusText = 'مدفوع';
            const today = new Date().toISOString().split('T')[0];
            if (p.remaining > 0 && p.dueDate < today) statusText = 'متأخر';

            html += `
                <tr>
                    <td>${p.dueDate}</td>
                    <td>${p.amount.toFixed(2)} ر.س</td>
                    <td>${statusText}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    } else {
        html += `<p style="color:var(--success)">هذه الوحدة شاغرة ولا يوجد لها عقد حالي.</p>`;
    }
    
    content.innerHTML = html;
    modal.style.display = "block";
}


// Close Modal function to be placed in ui.js
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('unit-details-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}