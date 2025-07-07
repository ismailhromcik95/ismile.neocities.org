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

    // Check for existing poops on load
    if (getPoopCount() > 0) {
        setTimeout(() => {
            alert("Your MON made a mess!\nPlease clean it up.");
        }, 1000); // 1 second delay after page loads
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

function initializeHunger() {
    // Debug logs
    console.log('Original lastFedTime:', localStorage.getItem('lastFedTime'));
    console.log('Original hatchTimestamp:', localStorage.getItem('hatchTimestamp'));

    // 1. Get lastFedTime with proper fallback logic
    let lastFedTime = localStorage.getItem('lastFedTime');
    
    // If lastFedTime is invalid, use hatchTimestamp instead
    if (!lastFedTime || isNaN(parseInt(lastFedTime))) {
        console.log('lastFedTime invalid - falling back to hatchTimestamp');
        lastFedTime = localStorage.getItem('hatchTimestamp');
        
        // If hatchTimestamp is also invalid, create new timestamp
        if (!lastFedTime || isNaN(parseInt(lastFedTime))) {
            console.log('hatchTimestamp also invalid - creating new timestamp');
            lastFedTime = Date.now().toString();
            localStorage.setItem('hatchTimestamp', lastFedTime);
        }
    }

    // 2. Final fallback: Initialize fresh timestamp if all checks failed
    if (isNaN(parseInt(lastFedTime))) {
        console.log('All checks failed - creating new timestamp');
        lastFedTime = Date.now().toString();
        localStorage.setItem('hatchTimestamp', lastFedTime);
    }

    // 3. Parse to number (now guaranteed to exist)
    lastFedTime = parseInt(lastFedTime);

    const currentTime = Date.now();
    const hoursSinceFed = Math.floor((currentTime - parseInt(lastFedTime)) / (1000 * 60 * 60));
    
    console.log('Last fed/hatch time:', new Date(parseInt(lastFedTime)).toLocaleString());
    console.log('Current time:', new Date(currentTime).toLocaleString());
    console.log('Hours since fed:', hoursSinceFed);

    // Calculate hunger increase (max 10)
    const hungerIncrease = Math.min(Math.floor(hoursSinceFed / 2), 10);
    let currentHunger = parseInt(localStorage.getItem('monHunger')) || 0;
    
    console.log('Initial hunger:', currentHunger);
    console.log('Hunger to add:', hungerIncrease);

    currentHunger = Math.min(currentHunger + hungerIncrease, 10);
    localStorage.setItem('monHunger', currentHunger);
    
    console.log('New hunger level:', currentHunger);
    updateHungerDisplay(currentHunger);
    
    if (currentHunger === 10) {
        setTimeout(() => {
            alert("Your MON is starving!\nPlease feed him!");
        }, 1000);
    }
}

function updateHungerDisplay(hungerValue) {
    const hungerElement = document.querySelector('.mon-hunger');
    if (!hungerElement) return;
    
    if (hungerValue === 0) {
        hungerElement.style.background = 'none';
    } else if (hungerValue === 10) {
        hungerElement.style.background = '#000';
    } else {
        const percentage = hungerValue * 10;
        hungerElement.style.background = 
            `linear-gradient(90deg, #000 0% ${percentage}%, transparent ${percentage}% 100%)`;
    }
}

// Call this on page load
initializeHunger();

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

        else if (radios[currentIndex].id === 'UIfeed') {
          const currentHunger = parseInt(localStorage.getItem('monHunger')) || 0;

          if (currentHunger >= 5) {
        // Feed the MON
            const newHunger = currentHunger - 5;
            localStorage.setItem('monHunger', newHunger);
            localStorage.setItem('lastFedTime', Date.now());
            updateHungerDisplay(newHunger);
            alert(`Your MON has been fed successfully!`);
          } 
          else {
        // Calculate time until next feeding
            const lastFedTime = localStorage.getItem('lastFedTime') || localStorage.getItem('hatchTimestamp') || Date.now();
            const currentTime = Date.now();
            const hoursPassed = (currentTime - parseInt(lastFedTime)) / (1000 * 60 * 60);
            const hoursNeeded = 2 * (5 - currentHunger) - hoursPassed;

            let message;
            if (hoursNeeded <= 0) {
              message = "less than 1 hour";
            } else if (hoursNeeded < 1) {
              message = "less than 1 hour";
            } else {
              message = `${Math.ceil(hoursNeeded)} hour${Math.ceil(hoursNeeded) > 1 ? 's' : ''}`;
            }

            alert(`Your MON is not hungry enough yet.\nYou can feed him in ${message}.`);
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
        hunger: localStorage.getItem('monHunger'),
        feed_time: localStorage.getItem('lastFedTime'),
        hatch_time: localStorage.getItem('hatchTimestamp'),
        clean_time: localStorage.getItem('lastCleanTime'),
        poop_count: localStorage.getItem('poopCount'),
        status: localStorage.getItem('monStatus'),
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
