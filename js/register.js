// ===== REGISTER PAGE JAVASCRIPT =====

// Validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function showError(fieldId, message) {
  const formGroup = document.getElementById(fieldId).closest('.form-group');
  formGroup.classList.add('error');
  formGroup.classList.remove('success');

  // Remove existing error message
  const existingError = formGroup.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  formGroup.appendChild(errorDiv);
}

function showSuccess(fieldId) {
  const formGroup = document.getElementById(fieldId).closest('.form-group');
  formGroup.classList.remove('error');
  formGroup.classList.add('success');

  // Remove error message if exists
  const existingError = formGroup.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
}

function clearValidation(fieldId) {
  const formGroup = document.getElementById(fieldId).closest('.form-group');
  formGroup.classList.remove('error', 'success');

  const existingError = formGroup.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
}

// Real-time validation on blur
document.getElementById('name').addEventListener('blur', function() {
  if (this.value.trim() === '') {
    showError('name', 'Le nom est requis');
  } else if (this.value.trim().length < 2) {
    showError('name', 'Le nom doit contenir au moins 2 caractères');
  } else {
    showSuccess('name');
  }
});

document.getElementById('email').addEventListener('blur', function() {
  if (this.value.trim() === '') {
    showError('email', "L'email est requis");
  } else if (!validateEmail(this.value)) {
    showError('email', 'Veuillez entrer un email valide');
  } else {
    showSuccess('email');
  }
});

document.getElementById('password').addEventListener('blur', function() {
  if (this.value === '') {
    showError('password', 'Le mot de passe est requis');
  } else if (!validatePassword(this.value)) {
    showError('password', 'Le mot de passe doit contenir au moins 8 caractères');
  } else {
    showSuccess('password');

    // Also validate confirm password if it has a value
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword) {
      if (this.value !== confirmPassword) {
        showError('confirmPassword', 'Les mots de passe ne correspondent pas');
      } else {
        showSuccess('confirmPassword');
      }
    }
  }
});

document.getElementById('confirmPassword').addEventListener('blur', function() {
  const password = document.getElementById('password').value;

  if (this.value === '') {
    showError('confirmPassword', 'Veuillez confirmer votre mot de passe');
  } else if (this.value !== password) {
    showError('confirmPassword', 'Les mots de passe ne correspondent pas');
  } else {
    showSuccess('confirmPassword');
  }
});

// Clear validation on input
document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
  input.addEventListener('input', function() {
    if (this.closest('.form-group').classList.contains('error')) {
      clearValidation(this.id);
    }
  });
});

// Main registration function
function register() {
  let isValid = true;

  // Get form values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const terms = document.getElementById('terms').checked;

  // Clear all previous validations
  clearValidation('name');
  clearValidation('email');
  clearValidation('password');
  clearValidation('confirmPassword');

  // Validate name
  if (name === '') {
    showError('name', 'Le nom est requis');
    isValid = false;
  } else if (name.length < 2) {
    showError('name', 'Le nom doit contenir au moins 2 caractères');
    isValid = false;
  } else {
    showSuccess('name');
  }

  // Validate email
  if (email === '') {
    showError('email', "L'email est requis");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError('email', 'Veuillez entrer un email valide');
    isValid = false;
  } else {
    showSuccess('email');
  }

  // Validate password
  if (password === '') {
    showError('password', 'Le mot de passe est requis');
    isValid = false;
  } else if (!validatePassword(password)) {
    showError('password', 'Le mot de passe doit contenir au moins 8 caractères');
    isValid = false;
  } else {
    showSuccess('password');
  }

  // Validate confirm password
  if (confirmPassword === '') {
    showError('confirmPassword', 'Veuillez confirmer votre mot de passe');
    isValid = false;
  } else if (password !== confirmPassword) {
    showError('confirmPassword', 'Les mots de passe ne correspondent pas');
    isValid = false;
  } else {
    showSuccess('confirmPassword');
  }

  // Validate terms
  if (!terms) {
    alert('Vous devez accepter les conditions d\'utilisation pour continuer');
    isValid = false;
  }

  // If all validations pass
  if (isValid) {
    // Here you would normally send the data to your backend
    alert('Inscription réussie ! (Fonctionnalité à venir)\n\nNom: ' + name + '\nEmail: ' + email);

    // For now, just redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
}

// Google registration
function registerWithGoogle() {
  alert('Inscription avec Google - Bientôt disponible !');
}

// Allow form submission on Enter key
document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        register();
      }
    });
  });
});
