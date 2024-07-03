import { FileModel } from '@models/file.ts';
import { useState } from 'react';
import tw from '@lib/classMerge.ts';
import { FileDisplayHandler } from '@pages/explorer/file/display/fileDisplayHandler.tsx';
import { DisplayHeader } from '@pages/explorer/file/display/displayHeader.tsx';
import { FileDisplayStats } from '@pages/explorer/file/display/fileDisplayStats.tsx';
import { FileDisplayFooter } from '@pages/explorer/file/display/fileDisplayFooter.tsx';
import { FileDisplayAction } from '@pages/explorer/file/display/fileDisplayAction.tsx';
import { accessShareFile } from '@lib/query.ts';
import { ShareError, ShareMessage } from '@pages/share/index.tsx';
import { AxiosError } from 'axios';

export function FileShareDisplay({ uuid }: { uuid: string }) {
  const [fullsScreenPreview, setFullScreenPreview] = useState(false);
  const share = accessShareFile(uuid);

  if (share.isLoading)
    return <ShareMessage text={`Loading file share...`} loading={true} />;
  if (!share.data)
    return <ShareError type={'file'} error={share.error as AxiosError} />;

  return (
    <div
      className={
        'mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-10 md:p-10'
      }>
      <div
        className={tw(
          '-mb-5 h-[300px] flex-grow md:-mr-5 md:mb-0 md:h-[500px] md:min-h-[unset] [&>*]:absolute [&>*]:inset-0 [&>*]:overflow-visible',
          fullsScreenPreview ? 'z-20' : 'relative z-0',
        )}>
        <FileDisplayHandler
          file={share.data as FileModel}
          shareUuid={uuid}
          fullScreen={fullsScreenPreview}
          onFullScreen={setFullScreenPreview}
        />
      </div>
      <div className={'mt-5 space-y-2 md:mt-0'}>
        <DisplayHeader file={share.data as FileModel} />
        <FileDisplayStats file={share.data as FileModel} />
        <div className={'mt-2 px-1'}>
          <FileDisplayFooter file={share.data as FileModel} />
        </div>
        <FileDisplayAction
          left
          file={share.data as FileModel}
          shareUuid={uuid}
        />
      </div>
    </div>
  );
}
