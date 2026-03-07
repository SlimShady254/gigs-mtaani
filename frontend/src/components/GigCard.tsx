import { useState } from "react";

export type GigCardProps = {
  gig: {
    id: string;
    title: string;
    description: string;
    category: string;
    payAmount: number;
    currency: string;
    distanceMeters?: number;
    startsAt: string;
    latitude?: number;
    longitude?: number;
    poster?: {
      id?: string;
      profile?: {
        displayName?: string;
        avatarUrl?: string;
      };
      trustScore?: {
        score: number;
        band: string;
      };
    };
    images?: string[];
    tags?: string[];
  };
  onApply: (gigId: string) => void;
  onMessage?: (gig: GigCardProps["gig"]) => void;
};

// Mock images for different categories
const CATEGORY_IMAGES = {
  DELIVERY: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop",
  TUTORING: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
  PHOTOGRAPHY: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400&h=300&fit=crop",
  GENERAL: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  LABOR: "https://images.unsplash.com/photo-1581091012217-3c332b9b989c?w=400&h=300&fit=crop",
  CLEANING: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
  EVENT: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop",
  TECH: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop"
};

export function GigCard({ gig, onApply, onMessage }: GigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categoryImage = gig.images?.[0] || CATEGORY_IMAGES[gig.category as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.GENERAL;
  const posterName = gig.poster?.profile?.displayName ?? "Campus User";
  const posterAvatar = gig.poster?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=random&color=fff`;

  const formatDistance = (meters?: number) => {
    if (meters === undefined) return null;
    const km = Math.round(meters / 100) / 10;
    return `${km} km away`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="gig-card theme-transition">
      {/* Image Header */}
      <div className="gig-image-header">
        <img 
          src={categoryImage} 
          alt={gig.title}
          className="gig-image"
          loading="lazy"
        />
        <div className="gig-image-overlay">
          <span className="chip chip-category">{gig.category}</span>
          <div className="gig-price-badge">
            <span className="price-label">Earn</span>
            <span className="price-amount">{gig.currency} {Number(gig.payAmount).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="gig-content">
        <div className="gig-card-head">
          <h3 className="gig-title">{gig.title}</h3>
          {gig.tags && gig.tags.length > 0 && (
            <div className="gig-tags">
              {gig.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <p className="gig-description">
          {isExpanded || gig.description.length <= 120 
            ? gig.description 
            : `${gig.description.substring(0, 120)}...`}
        </p>
        
        {gig.description.length > 120 && (
          <button 
            className="btn-text"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Meta Information */}
        <div className="gig-meta">
          <div className="gig-meta-item">
            <svg className="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0120 4.2C20 11.5 12 16 12 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12l0 .01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatDistance(gig.distanceMeters)}</span>
          </div>
          
          <div className="gig-meta-item">
            <svg className="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{formatDate(gig.startsAt)}</span>
          </div>
          
          <div className="gig-meta-item">
            <svg className="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{gig.poster?.trustScore?.band || "New"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="gig-footer">
          <div className="gig-poster">
            <img src={posterAvatar} alt={posterName} className="poster-avatar" />
            <div className="poster-info">
              <span className="poster-name">{posterName}</span>
              {gig.poster?.trustScore && (
                <span className="poster-trust">Trust Score: {gig.poster.trustScore.score}/100</span>
              )}
            </div>
          </div>
          
          <div className="gig-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onMessage?.(gig)}
              disabled={!onMessage}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Message
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onApply(gig.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
              </svg>
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
