export const getInitialGridSize = (): number => {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  if (window.innerWidth < 1280) return 3;
  if (window.innerWidth < 1536) return 4;
  if (window.innerWidth < 1920) return 5;
  if (window.innerWidth < 2560) return 6;
  return 7;
};
