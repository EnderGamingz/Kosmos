export function calculateDisplayHeight(
  isMobile: boolean,
  additionalHeight?: number[],
) {
  const dvh = window.innerHeight;
  const header = 80;
  const footer = isMobile ? 80 : 0;
  const breadcrumbs = 40;

  return (
    dvh -
    header -
    footer -
    breadcrumbs -
    (additionalHeight?.reduce((a, b) => a + b, 0) || 0)
  );
}
