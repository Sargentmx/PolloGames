document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      window.location.href = "main.html";
    })
    .catch(error => {
      document.getElementById("error").textContent = "Error: " + error.message;
    });
});