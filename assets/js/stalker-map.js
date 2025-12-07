let currentZoom = 100;
const zoomStep = 10;
const minZoom = 50;
const maxZoom = 150;
const baseScaleFactor = 0.9; // 100% UI = 0.9 visual scale

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// 0 = collapsed, 1 = full view, 2 = fully expanded
let expandState = 0;
let storyModsHidden = false;

// --- SEARCH FUNCTIONALITY ---

// Called by the HTML onkeyup event
function filterMods() {
  const input = document.getElementById('modSearchInput');
  const filter = input.value.toLowerCase().trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  const allCards = document.querySelectorAll('.mod-card');
  
  // Toggle Clear Button
  if (filter.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    allCards.forEach(card => card.classList.remove('search-match'));
    return;
  }

  // Clear previous highlights
  allCards.forEach(card => card.classList.remove('search-match'));

  let firstMatch = null;

  allCards.forEach(card => {
    const title = card.querySelector('.mod-title').textContent.toLowerCase();
    
    // Check if title contains search text
    if (title.includes(filter)) {
      card.classList.add('search-match');
      
      if (!firstMatch) {
        firstMatch = card;
      }
      
      // Expand the path to this card so it is visible
      expandToCard(card);
    }
  });

  // Pan to the first match
  if (firstMatch) {
    // We must wait for the CSS transition (height expansion) to finish
    // before calculating the coordinates, otherwise the calculation is off.
    setTimeout(() => {
      centerOnCard(firstMatch);
    }, 400);
  }
}

function clearSearch() {
  const input = document.getElementById('modSearchInput');
  input.value = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
}

// Recursively expand parents of a specific card to make it visible
function expandToCard(card) {
  let current = card;
  
  // Traverse up the DOM to find parent containers
  while (current) {
    // Find the closest parent container (hierarchical or children-row)
    const parentContainer = current.closest('.hierarchical-children, .children-row');
    
    if (parentContainer) {
      // Get the ID of the parent card that controls this container
      const parentId = parentContainer.getAttribute('data-parent');
      
      if (parentId) {
        const parentCard = document.querySelector(`.mod-card[data-id="${parentId}"]`);
        
        if (parentCard) {
          // Force expand the parent card
          forceExpandCard(parentCard);
          // Move pointer up to continue the chain
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

function centerOnCard(card) {
  const wrapper = document.getElementById('flowchartWrapper');
  
  // 1. Get Visual Coordinates (Post-transform, relative to viewport)
  const wrapperRect = wrapper.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  // 2. Calculate Centers
  const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
  const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;

  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;

  // 3. Calculate Visual Difference
  const diffX = wrapperCenterX - cardCenterX;
  const diffY = wrapperCenterY - cardCenterY;

  // 4. Calculate Current Effective Scale
  const currentScale = (currentZoom / 100) * baseScaleFactor;

  // 5. Apply to Transform
  // We divide by scale because the CSS translate is inside the transform matrix.
  // Moving 100px visually requires moving (100 / scale) pixels in the CSS transform.
  translateX += (diffX / currentScale);
  translateY += (diffY / currentScale);

  updateZoom();
}

// --- CARD LOGIC ---

function toggleCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  
  const isExpanded = details.classList.contains('expanded');
  
  if (isExpanded) {
    // Collapse
    details.style.height = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.height = '0';
      details.classList.remove('expanded');
