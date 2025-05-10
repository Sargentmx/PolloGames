function loadDomGames() {
    const gameCards = document.querySelectorAll('.game-card');
    const extractedData = [];

    gameCards.forEach(card => {
        const titleElement = card.querySelector('h3');
        const linkElement = card.querySelector('.play-button');
        const gameId = card.dataset.gameId;

        if (titleElement && linkElement && linkElement.href && gameId) {
            extractedData.push({
                title: titleElement.textContent.trim(),
                url: linkElement.href,
                gameId: gameId
            });
        }
    });

    console.log("🎮 Juegos cargados desde el DOM:", extractedData);
    return extractedData;
}

document.addEventListener('games-loaded', () => {
    gamesData = loadDomGames();

    if (gamesData.length === 0) {
        console.warn("⚠️ No se encontraron juegos cargados para búsqueda.");
    }

    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    if (searchInput && suggestionsContainer) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            suggestionsContainer.innerHTML = '';

            if (query.length === 0) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const filteredGames = gamesData.filter(game =>
                game.title.toLowerCase().includes(query)
            );

            if (filteredGames.length > 0) {
                filteredGames.forEach(game => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = game.title;
                    suggestionItem.addEventListener('click', () => {
                        window.location.href = game.url;
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        document.addEventListener('click', function (event) {
            if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });

        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const query = this.value.toLowerCase();
                const matchedGame = gamesData.find(game =>
                    game.title.toLowerCase().includes(query)
                );

                if (matchedGame) {
                    window.location.href = matchedGame.url;
                }
            }
        });
    } else {
        console.warn("❌ No se encontraron los elementos de búsqueda (#searchInput o #suggestionsContainer)");
    }
});