import { getFileTypeString } from '@models/file.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import { useNavigate } from 'react-router-dom';
import { FileTypeSumDataDTO } from '@bindings/FileTypeSumDataDTO.ts';
import { cn } from '@lib/utils.ts';

export function UsageReportByType({ types }: { types: FileTypeSumDataDTO[] }) {
  return (
    <section className={'space-y-2'}>
      <h2
        className={
          'text-xl font-semibold text-stone-700 dark:text-stone-300 animate-fade-in-top delay-400'
        }>
        Storage used by type
      </h2>
      <div
        className={
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
        }>
        {types.map((type, i) => (
          <FileTypeUsageItem key={type.file_type} type={type} index={i} />
        ))}
      </div>
    </section>
  );
}

function FileTypeUsageItem({
  type,
  index,
}: {
  type: FileTypeSumDataDTO;
  index: number;
}) {
  const fileTypeString = getFileTypeString(type.file_type);
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/home/files/${type.file_type}`)}
      style={{ animationDelay: `${index * 50 + 500}ms` }}
      className={cn(
        'overflow-hidden rounded-xl bg-stone-300/40 p-2 text-stone-700',
        'cursor-pointer transition-colors hover:bg-stone-400/40',
        'border border-stone-400/40 animate-fade-in-left',
        'dark:bg-stone-600/40 dark:text-stone-300 dark:hover:bg-stone-700/40',
      )}>
      <p
        title={fileTypeString}
        className={'truncate whitespace-nowrap text-lg'}>
        {fileTypeString}
      </p>
      <p className={'font-semibold'}>{useFormatBytes(type.sum)}</p>
      <p className={'text-sm italic'}>{type.count} Files</p>
    </div>
  );
}
