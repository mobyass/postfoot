// Configuration Supabase
const SUPABASE_URL = 'https://xpdxgtzwwgojjmqjqwlj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DO0ISCZofVuTg1SHP7f-ew_S6dsjuxQ';

// Initialiser le client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Fonction pour vérifier si l'utilisateur est connecté
async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

// Fonction pour vérifier la session
async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

// Écouter les changements d'authentification
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Utilisateur connecté:', session.user.email);
    localStorage.setItem('user', JSON.stringify(session.user));
  } else if (event === 'SIGNED_OUT') {
    console.log('Utilisateur déconnecté');
    localStorage.removeItem('user');
  }
});
