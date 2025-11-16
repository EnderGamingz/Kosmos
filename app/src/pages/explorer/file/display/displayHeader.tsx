import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Checkbox } from '@/components/ui/checkbox';
import { truncateString } from '@utils/truncate.ts';

export function DisplayHeader({
  file,
  selected,
  onSelect,
}: {
  file: FileModelDTO;
  selected?: boolean;
  onSelect?: (file: FileModelDTO) => void;
}) {
  const safeName = truncateString(file.file_name, 80);
  return (
    <div className={'flex items-center gap-2'}>
      {selected !== undefined && (
        <Checkbox checked={selected} onClick={() => onSelect?.(file)} />
      )}
      <p
        className={
          'select-all whitespace-break-spaces break-all text-xl font-semibold'
        }
        title={file.file_name}
      >
        {safeName}
      </p>
    </div>
  );
}
