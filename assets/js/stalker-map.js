let currentZoom = 100;
const zoomStep = 10;
const minZoom = 50;
const maxZoom = 150;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// 0 = collapsed, 1 = overview (base games + parents), 2 = fully expanded
let expandState = 0;

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
  
  if (expandState === 0) {
    // State 1: Expand base games and parent mods only
    expandOverview();
    expandState = 1;
    button.textContent = 'Expand All';
  } else if (expandState === 1) {
    // State 2: Expand everything
    expandAll();
    expandState = 2;
    button.textContent = 'Collapse All';
  } else {
    // State 0: Collapse everything
    collapseAll();
    expandState = 0;
    button.textContent = 'Overview';
  }
}

function expandOverview() {
  // Expand only base games and cards that have children (engine-family, platform-family)
  const baseGames = document.querySelectorAll('.mod-card.base-game');
  const parentMods = document.querySelectorAll('.mod-card.engine-family, .mod-card.platform-family');
  
  baseGames.forEach(card => expandCard(card));
  parentMods.forEach(card => expandCard(card));
}

function expandAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => expandCard(card));
}

function collapseAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => collapseCard(card));
}

function expandCard(card) {
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
}

function collapseCard(card) {
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
}

function updateZoom() {
  const container = document.getElementById('flowchartContainer');
  const zoomLevel = document.getElementById('zoomLevel');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  
  updateTransform();
  zoomLevel.textContent = `${currentZoom}%`;
  
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
  
  collapseAll();
  expandState = 0;
  document.getElementById('toggleAllBtn').textContent = 'Overview';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initPanZoom() {
  const wrapper = document.getElementById('flowchartWrapper');
  
  wrapper.addEventListener('mousedown', (e) => {
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
  
  wrapper.addEventListener('touchstart', (e) => {
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

document.addEventListener('DOMContentLoaded', function() {
  updateZoom();
  initPanZoom();
});
