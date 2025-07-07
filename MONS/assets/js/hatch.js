document.addEventListener('DOMContentLoaded', function() {
  const audio = new Audio('assets/audio/hatch.mp3');
  
  audio.play().catch(error => {
    console.log("Autoplay blocked:", error);
  });

  // Show prompt after 10 seconds
  setTimeout(function() {
    const monName = prompt("Name your MON:");
    
    if (monName) {
      // Save to localStorage
      localStorage.setItem('monName', monName);
      
      // Save hatching timestamp (current time in ISO format)
      const hatchTime = new Date().toISOString();
      localStorage.setItem('hatchTimestamp', hatchTime);
      localStorage.setItem('monAge', '1 day');
      localStorage.setItem('monHunger', '1');

      updateMonNameElements(monName);
      window.location.href = 'mon.html';
    }
  }, 9500);

  // Check for existing data on page load
  const savedName = localStorage.getItem('monName');
  if (savedName) {
    updateMonNameElements(savedName);
    updateMonAge(); // Calculate and update age
  }

  // Function to update all .mon-name elements
  function updateMonNameElements(name) {
    const nameElements = document.querySelectorAll('.mon-name');
    nameElements.forEach(element => {
      element.textContent = name;
    });
  }

  // Function to calculate and update age
  function updateMonAge() {
    const hatchTime = localStorage.getItem('hatchTimestamp');
    if (!hatchTime) return;
    
    const hatchDate = new Date(hatchTime);
    const currentDate = new Date();
    
    // Calculate difference in days
    const timeDiff = currentDate - hatchDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 because first day is day 1
    
    // Update age in localStorage and UI
    const ageText = daysDiff === 1 ? '1 day' : `${daysDiff} days`;
    localStorage.setItem('monAge', ageText);
    
    // Update age display if element exists
    const ageElements = document.querySelectorAll('.mon-age');
    if (ageElements.length) {
      ageElements.forEach(el => el.textContent = ageText);
    }
  }

  // Update age every hour (in case page stays open)
  setInterval(updateMonAge, 3600000); // 3600000ms = 1 hour
});
