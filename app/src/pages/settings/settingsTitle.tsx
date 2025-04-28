import { cn } from '@lib/utils.ts';

export function SettingsSubtitle({
  title,
  className,
  description,
}: {
  title: string;
  className?: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className={cn('text-xl font-bold animate-fade-in-top', className)}>
        {title}
      </h2>
      {description && (
        <p
          className={
            'text-sm text-muted-foreground animate-fade-in-top delay-50'
          }>
          {description}
        </p>
      )}
    </div>
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
