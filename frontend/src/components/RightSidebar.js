import React, { useState, useMemo } from "react";

function RightSidebar({ account, tweets = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const trends = useMemo(() => {
    const tagCounts = {};
    const keywordHits = {};
    const categories = {
      blockchain: 'Blockchain · Trending', ethereum: 'Technology · Trending',
      crypto: 'Crypto · Trending', defi: 'DeFi · Trending', nft: 'Digital Art · Trending',
      web3: 'Web3 · Trending', solidity: 'Development · Trending', bitcoin: 'Crypto · Trending',
      ai: 'AI · Trending', python: 'Development · Trending', javascript: 'Development · Trending',
      token: 'Crypto · Trending', dao: 'Web3 · Trending', dapp: 'Web3 · Trending',
      metaverse: 'Technology · Trending', wallet: 'Web3 · Trending',
      decentralized: 'Web3 · Trending', developer: 'Community · Trending',
      smart: 'Blockchain · Trending', programming: 'Technology · Trending',
    };

    tweets.forEach(t => {
      const text = (t.content || '').split('\n[IMG]')[0];
      (text.match(/#[\w]+/g) || []).forEach(h => {
        const l = h.toLowerCase();
        tagCounts[l] = (tagCounts[l] || 0) + 1;
      });
      const lower = text.toLowerCase();
      Object.keys(categories).forEach(kw => {
        if (lower.includes(kw)) keywordHits[kw] = (keywordHits[kw] || 0) + 1;
      });
    });

    const result = [];
    Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([tag, c]) => {
      result.push({ title: tag, category: 'Hashtag · Trending', count: `${c} post${c > 1 ? 's' : ''}` });
    });
    if (result.length < 5) {
      Object.entries(keywordHits).sort((a, b) => b[1] - a[1]).forEach(([kw, c]) => {
        if (result.length >= 5) return;
        if (!result.some(r => r.title.replace('#', '').toLowerCase().includes(kw))) {
          result.push({
            title: '#' + kw.charAt(0).toUpperCase() + kw.slice(1),
            category: categories[kw],
            count: `${c} post${c > 1 ? 's' : ''}`,
          });
        }
      });
    }
    if (result.length === 0) {
      return [
        { title: '#Web3Social', category: 'Blockchain · Trending', count: 'Decentralized social' },
        { title: '#Ethereum', category: 'Technology · Trending', count: 'Smart contracts' },
        { title: '#DeFi', category: 'Crypto · Trending', count: 'Decentralized Finance' },
        { title: '#BuildInPublic', category: 'Development · Trending', count: 'Open source' },
        { title: '#Solidity', category: 'Development · Trending', count: 'Smart contract lang' },
      ];
    }
    return result;
  }, [tweets]);

  const tweetCount = tweets.length;
  const authorCount = new Set(tweets.map(t => t.author?.toLowerCase())).size;
  const totalLikes = tweets.reduce((sum, t) => sum + (t.likes || 0), 0);

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-inner">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="right-card">
          <h3 className="right-card-title">About Tweeter</h3>
          <div className="right-card-body">
            <div className="about-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <div>
                <strong>On-Chain</strong>
                <span>All data stored on Ethereum</span>
              </div>
            </div>
            <div className="about-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <strong>Self-Custody</strong>
                <span>Your keys, your data</span>
              </div>
            </div>
            <div className="about-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div>
                <strong>Holesky Testnet</strong>
                <span>Zero real cost to try</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-card">
          <h3 className="right-card-title">What's happening</h3>
          <div className="right-card-body">
            {tweetCount > 0 && (
              <div className="network-stats">
                <div className="network-stat">
                  <span className="network-stat-num">{tweetCount}</span>
                  <span className="network-stat-label">Tweets</span>
                </div>
                <div className="network-stat">
                  <span className="network-stat-num">{authorCount}</span>
                  <span className="network-stat-label">Users</span>
                </div>
                <div className="network-stat">
                  <span className="network-stat-num">{totalLikes}</span>
                  <span className="network-stat-label">Likes</span>
                </div>
              </div>
            )}
            {trends.map((trend, i) => (
              <div
                className="trend-item"
                key={i}
                onClick={() => setSearchQuery(trend.title)}
                role="button"
                tabIndex={0}
              >
                <div className="trend-info">
                  <span className="trend-category">{trend.category}</span>
                  <strong className="trend-title">{trend.title}</strong>
                  <span className="trend-posts">{trend.count}</span>
                </div>
                <div className="trend-more">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-card right-card-footer">
          <div className="footer-links">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>About</span>
          </div>
          <p className="footer-copy">© 2026 Tweeter. Powered by Ethereum.</p>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
