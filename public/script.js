// Scroll reveal

// Select all elements that should have reveal animation
const reveals = document.querySelectorAll('.reveal');

// Create IntersectionObserver to detect when elements come into view
const observer = new IntersectionObserver((entries) => {

  // Loop through all observed entries
  entries.forEach(e => {

    // Check if element is visible in viewport
    if (e.isIntersecting) {

      // Add 'visible' class to trigger animation (via CSS)
      e.target.classList.add('visible');
    }
  });

}, { threshold: 0.15 }); // Trigger when 15% of element is visible

// Start observing each reveal element
reveals.forEach(r => observer.observe(r));



// Page indicator

// List of section IDs in order (used to map dots)
const sections = ['hero','history','culture','architecture','festivals','cuisine','states','philosophy'];

// Select all page indicator dots
const dots = document.querySelectorAll('.pi-dot');

// Create observer to track which section is currently visible
const io = new IntersectionObserver((entries) => {

  entries.forEach(e => {

    // If section is visible in viewport
    if (e.isIntersecting) {

      // Find index of current section
      const idx = sections.indexOf(e.target.id);

      // Highlight corresponding dot
      dots.forEach((d,i) => d.classList.toggle('active', i === idx));
    }
  });

}, { threshold: 0.4 }); // Trigger when 40% of section is visible

// Observe each section element
sections.forEach(s => {
  const el = document.getElementById(s); // Get section by ID
  if(el) io.observe(el); // Observe only if element exists
});



// States search

// Get search input element
const stateSearchInput = document.getElementById('stateSearch');

// Get all state tiles
const stateTiles = document.querySelectorAll('#states .state-tile');

// Get "no results found" message element
const stateSearchEmpty = document.getElementById('stateSearchEmpty');

// Ensure elements exist before applying search functionality
if (stateSearchInput && stateTiles.length && stateSearchEmpty) {

  // Listen for input changes (user typing)
  stateSearchInput.addEventListener('input', () => {

    // Get user query (trim spaces + convert to lowercase)
    const query = stateSearchInput.value.trim().toLowerCase();

    let matchCount = 0; // Counter for matching results

    // Loop through each state tile
    stateTiles.forEach(tile => {

      // Get state name text (optional chaining used for safety)
      const stateName = tile.querySelector('.state-name')?.textContent?.toLowerCase() || '';

      // Get state capital text
      const stateCapital = tile.querySelector('.state-capital')?.textContent?.toLowerCase() || '';

      // Check if query matches state name or capital
      const isMatch = !query || stateName.includes(query) || stateCapital.includes(query);

      // Show or hide tile based on match
      tile.classList.toggle('hidden-by-search', !isMatch);

      // Increase match count if tile matches
      if (isMatch) {
        matchCount += 1;
      }
    });

    // Show "no results" message if no matches found
    stateSearchEmpty.hidden = matchCount !== 0;
  });
}



// Add accessibility and click behavior to each state tile
stateTiles.forEach(tile => {

  // Make tile behave like a link for screen readers
  tile.setAttribute('role', 'link');

  // Allow keyboard focus (tab navigation)
  tile.setAttribute('tabindex', '0');

  // Add accessible label for screen readers
  tile.setAttribute('aria-label', `Open ${tile.querySelector('.state-name')?.textContent || 'state'} page`);

  // Handle mouse click
  tile.addEventListener('click', () => {

    // Get slug from data attribute OR generate it
    const slug = tile.dataset.stateSlug || slugifyStateName(tile.querySelector('.state-name')?.textContent || '');

    // Navigate to state page
    if (slug) window.location.assign(`/state/${slug}`);
  });

  // Handle keyboard interaction (Enter or Space)
  tile.addEventListener('keydown', (event) => {

    if (event.key === 'Enter' || event.key === ' ') {

      event.preventDefault(); // Prevent default scrolling behavior (for Space)
      tile.click(); // Trigger click manually
    }
  });
});



// Function to convert state name into URL-friendly slug
function slugifyStateName(name) {

  return name
    .toLowerCase()              // Convert to lowercase
    .replace(/&/g, 'and')       // Replace '&' with 'and'
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with '-'
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
}



// Smooth scroll function to scroll to a section by ID
function scrollToSection(id) {

  // Scroll to the element smoothly if it exists
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}