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
