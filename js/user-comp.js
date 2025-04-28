window.onload = function () {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        window.location.href = "login.html";
      }
    });
  };