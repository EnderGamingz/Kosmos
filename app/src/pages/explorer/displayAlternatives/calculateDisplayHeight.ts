export function calculateDisplayHeight(isMobile: boolean) {
  const dvh = window.innerHeight;
  const header = 80;
  const footer = isMobile ? 80 : 0;
  const breadcrumbs = 40;

  return dvh - header - footer - breadcrumbs;
}
