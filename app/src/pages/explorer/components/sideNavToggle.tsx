import { useExplorerStore } from '@stores/folderStore.ts';
import { Bars3Icon } from '@heroicons/react/24/outline';

export function SideNavToggle({ text }: { text?: string }) {
  const controls = useExplorerStore(s => s.sidenav);
  return (
    <div
      className={'z-20 flex items-center gap-2 md:hidden'}
      onClick={() => controls.toggle()}>
      <Bars3Icon className={'h-6 min-w-6 cursor-pointer text-stone-600'} />
      {text && <p className={'text-stone-600'}>{text}</p>}
    </div>
  );
}
