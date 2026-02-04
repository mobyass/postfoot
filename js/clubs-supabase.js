// ========================================
// CLUBS SUPABASE - Gestion des clubs via Supabase
// ========================================

// ========================================
// RECHERCHER DES CLUBS
// ========================================
async function rechercherClubs(recherche) {
  try {
    // Normaliser la recherche
    const searchTerm = recherche.toLowerCase().trim();

    if (searchTerm.length < 1) {
      return [];
    }

    // Rechercher dans Supabase (nom ou nom_court contient le terme)
    const { data, error } = await supabaseClient
      .from('clubs')
      .select('*')
      .or(`nom.ilike.%${searchTerm}%,nom_court.ilike.%${searchTerm}%`)
      .order('nb_utilisations', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erreur recherche clubs:', error);
      return [];
    }

    // Transformer les données pour correspondre au format attendu
    return data.map(club => ({
      id: club.id,
      nom: club.nom,
      abbr: club.nom_court || club.nom.substring(0, 3).toUpperCase(),
      logo: club.logo_url,
      couleurPrimaire: club.couleur_primaire,
      couleurSecondaire: club.couleur_secondaire
    }));
  } catch (error) {
    console.error('Erreur recherche clubs:', error);
    return [];
  }
}

// ========================================
// OBTENIR TOUS LES CLUBS (pour l'affichage initial)
// ========================================
async function getTousLesClubs(limit = 50) {
  try {
    const { data, error } = await supabaseClient
      .from('clubs')
      .select('*')
      .order('nb_utilisations', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération clubs:', error);
      return [];
    }

    return data.map(club => ({
      id: club.id,
      nom: club.nom,
      abbr: club.nom_court || club.nom.substring(0, 3).toUpperCase(),
      logo: club.logo_url,
      couleurPrimaire: club.couleur_primaire,
      couleurSecondaire: club.couleur_secondaire
    }));
  } catch (error) {
    console.error('Erreur récupération clubs:', error);
    return [];
  }
}

// ========================================
// AJOUTER UN CLUB
// ========================================
async function ajouterClub(club, userId = null) {
  try {
    // Vérifier si le club existe déjà (par nom similaire)
    const clubExistant = await verifierClubExistant(club.nom);
    if (clubExistant) {
      console.log('Club déjà existant:', clubExistant);
      return { success: true, data: clubExistant, existe: true };
    }

    // Utiliser l'userId fourni ou récupérer l'utilisateur connecté
    let userIdToUse = userId;
    if (!userIdToUse) {
      const user = await getUser();
      userIdToUse = user ? user.id : null;
    }

    // Insérer le nouveau club
    const { data, error } = await supabaseClient
      .from('clubs')
      .insert({
        nom: club.nom,
        nom_court: club.abbr || club.nom.substring(0, 3).toUpperCase(),
        logo_url: club.logo || null,
        couleur_primaire: club.couleurPrimaire || '#FFFFFF',
        couleur_secondaire: club.couleurSecondaire || '#000000',
        pays: club.pays || null,
        ligue: club.ligue || null,
        ajoute_par: userIdToUse,
        nb_utilisations: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur ajout club:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        nom: data.nom,
        abbr: data.nom_court,
        logo: data.logo_url
      },
      existe: false
    };
  } catch (error) {
    console.error('Erreur ajout club:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// VÉRIFIER SI UN CLUB EXISTE DÉJÀ
// ========================================
async function verifierClubExistant(nom) {
  try {
    const nomNormalise = nom.toLowerCase().trim();

    const { data, error } = await supabaseClient
      .from('clubs')
      .select('*')
      .or(`nom.ilike.${nomNormalise},nom_court.ilike.${nomNormalise}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return {
      id: data[0].id,
      nom: data[0].nom,
      abbr: data[0].nom_court,
      logo: data[0].logo_url
    };
  } catch (error) {
    console.error('Erreur vérification club:', error);
    return null;
  }
}

// ========================================
// INCRÉMENTER LE COMPTEUR D'UTILISATION
// ========================================
async function incrementerUtilisation(clubId) {
  try {
    // D'abord récupérer la valeur actuelle
    const { data: club, error: fetchError } = await supabaseClient
      .from('clubs')
      .select('nb_utilisations')
      .eq('id', clubId)
      .single();

    if (fetchError) {
      console.error('Erreur récupération club:', fetchError);
      return;
    }

    // Puis mettre à jour
    const { error } = await supabaseClient
      .from('clubs')
      .update({ nb_utilisations: (club.nb_utilisations || 0) + 1 })
      .eq('id', clubId);

    if (error) {
      console.error('Erreur mise à jour utilisation:', error);
    }
  } catch (error) {
    console.error('Erreur incrémentation:', error);
  }
}

// ========================================
// OBTENIR LE CLUB FAVORI DE L'UTILISATEUR
// ========================================
async function getClubFavoriSupabase() {
  try {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select(`
        club_favori_id,
        clubs (
          id,
          nom,
          nom_court,
          logo_url,
          couleur_primaire,
          couleur_secondaire
        )
      `)
      .eq('id', user.id)
      .single();

    if (error || !data || !data.clubs) {
      return null;
    }

    return {
      id: data.clubs.id,
      nom: data.clubs.nom,
      abbr: data.clubs.nom_court,
      logo: data.clubs.logo_url,
      couleurPrimaire: data.clubs.couleur_primaire,
      couleurSecondaire: data.clubs.couleur_secondaire
    };
  } catch (error) {
    console.error('Erreur récupération club favori:', error);
    return null;
  }
}

// ========================================
// DÉFINIR LE CLUB FAVORI DE L'UTILISATEUR
// ========================================
async function setClubFavoriSupabase(clubId, userId = null) {
  try {
    // Utiliser l'ID fourni ou récupérer l'utilisateur connecté
    let userIdToUse = userId;
    if (!userIdToUse) {
      const user = await getUser();
      if (!user) {
        return { success: false, error: 'Non connecté' };
      }
      userIdToUse = user.id;
    }

    // Mettre à jour ou créer le profil utilisateur
    const { error } = await supabaseClient
      .from('user_profiles')
      .upsert({
        id: userIdToUse,
        club_favori_id: clubId
      });

    if (error) {
      console.error('Erreur définition club favori:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur définition club favori:', error);
    return { success: false, error: error.message };
  }
}

