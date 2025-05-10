// --- Inicio: Código Corregido para Matrix Effect ---


document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('matrixcanvas'); 


  if (!canvas) {
      console.error("Error: No se encontró el elemento canvas con id 'matrixcanvas'.");
      return; 
  }

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize); 
      
      drops = Array(columns).fill(1);
  }

  // Configuración inicial
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTVWXYZアァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフム'; 
  const fontSize = 16;
  let columns; 
  let drops;   

  
  resizeCanvas();

  function drawMatrix() {
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Color y fuente de los caracteres
      ctx.fillStyle = '#00eaff'; 
      ctx.font = `${fontSize}px monospace`;

      
      drops.forEach((y, index) => {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = index * fontSize;
          ctx.fillText(text, x, y * fontSize);

          // Si la gota llega al final que se reinicie en la parte de arriba random
          if (y * fontSize > canvas.height && Math.random() > 0.975) {
              drops[index] = 0;
          }
          // Mueve la gota hacia abajo
          drops[index]++;
      });
  }

  
  setInterval(drawMatrix, 60); // Intervalo de 50ms

  // Añade un listener para redimensionar el canvas si cambia el tamaño de la ventana
  window.addEventListener('resize', resizeCanvas);

  console.log('Matrix effect inicializado.'); // Mensaje de confirmación
});

// --- Fin: Código Corregido para Matrix Effect ---