document.addEventListener('DOMContentLoaded', function() {

  const audio = new Audio('assets/audio/hatch.mp3');
  
  // Try to play immediately (will work if parent had interaction)
  audio.play().catch(error => {
    console.log("Autoplay blocked:", error);
    // Fallback: Show a mute/unmute button
  });

  // Show prompt after 10 seconds
  setTimeout(function() {
    const monName = prompt("Name your MON:");
    
    if (monName) { // Only proceed if user entered something
      // Save to localStorage
      localStorage.setItem('monName', monName);
      
      // Update all .mon-name elements
      updateMonNameElements(monName);
    }
  }, 9500);

  // Check for existing name on page load
  const savedName = localStorage.getItem('monName');
  if (savedName) {
    updateMonNameElements(savedName);
  }

  // Function to update all .mon-name elements
  function updateMonNameElements(name) {
    const nameElements = document.querySelectorAll('.mon-name');
    nameElements.forEach(element => {
      element.textContent = name;
    });
  }
});