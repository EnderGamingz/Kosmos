import type { FileModelDTO } from '@bindings/FileModelDTO.ts';

export default function EmbedAudio({
  file,
  serveUrl,
}: {
  file: FileModelDTO;
  serveUrl: string;
}) {
  return (
    // biome-ignore lint/a11y/useMediaCaption: Captions are currently not supported
    <audio
      className={'animate-fade-scale-in duration-300'}
      controls
      title={file.file_name}
    >
      <source src={serveUrl} type={'video/mp4'} />
    </audio>
  );
}
