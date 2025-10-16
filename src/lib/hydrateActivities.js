(function(){
  const ACTIVITIES_URL = 'src/data/activities-2025.json';
  const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const seasonNameMap = {
    'Summer': 'Summer 2025',
    'Fall': 'Fall 2025',
    'Early Winter': 'Early Winter 2025',
    'Late Winter': 'Late Winter 2025',
    'Spring': 'Spring 2025',
    'Early Summer': 'Early Summer 2025'
  };
  const copyIcon = '<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M9 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v6a2 2 0 0 0 2 2h7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const dayLookup = DAY_ORDER.reduce((acc, day) => {
    acc[day.toLowerCase()] = day;
    return acc;
  }, {});

  function canonicalDayName(value) {
    if (!value) return null;
    return dayLookup[value.trim().toLowerCase()] || null;
  }

  function getSeasonKey(detail) {
    const raw = detail?.dataset?.season ? detail.dataset.season.trim() : '';
    return seasonNameMap[raw] || raw || null;
  }

  function renderActivity(actsContainer, activity) {
    const { time, title } = activity;
    const actEl = document.createElement('div');
    actEl.className = 'act';
    actEl.setAttribute('data-copy', `${time} | ${title}`);

    const timeCol = document.createElement('div');
    const pill = document.createElement('span');
    pill.className = 'timepill';
    const dot = document.createElement('span');
    dot.className = 'time-dot';
    pill.appendChild(dot);
    pill.appendChild(document.createTextNode(` ${time}`));
    timeCol.appendChild(pill);

    const titleCol = document.createElement('div');
    titleCol.className = 'titleline';
    titleCol.textContent = title;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copybtn';
    copyBtn.setAttribute('title', 'Copy line');
    copyBtn.setAttribute('aria-label', 'Copy line');
    copyBtn.innerHTML = copyIcon;

    actEl.appendChild(timeCol);
    actEl.appendChild(titleCol);
    actEl.appendChild(copyBtn);
    actsContainer.appendChild(actEl);
  }

  function renderSeasonNotes(seasonDetail, seasonName, errors) {
    const notesContainer = seasonDetail.querySelector('[data-notes]');
    if (!notesContainer) {
      if (errors) {
        errors.push(`Missing notes container → Season='${seasonName || seasonDetail.dataset.season || 'Unknown'}'`);
      }
      return;
    }
    if (typeof window.getSeasonNotes !== 'function') {
      if (errors) {
        errors.push('Missing getSeasonNotes adapter');
      }
      notesContainer.innerHTML = '';
      return;
    }
    const notesData = window.getSeasonNotes(seasonName);
    const sections = Array.isArray(notesData?.sections) ? notesData.sections : [];
    notesContainer.innerHTML = '';
    sections.forEach(section => {
      if (!section) return;
      if (typeof section.heading === 'string') {
        const headingEl = document.createElement('div');
        headingEl.className = 'note-heading';
        headingEl.innerHTML = section.heading.replace(/\n/g, '<br>');
        notesContainer.appendChild(headingEl);
      }
      const lines = Array.isArray(section.lines) ? section.lines : [];
      lines.forEach(line => {
        if (typeof line !== 'string') return;
        const actEl = document.createElement('div');
        actEl.className = 'act note-act';
        actEl.setAttribute('data-copy', line);

        const timeCol = document.createElement('div');
        const pill = document.createElement('span');
        pill.className = 'timepill';
        const dot = document.createElement('span');
        dot.className = 'time-dot';
        pill.appendChild(dot);
        pill.appendChild(document.createTextNode(' '));
        timeCol.appendChild(pill);

        const titleCol = document.createElement('div');
        titleCol.className = 'titleline';
        titleCol.textContent = line;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copybtn';
        copyBtn.setAttribute('title', 'Copy line');
        copyBtn.setAttribute('aria-label', 'Copy line');
        copyBtn.innerHTML = copyIcon;

        actEl.appendChild(timeCol);
        actEl.appendChild(titleCol);
        actEl.appendChild(copyBtn);
        notesContainer.appendChild(actEl);
      });
    });
  }

  function validateSeasonNotes() {
    if (typeof window.getSeasonNotes !== 'function') {
      console.error('Missing getSeasonNotes adapter');
      throw new Error('Season notes validation failed');
    }
    const errors = [];
    document.querySelectorAll('[data-season]').forEach(seasonDetail => {
      const seasonName = seasonDetail.dataset.seasonFull || seasonDetail.dataset.season || '';
      const notesData = window.getSeasonNotes(seasonName);
      const sections = Array.isArray(notesData?.sections) ? notesData.sections : [];
      if (sections.length < 1) {
        errors.push(`Missing season notes → Season='${seasonName || 'Unknown'}'`);
        return;
      }
      sections.forEach((section, idx) => {
        const lines = Array.isArray(section?.lines) ? section.lines : [];
        if (lines.length < 1) {
          const label = typeof section?.heading === 'string' && section.heading ? section.heading : `Index ${idx}`;
          errors.push(`Missing season note lines → Season='${seasonName || 'Unknown'}', Section='${label}'`);
        }
      });
    });
    if (errors.length) {
      errors.forEach(msg => console.error(msg));
      throw new Error('Season notes validation failed');
    }
    return true;
  }

  function updateDayBadge(dayDetail, count) {
    const badge = dayDetail.querySelector('summary .badge');
    if (badge) {
      badge.textContent = `${count} ${count === 1 ? 'activity' : 'activities'}`;
    }
  }

  function updateSeasonBadge(seasonDetail) {
    const total = seasonDetail.querySelectorAll('.acts .act').length;
    const badge = seasonDetail.querySelector(':scope > summary .badge');
    if (badge) {
      badge.textContent = `${total} ${total === 1 ? 'activity' : 'activities'}`;
    }
  }

  function validateAllDaysPopulated() {
    const errors = [];
    document.querySelectorAll('[data-season]').forEach(seasonDetail => {
      const seasonKey = getSeasonKey(seasonDetail) || seasonDetail.dataset.season || 'Unknown season';
      const days = seasonDetail.querySelectorAll('[data-day]');
      if (days.length < DAY_ORDER.length) {
        errors.push(`Missing day containers → Season='${seasonKey}'`);
      }
      DAY_ORDER.forEach(dayName => {
        const dayDetail = Array.from(days).find(detail => canonicalDayName(detail.dataset.day || detail.querySelector('summary .season-name')?.textContent) === dayName);
        if (!dayDetail) {
          errors.push(`Missing day container → Season='${seasonKey}', Day='${dayName}'`);
          return;
        }
        const count = dayDetail.querySelectorAll('.acts .act').length;
        if (count < 1) {
          errors.push(`Missing activities → Season='${seasonKey}', Day='${dayName}'`);
        }
      });
    });
    if (errors.length) {
      errors.forEach(msg => console.error(msg));
      throw new Error('validateAllDaysPopulated failed');
    }
    return true;
  }

  window.validateAllDaysPopulated = validateAllDaysPopulated;

  async function hydrate() {
    let data;
    try {
      const response = await fetch(ACTIVITIES_URL);
      if (!response.ok) {
        throw new Error(`Failed to load activities data (${response.status})`);
      }
      data = await response.json();
    } catch (err) {
      console.error('Unable to hydrate activities:', err);
      return;
    }

    const errors = [];
    document.querySelectorAll('[data-season]').forEach(seasonDetail => {
      const seasonKey = getSeasonKey(seasonDetail);
      if (!seasonKey || !data[seasonKey]) {
        errors.push(`Missing season data → Season='${seasonDetail.dataset.season || seasonKey || 'Unknown'}'`);
        return;
      }
      seasonDetail.dataset.seasonFull = seasonKey;
      const seasonData = data[seasonKey];
      const rangeEl = seasonDetail.querySelector('.season-range');
      if (rangeEl && seasonData.range) {
        rangeEl.textContent = seasonData.range;
      }

      const dayDetails = seasonDetail.querySelectorAll('[data-day]');
      DAY_ORDER.forEach(dayName => {
        const dayDetail = Array.from(dayDetails).find(detail => canonicalDayName(detail.dataset.day || detail.querySelector('summary .season-name')?.textContent) === dayName);
        if (!dayDetail) {
          errors.push(`Missing day container → Season='${seasonKey}', Day='${dayName}'`);
          return;
        }
        dayDetail.dataset.day = dayName;
        const actsContainer = dayDetail.querySelector('.acts');
        if (!actsContainer) {
          errors.push(`Missing .acts container → Season='${seasonKey}', Day='${dayName}'`);
          return;
        }
        const activities = seasonData.days?.[dayName];
        if (!Array.isArray(activities) || activities.length === 0) {
          errors.push(`Missing activities → Season='${seasonKey}', Day='${dayName}'`);
          actsContainer.innerHTML = '';
          return;
        }
        actsContainer.innerHTML = '';
        activities.forEach(activity => renderActivity(actsContainer, activity));
        updateDayBadge(dayDetail, activities.length);
      });
      updateSeasonBadge(seasonDetail);
      renderSeasonNotes(seasonDetail, seasonDetail.dataset.seasonFull || seasonKey || seasonDetail.dataset.season, errors);
    });

    if (errors.length) {
      errors.forEach(msg => console.error(msg));
      throw new Error('Activity hydration failed');
    }

    validateSeasonNotes();

    validateAllDaysPopulated();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
})();
