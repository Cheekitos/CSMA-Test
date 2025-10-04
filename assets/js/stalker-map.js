let currentZoom = 100;
const zoomStep = 10;
const minZoom = 50;
const maxZoom = 150;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

function toggleCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  const isExpanded = details.classList.contains('expanded');
  
  if (isExpanded) {
    details.style.height = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.height = '0';
      details.classList.remove('expanded');
      if (icon) icon.classList.remove('rotated');
      card.classList.remove('expanded');
      if (connector) connector.classList.add('hidden');
      if (childrenRow) childrenRow.classList.add('hidden');
    });
  } else {
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
    if (connector) connector.classList.remove('hidden');
    if (childrenRow) childrenRow.classList.remove('hidden');
    
    const height = details.scrollHeight;
    details.style.height = '0';
    requestAnimationFrame(() => {
      details.style.height = height + 'px';
    });
    
    setTimeout(() => {
      if (details.classList.contains('expanded')) {
        details.style.height = 'auto';
      }
    }, 350);
  }
}

function toggleAll() {
  const button = document.getElementById('toggleAllBtn');
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  
  const anyExpanded = Array.from(allCards).some(card => 
    card.querySelector(':scope > .mod-details').classList.contains('expanded')
  );
  
  if (anyExpanded) {
    allCards.forEach(card => {
      const details = card.querySelector(':scope > .mod-details');
      const icon = card.querySelector(':scope > .mod-header .expand-icon');
      const cardId = card.getAttribute('data-id');
      const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
      const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
      
      if (details.classList.contains('expanded')) {
        details.style.height = '0';
        details.classList.remove('expanded');
        if (icon) icon.classList.remove('rotated');
        card.classList.remove('expanded');
        if (connector) connector.classList.add('hidden');
        if (childrenRow) childrenRow.classList.add('hidden');
      }
    });
    button.textContent = 'Expand All';
  } else {
    allCards.forEach(card => {
      const details = card.querySelector(':scope > .mod-details');
      const icon = card.querySelector(':scope > .mod-header .expand-icon');
      const cardId = card.getAttribute('data-id');
      const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
      const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
      
      if (!details.classList.contains('expanded')) {
        details.classList.add('expanded');
        if (icon) icon.classList.add('rotated');
        card.classList.add('expanded');
        if (connector) connector.classList.remove('hidden');
        if (childrenRow) childrenRow.classList.remove('hidden');
        details.style.height = 'auto';
      }
    });
    button.textContent = 'Collapse All';
  }
}

function updateZoom() {
  const container = document.getElementById('flowchartContainer');
  const zoomLevel = document.getElementById('zoomLevel');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  
  updateTransform();
  zoomLevel.textContent = `${currentZoom}%`;
  
  // Disable buttons at limits
  zoomInBtn.disabled = currentZoom >= maxZoom;
  zoomOutBtn.disabled = currentZoom <= minZoom;
}

function updateTransform() {
  const container = document.getElementById('flowchartContainer');
  container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
}

function zoomIn() {
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    updateZoom();
  }
}

function zoomOut() {
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    updateZoom();
  }
}

function resetView() {
  currentZoom = 100;
  translateX = 0;
  translateY = 0;
  updateZoom();
  
  // Collapse all cards
  const button = document.getElementById('toggleAllBtn');
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  
  allCards.forEach(card => {
    const details = card.querySelector(':scope > .mod-details');
    const icon = card.querySelector(':scope > .mod-header .expand-icon');
    const cardId = card.getAttribute('data-id');
    const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
    const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
    
    if (details.classList.contains('expanded')) {
      details.style.height = '0';
      details.classList.remove('expanded');
      if (icon) icon.classList.remove('rotated');
      card.classList.remove('expanded');
      if (connector) connector.classList.add('hidden');
      if (childrenRow) childrenRow.classList.add('hidden');
    }
  });
  
  button.textContent = 'Expand All';
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Pan/drag functionality
function initPanZoom() {
  const wrapper = document.getElementById('flowchartWrapper');
  
  // Mouse events
  wrapper.addEventListener('mousedown', (e) => {
    // Ignore if clicking on a mod card or link
    if (e.target.closest('.mod-card') || e.target.closest('a')) {
      return;
    }
    
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    wrapper.style.cursor = 'grabbing';
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });
  
  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      wrapper.style.cursor = 'grab';
    }
  });
  
  // Touch events for mobile
  wrapper.addEventListener('touchstart', (e) => {
    // Ignore if touching a mod card
    if (e.target.closest('.mod-card')) {
      return;
    }
    
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  }, { passive: true });
  
  wrapper.addEventListener('touchmove', (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    
    translateX = e.touches[0].clientX - startX;
    translateY = e.touches[0].clientY - startY;
    updateTransform();
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => {
    isPanning = false;
  });
}

// Initialize zoom display and pan functionality on page load
document.addEventListener('DOMContentLoaded', function() {
  updateZoom();
  initPanZoom();
});
