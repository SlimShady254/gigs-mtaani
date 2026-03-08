
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  Calendar,
  Compass,
  Filter,
  Flame,
  History,
  LayoutGrid,
  List,
  MapPin,
  Megaphone,
  Menu,
  MoreVertical,
  Palette,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap
} from "lucide-react";
import { AppLayout } from "../components/Layout";
import { AdminPanel } from "../components/AdminPanel";
import { GigCard, type GigCardProps } from "../components/GigCard";
import { SafetyPanel } from "../components/SafetyPanel";
import { WalletPanel } from "../components/WalletPanel";
import { useGeolocation } from "../hooks/useGeolocation";
import { adminApi, gigsApi, safetyApi, walletApi } from "../lib/api";
import { useAuthStore } from "../state/authStore";
import { THEME_OPTIONS, type ThemeName, useThemeStore } from "../state/themeStore";

type FeedMode = "MY_LOCATION" | "GENERAL";
type ViewMode = "grid" | "list";
type GigCardModel = GigCardProps["gig"];

type FeedResponse = {
  source: "api" | "fallback";
  gigs: GigCardModel[];
};

type WalletResponse = {
  source: "api" | "fallback";
  wallets: Array<{
    id?: string;
    currency: string;
    available: number;
    pending: number;
    ledgerEntries?: Array<{
      id: string;
      entryType: string;
      direction: string;
      amount: number;
      createdAt: string;
    }>;
  }>;
};

type SafetyResponse = {
  source: "api" | "fallback";
  sessions: Array<{
    id: string;
    status: "ACTIVE" | "ESCALATED" | "ENDED";
    startedAt: string;
    lastCheckInAt?: string;
  }>;
};

const FALLBACK_GIGS: GigCardModel[] = [
  {
    id: "demo-gig-1",
    title: "Campus Food Delivery Rush",
    description: "Deliver lunch parcels to hostels B and C between 12:00 and 2:00 PM. Quick and easy money!",
    category: "DELIVERY",
    payAmount: 750,
    currency: "KES",
    startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    latitude: -1.2824,
    longitude: 36.8202,
    distanceMeters: 500,
    tags: ["Fast", "Easy", "On-Campus"],
    poster: { profile: { displayName: "John D." }, trustScore: { score: 86, band: "Verified" } }
  },
  {
    id: "demo-gig-2",
    title: "Calculus and Statistics Coaching",
    description: "Two-hour evening tutoring for first-year engineering students. Help them ace their exams!",
    category: "TUTORING",
    payAmount: 1200,
    currency: "KES",
    startsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2809,
    longitude: 36.8212,
    distanceMeters: 800,
    tags: ["Teaching", "Math", "Evening"],
    poster: { profile: { displayName: "Sarah M." }, trustScore: { score: 91, band: "Verified" } }
  },
  {
    id: "demo-gig-3",
    title: "Event Photography for Cultural Night",
    description: "Capture highlights for student association social channels. Great portfolio building!",
    category: "PHOTOGRAPHY",
    payAmount: 3000,
    currency: "KES",
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2841,
    longitude: 36.8187,
    distanceMeters: 1200,
    tags: ["Creative", "Events", "Night"],
    poster: { profile: { displayName: "Mike K." }, trustScore: { score: 79, band: "Verified" } }
  },
  {
    id: "demo-gig-4",
    title: "Hostel Move Helper",
    description: "Need one reliable helper to move furniture within two blocks. Strong individuals needed!",
    category: "LABOR",
    payAmount: 900,
    currency: "KES",
    startsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2818,
    longitude: 36.8228,
    distanceMeters: 600,
    tags: ["Physical", "Quick", "Urgent"],
    poster: { profile: { displayName: "Linet A." }, trustScore: { score: 74, band: "Verified" } }
  },
  {
    id: "demo-gig-5",
    title: "Weekend Grocery Shopping Assistant",
    description: "Help elderly resident with weekly grocery shopping at the mall.",
    category: "DELIVERY",
    payAmount: 800,
    currency: "KES",
    startsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2835,
    longitude: 36.8195,
    distanceMeters: 1500,
    tags: ["Weekend", "Shopping", "Elderly"],
    poster: { profile: { displayName: "Grace W." }, trustScore: { score: 88, band: "Verified" } }
  },
  {
    id: "demo-gig-6",
    title: "Python Programming Tutor",
    description: "Looking for someone to teach Python basics. 3 sessions per week.",
    category: "TUTORING",
    payAmount: 1500,
    currency: "KES",
    startsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2805,
    longitude: 36.8230,
    distanceMeters: 900,
    tags: ["Tech", "Programming", "Flexible"],
    poster: { profile: { displayName: "David K." }, trustScore: { score: 95, band: "Top Rated" } }
  },
  {
    id: "demo-gig-7",
    title: "Office Cleaning - Weekend",
    description: "Small law office needs cleaning on Saturday morning.",
    category: "CLEANING",
    payAmount: 1000,
    currency: "KES",
    startsAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2848,
    longitude: 36.8175,
    distanceMeters: 2000,
    tags: ["Weekend", "Office", "Quick"],
    poster: { profile: { displayName: "Mr. Otieno" }, trustScore: { score: 82, band: "Verified" } }
  },
  {
    id: "demo-gig-8",
    title: "Birthday Party Decorations Setup",
    description: "Help set up decorations for a surprise birthday party.",
    category: "EVENT",
    payAmount: 1100,
    currency: "KES",
    startsAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2820,
    longitude: 36.8210,
    distanceMeters: 700,
    tags: ["Fun", "Creative", "Party"],
    poster: { profile: { displayName: "Amy J." }, trustScore: { score: 77, band: "Verified" } }
  }
];

const FALLBACK_WALLETS: WalletResponse["wallets"] = [
  {
    id: "wallet-kes",
    currency: "KES",
    available: 12450,
    pending: 1500,
    ledgerEntries: [
      {
        id: "entry-1",
        entryType: "TOPUP",
        direction: "CREDIT",
        amount: 2500,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

const FALLBACK_SESSIONS: SafetyResponse["sessions"] = [
  {
    id: "session-1",
    status: "ACTIVE",
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastCheckInAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)));
}

function normalizeGig(raw: any, userLat: number, userLon: number): GigCardModel {
  const lat = Number(raw?.latitude ?? userLat);
  const lon = Number(raw?.longitude ?? userLon);
  const posterName =
    raw?.poster?.profile?.displayName ??
    raw?.posterName ??
    raw?.poster?.displayName ??
    "Campus User";

  return {
    id: String(raw?.id ?? crypto.randomUUID()),
    title: String(raw?.title ?? "Untitled gig"),
    description: String(raw?.description ?? "No description available."),
    category: String(raw?.category ?? "GENERAL").toUpperCase(),
    payAmount: Number(raw?.payAmount ?? 0),
    currency: String(raw?.currency ?? "KES"),
    startsAt: String(raw?.startsAt ?? new Date().toISOString()),
    latitude: lat,
    longitude: lon,
    distanceMeters: distanceMeters(userLat, userLon, lat, lon),
    images: Array.isArray(raw?.images) ? raw.images : undefined,
    tags: Array.isArray(raw?.skills) ? raw.skills : undefined,
    poster: {
      id: raw?.poster?.id ? String(raw.poster.id) : raw?.posterId ? String(raw.posterId) : undefined,
      profile: {
        displayName: posterName,
        avatarUrl: raw?.poster?.profile?.avatarUrl
      },
      trustScore: {
        score: Number(raw?.trustScore ?? raw?.poster?.trustScore?.score ?? 75),
        band: String(raw?.poster?.trustScore?.band ?? "Verified")
      }
    }
  };
}

function parseApiError(error: unknown, fallback: string) {
  const data =
    (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
  return data?.error ?? data?.message ?? fallback;
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const geo = useGeolocation(-1.2824, 36.8202);

  const [feedMode, setFeedMode] = useState<FeedMode>("MY_LOCATION");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin = useMemo(() => {
    const role = String(user?.role ?? "").toUpperCase();
    return ["ADMIN", "MODERATOR", "RISK_OPS", "FINANCE_OPS"].includes(role);
  }, [user?.role]);

  const feedQuery = useQuery<FeedResponse>({
    queryKey: ["feed", geo.latitude, geo.longitude, radiusMeters, feedMode],
    queryFn: async () => {
      try {
        const data = await gigsApi.feed({
          latitude: geo.latitude,
          longitude: geo.longitude,
          radiusMeters,
          mode: feedMode,
          limit: 24
        });

        const rawGigs = Array.isArray(data?.gigs) ? data.gigs : [];
        return {
          source: "api",
          gigs: rawGigs.map((gig) => normalizeGig(gig, geo.latitude, geo.longitude))
        };
      } catch {
        return {
          source: "fallback",
          gigs: FALLBACK_GIGS.map((gig) => normalizeGig(gig, geo.latitude, geo.longitude))
        };
      }
    },
    staleTime: 15000,
    refetchInterval: 30000
  });

  const walletQuery = useQuery<WalletResponse>({
    queryKey: ["wallets"],
    queryFn: async () => {
      try {
        const data = await walletApi.me();
        return { source: "api", wallets: Array.isArray(data?.wallets) ? data.wallets : [] };
      } catch {
        return { source: "fallback", wallets: FALLBACK_WALLETS };
      }
    },
    staleTime: 15000
  });

  const safetyQuery = useQuery<SafetyResponse>({
    queryKey: ["safety"],
    queryFn: async () => {
      try {
        const data = await safetyApi.active();
        return {
          source: "api",
          sessions: Array.isArray(data?.sessions) ? data.sessions : []
        };
      } catch {
        return { source: "fallback", sessions: FALLBACK_SESSIONS };
      }
    },
    staleTime: 15000
  });

  const adminMetricsQuery = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      try {
        return await adminApi.metrics();
      } catch {
        return {
          totals: {
            totalUsers: 1240,
            activeGigs: 52,
            completedToday: 18,
            disputes: 3
          }
        };
      }
    },
    enabled: isAdmin
  });

  const riskDashboardQuery = useQuery({
    queryKey: ["risk-dashboard"],
    queryFn: async () => {
      try {
        return await adminApi.riskDashboard();
      } catch {
        return {
          counts: {
            highRisk: 2,
            mediumRisk: 11,
            lowRisk: 164
          }
        };
      }
    },
    enabled: isAdmin
  });

  const applyMutation = useMutation({
    mutationFn: async (gigId: string) => {
      return gigsApi.apply(gigId);
    },
    onSuccess: (result, gigId) => {
      setStatusMessage(`Application submitted for gig ${gigId}.`);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      setStatusMessage(parseApiError(error, "Could not apply for this gig right now."));
    }
  });

  const topupMutation = useMutation({
    mutationFn: async (amount: number) => walletApi.topup(amount),
    onSuccess: () => {
      setStatusMessage("Wallet top-up successful.");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    }
  });

  const sosMutation = useMutation({
    mutationFn: async (sessionId: string) => safetyApi.sos(sessionId),
    onSuccess: () => {
      setStatusMessage("SOS alert sent.");
      queryClient.invalidateQueries({ queryKey: ["safety"] });
    }
  });

  const gigs = feedQuery.data?.gigs ?? [];
  const categories = useMemo(() => {
    const unique = new Set<string>(["ALL"]);
    gigs.forEach((gig) => unique.add(gig.category));
    return Array.from(unique);
  }, [gigs]);

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const matchesSearch =
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || gig.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, gigs, searchQuery]);

  const walletTotal = (walletQuery.data?.wallets ?? []).reduce(
    (sum, wallet) => sum + Number(wallet.available ?? 0),
    0
  );
  const avgPay = filteredGigs.length
    ? Math.round(
        filteredGigs.reduce((sum, gig) => sum + Number(gig.payAmount ?? 0), 0) / filteredGigs.length
      )
    : 0;

  const displayName = user?.profile?.displayName || user?.displayName || "Comrade";
  const usingFallback = feedQuery.data?.source === "fallback";

  const quickStats = [
    { icon: Target, label: "Open Gigs", value: filteredGigs.length, color: "primary" },
    { icon: Zap, label: "Applied Today", value: 2, color: "accent" },
    { icon: Trophy, label: "Completed", value: 15, color: "success" },
    { icon: Flame, label: "Streak Days", value: 7, color: "warning" }
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-shell">
        <section className="panel dashboard-hero-panel">
          <div className="dashboard-hero-head">
            <div>
              <p className="dashboard-kicker">Professional Operations Dashboard</p>
              <h2>Welcome back, <span className="text-gradient">{displayName}</span></h2>
              <p className="dashboard-subtle">
                You have <strong>{filteredGigs.length} gigs</strong> available near you. Start earning today!
              </p>
            </div>
            <div className="dashboard-hero-actions">
              <motion.button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => navigate("/add-gig")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusCircle size={14} />
                Post New Gig
              </motion.button>
              
              <div className="notification-wrapper">
                <motion.button
                  className="btn btn-secondary btn-sm notification-btn"
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={14} />
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </motion.button>
                
                {showNotifications && (
                  <motion.div 
                    className="notification-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <button onClick={() => setNotifications(0)}>Mark all read</button>
                    </div>
                    <div className="notification-list">
                      <div className="notification-item unread">
                        <Bell size={14} />
                        <div>
                          <p>New gig matching your skills!</p>
                          <span>2 mins ago</span>
                        </div>
                      </div>
                      <div className="notification-item unread">
                        <Target size={14} />
                        <div>
                          <p>Your application was viewed</p>
                          <span>1 hour ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <Wallet size={14} />
                        <div>
                          <p>Payment received: KES 750</p>
                          <span>Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => {
                  feedQuery.refetch();
                  walletQuery.refetch();
                  safetyQuery.refetch();
                }}
              >
                <RefreshCw size={14} className={feedQuery.isFetching ? "spin" : ""} />
              </button>
            </div>
          </div>

          <div className="dashboard-quick-stats">
            {quickStats.map((stat, index) => (
              <motion.div 
                key={index}
                className={`quick-stat-card stat-${stat.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="quick-stat-icon">
                  <stat.icon size={18} />
                </div>
                <div className="quick-stat-content">
                  <span className="quick-stat-value">{stat.value}</span>
                  <span className="quick-stat-label">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <Wallet size={18} />
              </div>
              <p>Wallet Balance</p>
              <strong>KES {walletTotal.toLocaleString()}</strong>
            </article>
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <TrendingUp size={18} />
              </div>
              <p>Avg Gig Pay</p>
              <strong>KES {avgPay.toLocaleString()}</strong>
            </article>
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <ShieldCheck size={18} />
              </div>
              <p>Safety Sessions</p>
              <strong>{safetyQuery.data?.sessions.length ?? 0}</strong>
            </article>
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <Users size={18} />
              </div>
              <p>Active Workers</p>
              <strong>142</strong>
            </article>
          </div>

          {statusMessage ? (
            <motion.div 
              className="dashboard-status-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <Bell size={14} />
              <span>{statusMessage}</span>
              <button type="button" className="btn-text" onClick={() => setStatusMessage(null)}>
                Dismiss
              </button>
            </motion.div>
          ) : null}
          {usingFallback ? (
            <div className="dashboard-status-banner is-warning">
              <Sparkles size={14} />
              <span>Showing demo feed. API not reachable.</span>
            </div>
          ) : null}
        </section>

        <div className="dashboard-main-layout">
          <section className="panel feed-panel">
            <div className="feed-head">
              <div>
                <h3>Live Gig Feed</h3>
                <p className="dashboard-subtle">
                  {filteredGigs.length} gigs available • Updated just now
                </p>
              </div>
              <div className="dashboard-head-actions">
                <button
                  type="button"
                  className={viewMode === "grid" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={14} />
                  Grid
                </button>
                <button
                  type="button"
                  className={viewMode === "list" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                  onClick={() => setViewMode("list")}
                >
                  <List size={14} />
                  List
                </button>
              </div>
            </div>

            <div className="dashboard-filter-bar">
              <label className="dashboard-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search gigs..."
                />
              </label>

              <label className="dashboard-compact-field">
                <Compass size={16} />
                <span>Mode</span>
                <select
                  value={feedMode}
                  onChange={(event) => setFeedMode(event.target.value as FeedMode)}
                >
                  <option value="MY_LOCATION">Nearby</option>
                  <option value="GENERAL">General</option>
                </select>
              </label>

              <label className="dashboard-range-wrap">
                <Filter size={16} />
                <span>{radiusMeters < 1000 ? `${radiusMeters}m` : `${(radiusMeters / 1000).toFixed(1)}km`}</span>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={500}
                  value={radiusMeters}
                  onChange={(event) => setRadiusMeters(Number(event.target.value))}
                />
              </label>
            </div>

            <div className="dashboard-category-row">
              <SlidersHorizontal size={14} />
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={categoryFilter === category ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="geo-strip">
              <label>
                <MapPin size={14} />
                <span>
                  {geo.loading
                    ? "Detecting location..."
                    : `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`}
                </span>
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => feedQuery.refetch()}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {feedQuery.isLoading ? (
              <div className="dashboard-loading-grid">
                {[1,2,3,4].map(i => (
                  <motion.div 
                    key={i}
                    className="skeleton dashboard-skeleton-card"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  ></motion.div>
                ))}
              </div>
            ) : null}

            {!feedQuery.isLoading && filteredGigs.length === 0 ? (
              <motion.div 
                className="dashboard-empty-state"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Target size={24} />
                <p>No gigs matched your filters.</p>
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : null}

            {!feedQuery.isLoading && filteredGigs.length > 0 ? (
              <div className={viewMode === "grid" ? "gig-grid gig-grid-2up" : "gig-list"}>
                {filteredGigs.map((gig, index) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <GigCard
                      gig={gig}
                      onApply={(gigId) => applyMutation.mutate(gigId)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="dashboard-side-column">
            <WalletPanel
              wallets={walletQuery.data?.wallets ?? FALLBACK_WALLETS}
              onTopUp={async (amount) => topupMutation.mutateAsync(amount)}
            />
            
            <SafetyPanel
              sessions={safetyQuery.data?.sessions ?? FALLBACK_SESSIONS}
              onSos={async (sessionId) => sosMutation.mutateAsync(sessionId)}
            />

            <div className="panel quick-actions-panel">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <motion.button 
                  className="quick-action-btn"
                  onClick={() => navigate("/add-gig")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlusCircle size={20} />
                  <span>Post Gig</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bookmark size={20} />
                  <span>Saved</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <History size={20} />
                  <span>History</span>
                </motion.button>
                <motion.button 
                  className="quick-action-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </motion.button>
              </div>
            </div>

            <div className="panel top-earners-panel">
              <h3>Top Earners Today</h3>
              <div className="top-earners-list">
                <div className="top-earner">
                  <span className="earner-rank gold">1</span>
                  <div className="earner-info">
                    <span className="earner-name">Shady.</span>
                    <span className="earner-amount">KES 4,500</span>
                  </div>
                </div>
                <div className="top-earner">
                  <span className="earner-rank silver">2</span>
                  <div className="earner-info">
                    <span className="earner-name">John D.</span>
                    <span className="earner-amount">KES 3,200</span>
                  </div>
                </div>
                <div className="top-earner">
                  <span className="earner-rank bronze">3</span>
                  <div className="earner-info">
                    <span className="earner-name">Mike K.</span>
                    <span className="earner-amount">KES 2,800</span>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <AdminPanel
                metrics={adminMetricsQuery.data}
                risk={riskDashboardQuery.data}
              />
            ) : null}
          </aside>
        </div>
      </div>

      <style>{`
        .dashboard-quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 900px) {
          .dashboard-quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .quick-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--bg-quaternary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .quick-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .quick-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-primary .quick-stat-icon { background: var(--gradient-primary); }
        .stat-accent .quick-stat-icon { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
        .stat-success .quick-stat-icon { background: linear-gradient(135deg, #22c55e, #4ade80); }
        .stat-warning .quick-stat-icon { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

        .quick-stat-content {
          display: flex;
          flex-direction: column;
        }

        .quick-stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .quick-stat-label {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .notification-wrapper { position: relative; }

        .notification-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: var(--danger-500);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          width: 320px;
          background: var(--bg-secondary);
          border: 1px solid var(--bg-tertiary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          z-index: 50;
          overflow: hidden;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--bg-tertiary);
        }

        .notification-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .notification-header button {
          background: none;
          border: none;
          color: var(--primary-500);
          font-size: 0.8rem;
          cursor: pointer;
        }

        .notification-list { max-height: 300px; overflow-y: auto; }

        .notification-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid var(--bg-tertiary);
          transition: background 0.2s;
        }

        .notification-item:hover { background: var(--bg-tertiary); }
        .notification-item.unread { background: color-mix(in srgb, var(--primary-500) 8%, transparent); }

        .notification-item svg {
          color: var(--primary-500);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-item p { margin: 0; font-size: 0.875rem; color: var(--text-primary); }
        .notification-item span { font-size: 0.75rem; color: var(--text-tertiary); }

        .quick-actions-panel h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--bg-quaternary);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .quick-action-btn:hover {
          background: var(--bg-quaternary);
          border-color: var(--primary-500);
          color: var(--primary-500);
        }

        .quick-action-btn span { font-size: 0.8rem; font-weight: 600; }

        .top-earners-panel h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .top-earners-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .top-earner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .earner-rank {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          color: white;
        }

        .earner-rank.gold { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .earner-rank.silver { background: linear-gradient(135deg, #6b7280, #9ca3af); }
        .earner-rank.bronze { background: linear-gradient(135deg, #b45309, #d97706); }

        .earner-info {
          display: flex;
          justify-content: space-between;
          flex: 1;
        }

        .earner-name { font-weight: 600; color: var(--text-primary); font-size: 0.9rem; }
        .earner-amount { font-weight: 700; color: var(--success-500); font-size: 0.9rem; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .text-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gig-grid-2up {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 900px) {
          .gig-grid-2up { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppLayout>
  );
}

export default DashboardPage;

