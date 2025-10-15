import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_PATTERN = /^\d{1,2}:\d{2}$/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '..', 'src', 'data', 'seasonalActivities.json');

const contents = readFileSync(dataPath, 'utf8');
const raw = JSON.parse(contents);

const errors = [];

if (!Array.isArray(raw.seasons)) {
  errors.push('Root data must include a "seasons" array.');
} else {
  raw.seasons.forEach((season, seasonIndex) => {
    const label = getSeasonLabel(season, seasonIndex);
    const days = season && typeof season === 'object' ? season.days : undefined;

    if (!days || typeof days !== 'object') {
      errors.push(`Season ${label} is missing a days map.`);
      return;
    }

    DAY_ORDER.forEach((day) => {
      const activities = Array.isArray(days[day]) ? days[day] : undefined;
      if (!activities) {
        errors.push(`Season ${label} is missing the ${day} array.`);
        return;
      }

      if (activities.length === 0) {
        errors.push(`Season ${label} has no activities on ${day}.`);
        return;
      }

      activities.forEach((activity, index) => {
        if (!activity || typeof activity !== 'object') {
          errors.push(`Season ${label} ${day} activity #${index + 1} is not an object.`);
          return;
        }

        if (typeof activity.title !== 'string' || activity.title.trim().length === 0) {
          errors.push(`Season ${label} ${day} activity #${index + 1} is missing a title.`);
        }

        validateTimeField(activity.start, label, day, index + 1, 'start');
        validateTimeField(activity.end, label, day, index + 1, 'end');
      });
    });
  });
}

if (errors.length > 0) {
  console.error('Seasonal activities validation failed:');
  errors.forEach((message) => console.error(` - ${message}`));
  process.exitCode = 1;
} else {
  console.log('Seasonal activities data looks good.');
}

function getSeasonLabel(season, index) {
  if (season && typeof season.label === 'string' && season.label.trim().length > 0) {
    return season.label.trim();
  }
  if (season && typeof season.name === 'string' && season.name.trim().length > 0) {
    return season.name.trim();
  }
  return `#${index + 1}`;
}

function validateTimeField(value, season, day, index, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`Season ${season} ${day} activity #${index} is missing a ${field} time.`);
    return;
  }

  const trimmed = value.trim();
  if (!TIME_PATTERN.test(trimmed)) {
    errors.push(`Season ${season} ${day} activity #${index} has an invalid ${field} time (${value}).`);
    return;
  }

  const [hourText, minuteText] = trimmed.split(':');
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);

  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    errors.push(`Season ${season} ${day} activity #${index} has an out-of-range ${field} hour (${value}).`);
  }

  if (!Number.isFinite(minute) || minute < 0 || minute > 59) {
    errors.push(`Season ${season} ${day} activity #${index} has an out-of-range ${field} minute (${value}).`);
  }
}
