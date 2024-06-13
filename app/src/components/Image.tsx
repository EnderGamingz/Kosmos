import tw from '@lib/classMerge.ts';
import { useState } from 'react';
import { Skeleton } from '@nextui-org/react';

export function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={'grid [&>*]:col-[1/-1] [&>*]:row-[1/-1]'}>
      <img
        loading={'lazy'}
        onLoad={() => setLoaded(true)}
        data-loaded={loaded}
        width={40}
        height={40}
        className={tw(
          'img img relative z-10 aspect-square h-10 w-10 rounded-lg object-cover opacity-0',
          '!duration-300 transition-transform-opacity data-[loaded=true]:opacity-100 motion-reduce:transition-none',
        )}
        src={src}
        alt={alt}
      />
      {!loaded && (
        <Skeleton
          className={'h-10 w-10 rounded-lg !bg-transparent shadow-inner'}
        />
      )}
    </div>
  );
}
