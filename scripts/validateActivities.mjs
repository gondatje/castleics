import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'src', 'data', 'activities-2025.json');
const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function canonicalDay(day) {
  if (!day) return null;
  const normalized = day.trim().toLowerCase();
  return DAY_ORDER.find(name => name.toLowerCase() === normalized) || null;
}

function validateData(structure) {
  const errors = [];
  for (const [seasonName, seasonData] of Object.entries(structure)) {
    if (!seasonData || typeof seasonData !== 'object') {
      errors.push(`Invalid season structure → Season='${seasonName}'`);
      continue;
    }
    if (!seasonData.days || typeof seasonData.days !== 'object') {
      errors.push(`Missing days object → Season='${seasonName}'`);
      continue;
    }
    DAY_ORDER.forEach(day => {
      const activities = seasonData.days[day];
      if (!Array.isArray(activities) || activities.length === 0) {
        errors.push(`Missing activities → Season='${seasonName}', Day='${day}'`);
        return;
      }
      activities.forEach((activity, idx) => {
        if (!activity || typeof activity !== 'object') {
          errors.push(`Invalid activity → Season='${seasonName}', Day='${day}', Index=${idx}`);
          return;
        }
        if (!activity.time || !activity.title) {
          errors.push(`Incomplete activity → Season='${seasonName}', Day='${day}', Index=${idx}`);
        }
      });
    });
  }
  return errors;
}

async function main() {
  const raw = await readFile(dataPath, 'utf8');
  const data = JSON.parse(raw);
  const errors = validateData(data);
  if (errors.length) {
    errors.forEach(msg => console.error(msg));
    process.exitCode = 1;
    return;
  }
  console.log('VALIDATION: PASS');
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
