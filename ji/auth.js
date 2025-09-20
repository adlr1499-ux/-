/* Users (with simple password, stored locally) */
let users = JSON.parse(localStorage.getItem('re_users') || '[]');
let currentUser = null;

/* ================== Auth ================== */
function showLoginScreen(){
  document.getElementById('login-screen').style.display='block';
  document.getElementById('main-ui').style.display='none';
  document.getElementById('current-user').textContent = 'غير مسجل';
}
function showMainUI(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('main-ui').style.display='block';
  updateUserLabel();
  refreshAllUI();
}
function login(){
  const u=document.getElementById('login-username').value.trim();
  const p=document.getElementById('login-password').value;
  const user=users.find(x=>x.username===u && x.password===p);
  if(!user){ showToast('بيانات الدخول خاطئة','error'); return; }
  currentUser = user;
  showToast(`مرحباً ${user.username}`,'success');
  showMainUI();
}
function logout(){
  currentUser = null;
  showLoginScreen();
  showToast('تم تسجيل الخروج','info');
}
function showRegister(){ document.getElementById('register-form').style.display='block'; }
function registerUser(){
  const u=document.getElementById('reg-username').value.trim();
  const p=document.getElementById('reg-password').value;
  const r=document.getElementById('reg-role').value;
  if(!u||!p){ showToast('املأ الحقول','error'); return; }
  if(users.find(x=>x.username===u)){ showToast('اسم المستخدم موجود','error'); return; }
  users.push({id:Date.now(),username:u,password:p,role:r});
  saveAllData(); showToast('تم إنشاء المستخدم','success');
  document.getElementById('reg-username').value=''; document.getElementById('reg-password').value='';
  document.getElementById('register-form').style.display='none';
}