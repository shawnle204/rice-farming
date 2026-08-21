"use client";

import dynamic from "next/dynamic";

const RiceFarmGame = dynamic(() => import("@/components/RiceFarmGame"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-amber-50/40 dark:bg-zinc-950">
      <p className="text-zinc-500 dark:text-zinc-400">Loading farm...</p>
    </div>
  ),
});

export default function Home() {
  return <RiceFarmGame />;
}
