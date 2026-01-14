import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HeroGradientProps {
  children: ReactNode;
  className?: string;
}

/**
 * HeroGradient component with consistent gradient background
 * Used in blog pages and post detail pages
 */
export function HeroGradient({ children, className }: HeroGradientProps) {
  return (
    <div
      className={cn('container rounded-xl border py-12 md:px-8', className)}
      style={{
        backgroundColor: 'black',
        backgroundImage: [
          'linear-gradient(140deg, hsla(274,94%,54%,0.3), transparent 50%)',
          'linear-gradient(to left top, hsla(260,90%,50%,0.8), transparent 50%)',
          'radial-gradient(circle at 100% 100%, hsla(240,100%,82%,1), hsla(240,40%,40%,1) 17%, hsla(240,40%,40%,0.5) 20%, transparent)'
        ].join(', '),
        backgroundBlendMode: 'difference, difference, normal'
      }}
    >
      {children}
    </div>
  );
}
