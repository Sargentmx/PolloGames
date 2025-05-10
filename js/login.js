document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const googleButton = document.getElementById("googleLogin");
  const errorEl = document.getElementById("error");

  const mfaModal = document.getElementById("mfaModal");
  const codeInput = document.getElementById("codeInput");
  const verifyBtn = document.getElementById("verifyBtn");
  const mfaError = document.getElementById("mfaError");

  let currentResolver = null;
  let verificationId = null;

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  async function handleMultiFactorAuth(resolver) {
    currentResolver = resolver;
    const phoneInfoOptions = {
      multiFactorHint: resolver.hints[0],
      session: resolver.session
    };

    const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
    try {
      verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      mfaModal.style.display = "flex"; // Mostrar modal
    } catch (err) {
      errorEl.textContent = "Error al enviar código SMS: " + err.message;
    }
  }

  verifyBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) {
      mfaError.textContent = "Ingresa el código.";
      return;
    }

    try {
      const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
      const userCredential = await currentResolver.resolveSignIn(multiFactorAssertion);

      window.location.href = "main.html";
    } catch (err) {
      mfaError.textContent = "Código inválido: " + err.message;
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await user.sendEmailVerification();
        errorEl.textContent = "Por favor verifica tu correo antes de continuar.";
        await firebase.auth().signOut();
        return;
      }

      window.location.href = "main.html";

    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        handleMultiFactorAuth(error.resolver);
      } else {
        console.error(error);
        errorEl.textContent = "Error: " + error.message;
      }
    }
  });

  googleButton.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      window.location.href = "main.html";

    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        handleMultiFactorAuth(error.resolver);
      } else {
        console.error(error);
        errorEl.textContent = "Error con Google: " + error.message;
      }
    }
  });
});
