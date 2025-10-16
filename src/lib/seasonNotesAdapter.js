(function(){
  const CANONICAL_SEASONS = ['Summer','Fall','Early Winter','Late Winter','Spring','Early Summer'];

  const SEASON_NOTES_DATA = {
    'Summer': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    },
    'Fall': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    },
    'Early Winter': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    },
    'Late Winter': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    },
    'Spring': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    },
    'Early Summer': {
      sections: [
        {
          heading: 'Razor Tours:',
          lines: [
            '8:00am – 11:00am | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License',
            '2:00pm – 5:00pm | 3-Hour Razor Tour  - Sharing 1 Razor OR Two Separate Razors | Please wear closed toed shoes, long pants, and be sure to bring your valid Drivers License'
          ]
        },
        {
          heading: 'After October 8th\nHorseback Rides:',
          lines: [
            'TIME – TIME | 60-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.',
            'TIME – TIME | 90-Minute Horseback Ride – Please plan to arrive 15 minutes in advance, dressed in long pants and closed-toe shoes.'
          ]
        }
      ]
    }
  };

  function normalizeSeasonKey(name) {
    if (!name) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;
    const withoutYear = trimmed.replace(/\s+2025$/, '');
    const normalized = withoutYear.trim().toLowerCase();
    const match = CANONICAL_SEASONS.find(season => season.toLowerCase() === normalized);
    return match || null;
  }

  function cloneSections(sections) {
    if (!Array.isArray(sections)) return [];
    return sections.map(section => ({
      heading: section.heading,
      lines: Array.isArray(section.lines) ? section.lines.slice() : []
    }));
  }

  function getSeasonNotes(seasonName) {
    const key = normalizeSeasonKey(seasonName);
    if (!key || !SEASON_NOTES_DATA[key]) {
      return { sections: [] };
    }
    const seasonData = SEASON_NOTES_DATA[key];
    return { sections: cloneSections(seasonData.sections) };
  }

  window.getSeasonNotes = getSeasonNotes;
})();
