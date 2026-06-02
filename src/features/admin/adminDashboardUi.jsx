import { useState } from "react";
import { COLORS, icons } from "./adminDashboardTokens";

export function Badge({ status }) {
  const val = String(status || "");
  const normalized = val.toLowerCase();
  const tone = normalized.includes("cancel") || normalized.includes("reject")
    ? { background: `${COLORS.danger}20`, color: COLORS.danger, border: `1px solid ${COLORS.danger}40` }
    : normalized.includes("paid") || normalized.includes("confirm") || normalized.includes("approve") || normalized.includes("active")
      ? { background: `${COLORS.success}20`, color: COLORS.success, border: `1px solid ${COLORS.success}40` }
      : { background: `${COLORS.warning}20`, color: COLORS.warning, border: `1px solid ${COLORS.warning}40` };

  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide"
      style={tone}
    >
      {val}
    </span>
  );
}

export function ActionBtn({ label, color, onClick, disabled, small }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? color : `${color}15`,
        color: hover ? "#fff" : color,
        border: `1px solid ${color}40`,
        borderRadius: 8,
        padding: small ? "4px 10px" : "6px 14px",
        fontSize: small ? 11 : 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="relative flex-1">
      <span className="absolute top-1/2 -translate-y-1/2 text-lg text-[#9a8468] left-3 rtl:right-3 rtl:left-auto">
        {icons.search}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#2e2318] border border-[#3d2e1e] py-2 px-3 text-[#f5ecd7] text-sm outline-none pl-10 pr-4 rtl:pr-10 rtl:pl-4 transition duration-200 focus:border-[#c8860a]"
      />
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h2
        className="m-0 text-2xl font-black text-[#f5ecd7] tracking-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}

export function Table({ columns, data, renderRow, emptyLabel }) {
  return (
    <div className="overflow-x-auto w-full rounded-xl border border-[#3d2e1e] bg-[#231c15]">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-[#3d2e1e]">
            {columns.map((col) => (
              <th
                key={col}
                className="py-3 px-4 text-xs font-bold text-[#9a8468] uppercase tracking-wider text-left rtl:text-right"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3d2e1e]/40">
          {data.map((row, index) => (
            <tr
              key={row?.id ?? row?.userId ?? row?.name ?? index}
              className="transition duration-100 hover:bg-[#2e2318]"
            >
              {renderRow(row, index)}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-[#9a8468] font-semibold">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, muted }) {
  return (
    <td
      className="py-3 px-4 text-sm font-semibold whitespace-nowrap"
      style={{ color: muted ? COLORS.textMuted : COLORS.text }}
    >
      {children}
    </td>
  );
}

export function AdminSidebar({
  mobile,
  isRTL,
  tAdmin,
  navItems,
  page,
  setPage,
  setSidebarOpen,
  user,
  logout,
}) {
  return (
    <div
      className="flex flex-col h-full bg-[#231c15] overflow-y-auto"
      style={{
        width: mobile ? "100%" : 240,
        height: mobile ? "auto" : "100vh",
        borderRight: isRTL ? "none" : `1px solid ${COLORS.border}`,
        borderLeft: isRTL ? `1px solid ${COLORS.border}` : "none",
      }}
    >
      <div className="p-5 border-b border-[#3d2e1e] flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-black text-[#c8860a] tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {tAdmin.sidebar.title}
          </h1>
          <p className="text-[10px] text-[#9a8468] font-bold uppercase tracking-widest mt-0.5">
            {tAdmin.sidebar.subtitle}
          </p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-[#9a8468] text-xl font-semibold cursor-pointer border-none bg-none"
          >
            {icons.close}
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              setPage(item.id);
              if (mobile) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border-none transition duration-150 relative text-left rtl:text-right cursor-pointer"
            style={{
              background: page === item.id ? `${COLORS.primary}20` : "transparent",
              color: page === item.id ? COLORS.primary : COLORS.textMuted,
              fontWeight: page === item.id ? 800 : 600,
              fontSize: 13,
            }}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className="rounded-full bg-[#c0392b] text-white text-[10px] font-black px-2 py-0.5">
                {item.badge}
              </span>
            )}
            {page === item.id && (
              <span
                className="absolute top-2 bottom-2 w-1 rounded bg-[#c8860a]"
                style={{
                  left: isRTL ? "auto" : 0,
                  right: isRTL ? 0 : "auto",
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#3d2e1e]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#2e2318] mb-3">
          <div className="w-9 h-9 rounded-full bg-[#c8860a]/35 flex items-center justify-center font-black text-sm text-[#e8a830]">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#f5ecd7] truncate m-0">{user?.name || tAdmin.rolesOptions.admin}</h4>
            <p className="text-[10px] text-[#9a8468] mt-0.5 truncate">{user?.type || tAdmin.sidebar.superAdmin}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-lg border-none text-[#c0392b] bg-[#c0392b]/10 hover:bg-[#c0392b] hover:text-white transition duration-150 text-xs font-bold uppercase cursor-pointer"
        >
          <span>{icons.logout}</span>
          <span>{tAdmin.sidebar.logout}</span>
        </button>
      </div>
    </div>
  );
}
