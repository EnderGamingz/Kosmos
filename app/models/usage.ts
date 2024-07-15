import { FileModel } from '@models/file.ts';

export type UsageStats = {
  active: number;
  bin: number;
  total: number;
  limit: number;
};

export type UsageSum = {
  sum: number;
  count: number;
};

export type FileTypeSum = {
  file_type: number;
  sum: number;
  count: number;
};

export type UsageReport = {
  active_storage: UsageSum;
  bin_storage: UsageSum;
  by_file_type: FileTypeSum[];
  large_files: FileModel[];
};
