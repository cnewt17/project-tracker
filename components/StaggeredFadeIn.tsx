'use client';

import { ReactNode, Children, cloneElement, isValidElement } from 'react';

interface StaggeredFadeInProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export default function StaggeredFadeIn({
  children,
  staggerDelay = 100,
  className = '',
}: StaggeredFadeInProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child as any, {
            key: index,
            style: {
              ...((child.props as any).style || {}),
              animation: `fadeInUp 0.5s ease-out ${index * staggerDelay}ms both`,
            },
          });
        }
        return child;
      })}
    </div>
  );
}
