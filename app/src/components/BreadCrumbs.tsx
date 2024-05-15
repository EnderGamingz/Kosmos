import ConditionalWrapper from './ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export type BreadCrumb = { name: string; href?: string };

export default function BreadCrumbs({ crumbs }: { crumbs: BreadCrumb[] }) {
  return (
    <div className={'flex items-center gap-2'}>
      {crumbs &&
        crumbs.map((item, i) => (
          <ConditionalWrapper
            key={`breadcrumb-${item.href}`}
            condition={!!item.href}
            wrapper={c => <Link to={item.href!}>{c}</Link>}>
            <div
              className={twMerge(
                'rounded-lg bg-indigo-50 px-4 py-2 transition-colors',
                !!item.href ? 'hover:bg-indigo-200' : 'cursor-default',
                i === crumbs.length - 1 &&
                  'outline outline-1 outline-indigo-400',
              )}>
              {item.name}
            </div>
          </ConditionalWrapper>
        ))}
    </div>
  );
}
