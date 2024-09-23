export enum ShareType {
  Public,
  Private,
}

export function getShareTypeString(type: ShareType, lower?: boolean) {
  switch (type) {
    case ShareType.Public:
      return lower ? 'public' : 'Public';
    case ShareType.Private:
      return lower ? 'private' : 'Private';
  }
}
