import { type UserResponse } from "../../utils/Types";

interface UserTableProps {
  users: UserResponse[];
  currentUserId?: number;
  currentUsername?: string;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  listStatus: string;
  actionStatus: string;
  onPageChange: (page: number) => void;
  onRequestLockToggle: (user: UserResponse) => void;
  onRequestDelete: (user: UserResponse) => void;
  onEditRole: (user: UserResponse) => void;
}

function formatDate(value?: string) {
  if (!value) return "Không có";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getPrimaryRole(user: UserResponse) {
  if (user.roles?.includes("ADMIN")) return "ADMIN";
  if (user.roles?.includes("CREATOR")) return "CREATOR";
  return user.roles?.[0] || "USER";
}

function getInitials(name?: string, username?: string) {
  const displayName = name?.trim() || username?.trim() || "User";
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function UserTable({
  users,
  currentUserId,
  currentUsername,
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  listStatus,
  actionStatus,
  onPageChange,
  onRequestLockToggle,
  onRequestDelete,
  onEditRole,
}: UserTableProps) {
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col gap-4">
      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700/70 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-700/70 uppercase tracking-wider">
              <th className="p-4">STT</th>
              <th className="p-4">Người dùng</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
            {listStatus === "pending" && users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin text-indigo-500" />
                    <span>Đang tải danh sách người dùng...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => {
                const isSelf =
                  (user.id && user.id === currentUserId) ||
                  user.username === currentUsername;
                const active = user.isActive !== false;
                const primaryRole = getPrimaryRole(user);
                const stt = page * size + idx + 1;
                const avatarName = user.fullName || user.username;

                return (
                  <tr
                    key={user.id || user.username}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-4 text-slate-400 font-mono">#{stt}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={avatarName}
                            className="w-8 h-8 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-xs flex items-center justify-center shadow-sm">
                            {getInitials(user.fullName, user.username)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="leading-tight">{user.fullName || "Chưa cập nhật"}</span>
                          {user.id && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ID: #{user.id}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">
                      {user.username}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="p-4">
                      {primaryRole === "ADMIN" ? (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-extrabold text-[11px]">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {active ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isSelf ? (
                          <button
                            type="button"
                            disabled
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                            title="Tài khoản hiện tại của bạn"
                          >
                            <i className="fa-solid fa-shield text-xs" />
                          </button>
                        ) : (
                          <>
                            {/* Role info */}
                            <button
                              type="button"
                              onClick={() => onEditRole(user)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Thông tin / Vai trò"
                            >
                              <i className="fa-solid fa-user-gear text-xs" />
                            </button>

                            {/* Lock / Unlock */}
                            <button
                              type="button"
                              disabled={actionStatus === "pending"}
                              onClick={() => onRequestLockToggle(user)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                active
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white"
                              }`}
                              title={active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              <i className={`fa-solid ${active ? "fa-lock" : "fa-lock-open"} text-xs`} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => onRequestDelete(user)}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <i className="fa-solid fa-trash-can text-xs" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2 gap-3">
        <span>
          Hiển thị {startItem} - {endItem} trong tổng số {totalElements} người dùng
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={first || page <= 0}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Trước
          </button>

          {Array.from({ length: totalPages || 1 }, (_, i) => i)
            .slice(Math.max(0, page - 2), Math.max(5, page + 3))
            .map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => onPageChange(pNum)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  pNum === page
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                }`}
              >
                {pNum + 1}
              </button>
            ))}

          <button
            type="button"
            disabled={last || page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500 transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
