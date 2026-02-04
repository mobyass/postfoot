// ========================================
// AUTHENTIFICATION - INSCRIPTION
// ========================================

async function inscription(email, password, nomUtilisateur) {
  try {
    // Créer le compte
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nom_utilisateur: nomUtilisateur
        }
      }
    });

    if (error) {
      throw error;
    }

    // Créer le profil utilisateur dans la table user_profiles
    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          nom_utilisateur: nomUtilisateur
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
      }
    }

    return { success: true, data: data };
  } catch (error) {
    console.error('Erreur inscription:', error.message);
    return { success: false, error: error.message };
  }
}

// ========================================
// AUTHENTIFICATION - CONNEXION
// ========================================

async function connexion(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    return { success: true, data: data };
  } catch (error) {
    console.error('Erreur connexion:', error.message);
    return { success: false, error: error.message };
  }
}

// ========================================
// AUTHENTIFICATION - DÉCONNEXION
// ========================================

async function deconnexion() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    localStorage.removeItem('user');
    window.location.href = 'index.html';
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion:', error.message);
    return { success: false, error: error.message };
  }
}

// ========================================
// VÉRIFICATION DE SESSION
// ========================================

async function verifierSession() {
  const session = await getSession();
  return session !== null;
}

async function redirigerSiNonConnecte() {
  const estConnecte = await verifierSession();
  if (!estConnecte) {
    // Vérifier si mode invité
    const modeInvite = localStorage.getItem('modeInvite');
    if (!modeInvite) {
      window.location.href = 'index.html';
    }
  }
}

// ========================================
// MODE INVITÉ
// ========================================

function activerModeInvite() {
  localStorage.setItem('modeInvite', 'true');
  window.location.href = 'selection.html';
}

function estModeInvite() {
  return localStorage.getItem('modeInvite') === 'true';
}

// ========================================
// GESTION DES ERREURS (MESSAGES FR)
// ========================================

function traduireErreur(errorMessage) {
  const traductions = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email',
    'User already registered': 'Un compte existe déjà avec cet email',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Unable to validate email address: invalid format': 'Format d\'email invalide',
    'Email rate limit exceeded': 'Trop de tentatives, réessayez plus tard'
  };

  return traductions[errorMessage] || errorMessage;
}
