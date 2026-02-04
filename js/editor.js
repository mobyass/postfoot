// editor.js - Script pour l'éditeur d'affiche

document.addEventListener('DOMContentLoaded', function () {

  // =====================
  // VARIABLES
  // =====================
  let equipeA = null;
  let equipeB = null;
  let currentTeam = null;

  // =====================
  // CHARGER CLUB FAVORI COMME ÉQUIPE A
  // =====================
  async function chargerClubFavori() {
    let club = null;

    // Charger depuis Supabase si connecté
    if (typeof getClubFavoriSupabase === 'function') {
      club = await getClubFavoriSupabase();
      if (club) {
        localStorage.setItem('monClub', JSON.stringify(club));
      }
    }

    // Fallback localStorage
    if (!club) {
      const clubData = localStorage.getItem('monClub');
      if (clubData) {
        club = JSON.parse(clubData);
      }
    }

    if (club) {
      equipeA = {
        nom: club.nom,
        abbr: club.abbr,
        logo: club.logo
      };

      const teamAName = document.getElementById('teamA-name');
      const teamALogo = document.getElementById('teamA-logo');
      const logoA = document.getElementById('logoA');
      const matchTitle = document.getElementById('matchTitle');

      if (teamAName) teamAName.textContent = club.nom;

      if (teamALogo && club.logo) {
        teamALogo.classList.remove('empty-logo');
        teamALogo.style.backgroundImage = `url(${club.logo})`;
        teamALogo.style.backgroundSize = 'contain';
        teamALogo.style.backgroundPosition = 'center';
        teamALogo.style.backgroundRepeat = 'no-repeat';
      }

      if (logoA && club.logo) {
        logoA.style.backgroundImage = `url(${club.logo})`;
        logoA.style.backgroundSize = 'contain';
        logoA.style.backgroundPosition = 'center';
        logoA.style.backgroundRepeat = 'no-repeat';
      }

      if (matchTitle) {
        matchTitle.textContent = `${club.nom} - Équipe B`;
      }

      const teamADisplay = document.getElementById('teamA-display');
      if (teamADisplay) teamADisplay.classList.add('selected');
    }
  }

  // Charger au démarrage
  setTimeout(chargerClubFavori, 200);

  // =====================
  // ELEMENTS DOM
  // =====================
  const clubList = document.getElementById("clubListModal");
  const clubSearch = document.getElementById("clubSearchModal");

  const logoA = document.getElementById("logoA");
  const logoB = document.getElementById("logoB");

  const matchTitle = document.getElementById("matchTitle");

  const displayScoreA = document.getElementById("displayScoreA");
  const displayScoreB = document.getElementById("displayScoreB");
  const inputScoreA = document.getElementById("inputScoreA");
  const inputScoreB = document.getElementById("inputScoreB");

  const inputInfo2 = document.getElementById("inputInfo2");
  const info1 = document.getElementById("info1");
  const info2 = document.getElementById("info2");

  const fileInput = document.getElementById("fileInput");
  const btnZoom = document.getElementById("btnZoom");
  const btnCloseZoom = document.getElementById("btnCloseZoom");
  const zoomSlider = document.getElementById("zoomSlider");
  const btnExport = document.getElementById("btnExport");
  const btnShare = document.getElementById("btnShare");

  const bgImage = document.getElementById("bgImage");
  const capture = document.getElementById("capture");

  const modal = document.getElementById("clubModal");

  // Nouveaux éléments pour le recadrage
  const btnRecadrer = document.getElementById("btnRecadrer");
  const recadrageModal = document.getElementById("recadrageModal");
  const btnValiderRecadrage = document.getElementById("btnValiderRecadrage");
  const btnAnnulerRecadrage = document.getElementById("btnAnnulerRecadrage");
  const recadragePreview = document.getElementById("recadragePreview");
  const recadrageImage = document.getElementById("recadrageImage");
  const recadrageZoomSlider = document.getElementById("recadrageZoomSlider");

  // Éléments du preview de recadrage
  const recadrageInfo1 = document.getElementById("recadrage-info1");
  const recadrageInfo2 = document.getElementById("recadrage-info2");
  const recadrageMatchTitle = document.getElementById("recadrage-matchTitle");
  const recadrageLogoA = document.getElementById("recadrage-logoA");
  const recadrageLogoB = document.getElementById("recadrage-logoB");
  const recadrageScoreA = document.getElementById("recadrage-displayScoreA");
  const recadrageScoreB = document.getElementById("recadrage-displayScoreB");

  // =====================
  // SCORES
  // =====================
  inputScoreA.addEventListener("input", e => {
    const score = Math.max(0, e.target.value || 0);
    displayScoreA.textContent = score;
    recadrageScoreA.textContent = score;
  });

  inputScoreB.addEventListener("input", e => {
    const score = Math.max(0, e.target.value || 0);
    displayScoreB.textContent = score;
    recadrageScoreB.textContent = score;
  });

  inputInfo2.addEventListener("input", e => {
    info2.textContent = e.target.value;
    recadrageInfo2.textContent = e.target.value;
  });

  // =====================
  // COMPETITION
  // =====================
  document.querySelectorAll('[data-competition]').forEach(btn => {
    btn.addEventListener("click", e => {
      const comp = e.target.dataset.competition;
      info1.textContent = comp;
      recadrageInfo1.textContent = comp;
      e.target.parentElement.querySelectorAll("button")
        .forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // =====================
  // MODAL SELECTION
  // =====================
  document.getElementById("teamA-btn").addEventListener("click", () => openModal("A"));
  document.getElementById("teamB-btn").addEventListener("click", () => openModal("B"));

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("closeModalX").addEventListener("click", closeModal);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  // Debounce pour la recherche
  let searchTimeout = null;

  clubSearch.addEventListener("input", e => {
    clearTimeout(searchTimeout);
    const value = e.target.value;

    // Debounce de 300ms pour éviter trop d'appels API
    searchTimeout = setTimeout(() => {
      renderModalList(value);
    }, 300);
  });

  function openModal(team) {
    currentTeam = team;
    modal.classList.add("active");
    clubSearch.value = "";

    // Réinitialiser les vues (s'assurer qu'on est sur la vue recherche)
    const searchView = document.getElementById("searchView");
    const addClubView = document.getElementById("addClubView");
    if (searchView && addClubView) {
      addClubView.classList.add("hidden");
      searchView.classList.remove("hidden");
    }

    renderModalList("");
    clubSearch.focus();
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  async function renderModalList(filter) {
    clubList.innerHTML = `<div class="search-status">Chargement...</div>`;

    let results = [];

    // Rechercher dans Supabase si le filtre n'est pas vide
    if (filter.trim().length > 0) {
      results = await rechercherClubs(filter);
    } else {
      // Si pas de filtre, afficher les clubs les plus utilisés
      results = await getTousLesClubs(8);
    }

    // Si aucun résultat dans Supabase, chercher dans le fichier local (fallback)
    if (results.length === 0 && typeof CLUBS !== 'undefined') {
      results = CLUBS
        .filter(c =>
          (c.nom + " " + (c.abbr || "")).toLowerCase().includes(filter.toLowerCase())
        )
        .slice(0, filter === "" ? 4 : CLUBS.length);
    }

    clubList.innerHTML = "";

    if (results.length === 0) {
      clubList.innerHTML = `
        <div class="search-status no-results">
          Aucun club trouvé pour "${filter}"
        </div>
      `;
      return;
    }

    results.forEach(club => {
      const div = document.createElement("div");
      div.className = "club-option";
      div.innerHTML = `
        <div class="club-option-logo" style="background-image:url('${club.logo}')"></div>
        <div class="club-option-info">
          <span class="club-option-name">${club.nom}</span>
          ${club.abbr ? `<span class="club-option-abbr">${club.abbr}</span>` : ''}
        </div>
      `;
      div.addEventListener("click", () => {
        selectTeam(club);
        // Incrémenter le compteur d'utilisation si c'est un club Supabase
        if (club.id) {
          incrementerUtilisation(club.id);
        }
        closeModal();
      });
      clubList.appendChild(div);
    });
  }

  function selectTeam(club) {
    if (currentTeam === "A") {
      equipeA = club;
      updateTeam("A", club);
      logoA.style.backgroundImage = `url('${club.logo}')`;
      recadrageLogoA.style.backgroundImage = `url('${club.logo}')`;
    } else {
      equipeB = club;
      updateTeam("B", club);
      logoB.style.backgroundImage = `url('${club.logo}')`;
      recadrageLogoB.style.backgroundImage = `url('${club.logo}')`;
    }

    const titre = `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;
    matchTitle.textContent = titre;
    recadrageMatchTitle.textContent = titre;
  }

  function updateTeam(team, club) {
    const display = document.getElementById(`team${team}-display`);
    const logo = document.getElementById(`team${team}-logo`);
    const name = document.getElementById(`team${team}-name`);
    const btn = document.getElementById(`team${team}-btn`);

    display.classList.add("selected");
    logo.style.backgroundImage = `url('${club.logo}')`;
    logo.classList.remove("empty-logo");
    name.textContent = club.nom;
    btn.textContent = "Modifier";
  }

  // =====================
  // BACKGROUND / ZOOM
  // =====================
  const FRAME_W = 400;
  const FRAME_H = 500;

  let baseScale = 1;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  // Variables pour le recadrage
  let recadrageActive = false;
  let recadrageZoom = 1;
  let recadrageOffsetX = 0;
  let recadrageOffsetY = 0;
  let recadrageDragging = false;
  let recadrageStartX = 0;
  let recadrageStartY = 0;
  let recadrageTouchDistance = 0;

  // Charger l'image personnalisée si elle existe
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('custom') === 'true') {
    const customImage = localStorage.getItem('customAfficheImage');
    if (customImage) {
      loadBackgroundFromData(customImage);
      // Nettoyer le localStorage après chargement
      localStorage.removeItem('customAfficheImage');
      localStorage.removeItem('customAfficheName');
    }
  }

  fileInput.addEventListener("change", loadBackground);

  function loadBackground(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      loadBackgroundFromData(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function loadBackgroundFromData(dataUrl) {
    bgImage.onload = () => {
      baseScale = Math.max(
        FRAME_W / bgImage.naturalWidth,
        FRAME_H / bgImage.naturalHeight
      );
      zoom = 1;
      bgImage.width = bgImage.naturalWidth * baseScale;
      bgImage.height = bgImage.naturalHeight * baseScale;
      offsetX = (FRAME_W - bgImage.width) / 2;
      offsetY = (FRAME_H - bgImage.height) / 2;
      apply();

      // Activer le bouton recadrer
      btnRecadrer.disabled = false;
    };
    bgImage.src = dataUrl;
  }

  function apply() {
    bgImage.style.left = offsetX + "px";
    bgImage.style.top = offsetY + "px";
  }

  // =====================
  // MODE RECADRAGE
  // =====================
  btnRecadrer.addEventListener("click", openRecadrage);
  btnValiderRecadrage.addEventListener("click", validerRecadrage);
  btnAnnulerRecadrage.addEventListener("click", annulerRecadrage);

  function openRecadrage() {
    if (!bgImage.src) return;

    recadrageActive = true;
    recadrageModal.classList.add("active");
    
    // Copier l'image actuelle dans le preview
    recadrageImage.src = bgImage.src;
    
    // Synchroniser tous les éléments visuels
    recadrageInfo1.textContent = info1.textContent;
    recadrageInfo2.textContent = info2.textContent;
    recadrageMatchTitle.textContent = matchTitle.textContent;
    recadrageScoreA.textContent = displayScoreA.textContent;
    recadrageScoreB.textContent = displayScoreB.textContent;
    recadrageLogoA.style.backgroundImage = logoA.style.backgroundImage;
    recadrageLogoB.style.backgroundImage = logoB.style.backgroundImage;
    
    // Copier les paramètres actuels
    recadrageZoom = zoom;
    recadrageOffsetX = offsetX;
    recadrageOffsetY = offsetY;
    
    // Initialiser le slider
    recadrageZoomSlider.value = zoom;
    
    // Appliquer les styles
    recadrageImage.onload = () => {
      recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
      recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;
      applyRecadrage();
    };
    
    // Bloquer le scroll de la page
    document.body.style.overflow = 'hidden';
  }

  function validerRecadrage() {
    // Appliquer les changements à l'image principale
    zoom = recadrageZoom;
    offsetX = recadrageOffsetX;
    offsetY = recadrageOffsetY;
    
    bgImage.width = bgImage.naturalWidth * baseScale * zoom;
    bgImage.height = bgImage.naturalHeight * baseScale * zoom;
    apply();
    
    fermerRecadrage();
  }

  function annulerRecadrage() {
    fermerRecadrage();
  }

  function fermerRecadrage() {
    recadrageActive = false;
    recadrageModal.classList.remove("active");
    document.body.style.overflow = '';
  }

  function applyRecadrage() {
    recadrageImage.style.left = recadrageOffsetX + "px";
    recadrageImage.style.top = recadrageOffsetY + "px";
  }

  function clampRecadrage() {
    recadrageOffsetX = Math.min(0, Math.max(FRAME_W - recadrageImage.width, recadrageOffsetX));
    recadrageOffsetY = Math.min(0, Math.max(FRAME_H - recadrageImage.height, recadrageOffsetY));
  }

  // Gestion du zoom via slider
  recadrageZoomSlider.addEventListener("input", e => {
    const prevW = recadrageImage.width;
    const prevH = recadrageImage.height;
    recadrageZoom = Math.max(1, parseFloat(e.target.value));

    recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
    recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;

    recadrageOffsetX -= (recadrageImage.width - prevW) / 2;
    recadrageOffsetY -= (recadrageImage.height - prevH) / 2;

    clampRecadrage();
    applyRecadrage();
  });

  // Gestion du drag (souris)
  recadragePreview.addEventListener("mousedown", e => {
    e.preventDefault();
    recadrageDragging = true;
    recadrageStartX = e.clientX - recadrageOffsetX;
    recadrageStartY = e.clientY - recadrageOffsetY;
  });

  window.addEventListener("mousemove", e => {
    if (!recadrageDragging) return;
    e.preventDefault();
    recadrageOffsetX = e.clientX - recadrageStartX;
    recadrageOffsetY = e.clientY - recadrageStartY;
    clampRecadrage();
    applyRecadrage();
  });

  window.addEventListener("mouseup", () => {
    recadrageDragging = false;
  });

  // Gestion tactile (mobile)
  recadragePreview.addEventListener("touchstart", handleTouchStart, { passive: false });
  recadragePreview.addEventListener("touchmove", handleTouchMove, { passive: false });
  recadragePreview.addEventListener("touchend", handleTouchEnd, { passive: false });

  function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Un doigt : déplacer
      recadrageDragging = true;
      recadrageStartX = e.touches[0].clientX - recadrageOffsetX;
      recadrageStartY = e.touches[0].clientY - recadrageOffsetY;
    } else if (e.touches.length === 2) {
      // Deux doigts : zoom
      recadrageDragging = false;
      recadrageTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && recadrageDragging) {
      // Déplacement
      recadrageOffsetX = e.touches[0].clientX - recadrageStartX;
      recadrageOffsetY = e.touches[0].clientY - recadrageStartY;
      clampRecadrage();
      applyRecadrage();
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scale = newDistance / recadrageTouchDistance;
      const prevW = recadrageImage.width;
      const prevH = recadrageImage.height;
      
      recadrageZoom = Math.min(3, Math.max(1, recadrageZoom * scale));
      recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
      recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;
      
      recadrageOffsetX -= (recadrageImage.width - prevW) / 2;
      recadrageOffsetY -= (recadrageImage.height - prevH) / 2;
      
      clampRecadrage();
      applyRecadrage();
      
      recadrageZoomSlider.value = recadrageZoom;
      recadrageTouchDistance = newDistance;
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      recadrageDragging = false;
    }
  }

  // =====================
  // ANCIEN ZOOM (caché maintenant)
  // =====================
  btnZoom.addEventListener("click", () => toggleZoom(true));
  btnCloseZoom.addEventListener("click", () => toggleZoom(false));
  zoomSlider.addEventListener("input", e => zoomBg(e.target.value));

  function zoomBg(val) {
    const prevW = bgImage.width;
    const prevH = bgImage.height;
    zoom = Math.max(1, val);

    bgImage.width = bgImage.naturalWidth * baseScale * zoom;
    bgImage.height = bgImage.naturalHeight * baseScale * zoom;

    offsetX -= (bgImage.width - prevW) / 2;
    offsetY -= (bgImage.height - prevH) / 2;

    clamp();
    apply();
  }

  function toggleZoom(show) {
    document.getElementById("zoomControls")
      .classList.toggle("hidden", !show);
  }

  capture.addEventListener("mousedown", e => {
    dragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    clamp();
    apply();
  });

  window.addEventListener("mouseup", () => dragging = false);

  function clamp() {
    offsetX = Math.min(0, Math.max(FRAME_W - bgImage.width, offsetX));
    offsetY = Math.min(0, Math.max(FRAME_H - bgImage.height, offsetY));
  }

  // =====================
  // EXPORT / SHARE
  // =====================
  btnExport.addEventListener("click", exportImage);
  btnShare.addEventListener("click", shareImage);

  function exportImage() {
    html2canvas(capture, { scale: 4, useCORS: true }).then(canvas => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "post-match.png";
      a.click();
    });
  }

  function shareImage() {
    html2canvas(capture, { scale: 4, useCORS: true }).then(canvas => {
      canvas.toBlob(blob => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "post-match.png", { type: "image/png" });
          navigator.share({ files: [file] });
        } else {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]);
          alert("✅ Image copiée !");
        }
      });
    });
  }

  // =====================
  // GRADIENT COLOR PICKER
  // =====================
  const degrader = document.querySelector(".degrader");
  const gradientColorPicker = document.getElementById("gradientColorPicker");

  // Charger la couleur sauvegardée au démarrage
  const savedColor = localStorage.getItem("gradientColor");
  if (savedColor) {
    gradientColorPicker.value = savedColor;
    applyGradientColor(savedColor);
  }

  // Gérer le changement de couleur
  gradientColorPicker.addEventListener("input", (e) => {
    const color = e.target.value;
    applyGradientColor(color);
    localStorage.setItem("gradientColor", color);
  });

  function applyGradientColor(hexColor) {
    // Convertir hex en RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    degrader.style.background = `linear-gradient(
      to bottom,
      rgba(${r}, ${g}, ${b}, 0.01) 0%,
      rgba(${r}, ${g}, ${b}, 0.01) 54%,
      rgba(${r}, ${g}, ${b}, 1) 100%
    )`;
  }

  // =====================
  // SWAP TEAMS
  // =====================
  const btnSwapTeams = document.getElementById("btnSwapTeams");

  btnSwapTeams.addEventListener("click", () => {
    // Échanger les équipes
    const tempEquipe = equipeA;
    equipeA = equipeB;
    equipeB = tempEquipe;

    // Échanger les logos
    const tempLogoStyle = logoA.style.backgroundImage;
    logoA.style.backgroundImage = logoB.style.backgroundImage;
    logoB.style.backgroundImage = tempLogoStyle;

    // Mettre à jour aussi dans le preview de recadrage
    recadrageLogoA.style.backgroundImage = logoA.style.backgroundImage;
    recadrageLogoB.style.backgroundImage = logoB.style.backgroundImage;

    // Échanger les scores
    const tempScore = inputScoreA.value;
    inputScoreA.value = inputScoreB.value;
    inputScoreB.value = tempScore;

    displayScoreA.textContent = inputScoreA.value;
    displayScoreB.textContent = inputScoreB.value;
    recadrageScoreA.textContent = inputScoreA.value;
    recadrageScoreB.textContent = inputScoreB.value;

    // Mettre à jour les affichages des équipes
    const teamADisplay = document.getElementById("teamA-display");
    const teamBDisplay = document.getElementById("teamB-display");
    const teamALogo = document.getElementById("teamA-logo");
    const teamBLogo = document.getElementById("teamB-logo");
    const teamAName = document.getElementById("teamA-name");
    const teamBName = document.getElementById("teamB-name");

    // Échanger les logos dans les displays
    const tempDisplayLogoStyle = teamALogo.style.backgroundImage;
    teamALogo.style.backgroundImage = teamBLogo.style.backgroundImage;
    teamBLogo.style.backgroundImage = tempDisplayLogoStyle;

    // Échanger les classes empty-logo si nécessaire
    const tempHasEmpty = teamALogo.classList.contains("empty-logo");
    if (teamBLogo.classList.contains("empty-logo")) {
      teamALogo.classList.add("empty-logo");
    } else {
      teamALogo.classList.remove("empty-logo");
    }
    if (tempHasEmpty) {
      teamBLogo.classList.add("empty-logo");
    } else {
      teamBLogo.classList.remove("empty-logo");
    }

    // Échanger les noms
    const tempName = teamAName.textContent;
    teamAName.textContent = teamBName.textContent;
    teamBName.textContent = tempName;

    // Échanger les classes selected
    const tempSelected = teamADisplay.classList.contains("selected");
    if (teamBDisplay.classList.contains("selected")) {
      teamADisplay.classList.add("selected");
    } else {
      teamADisplay.classList.remove("selected");
    }
    if (tempSelected) {
      teamBDisplay.classList.add("selected");
    } else {
      teamBDisplay.classList.remove("selected");
    }

    // Mettre à jour le titre du match
    const titre = `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;
    matchTitle.textContent = titre;
    recadrageMatchTitle.textContent = titre;

    // Animation de feedback
    btnSwapTeams.style.transform = "rotate(180deg)";
    setTimeout(() => {
      btnSwapTeams.style.transform = "rotate(0deg)";
    }, 300);
  });

  // Style pour l'animation du bouton swap
  btnSwapTeams.style.transition = "transform 0.3s ease";

  // =====================
  // AJOUTER UN NOUVEAU CLUB
  // =====================
  const searchView = document.getElementById("searchView");
  const addClubView = document.getElementById("addClubView");
  const btnShowAddClub = document.getElementById("btnShowAddClub");
  const btnCancelAddClub = document.getElementById("btnCancelAddClub");
  const btnSaveNewClub = document.getElementById("btnSaveNewClub");
  const newClubNameInput = document.getElementById("newClubName");
  const newClubAbbrInput = document.getElementById("newClubAbbr");
  const newClubLogoInput = document.getElementById("newClubLogoInput");
  const newClubLogoPreview = document.getElementById("newClubLogoPreview");
  const btnUploadNewLogo = document.getElementById("btnUploadNewLogo");

  let newClubLogoBase64 = null;

  // Afficher le formulaire d'ajout
  btnShowAddClub.addEventListener("click", () => {
    searchView.classList.add("hidden");
    addClubView.classList.remove("hidden");
    newClubNameInput.value = "";
    newClubAbbrInput.value = "";
    newClubLogoBase64 = null;
    newClubLogoPreview.innerHTML = "<span>+</span>";
    newClubNameInput.focus();
  });

  // Annuler l'ajout
  btnCancelAddClub.addEventListener("click", () => {
    addClubView.classList.add("hidden");
    searchView.classList.remove("hidden");
  });

  // Upload logo
  btnUploadNewLogo.addEventListener("click", () => {
    newClubLogoInput.click();
  });

  newClubLogoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newClubLogoBase64 = event.target.result;
        newClubLogoPreview.innerHTML = `<img src="${newClubLogoBase64}" alt="Logo">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Abréviation en majuscules
  newClubAbbrInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  // Sauvegarder le nouveau club
  btnSaveNewClub.addEventListener("click", async () => {
    const nom = newClubNameInput.value.trim();
    const abbr = newClubAbbrInput.value.trim().toUpperCase();

    if (!nom) {
      alert("Veuillez entrer le nom du club");
      return;
    }

    if (!abbr) {
      alert("Veuillez entrer l'abréviation du club");
      return;
    }

    // Désactiver le bouton
    btnSaveNewClub.disabled = true;
    btnSaveNewClub.textContent = "Ajout...";

    const club = {
      nom: nom,
      abbr: abbr,
      logo: newClubLogoBase64
    };

    // Ajouter dans Supabase
    const result = await ajouterClub(club);

    if (result.success) {
      const clubData = result.data;

      // Créer l'objet club avec le format attendu
      const newClub = {
        id: clubData.id,
        nom: clubData.nom,
        abbr: clubData.abbr,
        logo: clubData.logo || newClubLogoBase64
      };

      // Sélectionner le club
      selectTeam(newClub);

      // Incrémenter le compteur
      if (newClub.id) {
        incrementerUtilisation(newClub.id);
      }

      // Fermer la modal
      closeModal();

      // Réinitialiser la vue
      addClubView.classList.add("hidden");
      searchView.classList.remove("hidden");
    } else {
      alert("Erreur: " + result.error);
    }

    // Réactiver le bouton
    btnSaveNewClub.disabled = false;
    btnSaveNewClub.textContent = "Ajouter";
  });

});
