import React, { useState } from "react";
import { ethers } from "ethers";
import { getDisplayName, getProfilePic } from "../helpers/profile";

function resolveImageUrl(url) {
  // Cloudinary URLs - return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Legacy localStorage support for old tweets
  if (url.startsWith("local:")) {
    const id = url.substring(6);
    try {
      const store = JSON.parse(localStorage.getItem("tweeter-images") || "{}");
      return store[id] || null;
    } catch (e) {
      return null;
    }
  }
  return url;
}

function parseTweetContent(content) {
  const imgSplit = content.split("\n[IMG]");
  const text = imgSplit[0] || "";
  const imageRef = imgSplit[1] || "";
  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi;
  const inlineImages = text.match(urlRegex) || [];
  const cleanText = inlineImages.length > 0 ? text.replace(urlRegex, '').trim() : text;

  const allImages = [];
  if (imageRef) {
    const resolved = resolveImageUrl(imageRef);
    if (resolved) allImages.push(resolved);
  }
  inlineImages.forEach(u => allImages.push(u));

  return { text: cleanText, images: allImages };
}

function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "d";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ShareModal({ tweet, onClose, onShare }) {
  const [toAddress, setToAddress] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    setError("");
    if (!toAddress.trim()) {
      setError("Enter a wallet address");
      return;
    }
    if (!ethers.isAddress(toAddress.trim())) {
      setError("Invalid Ethereum address");
      return;
    }
    setSending(true);
    try {
      await onShare(tweet.id, tweet.content, tweet.author, toAddress.trim());
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.reason || err.message || "Transaction failed");
    }
    setSending(false);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share Tweet</h3>
          <button className="share-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="share-modal-preview">
          <p className="share-preview-author">{tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}</p>
          <p className="share-preview-content">"{tweet.content}"</p>
        </div>
        {success ? (
          <div className="share-success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p>Shared successfully!</p>
          </div>
        ) : (
          <>
            <div className="share-modal-input-group">
              <label>Send to wallet address</label>
              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                disabled={sending}
                className="share-modal-input"
              />
            </div>
            {error && <p className="share-modal-error">{error}</p>}
            <button
              className="share-modal-btn"
              onClick={handleShare}
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Confirming in MetaMask...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Share via MetaMask
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TweetCard({ tweet, account, likeTweet, unlikeTweet, deleteTweet, shareTweet, profiles }) {
  const [acting, setActing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const isAuthor = tweet.author.toLowerCase() === account.toLowerCase();
  const displayName = getDisplayName(tweet.author, profiles);
  const shortAddr = tweet.author.slice(0, 6) + "..." + tweet.author.slice(-4);
  const profilePic = getProfilePic(tweet.author, profiles);
  const { text, images } = parseTweetContent(tweet.content);

  const handleLike = async () => {
    setActing(true);
    try {
      if (tweet.liked) await unlikeTweet(tweet.id);
      else await likeTweet(tweet.id);
    } catch (_) {}
    setActing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this tweet permanently?")) return;
    setActing(true);
    try { await deleteTweet(tweet.id); }
    catch (_) {}
    setActing(false);
  };

  return (
    <article className="tweet-card">
      <div className="tweet-card-left">
        <div className="tweet-avatar">
          {profilePic ? (
            <img src={profilePic} alt="" className="avatar-img" />
          ) : (
            tweet.author.slice(2, 4).toUpperCase()
          )}
        </div>
        <div className="tweet-thread-line"></div>
      </div>
      <div className="tweet-card-right">
        <div className="tweet-header">
          <span className="tweet-display-name">{displayName}</span>
          {displayName !== shortAddr && <span className="tweet-handle">@{shortAddr}</span>}
          <span className="tweet-dot">·</span>
          <span className="tweet-time">{timeAgo(tweet.createdAt)}</span>
          {isAuthor && (
            <button
              className="tweet-menu-btn"
              onClick={handleDelete}
              disabled={acting}
              title="Delete tweet"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
        <p className="tweet-content">{text}</p>
        {images.length > 0 && (
          <div className="tweet-images">
            {images.map((url, idx) => (
              <img key={idx} src={url} alt="" className="tweet-image" onError={(e) => { e.target.style.display = 'none'; }} />
            ))}
          </div>
        )}
        <div className="tweet-actions">
          <button
            className={`action-like ${tweet.liked ? "liked" : ""}`}
            onClick={handleLike}
            disabled={acting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={tweet.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{tweet.likes}</span>
          </button>
          <button
            className="action-share"
            title="Share tweet to another wallet"
            onClick={() => setShowShareModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
      {showShareModal && (
        <ShareModal
          tweet={tweet}
          onClose={() => setShowShareModal(false)}
          onShare={shareTweet}
        />
      )}
    </article>
  );
}

function TweetFeed({ tweets, loading, account, likeTweet, unlikeTweet, deleteTweet, shareTweet, profiles }) {
  if (loading) {
    return (
      <div className="tweet-feed">
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading tweets...</p>
        </div>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="tweet-feed">
        <div className="feed-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
          </div>
          <h3>No tweets yet</h3>
          <p>Be the first to tweet something on-chain!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tweet-feed">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          account={account}
          likeTweet={likeTweet}
          unlikeTweet={unlikeTweet}
          deleteTweet={deleteTweet}
          shareTweet={shareTweet}
          profiles={profiles}
        />
      ))}
    </div>
  );
}

export default TweetFeed;
