document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      // Mostrar datos actuales del usuario
      document.getElementById("displayName").textContent = user.displayName || "Sin nombre";
      document.getElementById("email").textContent = user.email;
      document.getElementById("verified").textContent = user.emailVerified ? "Sí" : "No";

      // Modificar nombre de usuario
      document.getElementById("modifyUsernameBtn").onclick = function() {
        showPasswordModal("name");
      };

      // Modificar correo electrónico
      document.getElementById("modifyEmailBtn").onclick = function() {
        showPasswordModal("email");
      };

      // Modificar la contraseña
      document.getElementById("modifyPasswordBtn").onclick = function() {
        showPasswordModal("password");
      };

      // Función para mostrar el modal de contraseña
      function showPasswordModal(action) {
        document.getElementById("passwordModal").style.display = "block";
        document.getElementById("submitPasswordModalBtn").onclick = function() {
          const currentPassword = document.getElementById("passwordModalInput").value.trim();
          if (currentPassword === "") {
            alert("Por favor ingresa tu contraseña actual.");
            return;
          }

          const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

          user.reauthenticateWithCredential(credential)
            .then(function() {
              document.getElementById("passwordModal").style.display = "none";
              if (action === "name") {
                showNameModal();
              } else if (action === "email") {
                showEmailModal();
              } else if (action === "password") {
                showPasswordChangeModal();
              }
            })
            .catch(function(error) {
              document.getElementById("error").textContent = error.message;
            });
        };

        document.getElementById("cancelPasswordModalBtn").onclick = function() {
          document.getElementById("passwordModal").style.display = "none";
        };
      }

      // Función para mostrar el modal de nuevo nombre
      function showNameModal() {
        document.getElementById("nameModal").style.display = "block";
        document.getElementById("submitNameModalBtn").onclick = function() {
          const newName = document.getElementById("newNameInput").value.trim();
          if (newName === "") {
            alert("El nombre de usuario no puede estar vacío.");
            return;
          }
          user.updateProfile({ displayName: newName })
            .then(function() {
              alert("Nombre de usuario actualizado");
              document.getElementById("nameModal").style.display = "none";
            })
            .catch(function(error) {
              document.getElementById("error").textContent = error.message;
            });
        };

        document.getElementById("cancelNameModalBtn").onclick = function() {
          document.getElementById("nameModal").style.display = "none";
        };
      }

      // Función para mostrar el modal de nuevo correo electrónico
      function showEmailModal() {
        document.getElementById("emailModal").style.display = "block";
        document.getElementById("submitEmailModalBtn").onclick = function() {
          const newEmail = document.getElementById("newEmailInput").value.trim();
          if (newEmail === "") {
            alert("El correo electrónico no puede estar vacío.");
            return;
          }
          user.verifyBeforeUpdateEmail(newEmail)
            .then(function() {
              alert("Correo actualizado. Se ha enviado un correo de verificación.");
              document.getElementById("emailModal").style.display = "none";
            })
            .catch(function(error) {
              document.getElementById("error").textContent = error.message;
            });
        };

        document.getElementById("cancelEmailModalBtn").onclick = function() {
          document.getElementById("emailModal").style.display = "none";
        };
      }

      // Función para mostrar el modal de nueva contraseña
      function showPasswordChangeModal() {
        document.getElementById("passwordChangeModal").style.display = "block";
        document.getElementById("submitPasswordChangeModalBtn").onclick = function() {
          const newPassword = document.getElementById("newPasswordInput").value.trim();
          if (newPassword === "" || newPassword.length < 6) {
            alert("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
          }
          user.updatePassword(newPassword)
            .then(function() {
              alert("Contraseña actualizada");
              document.getElementById("passwordChangeModal").style.display = "none";
            })
            .catch(function(error) {
              document.getElementById("error").textContent = error.message;
            });
        };

        document.getElementById("cancelPasswordChangeModalBtn").onclick = function() {
          document.getElementById("passwordChangeModal").style.display = "none";
        };
      }

      // Cerrar sesión
      document.getElementById("logoutBtn").onclick = function() {
        firebase.auth().signOut()
          .then(() => window.location.href = "login.html")
          .catch(error => document.getElementById("error").textContent = error.message);
      };

      // Activar verificación en dos pasos
      document.getElementById("activate2FABtn").onclick = async function() {
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
      // Redirigir al login si el usuario no está autenticado
      window.location.href = "login.html";
    }
  });
});