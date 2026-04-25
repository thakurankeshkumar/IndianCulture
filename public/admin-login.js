const form = document.getElementById('adminLoginForm');
const message = document.getElementById('authMessage');
const loginBtn = document.getElementById('loginBtn');

function setSubmitting(isSubmitting) {
  if (!loginBtn) {
    return;
  }

  loginBtn.classList.toggle('loading', isSubmitting);
  loginBtn.disabled = isSubmitting;
  loginBtn.textContent = isSubmitting ? 'Signing In...' : 'Login';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  message.className = 'message';
  message.textContent = 'Signing in...';
  setSubmitting(true);

  try {
    const response = await fetch('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      message.className = 'message error';
      message.textContent = payload.error || 'Login failed';
      return;
    }

    message.className = 'message success';
    message.textContent = 'Login successful. Redirecting...';
    window.location.href = payload.redirectTo || '/admin/dashboard';
  } catch (error) {
    message.className = 'message error';
    message.textContent = error.message || 'Unable to login right now';
  } finally {
    setSubmitting(false);
  }
});
