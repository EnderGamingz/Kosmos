import { getTitle } from '@utils/metadata.ts';

export function DefaultMetadata() {
  return (
    <>
      <title>{getTitle()}</title>
    </>
  );
}

export function PageMetadata({ title }: { title: string }) {
  return (
    <>
      <title>{getTitle(title)}</title>
    </>
  );
}
