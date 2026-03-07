import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  Compass,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  Palette,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Wallet
} from "lucide-react";
import { AppLayout } from "../components/Layout";
import { AdminPanel } from "../components/AdminPanel";
import { ChatPanel, type ChatLaunchIntent } from "../components/ChatPanel";
import { GigCard, type GigCardProps } from "../components/GigCard";
import { NewGigForm } from "../components/NewGigForm";
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

const FALLBACK_GIGS = [
  {
    id: "demo-gig-1",
    title: "Campus Food Delivery Rush",
    description: "Deliver lunch parcels to hostels B and C between 12:00 and 2:00 PM.",
    category: "DELIVERY",
    payAmount: 750,
    currency: "KES",
    startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    latitude: -1.2824,
    longitude: 36.8202,
    posterName: "John D.",
    trustScore: 86
  },
  {
    id: "demo-gig-2",
    title: "Calculus and Statistics Coaching",
    description: "Two-hour evening tutoring for first-year engineering students.",
    category: "TUTORING",
    payAmount: 1200,
    currency: "KES",
    startsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2809,
    longitude: 36.8212,
    posterName: "Sarah M.",
    trustScore: 91
  },
  {
    id: "demo-gig-3",
    title: "Event Photography for Cultural Night",
    description: "Capture highlights for student association social channels.",
    category: "PHOTOGRAPHY",
    payAmount: 3000,
    currency: "KES",
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2841,
    longitude: 36.8187,
    posterName: "Mike K.",
    trustScore: 79
  },
  {
    id: "demo-gig-4",
    title: "Hostel Move Helper",
    description: "Need one reliable helper to move furniture within two blocks.",
    category: "LABOR",
    payAmount: 900,
    currency: "KES",
    startsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    latitude: -1.2818,
    longitude: 36.8228,
    posterName: "Linet A.",
    trustScore: 74
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
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const geo = useGeolocation(-1.2824, 36.8202);

  const [feedMode, setFeedMode] = useState<FeedMode>("MY_LOCATION");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [chatLaunchIntent, setChatLaunchIntent] = useState<ChatLaunchIntent | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const createGigRef = useRef<HTMLDivElement | null>(null);

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
      const threadId = String(result?.threadId ?? "");
      if (threadId) {
        const gig = gigs.find((item) => item.id === gigId);
        if (gig) {
          setChatLaunchIntent({
            requestId: Date.now(),
            gigId: gig.id,
            gigTitle: gig.title,
            posterId: gig.poster?.id,
            posterName: gig.poster?.profile?.displayName
          });
          setTimeout(() => {
            chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      setStatusMessage(parseApiError(error, "Could not apply for this gig right now."));
    }
  });

  const createGigMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof gigsApi.create>[0]) => gigsApi.create(payload),
    onSuccess: () => {
      setStatusMessage("Gig posted successfully.");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      setStatusMessage(parseApiError(error, "Gig posting failed. Please review your inputs."));
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

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-shell">
        <section className="panel dashboard-hero-panel">
          <div className="dashboard-hero-head">
            <div>
              <p className="dashboard-kicker">Professional Operations Dashboard</p>
              <h2>Welcome back, {displayName}</h2>
              <p className="dashboard-subtle">
                Monitor gigs, funds and safety in one live command center.
              </p>
            </div>
            <div className="dashboard-hero-actions">
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => createGigRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <PlusCircle size={14} />
                Add Gig
              </button>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <MessageSquare size={14} />
                Messages
              </button>
              <label className="dashboard-theme-select">
                <Palette size={16} />
                <span>Theme</span>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as ThemeName)}
                >
                  {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => {
                  feedQuery.refetch();
                  walletQuery.refetch();
                  safetyQuery.refetch();
                }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>

          <div className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <Target size={18} />
              </div>
              <p>Open Gigs</p>
              <strong>{filteredGigs.length}</strong>
            </article>
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
          </div>

          {statusMessage ? (
            <div className="dashboard-status-banner">
              <Bell size={14} />
              <span>{statusMessage}</span>
              <button type="button" className="btn-text" onClick={() => setStatusMessage(null)}>
                Dismiss
              </button>
            </div>
          ) : null}
          {usingFallback ? (
            <div className="dashboard-status-banner is-warning">
              <Sparkles size={14} />
              <span>Showing demo feed because the API is not reachable.</span>
            </div>
          ) : null}
        </section>

        <div className="dashboard-main-layout">
          <section className="panel feed-panel">
            <div className="feed-head">
              <div>
                <h3>Live Gig Feed</h3>
                <p className="dashboard-subtle">Gigs are arranged 2 by 2 for clear scanning.</p>
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
                  placeholder="Search title or description"
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
                <span>Radius {radiusMeters < 1000 ? `${radiusMeters}m` : `${(radiusMeters / 1000).toFixed(1)}km`}</span>
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
                Reload Feed
              </button>
            </div>

            {feedQuery.isLoading ? (
              <div className="dashboard-loading-grid">
                <div className="skeleton dashboard-skeleton-card"></div>
                <div className="skeleton dashboard-skeleton-card"></div>
                <div className="skeleton dashboard-skeleton-card"></div>
                <div className="skeleton dashboard-skeleton-card"></div>
              </div>
            ) : null}

            {!feedQuery.isLoading && filteredGigs.length === 0 ? (
              <div className="dashboard-empty-state">
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
              </div>
            ) : null}

            {!feedQuery.isLoading && filteredGigs.length > 0 ? (
              <div className={viewMode === "grid" ? "gig-grid gig-grid-2up" : "gig-list"}>
                {filteredGigs.map((gig, index) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <GigCard
                      gig={gig}
                      onApply={(gigId) => applyMutation.mutate(gigId)}
                      onMessage={(selectedGig) => {
                        setChatLaunchIntent({
                          requestId: Date.now(),
                          gigId: selectedGig.id,
                          gigTitle: selectedGig.title,
                          posterId: selectedGig.poster?.id,
                          posterName: selectedGig.poster?.profile?.displayName
                        });
                        setStatusMessage(`Opening chat for ${selectedGig.title}.`);
                        setTimeout(() => {
                          chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 50);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="dashboard-side-column">
            <div ref={createGigRef}>
              <NewGigForm
                latitude={geo.latitude}
                longitude={geo.longitude}
                onSubmit={async (payload) => createGigMutation.mutateAsync(payload)}
              />
            </div>
            <WalletPanel
              wallets={walletQuery.data?.wallets ?? FALLBACK_WALLETS}
              onTopUp={async (amount) => topupMutation.mutateAsync(amount)}
            />
            <SafetyPanel
              sessions={safetyQuery.data?.sessions ?? FALLBACK_SESSIONS}
              onSos={async (sessionId) => sosMutation.mutateAsync(sessionId)}
            />
          </aside>
        </div>

        <div className="dashboard-bottom-grid" ref={chatPanelRef}>
          <ChatPanel
            launchIntent={chatLaunchIntent}
            onLaunchHandled={() => setChatLaunchIntent(null)}
            onStatusChange={(message) => setStatusMessage(message)}
          />
          {isAdmin ? (
            <AdminPanel
              metrics={adminMetricsQuery.data}
              risk={riskDashboardQuery.data}
            />
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;
