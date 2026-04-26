const stateList = document.getElementById('stateList');
const stateForm = document.getElementById('stateForm');
const formMessage = document.getElementById('formMessage');
const adminIdentity = document.getElementById('adminIdentity');
const logoutBtn = document.getElementById('logoutBtn');

const fieldIds = [
  'stateId',
  'name',
  'slug',
  'capital',
  'region',
  'overview',
  'geography',
  'history',
  'bestTimeToVisit',
  'idealTripDuration',
  'languages',
  'famousFor',
  'cultureHighlights',
  'cuisineHighlights',
  'economyHighlights',
  'travelTips',
  'mustVisit',
  'majorFestivals',
];

const fieldMap = Object.fromEntries(fieldIds.map((id) => [id, document.getElementById(id)]));
let selectedStateId = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setMessage(text, type = '') {
  formMessage.className = `message ${type}`.trim();
  formMessage.textContent = text;
}

function formatList(listValue) {
  return Array.isArray(listValue) ? listValue.join('\n') : '';
}

function formatJson(value) {
  return JSON.stringify(value || [], null, 2);
}

function parseJsonArray(raw, fieldName) {
  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be an array`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON for ${fieldName}: ${error.message}`);
  }
}

function normalizeStatePayload(state) {
  if (!state || typeof state !== 'object') {
    return null;
  }

  return {
    _id: String(state._id || ''),
    name: String(state.name || ''),
    slug: String(state.slug || ''),
    capital: String(state.capital || ''),
    region: String(state.region || 'North'),
    overview: String(state.overview || ''),
    geography: String(state.geography || ''),
    history: String(state.history || ''),
    bestTimeToVisit: String(state.bestTimeToVisit || ''),
    idealTripDuration: String(state.idealTripDuration || ''),
    languages: Array.isArray(state.languages) ? state.languages : [],
    famousFor: Array.isArray(state.famousFor) ? state.famousFor : [],
    cultureHighlights: Array.isArray(state.cultureHighlights) ? state.cultureHighlights : [],
    cuisineHighlights: Array.isArray(state.cuisineHighlights) ? state.cuisineHighlights : [],
    economyHighlights: Array.isArray(state.economyHighlights) ? state.economyHighlights : [],
    travelTips: Array.isArray(state.travelTips) ? state.travelTips : [],
    mustVisit: Array.isArray(state.mustVisit) ? state.mustVisit : [],
    majorFestivals: Array.isArray(state.majorFestivals) ? state.majorFestivals : [],
    updatedAt: state.updatedAt,
  };
}

async function renderStates(states, preferredStateId = null) {
  stateList.innerHTML = '';

  if (!Array.isArray(states) || states.length === 0) {
    selectedStateId = null;
    stateList.innerHTML = '<div class="state-meta">No state records found in database.</div>';
    setMessage('No states found in DB. Seed or add state documents first.', 'error');
    return;
  }

  let targetStateId = preferredStateId;
  const hasPreferredState = preferredStateId && states.some((entry) => String(entry._id) === String(preferredStateId));
  if (!hasPreferredState) {
    targetStateId = String(states[0]._id || '');
  }

  states.forEach((state) => {
    const stateId = String(state._id || '');
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'state-item';
    const updatedText = state.updatedAt ? new Date(state.updatedAt).toLocaleString() : 'Unknown';
    item.innerHTML = `
      <div class="state-name">${escapeHtml(state.name)}</div>
      <div class="state-meta">/${escapeHtml(state.slug)}</div>
      <div class="state-meta">Updated: ${escapeHtml(updatedText)}</div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.state-item').forEach((node) => node.classList.remove('active'));
      item.classList.add('active');
      selectedStateId = stateId;
      loadStateForEdit(stateId);
    });

    if (stateId && stateId === targetStateId) {
      item.classList.add('active');
    }

    stateList.appendChild(item);
  });

  if (targetStateId) {
    selectedStateId = targetStateId;
    await loadStateForEdit(targetStateId);
  }
}

function fillForm(state) {
  fieldMap.stateId.value = state._id;
  fieldMap.name.value = state.name || '';
  fieldMap.slug.value = state.slug || '';
  fieldMap.capital.value = state.capital || '';
  fieldMap.region.value = state.region || 'North';
  fieldMap.overview.value = state.overview || '';
  fieldMap.geography.value = state.geography || '';
  fieldMap.history.value = state.history || '';
  fieldMap.bestTimeToVisit.value = state.bestTimeToVisit || '';
  fieldMap.idealTripDuration.value = state.idealTripDuration || '';
  fieldMap.languages.value = formatList(state.languages);
  fieldMap.famousFor.value = formatList(state.famousFor);
  fieldMap.cultureHighlights.value = formatList(state.cultureHighlights);
  fieldMap.cuisineHighlights.value = formatList(state.cuisineHighlights);
  fieldMap.economyHighlights.value = formatList(state.economyHighlights);
  fieldMap.travelTips.value = formatList(state.travelTips);
  fieldMap.mustVisit.value = formatJson(state.mustVisit);
  fieldMap.majorFestivals.value = formatJson(state.majorFestivals);
}

// ==========================================
// AUTHORIZATION: SESSION VALIDATION
// ==========================================
// This function verifies if the user has an active, valid session.
// It hits an endpoint protected by the backend's ensureAdmin middleware.
async function ensureAdminSession() {
  const response = await fetch('/admin/api/me');

  // If the backend returns 401 Unauthorized, the session is invalid or expired
  if (response.status === 401) {
    window.location.href = '/admin/login'; // Force redirect to login page
    return false;
  }

  // If valid, display the logged-in admin's username
  const payload = await response.json();
  adminIdentity.textContent = `Signed in as ${payload.admin.username}`;
  return true;
}

async function loadStates() {
  setMessage('Loading states from DB...');
  const response = await fetch('/admin/api/states');
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load states');
  }

  await renderStates(payload, selectedStateId);
}

async function loadStateForEdit(stateId) {
  try {
    setMessage('Loading state data...');
    const response = await fetch(`/admin/api/state/${encodeURIComponent(stateId)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Failed to fetch state');
    }

    const normalizedState = normalizeStatePayload(payload);
    if (!normalizedState || !normalizedState._id) {
      throw new Error('Received invalid state payload from DB');
    }

    fillForm(normalizedState);
    setMessage(`Loaded from DB: ${normalizedState.name}`);
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

stateForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const stateId = fieldMap.stateId.value;
  if (!stateId) {
    setMessage('Select a state first', 'error');
    return;
  }

  let mustVisit;
  let majorFestivals;

  try {
    mustVisit = parseJsonArray(fieldMap.mustVisit.value, 'mustVisit');
    majorFestivals = parseJsonArray(fieldMap.majorFestivals.value, 'majorFestivals');
  } catch (error) {
    setMessage(error.message, 'error');
    return;
  }

  const payload = {
    capital: fieldMap.capital.value,
    region: fieldMap.region.value,
    overview: fieldMap.overview.value,
    geography: fieldMap.geography.value,
    history: fieldMap.history.value,
    bestTimeToVisit: fieldMap.bestTimeToVisit.value,
    idealTripDuration: fieldMap.idealTripDuration.value,
    languages: fieldMap.languages.value,
    famousFor: fieldMap.famousFor.value,
    cultureHighlights: fieldMap.cultureHighlights.value,
    cuisineHighlights: fieldMap.cuisineHighlights.value,
    economyHighlights: fieldMap.economyHighlights.value,
    travelTips: fieldMap.travelTips.value,
    mustVisit,
    majorFestivals,
  };

  try {
    setMessage('Saving changes...');
    const response = await fetch(`/admin/api/state/${encodeURIComponent(stateId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update state');
    }

    setMessage(`Saved successfully: ${result.state.name}`, 'success');
    selectedStateId = stateId;
    await loadStates();
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

// ==========================================
// AUTHORIZATION: LOGOUT
// ==========================================
// Sends a POST request to destroy the session on the backend
// and then redirects the user to the login page.
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/admin/logout', { method: 'POST' });
  } finally {
    window.location.href = '/admin/login';
  }
});

(async function init() {
  try {
    const isSessionValid = await ensureAdminSession();
    if (!isSessionValid) {
      return;
    }
    await loadStates();
  } catch (error) {
    setMessage(error.message, 'error');
  }
})();
