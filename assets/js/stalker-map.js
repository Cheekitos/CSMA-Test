let currentZoom = 100;
const zoomStep = 10;
const minZoom = 50;
const maxZoom = 150;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

let expandState = 0; // 0=collapsed, 1=full view, 2=all
let storyModsHidden = false;

// --- SEARCH FUNCTIONALITY ---
function searchMods() {
  const input = document.getElementById('modSearchInput');
  const filter = input.value.toLowerCase();
  const allCards = document.querySelectorAll('.mod-card');
  
  // Clear previous highlights
  allCards.forEach(card => card.classList.remove('search-match'));

  if (filter.length < 2) {
    return;
  }

  let firstMatch = null;

  allCards.forEach(card => {
    const title = card.querySelector('.mod-title').textContent.toLowerCase();
    
    // Check if title contains search text
    if (title.includes(filter)) {
      card.classList.add('search-match');
      if (!firstMatch) firstMatch = card;
      
      // Expand the path to this card
      expandToCard(card);
    }
  });

  // Center view on first match
  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}

// Recursively expand parents of a specific card
function expandToCard(card) {
  let current = card;
  
  // Traverse up the DOM to find parent containers
  while (current) {
    // Find the closest parent container
    const parentContainer = current.closest('.hierarchical-children, .children-row');
    
    if (parentContainer) {
      // Find the card that controls this container
      const parentId = parentContainer.getAttribute('data-parent');
      if (parentId) {
        const parentCard = document.querySelector(`.mod-card[data-id="${parentId}"]`);
        if (parentCard) {
          expandCard(parentCard);
          // Move current up to continue the chain
          current = parentCard;
        } else {
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }
}

// --- STANDARD CARD TOGGLING ---
function toggleCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  
  // Select the child container
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  const isExpanded = details.classList.contains('expanded');
  
  if (isExpanded) {
    // COLLAPSE
    details.style.height = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.height = '0';
      details.classList.remove('expanded');
      if (icon) icon.classList.remove('rotated');
      card.classList.remove('expanded');
      if (childrenRow) childrenRow.classList.add('hidden');
    });
  } else {
    // EXPAND
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
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
    }, 300);
  }
}

function expandCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  if (!details.classList.contains('expanded')) {
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
    if (childrenRow) childrenRow.classList.remove('hidden');
    details.style.height = 'auto';
  }
}

function collapseCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  if (details.classList.contains('expanded')) {
    details.style.height = '0';
    details.classList.remove('expanded');
    if (icon) icon.classList.remove('rotated');
    card.classList.remove('expanded');
    if (childrenRow) childrenRow.classList.add('hidden');
  }
}

// --- GLOBAL CONTROLS ---
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
  baseGames.forEach(card => expandCard(card));
  parentMods.forEach(card => expandCard(card));
}

function expandAll() {
  document.querySelectorAll('.mod-card[data-id]').forEach(card => expandCard(card));
}

function collapseAll() {
  document.querySelectorAll('.mod-card[data-id]').forEach(card => collapseCard(card));
}

function toggleStoryMods() {
  const button = document.getElementById('hideStoryBtn');
  const storyMods = document.querySelectorAll('.story-mod-container');
  storyModsHidden = !storyModsHidden;
  
  storyMods.forEach(container => {
    container.classList.toggle('story-hidden', storyModsHidden);
  });
  button.classList.toggle('active', storyModsHidden);
}

function resetView() {
  currentZoom = 100;
  translateX = 0;
  translateY = 0;
  updateZoom();
  collapseAll();
  expandState = 0;
  document.getElementById('toggleAllBtn').textContent = 'Full View';
  document.getElementById('modSearchInput').value = '';
  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
  
  if (storyModsHidden) {
    storyModsHidden = false;
    document.querySelectorAll('.story-mod-container').forEach(c => c.classList.remove('story-hidden'));
    document.getElementById('hideStoryBtn').classList.remove('active');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- PAN & ZOOM ---
function updateZoom() {
  const container = document.getElementById('flowchartContainer');
  document.getElementById('zoomLevel').textContent = `${currentZoom}%`;
  document.getElementById('zoomInBtn').disabled = currentZoom >= maxZoom;
  document.getElementById('zoomOutBtn').disabled = currentZoom <= minZoom;
  updateTransform();
}

function updateTransform() {
  const container = document.getElementById('flowchartContainer');
  container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
}

function zoomIn() { if (currentZoom < maxZoom) { currentZoom += zoomStep; updateZoom(); } }
function zoomOut() { if (currentZoom > minZoom) { currentZoom -= zoomStep; updateZoom(); } }

function initPanZoom() {
  const wrapper = document.getElementById('flowchartWrapper');
  
  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.mod-card') || e.target.closest('a') || e.target.closest('input')) return;
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
    if (isPanning) { isPanning = false; wrapper.style.cursor = 'grab'; }
  });
  
  // Basic Touch Support
  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('.mod-card') || e.touches.length > 1) return;
    isPanning = true;
    startX = e.touches[0].clientX - translateX;
    startY = e.touches[0].clientY - translateY;
  }, { passive: true });
  
  wrapper.addEventListener('touchmove', (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    translateX = e.touches[0].clientX - startX;
    translateY = e.touches[0].clientY - startY;
    updateTransform();
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => { isPanning = false; });
}

document.addEventListener('DOMContentLoaded', function() {
  updateZoom();
  initPanZoom();
  
  // Essential/About Popups
  const essentialsBtn = document.getElementById('essentials-button');
  const contactBtn = document.getElementById('contact-button');
  const installFilesOverlay = document.getElementById('install-files-overlay');
  const contactOverlay = document.getElementById('contact-overlay');
  
  if (essentialsBtn && installFilesOverlay) {
    essentialsBtn.addEventListener('click', () => installFilesOverlay.classList.remove('hidden'));
    installFilesOverlay.addEventListener('click', (e) => { if(e.target === installFilesOverlay) installFilesOverlay.classList.add('hidden'); });
  }
  if (contactBtn && contactOverlay) {
    contactBtn.addEventListener('click', () => contactOverlay.classList.remove('hidden'));
    contactOverlay.addEventListener('click', (e) => { if(e.target === contactOverlay) contactOverlay.classList.add('hidden'); });
  }
});
