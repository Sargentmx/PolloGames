document.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  const gamesGrid = document.getElementById('games-grid');
  console.log("Catalog.js cargado correctamente");

  try {
      const gamesSnapshot = await db.collection("games").get();
      console.log(`Se encontraron ${gamesSnapshot.size} juegos.`);

      if (gamesSnapshot.empty) {
          console.warn("No hay juegos en Firestore.");
          return;
      }

      gamesSnapshot.forEach(doc => {
          const gameId = doc.id;
          const gameData = doc.data();
          
          const gameCard = document.createElement('div');
          gameCard.classList.add('game-card');
          gameCard.setAttribute('data-game-id', gameId);

          const gameImage = gameData.image || '../assets/img/default-image.png';
          const gameVideo = gameData.video || '../assets/vid/default-video.gif';
          const gameDescription = gameData.description || 'Descripción no disponible';
          const gameTitle = gameData.title || 'Juego sin título';

          // Crear los elementos del juego
          gameCard.innerHTML = `
              <div class="media-container">
                  <img src="${gameImage}" alt="${gameTitle}" class="game-image">
                  <video class="game-video" loop muted playsinline preload="metadata">
                      <source src="${gameVideo}" type="video/mp4">
                      Tu navegador no soporta videos HTML5.
                  </video>
              </div>
              <h3>${gameTitle}</h3>
              <p>${gameDescription}</p>
              <div class="catalog-rating">
                  <span class="rating-label">Rating:</span> 
                  <span class="avg-rating-value">?</span> / 5 
                  <span class="rating-count">(? votos)</span>
              </div>
              <a href="../html/gameIn.html?gameId=${gameId}" class="play-button">Jugar Ahora</a> 
          `;
          gamesGrid.appendChild(gameCard);

          const avgRatingSpan = gameCard.querySelector('.catalog-rating .avg-rating-value');
          const countSpan = gameCard.querySelector('.catalog-rating .rating-count');

          if (avgRatingSpan && countSpan) {
              const avgRating = gameData.averageRating || 0;
              const ratingCount = gameData.ratingCount || 0;
              avgRatingSpan.textContent = avgRating.toFixed(1);
              countSpan.textContent = `(${ratingCount} ${ratingCount === 1 ? 'voto' : 'votos'})`;
          }
      });
      document.dispatchEvent(new Event("games-loaded"));

  } catch (error) {
      console.error("Error al cargar los juegos de Firestore:", error.message);
  }
});