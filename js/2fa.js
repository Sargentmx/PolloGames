let confirmationResult;

document.getElementById('activate2FABtn').onclick = function() {
  showPhoneModal();
};

document.getElementById('sendCodeBtn').onclick = function() {
  sendCodeSMS();
};

document.getElementById('confirmCodeBtn').onclick = function() {
  confirmSMSCode();
};

document.getElementById('cancelPhoneModalBtn').onclick = function() {
  closePhoneModal();
};

document.getElementById('cancelVerificationModalBtn').onclick = function() {
  closeVerificationModal();
};

function showPhoneModal() {
  document.getElementById('phoneModal').style.display = 'block';

  // Inicializar el reCAPTCHA en el modal
  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'normal',
    callback: function(response) {
      console.log('reCAPTCHA resuelto');
    },
    'expired-callback': function() {
      alert("reCAPTCHA expirado. Recarga la página.");
    }
  });
}

function sendCodeSMS() {
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  if (!phoneNumber) {
    alert("Por favor, ingresa tu número de teléfono.");
    return;
  }

  const user = firebase.auth().currentUser;

  // Asegurarse de que el appVerifier se esté pasando correctamente
  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'normal',
    callback: function(response) {
      console.log('reCAPTCHA resuelto');
    },
    'expired-callback': function() {
      alert("reCAPTCHA expirado. Recarga la página.");
    }
  });

  user.multiFactor.getSession()
    .then((multiFactorSession) => {
      const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
      return phoneAuthProvider.verifyPhoneNumber({
        phoneNumber: phoneNumber,
        session: multiFactorSession
      }, appVerifier);
    })
    .then((verificationId) => {
      confirmationResult = verificationId;
      closePhoneModal();
      showVerificationModal();
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("error").textContent = error.message;
    });
}

function confirmSMSCode() {
  const code = document.getElementById('codigo').value.trim();
  if (!code) {
    alert("Debes ingresar el código.");
    return;
  }

  const credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult, code);
  const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);

  const user = firebase.auth().currentUser;

  user.multiFactor.enroll(multiFactorAssertion, 'Teléfono')
    .then(() => {
      alert('Verificación en dos pasos activada correctamente.');
      window.location.href = "user.html";
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("error").textContent = error.message;
    });
}

function showVerificationModal() {
  document.getElementById('verificationModal').style.display = 'block';
}

function closePhoneModal() {
  document.getElementById('phoneModal').style.display = 'none';
}

function closeVerificationModal() {
  document.getElementById('verificationModal').style.display = 'none';
}
