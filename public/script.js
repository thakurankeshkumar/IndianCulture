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



// Intro strip counters
const introStrip = document.querySelector('.intro-strip');
const introCounters = document.querySelectorAll('.intro-strip .num[data-target]');

function animateCounter(element) {
  const target = Number(element.dataset.target || '0');
  const suffix = element.dataset.suffix || '';
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (introStrip && introCounters.length) {
  let introAnimated = false;
  const introObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !introAnimated) {
        introAnimated = true;
        introCounters.forEach((counter, index) => {
          counter.style.transitionDelay = `${index * 80}ms`;
          animateCounter(counter);
        });
      }
    });
  }, { threshold: 0.45 });

  introObserver.observe(introStrip);
}



// History chapter switcher
const historyStage = document.querySelector('.history-stage');
const historyTabs = document.querySelectorAll('.history-tab');
const historyKicker = document.getElementById('historyKicker');
const historyTitle = document.getElementById('historyTitle');
const historyRange = document.getElementById('historyRange');
const historySummary = document.getElementById('historySummary');
const historyHighlights = document.getElementById('historyHighlights');
const historyStat = document.getElementById('historyStat');
const historyStatLabel = document.getElementById('historyStatLabel');
const historyQuote = document.getElementById('historyQuote');
const historyFact1 = document.getElementById('historyFact1');
const historyFact2 = document.getElementById('historyFact2');
const historyFact3 = document.getElementById('historyFact3');
const historyProgressBar = document.getElementById('historyProgressBar');

const historyData = {
  indus: {
    kicker: 'Civilizational Beginnings',
    title: 'Indus Valley Civilization',
    range: '3300 – 1300 BCE',
    summary: 'One of the world’s earliest urban societies, known for planning, drainage, trade, and a remarkable sense of order.',
    stat: '400+',
    statLabel: 'urban settlements and trade centers',
    quote: '“India’s story begins not as a myth, but as an urban civilization built on precision and exchange.”',
    highlights: [
      'Planned cities with advanced drainage systems',
      'Standardized weights, seals, and long-distance trade',
      'A script that still invites discovery',
    ],
    facts: ['Urban planning', 'Trade networks', 'Continuity begins here'],
  },
  vedic: {
    kicker: 'Sacred Knowledge',
    title: 'Vedic Age & the Rise of Thought',
    range: '1500 – 500 BCE',
    summary: 'The Vedic period shaped ritual, language, and philosophy, creating a foundation that still influences India’s spiritual and intellectual life.',
    stat: '4',
    statLabel: 'core Vedas preserved through oral tradition',
    quote: '“In the Vedic age, memory itself became a living archive, carried through sound, rhythm, and recitation.”',
    highlights: [
      'Sanskrit literature and oral transmission flourished',
      'Early philosophical questions emerged around duty and cosmic order',
      'New religious and social traditions took shape across the Gangetic plains',
    ],
    facts: ['Oral tradition', 'Philosophical inquiry', 'Sacred language'],
  },
  maurya: {
    kicker: 'Imperial Unity',
    title: 'The Maurya Empire',
    range: '322 – 185 BCE',
    summary: 'Under Chandragupta and Ashoka, India saw large-scale political unity, administrative sophistication, and a remarkable spread of ethical governance.',
    stat: '1st',
    statLabel: 'major subcontinental empire',
    quote: '“Ashoka transformed power into a language of welfare, tolerance, and moral responsibility.”',
    highlights: [
      'A unified political vision stretched across much of the subcontinent',
      'Ashoka’s edicts promoted compassion and religious tolerance',
      'The Ashoka Chakra became a symbol of continuity and motion',
    ],
    facts: ['Statecraft', 'Dhamma', 'Ashoka Chakra'],
  },
  gupta: {
    kicker: 'Golden Age',
    title: 'The Gupta Era',
    range: '320 – 550 CE',
    summary: 'The Gupta period is remembered for mathematics, astronomy, literature, and art, often described as a high point of classical Indian civilization.',
    stat: '0',
    statLabel: 'zero, a world-changing concept in mathematics',
    quote: '“The Gupta age showed that knowledge can be a form of power, and beauty can be a form of order.”',
    highlights: [
      'Zero and decimal place value revolutionized math',
      'Classical literature and sculpture reached new heights',
      'Nalanda emerged as a magnet for scholars across Asia',
    ],
    facts: ['Mathematics', 'Literature', 'Global scholarship'],
  },
  mughal: {
    kicker: 'Cultural Synthesis',
    title: 'The Mughal Era',
    range: '1526 – 1857 CE',
    summary: 'The Mughal period created enduring architecture, courtly arts, and a synthesis of Persian and Indian traditions that still shapes visual culture.',
    stat: '3',
    statLabel: 'major artistic legacies: architecture, music, painting',
    quote: '“In the Mughal age, India’s cultural vocabulary expanded through architecture, music, and a shared aesthetic imagination.”',
    highlights: [
      'The Taj Mahal, Red Fort, and other monuments defined an era',
      'Miniature painting and court music flourished',
      'Persian, Central Asian, and Indian influences blended into new forms',
    ],
    facts: ['Architecture', 'Court arts', 'Synthesis'],
  },
  independence: {
    kicker: 'A Nation Reborn',
    title: 'Independence and the Republic',
    range: '1947 CE onward',
    summary: 'India’s independence marked the birth of the world’s largest democracy, built on constitutional values, civic rights, and democratic institutions.',
    stat: '1',
    statLabel: 'democratic republic with a living constitution',
    quote: '“Independence did not end the story. It gave the story a new democratic form.”',
    highlights: [
      'A non-violent freedom movement reshaped modern political history',
      'The Constitution enshrined justice, liberty, equality, and fraternity',
      'India emerged as a plural democracy with a global voice',
    ],
    facts: ['Freedom', 'Constitution', 'Democracy'],
  },
};

function renderHistoryEra(era) {
  const data = historyData[era];
  if (!data) return;

  const eraOrder = ['indus', 'vedic', 'maurya', 'gupta', 'mughal', 'independence'];
  const progressIndex = Math.max(eraOrder.indexOf(era), 0);
  const progressWidth = ((progressIndex + 1) / eraOrder.length) * 100;

  if (historyStage) {
    historyStage.classList.add('is-updating');
    window.setTimeout(() => historyStage.classList.remove('is-updating'), 220);
  }

  historyKicker.textContent = data.kicker;
  historyTitle.textContent = data.title;
  historyRange.textContent = data.range;
  historySummary.textContent = data.summary;
  historyStat.textContent = data.stat;
  historyStatLabel.textContent = data.statLabel;
  historyQuote.textContent = data.quote;
  historyFact1.textContent = data.facts[0];
  historyFact2.textContent = data.facts[1];
  historyFact3.textContent = data.facts[2];

  if (historyHighlights) {
    historyHighlights.innerHTML = data.highlights
      .map((item, index) => `<div class="history-bullet" style="animation-delay:${index * 90}ms">${item}</div>`)
      .join('');
    requestAnimationFrame(() => {
      const bullets = historyHighlights.querySelectorAll('.history-bullet');
      bullets.forEach((bullet) => {
        bullet.style.animationPlayState = 'running';
      });
    });
  }

  if (historyProgressBar) {
    historyProgressBar.style.width = `${progressWidth}%`;
  }

  historyTabs.forEach((tab) => {
    const isActive = tab.dataset.era === era;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });
}

if (historyTabs.length) {
  historyTabs.forEach((tab) => {
    tab.addEventListener('click', () => renderHistoryEra(tab.dataset.era || 'indus'));
  });

  renderHistoryEra('indus');
}


// Architecture spotlight switcher
const architectureCards = document.querySelectorAll('.arch-mini[data-architecture]');
const architectureIcon = document.getElementById('architectureIcon');
const architectureLabel = document.getElementById('architectureLabel');
const architectureMeta = document.getElementById('architectureMeta');
const architectureMetric1 = document.getElementById('architectureMetric1');
const architectureMetric2 = document.getElementById('architectureMetric2');
const architectureMetric3 = document.getElementById('architectureMetric3');
const architectureKicker = document.getElementById('architectureKicker');
const architectureTitle = document.getElementById('architectureTitle');
const architectureSummary = document.getElementById('architectureSummary');
const architectureDetail = document.getElementById('architectureDetail');
const architectureTags = document.getElementById('architectureTags');

const architectureData = {
  taj: {
    icon: '🕌',
    label: 'Taj Mahal',
    meta: 'Agra, Uttar Pradesh · 1632 CE',
    metrics: ['22 years', '20,000 artisans', '28 inlaid stones'],
    kicker: 'Mughal precision, poetic scale',
    title: 'The Crown of Palaces',
    summary: 'Built by Emperor Shah Jahan as an eternal testament to love for Mumtaz Mahal, the Taj Mahal stands as India’s most celebrated monument.',
    detail: 'Its translucent Makrana marble shifts through the day like a living surface of light, blending Persian, Islamic, and Indian design into a perfectly balanced garden tomb.',
    tags: ['UNESCO World Heritage', 'Mughal Architecture', 'World Wonder', 'Symbol of Love'],
  },
  forts: {
    icon: '🏯',
    label: 'Rajput Forts',
    meta: 'Rajasthan · 8th–18th century',
    metrics: ['Hilltop cities', 'Defensive walls', 'Royal courts'],
    kicker: 'Stone, power, and horizon',
    title: 'Fortified Cities in the Sky',
    summary: 'Amber, Mehrangarh, and Chittorgarh were more than forts. They were military, ceremonial, and residential worlds built into dramatic landscapes.',
    detail: 'Their ramparts, courtyards, mirrored halls, and gateways show how Rajput architecture turned terrain into theatre and defense into identity.',
    tags: ['Hill Forts', 'Rajput Architecture', 'Courtly Life', 'Desert Landscapes'],
  },
  temples: {
    icon: '🛕',
    label: 'Dravidian Temples',
    meta: 'Tamil Nadu · Chola to Nayak eras',
    metrics: ['Gopurams', 'Granite towers', 'Sacred geometry'],
    kicker: 'Cosmos carved in stone',
    title: 'Temple Cities of the South',
    summary: 'Madurai Meenakshi and Brihadeeswarar rise through gateways, mandapas, and towers that organize devotion at civic scale.',
    detail: 'These temple complexes combine sculpture, ritual movement, music, inscriptions, and urban planning into one continuous sacred experience.',
    tags: ['Temple Architecture', 'Chola Legacy', 'Sacred Geometry', 'Living Ritual'],
  },
  caves: {
    icon: '⛩️',
    label: 'Rock-Cut Caves',
    meta: 'Maharashtra · 2nd century BCE onward',
    metrics: ['Living rock', 'Murals', 'Sanctuaries'],
    kicker: 'Architecture by subtraction',
    title: 'Sanctuaries Carved from Mountains',
    summary: 'Ajanta, Ellora, and Elephanta transformed cliffs into temples, monasteries, and sculptural worlds.',
    detail: 'Instead of assembling stone blocks, artists removed mountain mass to reveal halls, shrines, columns, paintings, and deities inside the rock itself.',
    tags: ['Rock-Cut Design', 'Buddhist Art', 'Hindu Sculpture', 'Cave Murals'],
  },
  stepwells: {
    icon: '🏛️',
    label: 'Rani ki Vav',
    meta: 'Patan, Gujarat · 11th century',
    metrics: ['7 levels', 'Water design', 'Subterranean art'],
    kicker: 'Water, shade, and ritual',
    title: 'The Stepwell as Monument',
    summary: 'Rani ki Vav turns water management into an underground architectural journey of columns, terraces, and sculpture.',
    detail: 'The deeper one descends, the more the structure becomes both practical infrastructure and sacred spatial experience.',
    tags: ['Stepwell', 'Water Heritage', 'Gujarat', 'Subterranean Design'],
  },
};

function renderArchitecture(key) {
  const data = architectureData[key];
  if (!data || !architectureIcon || !architectureLabel || !architectureTags) return;

  architectureIcon.textContent = data.icon;
  architectureLabel.textContent = data.label;
  architectureMeta.textContent = data.meta;
  architectureMetric1.textContent = data.metrics[0];
  architectureMetric2.textContent = data.metrics[1];
  architectureMetric3.textContent = data.metrics[2];
  architectureKicker.textContent = data.kicker;
  architectureTitle.textContent = data.title;
  architectureSummary.textContent = data.summary;
  architectureDetail.textContent = data.detail;
  architectureTags.innerHTML = data.tags.map((tag) => `<span class="arch-tag">${tag}</span>`).join('');

  architectureCards.forEach((card) => {
    const isActive = card.dataset.architecture === key;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
  });
}

architectureCards.forEach((card) => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => renderArchitecture(card.dataset.architecture || 'taj'));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.click();
    }
  });
});

if (architectureCards.length) {
  renderArchitecture('taj');
}



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
      sections.forEach((sectionId) => {
        document.getElementById(sectionId)?.classList.toggle('section-active', sectionId === e.target.id);
      });
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
      tile.classList.toggle('is-focused', Boolean(query) && isMatch);

      // Increase match count if tile matches
      if (isMatch) {
        matchCount += 1;
      }
    });

    // Show "no results" message if no matches found
    stateSearchEmpty.hidden = matchCount !== 0;
  });
}


// Cuisine taste spotlight
const tasteButtons = document.querySelectorAll('.cuisine-taste-grid button[data-taste]');
const dishCards = document.querySelectorAll('.dish-card[data-tastes]');

function clearTasteSpotlight() {
  tasteButtons.forEach((button) => button.classList.remove('active'));
  dishCards.forEach((dish) => {
    dish.classList.remove('is-muted', 'is-highlighted');
  });
}

tasteButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const taste = button.dataset.taste || '';
    const isActive = button.classList.contains('active');

    clearTasteSpotlight();
    if (isActive) return;

    button.classList.add('active');
    dishCards.forEach((dish) => {
      const tastes = dish.dataset.tastes || '';
      const matches = tastes.split(' ').includes(taste);
      dish.classList.toggle('is-highlighted', matches);
      dish.classList.toggle('is-muted', !matches);
    });
  });
});


// Philosophy quote switcher
const wisdomTriggers = document.querySelectorAll('[data-wisdom]');
const wisdomQuoteText = document.getElementById('wisdomQuoteText');
const wisdomQuoteSource = document.getElementById('wisdomQuoteSource');

const wisdomData = {
  truth: {
    text: 'Satyam Shivam Sundaram. Truth, goodness, and beauty are not separate ideals; they are different ways of approaching what is real.',
    source: 'Vedic Philosophy',
  },
  duty: {
    text: 'Dharma asks a person to act with responsibility: to self, family, community, nature, and the moment they have been given.',
    source: 'Indian Ethical Thought',
  },
  compassion: {
    text: 'Ahimsa Paramo Dharma. Non-violence is the highest moral virtue; the measure of civilization is its compassion toward all life.',
    source: 'The Mahabharata',
  },
  unity: {
    text: 'Vasudhaiva Kutumbakam. The world is one family, and wisdom begins when the boundary between self and other becomes softer.',
    source: 'Maha Upanishad',
  },
};

function renderWisdom(key) {
  const data = wisdomData[key];
  if (!data || !wisdomQuoteText || !wisdomQuoteSource) return;

  wisdomQuoteText.textContent = data.text;
  wisdomQuoteSource.textContent = data.source;

  wisdomTriggers.forEach((trigger) => {
    trigger.classList.toggle('active', trigger.dataset.wisdom === key);
  });
}

wisdomTriggers.forEach((trigger) => {
  if (trigger.tagName !== 'BUTTON') {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
  }
  trigger.addEventListener('click', () => renderWisdom(trigger.dataset.wisdom || 'truth'));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      trigger.click();
    }
  });
});

renderWisdom('compassion');



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



// Hero interaction
const heroSection = document.getElementById('hero');
const heroParticles = document.querySelector('.hero-particles');

if (heroSection) {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroParticles) {
    const particleCount = reduceMotion ? 0 : 10;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('span');
      const isSaffron = index % 3 === 0;
      const size = 4 + (index % 4);
      const left = 10 + (index * 8) % 82;
      const top = 18 + (index * 11) % 62;
      const duration = 8 + (index % 5) * 1.8;
      const delay = index * 0.6;

      particle.className = `hero-particle${isSaffron ? ' particle-saffron' : ''}`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      heroParticles.appendChild(particle);
    }
  }

  if (!reduceMotion) {

    heroSection.addEventListener('mousemove', (event) => {
      const bounds = heroSection.getBoundingClientRect();
      const heroX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 100;
      const heroY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 100;

      heroSection.style.setProperty('--hero-x', heroX.toFixed(2));
      heroSection.style.setProperty('--hero-y', heroY.toFixed(2));
    });

    heroSection.addEventListener('mouseleave', () => {
      heroSection.style.setProperty('--hero-x', '0');
      heroSection.style.setProperty('--hero-y', '0');
    });

    heroSection.addEventListener('mouseenter', () => {
      heroSection.classList.add('hero-active');
    });

    heroSection.addEventListener('mouseleave', () => {
      heroSection.classList.remove('hero-active');
    });
  }
}



// Chatbot functionality
const chatToggle = document.getElementById('chatToggle');
const chatClose = document.getElementById('chatClose');
const chatWidget = document.getElementById('chatWidget');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatBody = document.getElementById('chatBody');

let chatHistory = [];

if (chatToggle && chatClose && chatWidget && chatInput && chatSend && chatBody) {
  
  // Toggle chat window
  chatToggle.addEventListener('click', () => {
    chatWidget.classList.add('active');
    chatInput.focus();
  });
  
  chatClose.addEventListener('click', () => {
    chatWidget.classList.remove('active');
  });
  
  // Function to add a message to the UI
  function addMessage(text, sender, isMarkdown = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender === 'user' ? 'user-msg' : 'bot-msg');
    
    if (isMarkdown && typeof marked !== 'undefined') {
      msgDiv.innerHTML = marked.parse(text);
    } else {
      msgDiv.textContent = text;
    }
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  
  // Function to show/hide typing indicator
  function showTyping(show) {
    if (show) {
      const typingDiv = document.createElement('div');
      typingDiv.classList.add('chat-msg', 'bot-msg', 'typing-indicator');
      typingDiv.id = 'typingIndicator';
      typingDiv.innerHTML = '<span class="typing-dots">Typing</span>';
      chatBody.appendChild(typingDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    } else {
      const typingDiv = document.getElementById('typingIndicator');
      if (typingDiv) {
        typingDiv.remove();
      }
    }
  }
  
  // Handle sending message
  async function handleSend() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // UI updates for user message
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    showTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, history: chatHistory })
      });
      
      const data = await response.json();
      
      showTyping(false);
      
      if (response.ok && data.reply) {
        addMessage(data.reply, 'bot', true);
        
        // Update history
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage(data.error || 'Sorry, I am having trouble connecting.', 'bot');
      }
      
    } catch (error) {
      showTyping(false);
      addMessage('Sorry, a network error occurred. Please try again.', 'bot');
    }
  }
  
  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });
}
