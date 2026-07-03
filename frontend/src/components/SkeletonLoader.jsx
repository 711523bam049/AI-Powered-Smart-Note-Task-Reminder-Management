import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-[var(--bg-hover)] rounded-md" />
      <div className="h-4 w-full bg-[var(--bg-hover)] rounded-md" />
      <div className="h-4 w-5/6 bg-[var(--bg-hover)] rounded-md" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-12 bg-[var(--bg-hover)] rounded-full" />
        <div className="h-5 w-16 bg-[var(--bg-hover)] rounded-full" />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 glass rounded-lg animate-pulse mb-3">
      <div className="flex items-center gap-3 w-2/3">
        <div className="h-5 w-5 bg-[var(--bg-hover)] rounded-md" />
        <div className="space-y-2 w-full">
          <div className="h-4 w-1/2 bg-[var(--bg-hover)] rounded-md" />
          <div className="h-3 w-5/6 bg-[var(--bg-hover)] rounded-md" />
        </div>
      </div>
      <div className="h-4 w-16 bg-[var(--bg-hover)] rounded-md" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-[var(--bg-hover)] rounded-md" />
        <div className="h-5 w-5 bg-[var(--bg-hover)] rounded-md" />
      </div>
      <div className="h-8 w-12 bg-[var(--bg-hover)] rounded-md" />
      <div className="h-3 w-24 bg-[var(--bg-hover)] rounded-md" />
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => {
        if (type === 'list') return <ListSkeleton key={idx} />;
        if (type === 'stat') return <StatSkeleton key={idx} />;
        return <CardSkeleton key={idx} />;
      })}
    </>
  );
}
