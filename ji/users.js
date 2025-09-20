/* ================== Users ================== */
function createUser(){
  const u=document.getElementById('new-username').value.trim();
  const p=document.getElementById('new-password').value;
  const r=document.getElementById('new-role').value;
  if(!u||!p){ showToast('املأ الحقول','error'); return; }
  if(users.find(x=>x.username===u)){ showToast('اسم المستخدم موجود','error'); return; }
  users.push({id:Date.now(),username:u,password:p,role:r});
  saveAllData();
  document.getElementById('new-username').value=''; document.getElementById('new-password').value='';
  renderUsers();
  showToast('تم إنشاء المستخدم','success');
}
function renderUsers(){
  const list = document.getElementById('users-list');
  list.innerHTML = '';
  users.forEach(u=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<strong>${u.username}</strong><div class="small">${u.role}</div>`;
    list.appendChild(el);
  });
}