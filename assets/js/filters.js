// Search and filtering functionality
// This file handles all filtering, searching, and sorting logic

document.addEventListener('DOMContentLoaded', function() {
  if (!window.StalkerMods) {
    window.StalkerMods = {};
  }
  
  window.StalkerMods.filters = {
    isFilterDropdownOpen: false,
    searchInput: null,
    filterText: null,
    filterTextContent: null,
    filterArrow: null,
    filterDropdown: null,
    filterCheckboxes: null,
    filterRadios: null,
    searchContainer: null,
    controlsContainer: null,

    init: function() {
      this.setupFilterElements();
      this.setupSearchInput();
      this.setupSortButton();
      this.bindEventListeners();
    },

    setupFilterElements: function() {
      this.searchInput = document.getElementById('search-input');
      this.filterText = document.getElementById('filter-text');
      this.filterTextContent = document.getElementById('filter-text-content');
      this.filterArrow = document.getElementById('filter-arrow');
      this.filterDropdown = document.getElementById('filter-dropdown');
      this.filterCheckboxes = document.querySelectorAll('.filter-checkbox');
      this.filterRadios = document.querySelectorAll('.filter-radio');
      this.searchContainer = document.getElementById('search-container');
      this.controlsContainer = document.getElementById('controls-container');
    },

    setupSearchInput: function() {
      if (this.searchInput && this.filterDropdown) {
        this.searchInput.addEventListener('focus', () => {
          this.showFilterDropdown();
        });

        this.searchInput.addEventListener('click', () => {
          this.showFilterDropdown();
        });

        this.searchInput.addEventListener('input', () => {
          this.applyFilters();
        });
      }
    },

    setupSortButton: function() {
      const sortButton = document.getElementById('sort-button');
      if (sortButton) {
        sortButton.addEventListener('click', () => {
          const gradesHidden = document.body.classList.contains('hide-grades');
          
          if (gradesHidden) {
            const shuffled = window.StalkerMods.utils.shuffleArray([...window.StalkerMods.currentDisplayedMods]);
            window.StalkerMods.baselineOrder = [...shuffled];
            window.StalkerMods.utils.renderMods(shuffled);
          } else {
            window.StalkerMods.sortState = (window.StalkerMods.sortState + 1) % 3;
            
            let toRender;
            switch(window.StalkerMods.sortState) {
              case 0:
                sortButton.textContent = 'Sort by Rating';
                window.StalkerMods.baselineOrder = window.StalkerMods.utils.applySortToMods