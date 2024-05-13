import ConditionalWrapper from './ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';

export type BreadCrumb = { name: string; href?: string };

export default function BreadCrumbs({ crumbs }: { crumbs: BreadCrumb[] }) {
  return (
    <div className={'flex items-center gap-2'}>
      {crumbs &&
        crumbs.map(item => (
          <ConditionalWrapper
            condition={!!item.href}
            wrapper={c => <Link to={item.href!}>{c}</Link>}>
            <div
              className={
                'rounded-lg bg-indigo-50/50 px-4 py-2 transition-colors hover:bg-indigo-100/90'
              }>
              {item.name}
            </div>
          </ConditionalWrapper>
        ))}
    </div>
  );
}
