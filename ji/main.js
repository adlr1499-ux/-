/* ================== Initialization ================== */
function initApp(){
  loadAll();
  ensureDefaultUser(); // تأكد من وجود مستخدم افتراضي
  
  // الانتظار حتى يكون DOM جاهزاً بالكامل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded);
  } else {
    afterDOMLoaded();
  }
}

function afterDOMLoaded() {
  // Show login if no user is logged in
  if(!currentUser){
    showLoginScreen();
  }else{
    showMainUI();
  }
  
  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(()=>{
    progress += 10;
    const splashBar = document.getElementById('splash-bar');
    if (splashBar) {
      splashBar.style.width = `${progress}%`;
    }
    if(progress >= 100){
      clearInterval(interval);
      const splashScreen = document.getElementById('splash-screen');
      if (splashScreen) {
        splashScreen.style.display = 'none';
      }
    }
  }, 100);
}

// Initialize the app when the page loads
window.onload = initApp;
/* ================== Payment Logic ================== */
function processPayment() {
    if (!currentPaymentId) return;
    const amountPaid = parseFloat(document.getElementById('modal-payment-amount').value);
    const datePaid = document.getElementById('modal-payment-date').value;
    const notes = document.getElementById('modal-notes').value.trim();
  
    if (isNaN(amountPaid) || amountPaid <= 0 || !datePaid) {
      showToast('أدخل مبلغًا وتاريخًا صحيحًا');
      return;
    }
  
    let remainingAmount = amountPaid;
    
    // Find the first pending payment to process
    const firstPendingIndex = state.contracts
        .flatMap(c => c.payments)
        .findIndex(p => p.remaining > 0);
  
    if (firstPendingIndex !== -1) {
      for (let i = firstPendingIndex; i < state.contracts.flatMap(c=>c.payments).length && remainingAmount > 0; i++) {
        const p = state.contracts.flatMap(c=>c.payments)[i];
        if (p.remaining > 0) {
          const amountToPay = Math.min(remainingAmount, p.remaining);
          
          p.remaining -= amountToPay;
          
          const transaction = {
            id: Date.now(),
            paymentId: p.id,
            amount: amountToPay,
            date: datePaid,
            notes: notes,
            createdAt: new Date().toISOString()
          };
          
          if (!p.transactions) {
            p.transactions = [];
          }
          p.transactions.push(transaction);
  
          remainingAmount -= amountToPay;
  
          if (p.remaining <= 0) {
            p.status = 'paid';
            p.paidDate = datePaid;
          }
        }
      }
    } else {
        // No pending payments, this is a full prepayment
        const contract = state.contracts.find(c => c.tenantId === state.tenants.find(t=>t.name === 'المستأجر الحالي').id);
        const transaction = {
            id: Date.now(),
            paymentId: 'prepayment_' + Date.now(),
            amount: amountPaid,
            date: datePaid,
            notes: notes + ' (دفعة مقدمة)',
            createdAt: new Date().toISOString(),
            contractId: contract ? contract.id : null,
        };
        // Add transaction to a general transactions list or to the contract's transactions
        // For simplicity, we can add a new transaction list to the contracts object
        if (!state.transactions) {
            state.transactions = [];
        }
        state.transactions.push(transaction);
    }
  
    closePaymentModal();
    saveAllData();
    renderAll();
    showToast('تم تسجيل الدفعة بنجاح', 'success');
}