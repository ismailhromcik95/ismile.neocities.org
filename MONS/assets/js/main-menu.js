window.addEventListener('message', (event) => {
    const radios = document.getElementsByName('menu1');
    const currentIndex = Array.from(radios).findIndex(radio => radio.checked);
    
    switch(event.data.action) {
    case 'up':
    case 'down':
        const nextIndex = (currentIndex + 1) % radios.length;
        radios[nextIndex].checked = true;
        break;

    case 'select':
        console.log('Select pressed - current selection:', radios[currentIndex].value);
        if (radios[currentIndex].id === 'newGame') {
            window.location.href = 'location.html';
        }
        else if (radios[currentIndex].id === 'loadGame') {
        window.parent.postMessage({ type: 'requestFileUpload' }, '*');
      }
        break;
    }
    
    if (event.data.type === 'uploadComplete') {
      window.parent.postMessage({ type: 'refresh' }, '*');
    }


});