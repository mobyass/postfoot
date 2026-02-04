// ===== SELECTION PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
  const customCard = document.querySelector('.custom-card');
  const customPreview = document.getElementById('customPreview');
  const customImageInput = document.getElementById('customImageInput');
  const customModal = document.getElementById('customModal');
  const customNameInput = document.getElementById('customName');

  let selectedImageData = null;

  // Ouvrir le sélecteur de fichier au clic sur la carte
  customCard.addEventListener('click', function(e) {
    e.preventDefault();
    customImageInput.click();
  });

  // Gérer la sélection de l'image
  customImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner une image (JPEG, PNG)');
      return;
    }

    // Lire l'image
    const reader = new FileReader();

    reader.onload = function(event) {
      selectedImageData = event.target.result;

      // Afficher l'aperçu
      customPreview.style.backgroundImage = `url('${selectedImageData}')`;
      customPreview.classList.add('has-image');

      // Ouvrir la modal pour nommer l'affiche
      customModal.classList.add('active');
      customNameInput.focus();
    };

    reader.readAsDataURL(file);
  });

  // Fermer la modal si on clique en dehors
  customModal.addEventListener('click', function(e) {
    if (e.target === customModal) {
      cancelCustom();
    }
  });

  // Permettre la validation avec Enter
  customNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      confirmCustom();
    }
  });
});

// Annuler la création
function cancelCustom() {
  const customModal = document.getElementById('customModal');
  const customPreview = document.getElementById('customPreview');
  const customNameInput = document.getElementById('customName');
  const customImageInput = document.getElementById('customImageInput');

  // Fermer la modal
  customModal.classList.remove('active');

  // Réinitialiser
  customNameInput.value = '';
  customImageInput.value = '';
  customPreview.style.backgroundImage = '';
  customPreview.classList.remove('has-image');
  selectedImageData = null;
}

// Confirmer et créer l'affiche
function confirmCustom() {
  const customNameInput = document.getElementById('customName');
  const name = customNameInput.value.trim();

  if (!name) {
    alert('Veuillez donner un nom à votre affiche');
    customNameInput.focus();
    return;
  }

  if (!selectedImageData) {
    alert('Aucune image sélectionnée');
    return;
  }

  // Sauvegarder les données dans localStorage
  localStorage.setItem('customAfficheName', name);
  localStorage.setItem('customAfficheImage', selectedImageData);

  // Rediriger vers l'éditeur
  window.location.href = 'editor.html?custom=true';
}
