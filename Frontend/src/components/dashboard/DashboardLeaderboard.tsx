import { type RankingResponse } from "../../utils/Types";

interface DashboardLeaderboardProps {
  rankings: RankingResponse[];
}

function formatCompactScore(score: number) {
  if (score >= 1000) return `${(score / 1000).toFixed(score % 1000 === 0 ? 0 : 1)}k`;
  return new Intl.NumberFormat("vi-VN").format(score);
}

export default function DashboardLeaderboard({ rankings }: DashboardLeaderboardProps) {
  const leaderboard = rankings.slice(0, 3);

  return (
    <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Top điểm hệ thống</h3>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
          Bảng xếp hạng
        </span>
      </div>

      <div className="space-y-3">
        {leaderboard.length > 0 ? (
          leaderboard.map((item, idx) => {
            const rankNum = item.rank || idx + 1;
            const trophyColor =
              rankNum === 1
                ? "text-amber-500"
                : rankNum === 2
                ? "text-slate-400"
                : "text-amber-700";
            const avatarUrl =
              item.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.fullName || item.username
              )}&background=4f46e5&color=fff`;

            return (
              <div
                key={`${item.userId || idx}-${item.username}`}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid fa-trophy ${trophyColor} text-base`}></i>
                  <img
                    src={avatarUrl}
                    alt={item.fullName || item.username}
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                      {item.fullName || item.username}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hạng {rankNum} · {rankNum === 1 ? "Siêu tốc" : rankNum === 2 ? "Bền bỉ" : "Chính xác"}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatCompactScore(item.totalScore)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 text-center text-xs text-slate-400">
            Chưa có thông tin bảng xếp hạng
          </div>
        )}
      </div>
    </div>
  );
}
