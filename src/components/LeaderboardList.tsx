interface LeaderboardEntry {
  username: string;
  value: number;
}

export function LeaderboardList({
  title,
  icon,
  unit,
  entries,
  currentUsername,
}: {
  title: string;
  icon: string;
  unit: string;
  entries: LeaderboardEntry[];
  currentUsername: string | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {icon} {title}
      </h2>
      <ol className="mt-3 flex flex-col gap-1">
        {entries.length === 0 && (
          <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">No farmers yet.</li>
        )}
        {entries.map((entry, i) => (
          <li
            key={entry.username}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
              entry.username === currentUsername
                ? "bg-amber-100 font-semibold text-amber-950 dark:bg-amber-900/40 dark:text-amber-100"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-5 text-right text-zinc-400 dark:text-zinc-500">{i + 1}</span>
              <span>{entry.username}</span>
            </span>
            <span>
              {entry.value.toLocaleString()} {unit}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
