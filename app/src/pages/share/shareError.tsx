import { AxiosError } from 'axios';
import { ShareOperationType } from '@models/file.ts';
import { PasswordUnlock } from '@pages/share/passwordUnlock.tsx';
import { ShareMessage } from '@pages/share/shareMessage.tsx';

function getErrorText(
  errorStatus: number,
  type: ShareOperationType,
  altText?: string,
) {
  switch (errorStatus) {
    case 410:
      return 'Share expired';
    case 403:
      return 'Insufficient permissions';
    default:
      return altText || `Error loading ${type} share`;
  }
}

export function ShareError({
  error,
  type,
}: {
  error?: AxiosError;
  type: ShareOperationType;
}) {
  const errorStatus = (error as AxiosError)?.response?.status;
  //@ts-expect-error backend passes `error` on error
  const errorMessage = (error as AxiosError)?.response?.data?.error;

  // 423: Locked
  if (errorStatus === 423) return <PasswordUnlock />;

  const errorText = getErrorText(errorStatus || 0, type, errorMessage);

  return (
    <ShareMessage
      text={errorText}
      subText={errorMessage !== errorText && errorMessage}
    />
  );
}
