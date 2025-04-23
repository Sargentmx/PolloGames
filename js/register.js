document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      return userCredential.user.updateProfile({
        displayName: username
      });
    })
    .then(() => {
      alert("Registro exitoso. Redirigiendo al inicio...");
      window.location.href = "main.html";
    })
    .catch(error => {
      document.getElementById("error").textContent = "Error: " + error.message;
    });
});