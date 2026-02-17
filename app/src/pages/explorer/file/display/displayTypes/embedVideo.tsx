import type { FileModelDTO } from '@bindings/FileModelDTO.ts';

export default function EmbedVideo({
  file,
  serveUrl,
}: {
  file: FileModelDTO;
  serveUrl: string;
}) {
  return (
    // biome-ignore lint/a11y/useMediaCaption: Captions are currently not supported
    <video
      controls
      className={
        'absolute inset-0 h-full w-full object-scale-down animate-fade-scale-in duration-300'
      }
      title={file.file_name}
    >
      <source src={serveUrl} type={'video/mp4'} />
    </video>
  );
}
