export enum ResolveAction {
  MakeUnique,
  Skip,
  Replace,
}

export type UploadFile = {
  file: File;
  newName?: string;
  conflict: boolean;
  resolveAction?: ResolveAction;
};

export function makeUploadFiles(files: File[], filesNames: string[]) {
  return files.map(
    f =>
      ({
        file: f,
        conflict: !f.webkitRelativePath && filesNames.includes(f.name),
      }) satisfies UploadFile,
  );
}
