  const savedTrain = localStorage.getItem('trainingNumber');
  if (savedTrain) {
    updateMonTrainElements(savedTrain);
  }

  function updateMonTrainElements(train) {
    const trainElements = document.querySelectorAll('.mon-train');
    trainElements.forEach(element => {
      element.textContent = train;
    });
  }

window.addEventListener('message', (event) => {
  if (['up', 'down', 'select'].includes(event.data?.action)) {
    const trainBar = document.querySelector('.train-bar');
    if (!trainBar) return;

    // If train-bar is already visible (second press)
    if (!trainBar.classList.contains('hidden')) {

      const mon = document.querySelector('.mon'); 
      mon.classList.add('attacking');

      // 1. Stop animation and freeze current position
      const computedStyle = getComputedStyle(trainBar);
      console.log('Current transform:', computedStyle.transform);
      const currentTransform = computedStyle.transform;
      trainBar.style.animation = 'none';
      trainBar.style.transform = currentTransform;

      // 2. Add opacity: 0
      trainBar.style.opacity = '0';

      // 3. Create attacks based on position
      createAttacks(currentTransform);

      const trainWall = document.querySelector('.train-wall');
      const attackContainer = document.querySelector('.attack-cont');
      const explosion = document.querySelector('.explosion');

      setTimeout(() => {
        trainWall.classList.add('hidden');
      }, 400);

      setTimeout(() => {
        attackContainer.classList.add('hidden');
        explosion.classList.remove('hidden');
      }, 500);

      setTimeout(() => {
        explosion.classList.add('hidden');
        const currentTrainingNumber = parseInt(localStorage.getItem('trainingNumber')) || 0;
        localStorage.setItem('trainingNumber', (currentTrainingNumber + 1).toString());
        console.log('Training Number:', localStorage.getItem('trainingNumber'));
        mon.classList.remove('attacking');
        window.location.href = 'mon.html';
      }, 2400);

    } 
    else {
      // First press - just show the train bar
      trainBar.classList.remove('hidden');

      const trainingCont = document.querySelector('.training-number'); 
      trainingCont.classList.add('hidden');
    }
  }
});

function createAttacks(transformValue) {
  const attackContainer = document.querySelector('.attack-cont');
  if (!attackContainer) return;

  // Clear previous attacks
  attackContainer.innerHTML = '';

  // Determine number of attacks based on transform
  const translateY = parseTransformY(transformValue);
  let attackCount = 1;
  
  if (translateY <= 12.5) attackCount = 6;
  else if (translateY <= 37.5) attackCount = 5;
  else if (translateY <= 62.5) attackCount = 4;
  else if (translateY <= 87.5) attackCount = 3;
  else if (translateY <= 93.75) attackCount = 2;
  else attackCount = 1;

  // Create attacks
  for (let i = 0; i < attackCount; i++) {
    const attack = document.createElement('div');
    attack.className = 'attack';
    attackContainer.appendChild(attack);
  }

  attackContainer.classList.add('animated');
}

function parseTransformY(transformValue) {
  // Handle both matrix and translate formats
  if (transformValue.includes('matrix')) {
    // Extract Y translation from matrix(1, 0, 0, 1, 0, Y)
    const matrixValues = transformValue.match(/matrix\(([^)]+)\)/)[1].split(', ');
    return parseFloat(matrixValues[5]); // Y value is the 6th item
  } else {
    // Handle translateY(%)
    const match = transformValue.match(/translateY\(([^%]+)%\)/);
    return match ? parseFloat(match[1]) : 100; // Default to bottom
  }
}