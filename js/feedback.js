document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore(); // usar firebase-compat

    function getGameIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('gameId');
    }

    const starsContainer = document.querySelector('.rating-stars');
    const stars = starsContainer?.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating-value');
    const commentInput = document.getElementById('comment-input');
    const sendButton = document.getElementById('send-feedback-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    const currentGameId = getGameIdFromUrl();
    let currentRating = 0;

    function moderateComment(commentText) {
        const badWords = ["malo", "tonto", "estúpido", "idiota", "imbécil", "mierda", "pendejo", "gilipollas"];  
        const lowerText = commentText.toLowerCase(); 
        const containsBadWord = badWords.some(word => lowerText.includes(word));

        return containsBadWord;
    }

    if (!starsContainer || !stars || !ratingInput || !commentInput || !sendButton || !feedbackMessage) {
        console.warn("Faltan elementos de feedback.");
        return;
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-value'));
            ratingInput.value = currentRating;
            stars.forEach(s => {
                s.classList.toggle('selected', parseInt(s.getAttribute('data-value')) <= currentRating);
            });
        });
        star.addEventListener('mouseover', () => {
            const hoverValue = parseInt(star.getAttribute('data-value'));
            stars.forEach(s => {
                s.style.color = parseInt(s.getAttribute('data-value')) <= hoverValue ? '#FFD700' : '#ccc';
            });
        });
    });

    starsContainer.addEventListener('mouseleave', () => {
        stars.forEach(s => {
            s.style.color = s.classList.contains('selected') ? '#FFC107' : '#ccc';
        });
    });

    sendButton.addEventListener('click', async () => {
        const commentText = commentInput.value.trim();
        const ratingValue = parseInt(ratingInput.value);

        if (moderateComment(commentText)) {
            feedbackMessage.textContent = 'El uso de malas palabras está prohibido.';
            feedbackMessage.className = 'error';
            return;
        }

        if (ratingValue === 0 || commentText === '' || !currentGameId) {
            feedbackMessage.textContent = 'Por favor, completa la calificación y el comentario.';
            feedbackMessage.className = 'error';
            return;
        }

        const feedbackData = {
            rating: ratingValue,
            comment: commentText,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        feedbackMessage.textContent = 'Enviando...';
        feedbackMessage.className = '';
        sendButton.disabled = true;

        try {
            const gameRatingsRef = db.collection("games").doc(currentGameId).collection("ratings");
            await gameRatingsRef.add(feedbackData);
            const gameDocRef = db.collection("games").doc(currentGameId);

            await db.runTransaction(async (transaction) => {
                const gameDoc = await transaction.get(gameDocRef);
                let currentAvg = 0;
                let currentCount = 0;

                if (gameDoc.exists) {
                    const data = gameDoc.data();
                    currentAvg = data.averageRating || 0;
                    currentCount = data.ratingCount || 0;
                }

                const newCount = currentCount + 1;
                const newSum = (currentAvg * currentCount) + ratingValue;
                const newAverage = newSum / newCount;

                transaction.set(gameDocRef, {
                    averageRating: newAverage,
                    ratingCount: newCount
                }, { merge: true });
            });

            feedbackMessage.textContent = '¡Gracias por tu comentario!';
            feedbackMessage.className = 'success';
            commentInput.value = '';
            ratingInput.value = '0';
            currentRating = 0;
            stars.forEach(s => s.classList.remove('selected'));
            stars.forEach(s => s.style.color = '#ccc');
        } catch (error) {
            console.error("Error al guardar feedback:", error);
            feedbackMessage.textContent = 'Error al enviar. Inténtalo de nuevo.';
            feedbackMessage.className = 'error';
        } finally {
            sendButton.disabled = false;
        }
    });
});