document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const googleButton = document.getElementById("googleRegister");
  const errorElement = document.getElementById("error");

  const db = firebase.firestore();

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorElement.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const username = document.getElementById("username").value.trim();

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!correoRegex.test(email)) {
        alert("El formato del correo no es válido.");
        return;
      }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName: username });
      await user.sendEmailVerification();

      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        username: username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Te hemos enviado un correo de verificación. Verifica tu cuenta antes de iniciar sesión.");
      await firebase.auth().signOut();
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error en registro:", error.message);
      errorElement.textContent = "Error: " + error.message;
    }
  });

  googleButton.addEventListener("click", async () => {
    errorElement.textContent = "";

    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      if (result.additionalUserInfo.isNewUser) {
        await db.collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          username: user.displayName || "Usuario Google",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      window.location.href = "main.html";
    } catch (error) {
      console.error("Error con Google:", error.message);
      errorElement.textContent = "Error: " + error.message;
    }
  });
});
