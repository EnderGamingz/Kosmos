import { cn } from '@lib/utils.ts';

export function SettingsSubtitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <h2 className={cn('text-xl font-bold animate-fade-in-top', className)}>
      {title}
    </h2>
  );
}

export function SettingsTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return <h1 className={cn('text-3xl font-bold', className)}>{title}</h1>;
}
