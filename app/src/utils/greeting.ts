export default function getCurrentTimeSection() {
  const currentTime = new Date().getHours();
  if (currentTime < 12) {
    return 'morning';
  } else if (currentTime < 18) {
    return 'afternoon';
  } else if (currentTime < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}

const GREETINGS: Record<ReturnType<typeof getCurrentTimeSection>, string[]> = {
  morning: [
    'Ready to start your day?',
    'Files are ready.',
    'Let’s get to work!',
    'Starting fresh today.',
    'Set your day in motion.',
  ],
  afternoon: [
    'Keep momentum going.',
    'Orbit through tasks.',
    'Afternoon grind steady.',
    'How’s the workflow?',
  ],
  evening: [
    'Wrapping up the day?',
    'Checking for any loose ends?',
    'Evening workflow steady.',
    'Prepare for tomorrow.',
    'Almost time to log off.',
  ],
  night: [
    'Quiet orbit tonight.',
    'Anything left to organize?',
    'Ready for morning?',
    'Working late?',
  ],
};

export function getRandomGreeting() {
  const timeOfDay = getCurrentTimeSection();
  const pool = GREETINGS[timeOfDay] || GREETINGS.morning;
  return pool[Math.floor(Math.random() * pool.length)];
}
