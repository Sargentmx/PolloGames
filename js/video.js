// video.js

document.addEventListener('DOMContentLoaded', () => {

  const gameCards = document.querySelectorAll('.game-card');

  gameCards.forEach(card => {
      const mediaContainer = card.querySelector('.media-container');
      const video = card.querySelector('.game-video');

      if (mediaContainer && video) {
          
          // No necesitamos 'isVideoReady' si usamos play().catch()
          
           // Asegurar que el video intente cargarse un poco
          video.load(); 

          mediaContainer.addEventListener('mouseenter', () => {
              // --- LEER EL ID DE LA TARJETA ---
              const cardId = card.id; 
              console.log(`Mouse entró en la tarjeta con ID: ${cardId}`); // Muestra el ID en la consola

              // Intentar reproducir el video específico de ESTA tarjeta
              video.play().catch(error => {
                  console.error(`Error al reproducir video en ${cardId}:`, error);
              });
          });

          mediaContainer.addEventListener('mouseleave', () => {
               // --- LEER EL ID DE LA TARJETA ---
               const cardId = card.id; 
               console.log(`Mouse salió de la tarjeta con ID: ${cardId}`); // Muestra el ID en la consola

              // Pausar y reiniciar el video específico de ESTA tarjeta
              video.pause();
              video.currentTime = 0; 
          });
      } 
  });
});
