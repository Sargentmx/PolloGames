document.getElementById("resetForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Correo de recuperación enviado.");
      window.location.href = "login.html";
    })
    .catch(error => {
      document.getElementById("error").textContent = "Error: " + error.message;
    });
});