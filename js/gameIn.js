document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore(); // Usamos firebase-compat

    // Obtener el ID del juego desde la URL
    function getGameIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('gameId');
    }

    const currentGameId = getGameIdFromUrl();
    if (!currentGameId) {
        console.error("No se ha proporcionado un ID de juego en la URL.");
        return;
    }

    try {
        // Obtener los datos del juego desde Firestore
        const gameDoc = await db.collection('games').doc(currentGameId).get();

        if (!gameDoc.exists) {
            console.error("Juego no encontrado.");
            return;
        }

        const gameData = gameDoc.data();
        const gameTitle = gameData.title || 'Juego sin título';  // Usamos 'title'
        const gameDescription = gameData.description || 'Descripción no disponible'; // Usamos 'description'
        const gameUrl = gameData.gameUrl || '';  // URL del juego (Itch.io)

        // Mostrar el título y la descripción del juego en la página
        document.getElementById('game-title').textContent = gameTitle;
        document.getElementById('game-description').textContent = gameDescription;

        // Insertar el iframe del juego Itch.io en el contenedor
        const iframe = document.getElementById('game-iframe');
        iframe.src = gameUrl;  // Cargar la URL del juego desde la base de datos
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.frameBorder = "0";
        iframe.allowfullscreen = true;

        // Mostrar la sección de comentarios cuando el juego termine
        document.getElementById('end-game-btn').addEventListener('click', () => {
            // Mostrar la sección de comentarios
            document.getElementById('feedback-section').style.display = 'block';
        });

        // Cerrar la sección de comentarios
        document.getElementById('close-feedback-btn').addEventListener('click', () => {
            document.getElementById('feedback-section').style.display = 'none'; // Ocultar los comentarios
        });

    } catch (error) {
        console.error("Error al cargar los datos del juego:", error);
    }
});
