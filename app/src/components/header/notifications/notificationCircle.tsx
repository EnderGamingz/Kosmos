import tw from '@utils/classMerge.ts';

export const NotificationCircle = ({ className }: { className: string }) => (
  <div
    className={tw('h-2.5 w-2.5 rounded-full opacity-50 shadow', className)}
  />
);
