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
  const RAZOR_TOUR_SLOTS = {
    early: [
      '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
      '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
    ],
    standard: [
      '9:00am – 12:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
      '1:00pm – 4:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
    ]
  };
  const RAZOR_TOURS = {
    'Summer 2025': RAZOR_TOUR_SLOTS.early,
    'Fall 2025': RAZOR_TOUR_SLOTS.standard,
    'Early Winter 2025': RAZOR_TOUR_SLOTS.standard,
    'Late Winter 2025': RAZOR_TOUR_SLOTS.standard,
    'Spring 2025': RAZOR_TOUR_SLOTS.standard,
    'Early Summer 2025': RAZOR_TOUR_SLOTS.early
  };
  const HORSEBACK_RIDES = [
    'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
    'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
  ];

  const DASH_REGEX = /\s*[\u2012-\u2015-]\s*/g;

  function ordinalSuffix(day) {
    if (typeof day !== 'number' || Number.isNaN(day)) return '';
    const mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  function formatRangePart(part) {
    if (typeof part !== 'string') return '';
    const trimmed = part.trim();
    const match = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s*(st|nd|rd|th))?$/);
    if (!match) return trimmed;
    const month = match[1];
    const dayNumber = parseInt(match[2], 10);
    if (!dayNumber) return `${month} ${match[2]}`;
    return `${month} ${dayNumber}${ordinalSuffix(dayNumber)}`;
  }

  function formatSeasonRange(rangeText) {
    if (typeof rangeText !== 'string') return rangeText;
    const normalized = rangeText.replace(DASH_REGEX, ' - ').trim();
    const parts = normalized.split(' - ').map(formatRangePart);
    if (parts.length !== 2) {
      return normalized;
    }
    return `${parts[0]} - ${parts[1]}`;
  }

  function createCopyButton() {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copybtn';
    copyBtn.setAttribute('title', 'Copy line');
    copyBtn.setAttribute('aria-label', 'Copy line');
    copyBtn.innerHTML = copyIcon;
    return copyBtn;
  }

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

    const copyBtn = createCopyButton();

    actEl.appendChild(timeCol);
    actEl.appendChild(titleCol);
    actEl.appendChild(copyBtn);
    actsContainer.appendChild(actEl);
  }

  function parseTimeAndTitle(text) {
    if (typeof text !== 'string') return { time: '', title: '' };
    const parts = text.split('|');
    const time = (parts.shift() || '').trim();
    const title = parts.join('|').trim();
    return { time, title };
  }

  function createSupplementalAct(text) {
    const { time, title } = parseTimeAndTitle(text);
    const actEl = document.createElement('div');
    actEl.className = 'act';
    actEl.setAttribute('data-copy', text);

    const timeCol = document.createElement('div');
    if (time) {
      const pill = document.createElement('span');
      pill.className = 'timepill';
      const dot = document.createElement('span');
      dot.className = 'time-dot';
      pill.appendChild(dot);
      pill.appendChild(document.createTextNode(` ${time}`));
      timeCol.appendChild(pill);
    }

    const titleCol = document.createElement('div');
    titleCol.className = 'titleline';
    titleCol.textContent = title;

    const copyBtn = createCopyButton();

    actEl.appendChild(timeCol);
    actEl.appendChild(titleCol);
    actEl.appendChild(copyBtn);
    return actEl;
  }

  function renderSupplementalActivities(container, lines) {
    if (!container || !Array.isArray(lines) || !lines.length) return;
    container.innerHTML = '';
    lines.forEach(text => container.appendChild(createSupplementalAct(text)));
  }

  function updateDayBadge(dayDetail, count) {
    const badge = dayDetail.querySelector('summary .badge');
    if (badge) {
      badge.textContent = `${count} ${count === 1 ? 'activity' : 'activities'}`;
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
        rangeEl.textContent = formatSeasonRange(seasonData.range);
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
      const daySection = seasonDetail.querySelector('.section.day');
      const razorLines = RAZOR_TOURS[seasonDetail.dataset.seasonFull];
      if (razorLines && daySection) {
        const razorActs = daySection.querySelector('[data-extra-acts="razor-tours"]');
        renderSupplementalActivities(razorActs, razorLines);
      }
    });

    const horsebackActs = document.querySelector('[data-extra-acts="horseback-rides"]');
    renderSupplementalActivities(horsebackActs, HORSEBACK_RIDES);

    if (errors.length) {
      errors.forEach(msg => console.error(msg));
      throw new Error('Activity hydration failed');
    }

    validateAllDaysPopulated();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
})();
