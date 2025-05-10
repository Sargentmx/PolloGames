document.addEventListener("DOMContentLoaded", function () {
  const db = firebase.firestore();

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const userId = user.uid;

      // ✅ Verificar y crear el documento del usuario si no existe
      const userDocRef = db.collection("users").doc(userId);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        await userDocRef.set({
          email: user.email,
          username: user.displayName || "Sin nombre",
          uid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      document.getElementById("displayName").textContent = user.displayName || "Sin nombre";
      document.getElementById("email").textContent = user.email;
      document.getElementById("verified").textContent = user.emailVerified ? "Sí" : "No";

      document.getElementById("modifyUsernameBtn").onclick = () => showPasswordModal("name");
      document.getElementById("modifyEmailBtn").onclick = () => showPasswordModal("email");
      document.getElementById("modifyPasswordBtn").onclick = () => showPasswordModal("password");

      function showPasswordModal(action) {
        document.getElementById("passwordModal").style.display = "block";
        document.getElementById("submitPasswordModalBtn").onclick = () => {
          const currentPassword = document.getElementById("passwordModalInput").value.trim();
          if (!currentPassword) {
            alert("Por favor ingresa tu contraseña actual.");
            return;
          }

          const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

          user.reauthenticateWithCredential(credential)
            .then(() => {
              document.getElementById("passwordModal").style.display = "none";
              if (action === "name") showNameModal();
              else if (action === "email") showEmailModal();
              else if (action === "password") showPasswordChangeModal();
            })
            .catch((error) => {
              if (error.code === 'auth/multi-factor-auth-required') {
                handleMultiFactorError(error, () => showPasswordModal(action));
              } else {
                document.getElementById("error").textContent = error.message;
              }
            });
        };

        document.getElementById("cancelPasswordModalBtn").onclick = () => {
          document.getElementById("passwordModal").style.display = "none";
        };
      }

      function handleMultiFactorError(error, onSuccess) {
        const resolver = error.resolver;

        if (!resolver) {
          alert("Error en la verificación en dos pasos.");
          return;
        }

        const phoneInfo = resolver.hints[0];
        const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
        const recaptchaContainer = document.getElementById("recaptcha-container");
        if (!recaptchaContainer) {
          alert("Error: el contenedor de reCAPTCHA no está disponible.");
          return;
        }

        phoneAuthProvider.verifyPhoneNumber(phoneInfo, resolver.session, recaptchaContainer)
          .then((verificationId) => {
            document.getElementById("mfaModal").style.display = "flex";
            document.getElementById("verifyBtn").onclick = () => {
              const code = document.getElementById("codeInput").value.trim();
              if (code.length === 6) {
                const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
                const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);

                resolver.resolveSignIn(multiFactorAssertion)
                  .then(() => {
                    document.getElementById("mfaModal").style.display = "none";
                    onSuccess();
                  })
                  .catch((err) => {
                    document.getElementById("mfaError").textContent = "Error: " + err.message;
                  });
              } else {
                document.getElementById("mfaError").textContent = "El código ingresado no es válido.";
              }
            };
          })
          .catch((err) => {
            alert("Error durante la verificación en dos pasos: " + err.message);
          });
      }

      function showNameModal() {
        document.getElementById("nameModal").style.display = "block";
        document.getElementById("submitNameModalBtn").onclick = async () => {
          const newName = document.getElementById("newNameInput").value.trim();
          if (!newName) {
            alert("El nombre de usuario no puede estar vacío.");
            return;
          }

          try {
            await user.updateProfile({ displayName: newName });
            await db.collection("users").doc(userId).set({ username: newName }, { merge: true });
            alert("Nombre de usuario actualizado");
            document.getElementById("nameModal").style.display = "none";
            document.getElementById("displayName").textContent = newName;
          } catch (error) {
            document.getElementById("error").textContent = error.message;
          }
        };

        document.getElementById("cancelNameModalBtn").onclick = () => {
          document.getElementById("nameModal").style.display = "none";
        };
      }

      function showEmailModal() {
        document.getElementById("emailModal").style.display = "block";
        document.getElementById("submitEmailModalBtn").onclick = async () => {
          const newEmail = document.getElementById("newEmailInput").value.trim();
          if (!newEmail) {
            alert("El correo electrónico no puede estar vacío.");
            return;
          }

          try {
            await user.verifyBeforeUpdateEmail(newEmail);
            await db.collection("users").doc(userId).set({ email: newEmail }, { merge: true });
            alert("Correo actualizado. Se ha enviado un correo de verificación.");
            document.getElementById("emailModal").style.display = "none";
            document.getElementById("email").textContent = newEmail;
          } catch (error) {
            document.getElementById("error").textContent = error.message;
          }
        };

        document.getElementById("cancelEmailModalBtn").onclick = () => {
          document.getElementById("emailModal").style.display = "none";
        };
      }

      function showPasswordChangeModal() {
        document.getElementById("passwordChangeModal").style.display = "block";
        document.getElementById("submitPasswordChangeModalBtn").onclick = async () => {
          const newPassword = document.getElementById("newPasswordInput").value.trim();
          if (!newPassword || newPassword.length < 6) {
            alert("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
          }

          try {
            await user.updatePassword(newPassword);
            alert("Contraseña actualizada");
            document.getElementById("passwordChangeModal").style.display = "none";
          } catch (error) {
            document.getElementById("error").textContent = error.message;
          }
        };

        document.getElementById("cancelPasswordChangeModalBtn").onclick = () => {
          document.getElementById("passwordChangeModal").style.display = "none";
        };
      }

      document.getElementById("logoutBtn").onclick = function () {
        firebase.auth().signOut()
          .then(() => {
            const logoutWindow = window.open("https://accounts.google.com/Logout", "_blank");
            setTimeout(() => {
              if (logoutWindow) logoutWindow.close();
              window.location.href = "login.html";
            }, 1500);
          })
          .catch((error) => {
            document.getElementById("error").textContent = error.message;
          });
      };

      document.getElementById("activate2FABtn").onclick = async () => {
        try {
          if (user.multiFactor.enrolledFactors.length > 0) {
            alert("Ya tienes activada la verificación en dos pasos.");
            return;
          }
          window.location.href = "2fa.html";
        } catch (error) {
          console.error("Error activando verificación en dos pasos:", error);
          alert("Ocurrió un error. Intenta cerrar sesión y volver a entrar.");
        }
      };
    } else {
      window.location.href = "login.html";
    }
  });
});
