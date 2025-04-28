const db = firebase.firestore();

db.collection("games").orderBy("createdAt", "desc").get()
  .then(querySnapshot => {
    const gamesContainer = document.getElementById("gamesContainer");
    querySnapshot.forEach(doc => {
      const game = doc.data();
      const card = `
        <div class="game-card">
          <h3>${game.title}</h3>
          <p>${game.description}</p>
          <a href="${game.fileURL}" target="_blank">Jugar</a>
        </div>
      `;
      gamesContainer.innerHTML += card;
    });
  })
  .catch(error => {
    console.error("Error al cargar los juegos: ", error);
  });