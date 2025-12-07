// Changed default zoom to 80% as requested
let currentZoom = 80;
const zoomStep = 10;
const minZoom = 40; // Allow zooming out further
const maxZoom = 150;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let searchTimeout = null; // For debouncing search

// 0 = collapsed, 1 = full view, 2 = fully expanded
let expandState = 0;
let storyModsHidden = false;

// --- Card Logic ---

function toggleCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  const isExpanded = details.classList.contains('expanded');
  
  if (isExpanded) {
    // Collapse
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
    // Expand
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
    if (connector) connector.classList.remove('hidden');
    if (childrenRow) childrenRow.classList.remove('hidden');
    
    // Smooth height animation
    const height = details.scrollHeight;
    details.style.height = '0';
    requestAnimationFrame(() => {
      details.style.height = height + 'px';
    });
    
    setTimeout(() => {
      if (details.classList.contains('expanded')) {
        details.style.height = 'auto';
      }
    }, 300);
  }
}

// --- Expansion Logic ---

function toggleAll() {
  const button = document.getElementById('toggleAllBtn');
  
  if (expandState === 0) {
    expandFullView();
    expandState = 1;
    button.textContent = 'Expand All';
  } else if (expandState === 1) {
    expandAll();
    expandState = 2;
    button.textContent = 'Collapse All';
  } else {
    collapseAll();
    expandState = 0;
    button.textContent = 'Full View';
  }
}

function expandFullView() {
  const baseGames = document.querySelectorAll('.mod-card.base-game');
  const parentMods = document.querySelectorAll('.mod-card.engine-family, .mod-card.platform-family');
  baseGames.forEach(card => forceExpandCard(card));
  parentMods.forEach(card => forceExpandCard(card));
}

function expandAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => forceExpandCard(card));
}

function collapseAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => forceCollapseCard(card));
}

function forceExpandCard(card) {
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

function forceCollapseCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  details.style.height = '0';
  details.classList.remove('expanded');
  if (icon) icon.classList.remove('rotated');
  card.classList.remove('expanded');
  if (connector) connector.classList.add('hidden');
  if (childrenRow) childrenRow.classList.add('hidden');
}

// --- Search Functionality ---

// Debounce wrapper to prevent jerky movement while typing
function filterMods() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(executeSearch, 300);
}

function executeSearch() {
  const input = document.getElementById('modSearchInput');
  const filter = input.value.toLowerCase().trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  const cards = document.querySelectorAll('.mod-card');
  
  if (filter.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
    return;
  }

  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));

  let firstMatch = null;

  cards.forEach(card => {
    const modName = card.getAttribute('data-name') || "";
    if (modName.includes(filter)) {
      card.classList.add('search-match');
      if (!firstMatch) firstMatch = card;
      expandParents(card);
    }
  });

  if (firstMatch) {
    // Wait slightly for CSS expansion animation to layout before panning
    setTimeout(() => {
        panToCard(firstMatch);
    }, 350);
  }
}

function expandParents(cardElement) {
  let current = cardElement.parentElement;
  while (current && !current.classList.contains('flowchart-container')) {
    if (current.classList.contains('hierarchical-children') || current.classList.contains('children-row')) {
      const parentId = current.getAttribute('data-parent');
      const parentCard = document.querySelector(`.mod-card[data-id="${parentId}"]`);
      if (parentCard) {
        forceExpandCard(parentCard);
      }
    }
    current = current.parentElement;
  }
}

function panToCard(card) {
  const wrapper = document.getElementById('flowchartWrapper');
  
  // Get positions relative to the viewport
  const wrapperRect = wrapper.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  
  // Calculate center points
  const wrapperCenterX = wrapperRect.left + (wrapperRect.width / 2);
  const wrapperCenterY = wrapperRect.top + (wrapperRect.height / 2);
  
  const cardCenterX = cardRect.left + (cardRect.width / 2);
  const cardCenterY = cardRect.top + (cardRect.height / 2);
  
  // Calculate the difference needed to center
  const diffX = wrapperCenterX - cardCenterX;
  const diffY = wrapperCenterY - cardCenterY;
  
  // Update global translation
  translateX += diffX;
  translateY += diffY;
  
  updateZoom();
}

function clearSearch() {
  const input = document.getElementById('modSearchInput');
  input.value = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
}

// --- View Logic ---

function toggleStoryMods() {
  const button = document.getElementById('hideStoryBtn');
  const storyMods = document.querySelectorAll('.story-mod-container');
  storyModsHidden = !storyModsHidden;
  
  storyMods.forEach(container => {
    storyModsHidden ? container.classList.add('story-hidden') : container.classList.remove('story-hidden');
  });
  
  button.classList.toggle('active', storyModsHidden);
}

function updateZoom() {
  const container = document.getElementById('flowchartContainer');
  const zoomLevel = document.getElementById('zoomLevel');
  document.getElementById('zoomInBtn').disabled = currentZoom >= maxZoom;
  document.getElementById('zoomOutBtn').disabled = currentZoom <= minZoom;
  
  zoomLevel.textContent = `${currentZoom}%`;
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
  // Reset to 80% as requested
  currentZoom = 80;
  translateX = 0;
  translateY = 0;
  updateZoom();
  collapseAll();
  clearSearch();
  expandState = 0;
  document.getElementById('toggleAllBtn').textContent = 'Full View';
  
  if (storyModsHidden) {
    storyModsHidden = false;
    document.querySelectorAll('.story-mod-container').forEach(c => c.classList.remove('story-hidden'));
    document.getElementById('hideStoryBtn').classList.remove('active');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initPanZoom() {
  const wrapper = document.getElementById('flowchartWrapper');
  
  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.mod-card') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    
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
    updateZoom();
  });
  
  window.addEventListener('mouseup', () => {
    isPanning = false;
    wrapper.style.cursor = 'grab';
  });
  
  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('.mod-card')) return;
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
    updateZoom();
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => {
    isPanning = false;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updateZoom();
  initPanZoom();
  
  const popupMap = {
    'essentials-button': 'install-files-overlay',
    'contact-button': 'contact-overlay'
  };
  
  Object.keys(popupMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    const overlay = document.getElementById(popupMap[btnId]);
    if (btn && overlay) {
      btn.addEventListener('click', () => overlay.classList.remove('hidden'));
      const closeBtn = overlay.querySelector('button[id$="close"]');
      if(closeBtn) closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
      overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.classList.add('hidden');
      });
    }
  });
});
