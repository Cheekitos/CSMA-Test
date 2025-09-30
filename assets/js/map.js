// Interactive Map functionality
// Handles engine and child card expand/collapse

(function() {
  'use strict';

  window.StalkerMap = {
    toggleEngine: function(engineCard) {
      const branch = engineCard.closest('.mod-branch');
      const container = branch.querySelector('.children-container');
      const icon = engineCard.querySelector('.expand-icon');
      const details = engineCard.querySelector('.mod-details');
      
      if (engineCard.classList.contains('expanded')) {
        // Collapse engine
        engineCard.classList.remove('expanded');
        container.classList.remove('expanded');
        icon.classList.remove('rotated');
        details.classList.remove('expanded');
      } else {
        // Expand engine
        engineCard.classList.add('expanded');
        container.classList.add('expanded');
        icon.classList.add('rotated');
        details.classList.add('expanded');
      }
    },

    toggleCard: function(card) {
      const details = card.querySelector('.mod-details');
      const icon = card.querySelector('.expand-icon');
      if (card.classList.contains('expanded')) {
    // Collapse card
    details.style.height = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.height = '0';
      details.classList.remove('expanded');
      icon.classList.remove('rotated');
      card.classList.remove('expanded');
    });
  } else {
    // Expand card
    card.classList.add('expanded');
    icon.classList.add('rotated');
    details.classList.add('expanded');
    const height = details.scrollHeight;
    details.style.height = '0';
    requestAnimationFrame(() => {
      details.style.height = height + 'px';
    });
    
    // Remove inline height after transition completes
    setTimeout(() => {
      if (details.classList.contains('expanded')) {
        details.style.height = 'auto';
      }
    }, 350);
  }
}
    };
})();
