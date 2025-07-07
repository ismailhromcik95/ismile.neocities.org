document.addEventListener('DOMContentLoaded', function() {

  const savedName = localStorage.getItem('monName');
  if (savedName) {
    updateMonNameElements(savedName);
  }

  function updateMonNameElements(name) {
    const nameElements = document.querySelectorAll('.mon-name');
    nameElements.forEach(element => {
      element.textContent = name;
    });
  }

  const savedType = localStorage.getItem('selectedEggType');
  if (savedType) {
    updateMonTypeElements(savedType);
  }

  function updateMonTypeElements(type) {
    const typeElements = document.querySelectorAll('.mon-type');
    typeElements.forEach(element => {
      element.textContent = type;
    });
  }

  const savedFamily = localStorage.getItem('monFamily');
  if (savedFamily) {
    updateMonFamilyElements(savedFamily);
  }

  function updateMonFamilyElements(family) {
    const familyElements = document.querySelectorAll('.mon-family');
    familyElements.forEach(element => {
      element.textContent = family;
    });
  }

  const savedSpecies = localStorage.getItem('monSpecies');
  if (savedSpecies) {
    updateMonSpeciesElements(savedSpecies);
  }

  function updateMonSpeciesElements(species) {
    const speciesElements = document.querySelectorAll('.mon-species');
    speciesElements.forEach(element => {
      element.textContent = species;
    });
  }

  const savedLevel = localStorage.getItem('monLevel');
  if (savedLevel) {
    updateMonLevelElements(savedLevel);
  }

  function updateMonLevelElements(level) {
    const levelElements = document.querySelectorAll('.mon-level');
    levelElements.forEach(element => {
      element.textContent = level;
    });
  }

    const savedAge = localStorage.getItem('monAge');
  if (savedAge) {
    updateMonAgeElements(savedAge);
  }

  function updateMonAgeElements(age) {
    const ageElements = document.querySelectorAll('.mon-age');
    ageElements.forEach(element => {
      element.textContent = age;
    });
  }

    // Initialize poop system
     const poopContainer = document.querySelector('.poop-cont');
    const maxPoops = 6;
    const poopInterval = 20 * 1000; // 20 seconds for active pooping
    const backgroundPoopInterval = 4 * 60 * 60 * 1000; // 4 hours in ms
    let poopTimers = [];
    
    // Load saved data
    const savedPoops = parseInt(localStorage.getItem('poopCount')) || 0;
    const lastCleanTime = localStorage.getItem('lastCleanTime') || Date.now();
    const lastPoopTime = localStorage.getItem('lastPoopTime') || Date.now();
    
    // Calculate background poops (while page was closed)
    const currentTime = Date.now();
    const timeSinceLastPoop = currentTime - parseInt(lastPoopTime);
    const backgroundPoops = Math.min(
        Math.floor(timeSinceLastPoop / backgroundPoopInterval),
        maxPoops - savedPoops
    );
    
    // Create initial poops (saved + background)
    for (let i = 0; i < savedPoops + backgroundPoops; i++) {
        if (getPoopCount() >= maxPoops) break;
        createPoopElement();
    }
    
    // Start active pooping if under max
    if (getPoopCount() < maxPoops) {
        // First active poop
        const timeSinceLastActivePoop = currentTime - parseInt(lastPoopTime);
        const nextPoopDelay = Math.max(poopInterval - timeSinceLastActivePoop, 0);
        
        poopTimers.push(setTimeout(() => {
            if (getPoopCount() < maxPoops) {
                createPoopElement();
            }
            startRegularPoops();
        }, nextPoopDelay));
    }
    
    function startRegularPoops() {
        if (getPoopCount() < maxPoops) {
            poopTimers.push(setInterval(() => {
                if (getPoopCount() >= maxPoops) {
                    clearAllPoopTimers();
                } else {
                    createPoopElement();
                }
            }, poopInterval));
        }
    }
    
    function createPoopElement() {
        if (getPoopCount() >= maxPoops) return;
        
        const poop = document.createElement('div');
        poop.className = 'poop';
        poopContainer.appendChild(poop);
        savePoopState();
    }
    
    function getPoopCount() {
        return document.querySelectorAll('.poop-cont .poop').length;
    }
    
    function savePoopState() {
        localStorage.setItem('poopCount', getPoopCount());
        localStorage.setItem('lastPoopTime', Date.now());
    }
    
    function clearAllPoopTimers() {
        poopTimers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        poopTimers = [];
    }
    
    window.addEventListener('beforeunload', clearAllPoopTimers);

  window.addEventListener('message', (event) => {
    const radios = document.getElementsByName('mon-ui');
    const currentIndex = Array.from(radios).findIndex(radio => radio.checked);
    
    switch(event.data.action) {
      case 'up':
        const previousIndex = (currentIndex - 1 + radios.length) % radios.length;
        radios[previousIndex].checked = true;
        break;

      case 'down':
        const nextIndex = (currentIndex + 1) % radios.length;
        radios[nextIndex].checked = true;
        break;
        
case 'select':
    console.log('Select pressed - current selection:', radios[currentIndex].value);
    
    // First check if info panel is open
    const infoPanel = document.querySelector('.info-cont');
    if (infoPanel && !infoPanel.classList.contains('hidden')) {
        // If info panel is visible, close it and exit
        infoPanel.classList.add('hidden');
        break;
    }
    
    // Otherwise handle normal select actions
    if (radios[currentIndex].id === 'UIdelete') {
        if (confirm("Are you sure you want to delete your MON?\nWarning: The MON will die!")) {
            localStorage.clear();
            window.parent.postMessage({ type: 'refresh' }, '*');
        }
    }
    else if (radios[currentIndex].id === 'UIsave') {
        exportMonData();
    }
    else if (radios[currentIndex].id === 'UIrename') {
        const currentName = localStorage.getItem('monName') || "Your MON";
        const newName = prompt("Rename your MON:", currentName);
        
        if (newName !== null) {
            localStorage.setItem('monName', newName);
            window.parent.postMessage({ 
                type: 'monRenamed', 
                name: newName 
            }, '*');
        }
        window.location.reload();
    }
    else if (radios[currentIndex].id === 'UIinfo') {
        const infoPanel = document.querySelector('.info-cont');
        if (infoPanel) {
            infoPanel.classList.remove('hidden');
        }
    }
else if (radios[currentIndex].id === 'UIclean') {
    const poopClean = document.querySelector('.poop-clean');
    const poopCont = document.querySelector('.poop-cont');
    
    if (poopClean && poopCont) {
        // Show cleaning interface
        poopClean.classList.remove('hidden');
        
        // Animate poop container out
        poopCont.style.transition = 'transform 0.5s ease-in-out';
        poopCont.style.transform = 'translateX(100%)';
        
        // After animation completes
        setTimeout(() => {
            // Remove all poop elements
            const poops = document.querySelectorAll('.poop-cont .poop');
            poops.forEach(poop => poop.remove());
            
            // Clear storage
            localStorage.removeItem('poopCount');
            
            // Reset container position (hidden during reset)
            poopCont.style.transition = 'none';
            poopCont.style.transform = 'translateX(-100%)';
            
            // Animate back in
            setTimeout(() => {
                poopCont.style.transition = 'transform 0.5s ease-in-out';
                poopCont.style.transform = 'translateX(0)';
                
                // Hide cleaning interface after completion
                setTimeout(() => {
                    poopClean.classList.add('hidden');
                }, 500);
            }, 50);
            
            // Reset poop timers
            clearAllPoopTimers();
            localStorage.setItem('lastCleanTime', Date.now());
            
        }, 500); // Matches CSS transition duration
    }
}
    break;
}

// Add this function to your code
function exportMonData() {
    // Gather all relevant data from localStorage
    const monData = {
        name: localStorage.getItem('monName'),
        species: localStorage.getItem('monSpecies'),
        family: localStorage.getItem('monFamily'),
        type: localStorage.getItem('selectedEggType'),
        level: localStorage.getItem('monLevel'),
        age: localStorage.getItem('monAge'),
        hatch_date: localStorage.getItem('hatchTimestamp'),
        save_date: new Date().toISOString()
    };

    // Convert to JSON string
    const dataStr = JSON.stringify(monData, null, 2);
    
    // Create download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mon_save_${new Date().getTime()}.json`; // Unique filename
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Optional: Show confirmation
    alert("MON data saved to file!");
}
  });

  const monElement = document.querySelector('.mon');
  const movementInterval = 1000;
  const movementDuration = 1000;
  const baseJump = 30;
  let isAnimating = false;

  function startRandomMovement() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Random number of movements (3-5)
    const totalMovements = 3 + Math.floor(Math.random() * 3);
    let movementsCompleted = 0;
    let currentPosition = 0;
    
    function performMovement() {
      if (movementsCompleted >= totalMovements) {
        // Snap back to center
        monElement.style.transform = 'translateX(0)';
        setTimeout(() => {
          isAnimating = false;
        }, movementDuration);
        return;
      }
      
      // Random movement (multiples of 15px in either direction)
      const randomMultiplier = Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
      const movement = baseJump * randomMultiplier;
      currentPosition += movement;
      
      // Apply movement
      monElement.style.transition = `transform ${movementDuration}ms steps(1)`;
      monElement.style.transform = `translateX(${currentPosition}px)`;
      
      // Next movement
      setTimeout(() => {
        movementsCompleted++;
        performMovement();
      }, movementDuration);
    }
    
    performMovement();
  }
  
  // Start first movement after delay
  setTimeout(startRandomMovement, movementInterval);
  
  // Set up recurring movements
  setInterval(startRandomMovement, movementInterval + (movementDuration * 6));
});
