import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { useZipInformation } from '@lib/query.ts';
import { FileTypeDisplay } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { ZipInformation } from '@bindings/ZipInformation.ts';
import { useState } from 'react';
import { Collapse } from 'react-collapse';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export default function ArchiveDisplay({
  file,
  share,
  loading,
}: {
  file: FileModelDTO;
  loading?: boolean;
  share: {
    shareUuid?: string;
    isSharedInFolder?: boolean;
  };
}) {
  const query = useZipInformation(
    share.shareUuid,
    share.isSharedInFolder,
    file.id,
  );
  return (
    <FileTypeDisplay
      id={file.id}
      name={file.file_name}
      type={file.file_type}
      loading={loading || query.isLoading}>
      <div className={'h-full w-full overflow-auto p-3 text-left'}>
        <h2
          className={
            'flex items-center pb-2 text-xl [&_svg]:!h-10 [&_svg]:!w-10'
          }>
          <ItemIcon id={file.id} name={file.file_name} type={file.file_type} />
          <span
            className={
              'overflow-hidden whitespace-nowrap animate-fade-in-left delay-300'
            }>
            Archive Preview
          </span>
        </h2>
        <div className={'animate-fade-in-top delay-400'}>
          {query.data && <ArchiveFolder data={query.data} />}
        </div>
      </div>
    </FileTypeDisplay>
  );
}

function ArchiveItem({
  name,
  onClick,
  active,
}: {
  name: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1 transition-colors',
        onClick &&
          'cursor-pointer bg-stone-600/60 hover:bg-stone-600/40 dark:bg-stone-700/60',
      )}>
      {onClick && (
        <ChevronDown
          className={cn(
            '!h-4 !w-4 transition-all',
            active ? 'rotate-180' : 'rotate-0',
          )}
        />
      )}
      <p title={name} className={'truncate'}>
        {name}
      </p>
    </div>
  );
}

function ArchiveFolder({
  data,
  indent = 0,
}: {
  data: ZipInformation;
  indent?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'transition-colors',
        indent > 0 && 'mt-1 border-l-1 border-stone-700/50 pl-1',
      )}
      style={{
        marginLeft: indent * 3,
      }}>
      <ArchiveItem
        name={data.name}
        active={open}
        onClick={() => setOpen(prev => !prev)}
      />
      <Collapse isOpened={open}>
        {data.folders.map((folder, i) => (
          <ArchiveFolder
            key={`${folder.name}-${i}`}
            data={folder}
            indent={indent + 1}
          />
        ))}
        {data.files.map((file, i) => (
          <ArchiveItem key={`${file}-${i}`} name={file} />
        ))}
      </Collapse>
    </div>
  );
}
