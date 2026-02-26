const userEmail = /*[[${userEmail}]]*/ null;
if (userEmail) {
    localStorage.setItem('userEmail', userEmail);
    window.location.href = '/'; // переход на страницу теста
}
function switchToLogin() {
    document.getElementById('loginForm').classList.remove('hidden-form');
    document.getElementById('registerForm').classList.add('hidden-form');
 }
function switchToRegister() {
    document.getElementById('loginForm').classList.add('hidden-form');
    document.getElementById('registerForm').classList.remove('hidden-form');
}
function togglePassword(id) {
    const input = document.getElementById(id);
    if (!input) return;
    const wrapper = input.closest('.password-wrapper');
    const icon = wrapper ? wrapper.querySelector('.eye-icon') : null;
    if (!icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    console.log('Login:', { email, password });
    alert('Вход успешен!');
    localStorage.setItem('userEmail', email);
    window.location.href = '/';
}
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    console.log('Register:', { name, email, password });
    alert('Регистрация успешна!');
    localStorage.setItem('userEmail', email);
    window.location.href = '/';
}
function handleSocial() {
    alert('Социальная авторизация скоро...');
}
