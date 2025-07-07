document.addEventListener('DOMContentLoaded', function() {
  const radios = document.getElementsByName('eggs');
  const eggsContainer = document.querySelector('.eggs');
  const eggs = document.querySelectorAll('.egg');
  const radioInputs = document.querySelectorAll('.egg input');
  const visibleCount = 3;
  let currentIndex = 0;
  
  // Message listener for parent page communication
  window.addEventListener('message', (event) => {
    switch(event.data.action) {
      case 'up':    // Treat up as left arrow
      case 'left':  // (keep existing left functionality)
        if (currentIndex > 0) {
          currentIndex--;
          radioInputs[currentIndex].checked = true;
          updateSelection();
        }
        break;
        
      case 'down':  // Treat down as right arrow
      case 'right': // (keep existing right functionality)
        if (currentIndex < eggs.length - 1) {
          currentIndex++;
          radioInputs[currentIndex].checked = true;
          updateSelection();
        }
        break;
        
case 'select':
    console.log('Select pressed - current selection:', radioInputs[currentIndex].value);
    if (radios[currentIndex].id === 'botamonEgg') {
        // Save only the egg type to localStorage
        window.parent.postMessage({ eggType: 'fire' }, '*');
        localStorage.setItem('selectedEggType', 'fire');
        localStorage.setItem('monSpecies', 'Botamon');
        localStorage.setItem('monLevel', '1 (Fresh)');
        window.location.href = 'hatch.html';
    }
    break;
    }
  });

  // Initialize selection
  updateSelection();
  
  // Handle radio button changes (clicking directly on eggs)
  radioInputs.forEach((input, index) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        currentIndex = index;
        updateSelection();
      }
    });
  });
  
  // Keyboard arrow navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      // Will be handled by the message listener's 'down' case
      window.postMessage({ action: 'down' }, '*');
    } else if (e.key === 'ArrowLeft') {
      // Will be handled by the message listener's 'up' case
      window.postMessage({ action: 'up' }, '*');
    }
  });
  
function updateSelection() {
  // Check if mobile view (matches your media query)
  const isMobile = window.matchMedia('(max-width: 599px)').matches;
  
  // Calculate width based on viewport
  const eggWidth = isMobile 
    ? eggs[0].offsetWidth + (window.innerWidth * 0.2) // 20vw gap
    : eggs[0].offsetWidth + 120; // Fixed 120px gap for desktop
  
  let scrollPosition;
  
  if (currentIndex === 0) {
    scrollPosition = 0;
  } else if (currentIndex === eggs.length - 1) {
    scrollPosition = (eggs.length - visibleCount) * eggWidth;
  } else {
    scrollPosition = (currentIndex - 1) * eggWidth;
  }
  
  eggsContainer.style.transform = `translateX(-${scrollPosition}px)`;
}
});