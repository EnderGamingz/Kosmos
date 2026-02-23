import { cn } from '@lib/utils.ts';

type Props = {
  username: string;
};

const AVATAR_COLORS = [
  'bg-red-500 text-red-800',
  'bg-orange-500 text-orange-800',
  'bg-amber-500 text-amber-800',
  'bg-yellow-500 text-yellow-800',
  'bg-lime-500 text-lime-800',
  'bg-green-500 text-green-800',
  'bg-emerald-500 text-emerald-800',
  'bg-teal-500 text-teal-800',
  'bg-cyan-500 text-cyan-800',
  'bg-blue-500 text-blue-800',
  'bg-indigo-500 text-indigo-800',
  'bg-violet-500 text-violet-800',
  'bg-purple-500 text-purple-800',
  'bg-fuchsia-500 text-fuchsia-800',
  'bg-pink-500 text-pink-800',
  'bg-rose-500 text-rose-800',
];

function getColorForUsername(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function getInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

export function UserInitialsAvatar({ username }: Props) {
  const color = getColorForUsername(username);
  const initials = getInitials(username);

  return (
    <div className={cn(`w-full h-full rounded-full`, color)}>
      <span
        className={
          'text-lg opacity-50 font-black absolute inset-0 flex items-center justify-center'
        }
      >
        {initials}
      </span>
    </div>
  );
}
