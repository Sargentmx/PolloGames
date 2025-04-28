document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const googleButton = document.getElementById("googleLogin");
  const errorEl = document.getElementById("error");

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        if (!user.emailVerified) {
          await user.sendEmailVerification();
          errorEl.textContent = "Por favor verifica tu correo antes de continuar. Revisa tu bandeja de entrada.";
          firebase.auth().signOut();
          return;
        }

        if (user.multiFactor.enrolledFactors.length > 0) {
          const mfaResolver = firebase.auth().getMultiFactorResolver(null, userCredential);
          const phoneInfoOptions = {
            multiFactorHint: mfaResolver.hints[0],
            session: mfaResolver.session
          };

          const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
          phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier)
            .then((verificationId) => {
              const code = prompt("Código SMS:");
              const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
              const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
              return mfaResolver.resolveSignIn(multiFactorAssertion);
            })
            .then(() => {
              window.location.href = "main.html";
            })
            .catch((error) => {
              console.error(error);
              errorEl.textContent = "Error en la verificación de dos pasos: " + error.message;
            });
        } else {
          window.location.href = "main.html";
        }
      })
      .catch((error) => {
        console.error(error);
        errorEl.textContent = "Error: " + error.message;
      });
  });

  googleButton.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        window.location.href = "main.html";
      })
      .catch((error) => {
        errorEl.textContent = "Error con Google: " + error.message;
      });
  });
});