function getStateSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[1] || '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderList(items) {
  if (!items || items.length === 0) {
    return '<p class="empty-copy">Details coming soon.</p>';
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderEmptyBlock(message) {
  return `<p class="empty-copy">${escapeHtml(message)}</p>`;
}

function renderStatePage(state) {
  const root = document.getElementById('pageState');
  const keywords = [state.name, state.capital, state.region, ...(state.languages || [])].join(' • ');

  root.innerHTML = `
    <section class="hero reveal">
      <div class="hero-grid">
        <div class="hero-main">
          <div class="eyebrow">State Explorer</div>
          <h1>${escapeHtml(state.name)}</h1>
          <p class="subline">${escapeHtml(state.overview)}</p>
          <div class="meta-row">
            <div class="meta-pill">Capital: ${escapeHtml(state.capital)}</div>
            <div class="meta-pill">Region: ${escapeHtml(state.region)}</div>
            <div class="meta-pill">Best time: ${escapeHtml(state.bestTimeToVisit || 'Not listed')}</div>
            <div class="meta-pill">Trip length: ${escapeHtml(state.idealTripDuration || 'Not listed')}</div>
          </div>
        </div>
        <aside class="hero-side">
          <div class="state-seal">Bharat<br>Atlas</div>
          <p class="state-note">A detailed profile of geography, history, culture, festivals, and travel highlights curated for better trip planning.</p>
        </aside>
      </div>
    </section>

    <div class="layout reveal delay-1">
      <section class="panel panel-card">
        <h2 class="section-title">Overview</h2>
        <p class="section-subtitle">The essence of ${escapeHtml(state.name)} at a glance.</p>
        <p class="overview">${escapeHtml(state.overview)}</p>
      </section>
      <aside class="panel panel-card">
        <h2 class="section-title">Quick Facts</h2>
        <div class="facts-grid">
          <div class="fact"><span class="fact-label">Capital</span><span class="fact-value">${escapeHtml(state.capital)}</span></div>
          <div class="fact"><span class="fact-label">Region</span><span class="fact-value">${escapeHtml(state.region)}</span></div>
          <div class="fact"><span class="fact-label">Languages</span><span class="fact-value">${escapeHtml((state.languages || []).join(', ') || 'N/A')}</span></div>
          <div class="fact"><span class="fact-label">Best Time</span><span class="fact-value">${escapeHtml(state.bestTimeToVisit || 'N/A')}</span></div>
        </div>
      </aside>
    </div>

    <section class="section-block reveal delay-2">
      <h2 class="section-title">Geography & History</h2>
      <p class="section-subtitle">Landscape, legacy, and how this state evolved through time.</p>
      <div class="grid-2">
        <div class="list-card">
          <h3>Geography</h3>
          <p class="overview">${escapeHtml(state.geography || 'Not available yet.')}</p>
        </div>
        <div class="list-card">
          <h3>History</h3>
          <p class="overview">${escapeHtml(state.history || 'Not available yet.')}</p>
        </div>
      </div>
    </section>

    <section class="section-block reveal delay-3">
      <h2 class="section-title">Culture, Food & Economy</h2>
      <p class="section-subtitle">Traditions, flavors, and key economic strengths.</p>
      <div class="grid-3">
        <div class="list-card">
          <h3>Culture</h3>
          ${renderList(state.cultureHighlights || [])}
        </div>
        <div class="list-card">
          <h3>Cuisine</h3>
          ${renderList(state.cuisineHighlights || [])}
        </div>
        <div class="list-card">
          <h3>Economy</h3>
          ${renderList(state.economyHighlights || [])}
        </div>
      </div>
    </section>

    <section class="section-block reveal delay-4">
      <h2 class="section-title">Must Visit Places</h2>
      <p class="section-subtitle">Iconic destinations you should include in your itinerary.</p>
      <div class="list-card">
        ${(state.mustVisit || []).length > 0
          ? (state.mustVisit || []).map((place) => `
          <div class="visit-item">
            <span class="visit-name">${escapeHtml(place.name)}</span>
            <p class="visit-desc">${escapeHtml(place.description)}</p>
          </div>
        `).join('')
          : renderEmptyBlock('Travel highlights for this state will be added soon.')}
      </div>
    </section>

    <section class="section-block reveal delay-5">
      <h2 class="section-title">Major Festivals</h2>
      <p class="section-subtitle">Celebrations that define the rhythm of local life.</p>
      <div class="list-card">
        ${(state.majorFestivals || []).length > 0
          ? (state.majorFestivals || []).map((festival) => `
          <div class="festival-row">
            <div class="festival-month">${escapeHtml(festival.month || 'Any time')}</div>
            <div>
              <h3 class="festival-name">${escapeHtml(festival.name)}</h3>
              <p class="festival-note">${escapeHtml(festival.note)}</p>
            </div>
          </div>
        `).join('')
          : renderEmptyBlock('Festival details will appear here once they are available.')}
      </div>
    </section>

    <section class="section-block reveal delay-6">
      <h2 class="section-title">Travel Guide</h2>
      <p class="section-subtitle">Practical tips and reasons travelers keep coming back.</p>
      <div class="grid-2">
        <div class="list-card">
          <h3>Travel Tips</h3>
          ${renderList(state.travelTips || [])}
        </div>
        <div class="list-card">
          <h3>Why ${escapeHtml(state.name)}?</h3>
          <p class="overview">${escapeHtml((state.famousFor || []).join(', '))}</p>
        </div>
      </div>
    </section>
  `;

  document.title = `${state.name} | Bharat`;
  const description = document.querySelector('meta[name="description"]') || document.createElement('meta');
  description.name = 'description';
  description.content = `${state.name} state guide: ${keywords}.`;
  if (!description.isConnected) document.head.appendChild(description);
}

async function loadState() {
  const slug = getStateSlugFromPath();
  const root = document.getElementById('pageState');

  console.log('📍 Extracted state slug:', slug);

  if (!slug) {
    console.error('❌ No state slug found in URL');
    root.innerHTML = '<div class="error-state"><strong>Missing state name.</strong> Open the page as /state/bihar or /state/andhra-pradesh.</div>';
    return;
  }

  try {
    const apiUrl = `/api/state/${encodeURIComponent(slug)}`;
    console.log('🔄 Fetching API:', apiUrl);
    console.time(`API Call: ${slug}`);

    const response = await fetch(apiUrl);
    console.log('📊 API Response Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('✅ Data received:', data);
    console.timeEnd(`API Call: ${slug}`);

    if (!response.ok) {
      console.error('❌ API Error:', data.error);
      root.innerHTML = `<div class="error-state"><strong>State not found.</strong><br>${escapeHtml(data.error || 'No data available for this state.')}</div>`;
      return;
    }

    console.log('🎨 Rendering state page for:', data.name);
    renderStatePage(data);
    console.log('✨ Page rendered successfully');
  } catch (error) {
    console.error('🚨 Error loading state:', error);
    root.innerHTML = `<div class="error-state"><strong>Could not load state data.</strong><br>${escapeHtml(error.message)}</div>`;
  }
}

console.log('🚀 State page script loaded');
loadState();
