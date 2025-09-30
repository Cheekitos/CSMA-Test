// Interactive Map functionality
// Handles engine and child card expand/collapse

(function() {
  'use strict';

  window.StalkerMap = {
    toggleEngine: function(engineCard) {
      const container = engineCard.querySelector('.children-container');
      const icon = engineCard.querySelector('.engine-header .expand-icon');
      
      if (engineCard.classList.contains('expanded')) {
        // Collapse engine
        engineCard.classList.remove('expanded');
        container.classList.remove('expanded');
        icon.classList.remove('rotated');
      } else {
        // Expand engine
        engineCard.classList.add('expanded');
        container.classList.add('expanded');
        icon.classList.add('rotated');
      }
    },

    toggleChild: function(childCard) {
      const details = childCard.querySelector('.child-details');
      const icon = childCard.querySelector('.child-header .expand-icon');
      
      if (childCard.classList.contains('expanded')) {
        // Collapse child
        details.style.height = details.scrollHeight + 'px';
        requestAnimationFrame(() => {
          details.style.height = '0';
          details.classList.remove('expanded');
          icon.classList.remove('rotated');
          childCard.classList.remove('expanded');
        });
      } else {
        // Expand child
        childCard.classList.add('expanded');
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
