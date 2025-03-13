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
