import { useState } from 'react';
import tw from '@utils/classMerge.ts';
import { FileDisplayHandler } from '@pages/explorer/file/display/displayTypes/fileDisplayHandler.tsx';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayActions } from '@pages/explorer/file/display/fileDisplayActions.tsx';
import { useAccessShareFile } from '@lib/query.ts';
import { AxiosError } from 'axios';
import { ShareMessage } from '@pages/share/shareMessage.tsx';
import { ShareError } from '@pages/share/shareError.tsx';
import { Helmet } from 'react-helmet';
import { truncateString } from '@utils/truncate.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function FileShareDisplay({ uuid }: { uuid: string }) {
  const [fullsScreenPreview, setFullScreenPreview] = useState(false);
  const share = useAccessShareFile(uuid);

  if (share.isLoading)
    return <ShareMessage text={`Loading file share...`} loading={true} />;
  if (!share.data)
    return <ShareError type={'file'} error={share.error as AxiosError} />;

  const file = share.data as unknown as FileModelDTO;

  return (
    <div
      className={
        'mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-10 md:p-10'
      }>
      <Helmet>
        <title>{truncateString(share.data.file_name) ?? 'Shared File'}</title>
      </Helmet>
      <div
        className={tw(
          '-mb-5 h-[300px] flex-grow overflow-hidden md:-mr-5 md:mb-0 md:h-[500px] md:min-h-[unset] [&>*]:absolute [&>*]:inset-0 [&>*]:overflow-visible',
          fullsScreenPreview ? 'z-20' : 'relative z-0',
        )}>
        <FileDisplayHandler
          file={file}
          shareUuid={uuid}
          fullScreen={fullsScreenPreview}
          onFullScreen={setFullScreenPreview}
        />
      </div>
      <div className={'mt-5 space-y-2 md:mt-0'}>
        <DisplayHeader file={file} />
        <FileDisplayStats file={file} />
        <div className={'mt-2 px-1'}>
          <FileDisplayFooter file={file} />
        </div>
        <FileDisplayActions left file={file} shareUuid={uuid} />
      </div>
    </div>
  );
}
