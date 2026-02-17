export default function getPasskeyError(error: Error) {
  const string = error.toString();
  if (string.includes('NotAllowedError'))
    return 'The user has denied the request';

  if (string.includes('NetworkError'))
    return 'The Identity Provider did not respond in time, or the credentials were not valid/found';

  return 'Error';
}
