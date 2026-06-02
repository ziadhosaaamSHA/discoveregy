import { useState } from "react";

const COLORS = {
  primary: "#C8860A",
  primaryLight: "#E8A830",
  primaryDark: "#8B5E08",
  bg: "#1A1410",
  surface: "#231C15",
  surfaceHover: "#2E2318",
  border: "#3D2E1E",
  text: "#F5ECD7",
  textMuted: "#9A8468",
  textDim: "#6B5A45",
  danger: "#C0392B",
  dangerLight: "#E74C3C",
  success: "#27AE60",
  successLight: "#2ECC71",
  warning: "#E67E22",
  info: "#2980B9",
};

const icons = {
  dashboard: "⊞",
  users: "👥",
  guides: "🧭",
  places: "🏛",
  trips: "✈",
  bookings: "📋",
  payments: "💳",
  reviews: "⭐",
  nationalities: "🌍",
  roles: "🛡",
  notifications: "🔔",
  menu: "☰",
  close: "✕",
  approve: "✓",
  reject: "✗",
  delete: "🗑",
  view: "👁",
  edit: "✏",
  add: "＋",
  search: "⌕",
  logout: "⎋",
  pending: "⏳",
  active: "●",
  chevron: "›",
};

const mockStats = {
  users: 1284,
  guides: 47,
  pendingGuides: 8,
  places: 203,
  trips: 89,
  bookings: 312,
  revenue: 48750,
  reviews: 1054,
};

const mockPendingGuides = [
  { id: "g1", name: "Youssef Al-Rashidi", email: "youssef@email.com", license: "LIC-2024-001", date: "2026-05-10", nationality: "Egyptian" },
  { id: "g2", name: "Sara Mitchell", email: "sara@email.com", license: "LIC-2024-002", date: "2026-05-11", nationality: "British" },
  { id: "g3", name: "Karim Mansour", email: "karim@email.com", license: "LIC-2024-003", date: "2026-05-12", nationality: "Egyptian" },
  { id: "g4", name: "Lena Hoffmann", email: "lena@email.com", license: "LIC-2024-004", date: "2026-05-13", nationality: "German" },
  { id: "g5", name: "Omar Farouk", email: "omar@email.com", license: "LIC-2024-005", date: "2026-05-14", nationality: "Egyptian" },
];

const mockUsers = [
  { id: "u1", name: "Ahmed Hassan", email: "ahmed@email.com", role: "Tourist", status: "Active", joined: "2025-01-15", bookings: 3 },
  { id: "u2", name: "Maria Garcia", email: "maria@email.com", role: "Tourist", status: "Active", joined: "2025-02-20", bookings: 7 },
  { id: "u3", name: "James Wilson", email: "james@email.com", role: "Guide", status: "Active", joined: "2025-03-05", bookings: 24 },
  { id: "u4", name: "Fatima Al-Zahra", email: "fatima@email.com", role: "Tourist", status: "Inactive", joined: "2025-04-10", bookings: 1 },
  { id: "u5", name: "Chen Wei", email: "chen@email.com", role: "Guide", status: "Active", joined: "2025-05-01", bookings: 18 },
];

const mockBookings = [
  { id: 1, tourist: "Ahmed Hassan", trip: "Nile Valley Classic", guide: "James Wilson", amount: 450, status: "Confirmed", date: "2026-06-15" },
  { id: 2, tourist: "Maria Garcia", trip: "Red Sea Adventure", guide: "Chen Wei", amount: 320, status: "Pending", date: "2026-06-20" },
  { id: 3, tourist: "Sara Lee", trip: "Cairo Discovery", guide: "Omar Farouk", amount: 280, status: "Cancelled", date: "2026-06-25" },
  { id: 4, tourist: "Tom Brown", trip: "Luxor Temples", guide: "James Wilson", amount: 600, status: "Confirmed", date: "2026-07-01" },
  { id: 5, tourist: "Ana Silva", trip: "Alexandria Tour", guide: "Youssef Al-Rashidi", amount: 200, status: "Paid", date: "2026-07-05" },
];

const mockPlaces = [
  { id: 1, name: "Giza Pyramids", city: "Giza", category: "Historical", rating: 4.9, price: 150 },
  { id: 2, name: "Karnak Temple", city: "Luxor", category: "Historical", rating: 4.8, price: 100 },
  { id: 3, name: "Red Sea Beach", city: "Hurghada", category: "Nature", rating: 4.7, price: 0 },
  { id: 4, name: "Alexandria Library", city: "Alexandria", category: "Cultural", rating: 4.6, price: 50 },
  { id: 5, name: "Valley of Kings", city: "Luxor", category: "Historical", rating: 4.9, price: 200 },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
  { id: "guides", label: "Guide Approvals", icon: icons.guides, badge: mockStats.pendingGuides },
  { id: "users", label: "Users", icon: icons.users },
  { id: "places", label: "Places", icon: icons.places },
  { id: "trips", label: "Trips", icon: icons.trips },
  { id: "bookings", label: "Bookings", icon: icons.bookings },
  { id: "payments", label: "Payments", icon: icons.payments },
  { id: "reviews", label: "Reviews", icon: icons.reviews },
  { id: "nationalities", label: "Nationalities", icon: icons.nationalities },
  { id: "roles", label: "Roles", icon: icons.roles },
];

const statusColors = {
  Active: COLORS.success, Inactive: COLORS.textMuted,
  Confirmed: COLORS.success, Pending: COLORS.warning,
  Cancelled: COLORS.danger, Paid: COLORS.info,
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 16px 0 80px", background: `${color}15` }} />
      <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: -1 }}>
        {typeof value === "number" && value > 999 ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function Badge({ status }) {
  const color = statusColors[status] || COLORS.textMuted;
  return (
    <span style={{
      background: `${color}20`, color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5
    }}>{status}</span>
  );
}

function ActionBtn({ label, color, onClick, small }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? color : `${color}20`,
        color: hover ? "#fff" : color,
        border: `1px solid ${color}50`,
        borderRadius: 8, padding: small ? "4px 10px" : "6px 14px",
        fontSize: small ? 11 : 12, fontWeight: 700, cursor: "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}>{label}</button>
  );
}

function SearchBar({ placeholder, value, onChange }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted, fontSize: 18 }}>{icons.search}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search..."}
        style={{
          width: "100%", background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
          borderRadius: 10, padding: "10px 12px 10px 40px", color: COLORS.text,
          fontSize: 14, outline: "none", boxSizing: "border-box",
        }} />
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Serif Display', Georgia, serif" }}>{title}</h2>
      {action}
    </div>
  );
}

function Table({ columns, data, renderRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} style={{
                textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700,
                color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1,
                borderBottom: `1px solid ${COLORS.border}`,
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}
              style={{ borderBottom: `1px solid ${COLORS.border}22`, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = ""}
            >
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, muted }) {
  return <td style={{ padding: "14px 16px", fontSize: 13, color: muted ? COLORS.textMuted : COLORS.text }}>{children}</td>;
}

// === PAGES ===

function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: COLORS.text, fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Welcome back, Admin 👋
        </h1>
        <p style={{ margin: "6px 0 0", color: COLORS.textMuted, fontSize: 14 }}>Here's what's happening with Discover Egypt today.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Users" value={mockStats.users} color={COLORS.info} />
        <StatCard icon="🧭" label="Active Guides" value={mockStats.guides} sub={`${mockStats.pendingGuides} pending approval`} color={COLORS.warning} />
        <StatCard icon="🏛" label="Places" value={mockStats.places} color={COLORS.primary} />
        <StatCard icon="✈" label="Trips" value={mockStats.trips} color={COLORS.success} />
        <StatCard icon="📋" label="Bookings" value={mockStats.bookings} color={COLORS.primaryLight} />
        <StatCard icon="💰" label="Revenue" value={`$${mockStats.revenue.toLocaleString()}`} color={COLORS.successLight} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {/* Pending Guides Alert */}
        <div style={{ background: `${COLORS.warning}15`, border: `1px solid ${COLORS.warning}40`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>Pending Guide Approvals</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{mockStats.pendingGuides} guides waiting for review</div>
            </div>
          </div>
          {mockPendingGuides.slice(0, 3).map(g => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}30` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{g.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{g.nationality}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <ActionBtn label="✓" color={COLORS.success} small />
                <ActionBtn label="✗" color={COLORS.danger} small />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15, marginBottom: 16 }}>Recent Bookings</div>
          {mockBookings.slice(0, 4).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{b.tourist}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{b.trip}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primaryLight }}>${b.amount}</div>
                <Badge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuidesPage() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [guides, setGuides] = useState(mockPendingGuides);

  const filtered = guides.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id) => setGuides(prev => prev.filter(g => g.id !== id));
  const handleReject = () => {
    setGuides(prev => prev.filter(g => g.id !== rejectModal));
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <div>
      <SectionHeader title="Guide Management" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["pending", "approved", "rejected"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? COLORS.primary : COLORS.surface,
            color: tab === t ? "#fff" : COLORS.textMuted,
            border: `1px solid ${tab === t ? COLORS.primary : COLORS.border}`,
            borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            textTransform: "capitalize",
          }}>{t} {t === "pending" && `(${filtered.length})`}</button>
        ))}
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <SearchBar placeholder="Search guides..." value={search} onChange={setSearch} />
        </div>

        {tab === "pending" && (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map(g => (
              <div key={g.id} style={{
                background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${COLORS.primary}30`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: COLORS.primary, flexShrink: 0,
                  }}>{g.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{g.email} · {g.nationality}</div>
                    <div style={{ fontSize: 11, color: COLORS.textDim }}>License: {g.license} · Applied: {g.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <ActionBtn label="View License" color={COLORS.info} />
                  <ActionBtn label="✓ Approve" color={COLORS.success} onClick={() => handleApprove(g.id)} />
                  <ActionBtn label="✗ Reject" color={COLORS.danger} onClick={() => setRejectModal(g.id)} />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: COLORS.textMuted }}>No pending guides found.</div>
            )}
          </div>
        )}

        {tab !== "pending" && (
          <div style={{ textAlign: "center", padding: 60, color: COLORS.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === "approved" ? "✅" : "❌"}</div>
            <div>No {tab} guides to show.</div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setRejectModal(null)}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Reject Guide Application</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Please provide a reason for rejection.</div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: "100%", background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 13,
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <ActionBtn label="Cancel" color={COLORS.textMuted} onClick={() => setRejectModal(null)} />
              <ActionBtn label="Confirm Reject" color={COLORS.danger} onClick={handleReject} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="User Management" action={<ActionBtn label="＋ Add User" color={COLORS.primary} />} />
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <SearchBar placeholder="Search users..." value={search} onChange={setSearch} />
        </div>
        <Table
          columns={["User", "Role", "Status", "Joined", "Bookings", "Actions"]}
          data={filtered}
          renderRow={(u) => [
            <Td key="name">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COLORS.primary}25`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.primary, flexShrink: 0 }}>
                  {u.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{u.email}</div>
                </div>
              </div>
            </Td>,
            <Td key="role"><span style={{ color: u.role === "Guide" ? COLORS.warning : COLORS.info, fontWeight: 600, fontSize: 12 }}>{u.role}</span></Td>,
            <Td key="status"><Badge status={u.status} /></Td>,
            <Td key="joined" muted>{u.joined}</Td>,
            <Td key="bookings"><span style={{ fontWeight: 700, color: COLORS.text }}>{u.bookings}</span></Td>,
            <Td key="actions">
              <div style={{ display: "flex", gap: 6 }}>
                <ActionBtn label="View" color={COLORS.info} small />
                <ActionBtn label="Delete" color={COLORS.danger} small onClick={() => setUsers(prev => prev.filter(x => x.id !== u.id))} />
              </div>
            </Td>,
          ]}
        />
      </div>
    </div>
  );
}

function PlacesPage() {
  const [search, setSearch] = useState("");
  const filtered = mockPlaces.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="Places Management"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <ActionBtn label="⬆ Import from Geoapify" color={COLORS.info} />
            <ActionBtn label="＋ Add Place" color={COLORS.primary} />
          </div>
        }
      />
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <SearchBar placeholder="Search places..." value={search} onChange={setSearch} />
        </div>
        <Table
          columns={["Place", "City", "Category", "Rating", "Ticket Price", "Actions"]}
          data={filtered}
          renderRow={(p) => [
            <Td key="name"><span style={{ fontWeight: 600, color: COLORS.text }}>{p.name}</span></Td>,
            <Td key="city" muted>{p.city}</Td>,
            <Td key="cat"><span style={{ color: COLORS.primaryLight, fontWeight: 600, fontSize: 12 }}>{p.category}</span></Td>,
            <Td key="rating">
              <span style={{ color: "#F1C40F", fontWeight: 700 }}>★ {p.rating}</span>
            </Td>,
            <Td key="price">{p.price === 0 ? <span style={{ color: COLORS.success, fontWeight: 600 }}>Free</span> : `$${p.price}`}</Td>,
            <Td key="actions">
              <div style={{ display: "flex", gap: 6 }}>
                <ActionBtn label="Edit" color={COLORS.warning} small />
                <ActionBtn label="Delete" color={COLORS.danger} small />
              </div>
            </Td>,
          ]}
        />
      </div>
    </div>
  );
}

function BookingsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockBookings.filter(b =>
    b.tourist.toLowerCase().includes(search.toLowerCase()) ||
    b.trip.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="All Bookings" />
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <SearchBar placeholder="Search bookings..." value={search} onChange={setSearch} />
        </div>
        <Table
          columns={["#", "Tourist", "Trip", "Guide", "Amount", "Status", "Date", "Actions"]}
          data={filtered}
          renderRow={(b) => [
            <Td key="id" muted>#{b.id}</Td>,
            <Td key="tourist"><span style={{ fontWeight: 600, color: COLORS.text }}>{b.tourist}</span></Td>,
            <Td key="trip" muted>{b.trip}</Td>,
            <Td key="guide" muted>{b.guide}</Td>,
            <Td key="amt"><span style={{ fontWeight: 700, color: COLORS.primaryLight }}>${b.amount}</span></Td>,
            <Td key="status"><Badge status={b.status} /></Td>,
            <Td key="date" muted>{b.date}</Td>,
            <Td key="actions"><ActionBtn label="View" color={COLORS.info} small /></Td>,
          ]}
        />
      </div>
    </div>
  );
}

function GenericPage({ title, description, color }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{color === COLORS.success ? "✅" : "🔧"}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{title} Management</div>
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>{description}</div>
      </div>
    </div>
  );
}

// === MAIN APP ===
export default function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "guides": return <GuidesPage />;
      case "users": return <UsersPage />;
      case "places": return <PlacesPage />;
      case "bookings": return <BookingsPage />;
      case "trips": return <GenericPage title="Trips" description="Create, edit, and delete ready trip plans for tourists." />;
      case "payments": return <GenericPage title="Payments" description="View all payments and process refunds." />;
      case "reviews": return <GenericPage title="Reviews" description="Manage place and guide reviews." />;
      case "nationalities": return <GenericPage title="Nationalities" description="Add, edit, or remove nationalities from the system." />;
      case "roles": return <GenericPage title="Roles" description="Manage system roles and assign them to users." />;
      case "notifications": return <GenericPage title="Notifications" description="Send and manage system notifications." />;
      default: return <DashboardPage />;
    }
  };

  const renderSidebar = (mobile = false) => (
    <div style={{
      width: mobile ? "100%" : 240,
      background: COLORS.surface,
      borderRight: `1px solid ${COLORS.border}`,
      display: "flex",
      flexDirection: "column",
      height: mobile ? "auto" : "100vh",
      position: mobile ? "fixed" : "sticky",
      top: 0,
      left: 0,
      zIndex: mobile ? 100 : 1,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: mobile ? "space-between" : "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.primary, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: -0.5 }}>Discover Egypt</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Admin Panel</div>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => { setPage(item.id); if (mobile) setSidebarOpen(false); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, border: "none",
              background: page === item.id ? `${COLORS.primary}20` : "none",
              color: page === item.id ? COLORS.primary : COLORS.textMuted,
              cursor: "pointer", fontSize: 13, fontWeight: page === item.id ? 700 : 500,
              marginBottom: 2, textAlign: "left", transition: "all 0.15s",
              position: "relative",
            }}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = COLORS.surfaceHover; e.currentTarget.style.color = COLORS.text; }}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = COLORS.textMuted; } }}
          >
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span style={{ marginLeft: "auto", background: COLORS.danger, color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
                {item.badge}
              </span>
            )}
            {page === item.id && <span style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, background: COLORS.primary, borderRadius: "0 4px 4px 0" }} />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 12px", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: COLORS.surfaceHover }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COLORS.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: COLORS.primary, fontSize: 14 }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Admin</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Super Admin</div>
          </div>
        </div>
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: "none", background: "none", color: COLORS.danger, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <span>⎋</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #6B5A45; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1A1410; }
        ::-webkit-scrollbar-thumb { background: #3D2E1E; border-radius: 3px; }
        @media (max-width: 768px) { .sidebar-desktop { display: none !important; } }
        @media (min-width: 769px) { .mobile-header { display: none !important; } }
      `}</style>

      <div style={{ display: "flex" }}>
        {/* Desktop Sidebar */}
        <div className="sidebar-desktop" style={{ flexShrink: 0 }}>
          {renderSidebar()}
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "#00000088" }} onClick={() => setSidebarOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 280, height: "100%", background: COLORS.surface, overflowY: "auto" }}>
              {renderSidebar(true)}
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Mobile header */}
          <div className="mobile-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 10 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 10px", color: COLORS.text, fontSize: 18, cursor: "pointer" }}>☰</button>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.primary, fontFamily: "'DM Serif Display', Georgia, serif" }}>Discover Egypt Admin</div>
            <div style={{ width: 38 }} />
          </div>

          {/* Page content */}
          <main style={{ flex: 1, padding: "28px 24px", maxWidth: 1200, width: "100%" }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}
