document.addEventListener('DOMContentLoaded', function() {
  // Free API options (randomly picks one daily)
  const factAPIs = [
    "https://uselessfacts.jsph.pl/api/v2/facts/random", // Random facts
    "https://cat-fact.herokuapp.com/facts/random" // Animal facts
  ];

  async function loadDailyFact() {
    const today = new Date().toDateString();
    const savedFact = localStorage.getItem('dailyFact');
    const savedDate = localStorage.getItem('factDate');
    const factElement = document.getElementById('fact');
    
    if (savedFact && savedDate === today) {
      factElement.textContent = truncateAtPunctuation(savedFact);
      factElement.title = savedFact;
      return;
    }

    try {
      for (const apiUrl of factAPIs) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            let fact = data.text || data.fact;
            
            localStorage.setItem('dailyFact', fact);
            localStorage.setItem('factDate', today);
            factElement.textContent = truncateAtPunctuation(fact);
            factElement.title = fact;
            return; // Exit after first successful fetch
          }
        } catch (error) {
          console.error(`Failed with ${apiUrl}:`, error);
          continue; // Try next API
        }
      }
      // If all APIs fail
      throw new Error('All APIs failed');
    } catch (error) {
      const fallback = "Did you know? The first computer bug was a real moth!";
      factElement.textContent = truncateAtPunctuation(fallback);
      factElement.title = fallback;
    }
  }

  function truncateAtPunctuation(text) {
    const maxLength = 49;
    if (!text || text.length <= maxLength) return text;
    
    const punctuation = ['.', '!', '?', ';', ',', ':'];
    let lastPunctuationIndex = -1;
    
    for (let i = Math.min(maxLength, text.length - 1); i >= 0; i--) {
      if (punctuation.includes(text[i]) && (i === text.length - 1 || text[i+1] === ' ')) {
        lastPunctuationIndex = i;
        break;
      }
    }
    
    if (lastPunctuationIndex === -1) {
      for (let i = Math.min(maxLength, text.length - 1); i >= 0; i--) {
        if (punctuation.includes(text[i])) {
          lastPunctuationIndex = i;
          break;
        }
      }
    }
    
    const truncated = lastPunctuationIndex >= 0 
      ? text.substring(0, lastPunctuationIndex + 1).trim()
      : text.substring(0, text.lastIndexOf(' ', maxLength)).trim();
      
    return truncated + (text.length > truncated.length ? '…' : '');
  }

  document.getElementById('fact').addEventListener('click', function() {
    const fullFact = this.title || this.textContent;
    window.open(`https://search.aol.com/aol/search?q=${encodeURIComponent(fullFact)}`, '_blank');
  });

  // Load fact on page load
  loadDailyFact();
});