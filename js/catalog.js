document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore(); // Usamos firebase-compat
  
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
  
        const gameCard = document.querySelector(`.game-card[data-game-id="${gameId}"]`);
        if (!gameCard) {
          console.warn(`No se encontró la tarjeta HTML para el juego ID: ${gameId}`);
          return;
        }
  
        const avgRatingSpan = gameCard.querySelector('.catalog-rating .avg-rating-value');
        const countSpan = gameCard.querySelector('.catalog-rating .rating-count');
  
        if (avgRatingSpan && countSpan) {
          const avgRating = gameData.averageRating || 0;
          const ratingCount = gameData.ratingCount || 0;
  
          avgRatingSpan.textContent = avgRating.toFixed(1);
          countSpan.textContent = `(${ratingCount} ${ratingCount === 1 ? 'voto' : 'votos'})`;
        } else {
          console.warn(`No se encontraron los spans de rating para el juego ${gameId}`);
        }
      });
  
    } catch (error) {
      console.error("Error al cargar ratings de juegos:", error.message);
    }
  });
  