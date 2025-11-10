import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './MarketDiscovery.scss';

interface TokenLaunch {
  id: string;
  address: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  logoUrl: string;
  description: string;
  creator: string;
  createdAt: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  progressPercent: number;
  holdersCount: number;
  currentPrice: number;
  liquidityBNB: number;
  verified: boolean;
  flagged: boolean;
  graduated: boolean;
  website?: string;
  twitter?: string;
  telegram?: string;
}

type SortOption = 'newest' | 'hot' | 'top' | 'completed';
type FilterOption = 'all' | 'active' | 'graduated' | 'verified';

const MarketDiscovery: React.FC = () => {
  const [launches, setLaunches] = useState<TokenLaunch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadLaunches();
  }, [sortBy, filterBy]);

  const loadLaunches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/bonding-launches?sort=${sortBy}&filter=${filterBy}&limit=${ITEMS_PER_PAGE}&offset=${(page - 1) * ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch launches');
      }

      const data = await response.json();

      // Map backend data to TokenLaunch interface
      const mappedLaunches: TokenLaunch[] = data.launches.map((launch: any) => ({
        id: launch._id,
        address: launch.address,
        tokenAddress: launch.tokenAddress,
        name: launch.name,
        symbol: launch.symbol,
        logoUrl: launch.logoUrl || `https://via.placeholder.com/100?text=${launch.symbol.substr(0, 2)}`,
        description: launch.description || 'The next big meme coin on BSC',
        creator: `${launch.creator.slice(0, 6)}...${launch.creator.slice(-4)}`,
        createdAt: new Date(launch.createdAt).getTime(),
        marketCap: launch.marketCap,
        volume24h: launch.volume24h,
        priceChange24h: launch.priceChange24h,
        progressPercent: launch.progressPercent,
        holdersCount: launch.holdersCount,
        currentPrice: launch.currentPrice,
        liquidityBNB: launch.liquidityBNB,
        verified: launch.verified,
        flagged: launch.flagged,
        graduated: launch.graduated,
        website: launch.website,
        twitter: launch.twitter,
        telegram: launch.telegram
      }));

      setLaunches(mappedLaunches);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading launches:', error);
      // Fallback to empty array on error
      setLaunches([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedLaunches = useMemo(() => {
    let result = [...launches];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(launch =>
        launch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        launch.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'active':
        result = result.filter(l => !l.graduated && l.progressPercent < 100);
        break;
      case 'graduated':
        result = result.filter(l => l.graduated);
        break;
      case 'verified':
        result = result.filter(l => l.verified);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'hot':
        result.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case 'top':
        result.sort((a, b) => b.marketCap - a.marketCap);
        break;
      case 'completed':
        result = result.filter(l => l.progressPercent >= 100);
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [launches, searchQuery, sortBy, filterBy]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="market-discovery">
      <Navbar />

      <div className="market-container">
        {/* Header */}
        <div className="market-header">
          <h1>Discover Tokens</h1>
          <p>Trade on bonding curves and watch tokens graduate to PancakeSwap</p>
        </div>

        {/* Controls */}
        <div className="market-controls">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Sort Tabs */}
          <div className="sort-tabs">
            {(['newest', 'hot', 'top', 'completed'] as SortOption[]).map(option => (
              <button
                key={option}
                className={sortBy === option ? 'active' : ''}
                onClick={() => setSortBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            {(['all', 'active', 'graduated', 'verified'] as FilterOption[]).map(option => (
              <button
                key={option}
                className={filterBy === option ? 'active' : ''}
                onClick={() => setFilterBy(option)}
              >
                {option === 'all' ? 'All' :
                 option === 'active' ? 'Active' :
                 option === 'graduated' ? 'Graduated' :
                 'Verified ✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Token Grid */}
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading launches...</p>
          </div>
        ) : filteredAndSortedLaunches.length === 0 ? (
          <div className="empty-state">
            <h3>No tokens found</h3>
            <p>Try adjusting your filters or be the first to launch!</p>
            <Link to="/Create_presale" className="cta-button">
              Create Launch
            </Link>
          </div>
        ) : (
          <div className="token-grid">
            {filteredAndSortedLaunches.map(launch => (
              <Link
                key={launch.id}
                to={`/launch/${launch.address}`}
                className={`token-card ${launch.flagged ? 'flagged' : ''}`}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="token-logo">
                    <img src={launch.logoUrl} alt={launch.name} />
                    {launch.verified && (
                      <span className="verified-badge" title="Verified">✓</span>
                    )}
                  </div>
                  <div className="token-info">
                    <h3>{launch.name}</h3>
                    <span className="symbol">${launch.symbol}</span>
                  </div>
                  {launch.graduated && (
                    <span className="graduated-badge">🎓 Graduated</span>
                  )}
                </div>

                {/* Description */}
                <p className="description">{launch.description}</p>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Bonding Curve</span>
                    <span className="progress-percent">{launch.progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(launch.progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="token-stats">
                  <div className="stat">
                    <span className="label">Market Cap</span>
                    <span className="value">{formatNumber(launch.marketCap)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">24h Volume</span>
                    <span className="value">{formatNumber(launch.volume24h)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">24h Change</span>
                    <span className={`value ${launch.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {launch.priceChange24h >= 0 ? '+' : ''}
                      {launch.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="label">Holders</span>
                    <span className="value">{launch.holdersCount}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="card-footer">
                  <div className="creator">
                    <span>By {launch.creator}</span>
                  </div>
                  <div className="timestamp">
                    {formatTimeAgo(launch.createdAt)}
                  </div>
                </div>

                {/* Social Links */}
                {(launch.website || launch.twitter || launch.telegram) && (
                  <div className="social-links">
                    {launch.website && (
                      <a href={launch.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <span>🌐</span>
                      </a>
                    )}
                    {launch.twitter && (
                      <a href={launch.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <span>🐦</span>
                      </a>
                    )}
                    {launch.telegram && (
                      <a href={launch.telegram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <span>✈️</span>
                      </a>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoading && filteredAndSortedLaunches.length > 0 && (
          <div className="load-more">
            <button onClick={() => setPage(p => p + 1)}>
              Load More
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MarketDiscovery;
