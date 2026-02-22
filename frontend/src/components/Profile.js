import React, { useState, useEffect, useCallback } from "react";
import { getProfile, getDisplayName, getProfilePic, shortAddr as shortAddress } from "../helpers/profile";
import EditProfile from "./EditProfile";
import { resolveCloudinaryRef } from "../helpers/cloudinary";

function resolveImageUrl(url) {
  if (url.startsWith("cloud:")) return resolveCloudinaryRef(url);
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("local:")) {
    const id = url.substring(6);
    try {
      const store = JSON.parse(localStorage.getItem("tweeter-images") || "{}");
      return store[id] || null;
    } catch (e) { return null; }
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

function Profile({ contract, account, profiles, onSaveProfile, deleteTweet }) {
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [userTweets, setUserTweets] = useState([]);
  const [followAddr, setFollowAddr] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [showTab, setShowTab] = useState("tweets");
  const [copied, setCopied] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const myProfile = getProfile(account);
  const displayName = getDisplayName(account, profiles);
  const profilePic = myProfile?.profilePic || getProfilePic(account, profiles);
  const shortAddr = (a) => shortAddress(a);

  const loadProfile = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const fing = await contract.getFollowingCount(account);
      const fers = await contract.getFollowersCount(account);
      setFollowingCount(Number(fing));
      setFollowersCount(Number(fers));

      const fList = await contract.getFollowing(account);
      setFollowingList(fList.map((a) => a));

      const ferList = await contract.getFollowers(account);
      setFollowers(ferList.map((a) => a));

      const tweetIds = await contract.getTweetsOf(account);
      if (tweetIds.length > 0) {
        const count = tweetIds.length > 20 ? 20 : tweetIds.length;
        const raw = await contract.getLatestTweetsOf(account, count);
        const tweetsData = await Promise.all(
          raw.map(async (t) => {
            const likes = await contract.likesCount(t.id);
            return {
              id: Number(t.id),
              author: t.author,
              content: t.content,
              createdAt: Number(t.createdAt),
              likes: Number(likes),
            };
          })
        );
        setUserTweets(tweetsData);
      } else {
        setUserTweets([]);
      }
    } catch (_) {}
  }, [contract, account]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleFollow = async (e) => {
    e.preventDefault();
    if (!followAddr.trim()) return;
    setActing(true);
    setError("");
    try {
      const tx = await contract.follow(followAddr);
      await tx.wait();
      setFollowAddr("");
      await loadProfile();
    } catch (err) {
      setError(err.reason || err.message);
    }
    setActing(false);
  };

  const handleUnfollow = async (addr) => {
    setActing(true);
    try {
      const tx = await contract.unfollow(addr);
      await tx.wait();
      await loadProfile();
    } catch (err) {
      setError(err.reason || err.message);
    }
    setActing(false);
  };

  const handleDeleteTweet = async (id) => {
    if (!window.confirm("Delete this tweet permanently?")) return;
    setActing(true);
    try {
      await deleteTweet(id);
      await loadProfile();
    } catch (err) {
      setError(err.reason || err.message);
    }
    setActing(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="profile">
      <div
        className="profile-banner"
        style={myProfile?.coverPic ? { backgroundImage: `url(${myProfile.coverPic})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!myProfile?.coverPic && (
          <>
            <div className="banner-pattern"></div>
            <div className="banner-overlay"></div>
          </>
        )}
      </div>

      <div className="profile-info-section">
        <div className="profile-top-row">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {profilePic ? (
                <img src={profilePic} alt="" className="profile-avatar-img" />
              ) : (
                account.slice(2, 4).toUpperCase()
              )}
            </div>
            <span className="profile-online-dot"></span>
          </div>
          <button className="btn btn-outline edit-profile-btn" onClick={() => setShowEditProfile(true)}>
            Edit profile
          </button>
        </div>

        <div className="profile-details">
          <div className="profile-name-row">
            <h2 className="profile-display-name">{displayName}</h2>
            <button className="btn-copy" onClick={copyAddress} title="Copy full address">
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="profile-handle">@{shortAddr(account)}</p>

          {myProfile?.bio && <p className="profile-bio-text">{myProfile.bio}</p>}

          <div className="profile-meta-row">
            {myProfile?.location && (
              <span className="profile-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {myProfile.location}
              </span>
            )}
            <span className="profile-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Holesky Testnet
            </span>
            <span className="profile-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Joined {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat clickable" onClick={() => setShowTab("tweets")}>
            <span className="profile-stat-num">{userTweets.length}</span>
            <span className="profile-stat-label">Tweets</span>
          </div>
          <div className="profile-stat-divider"></div>
          <div className="profile-stat clickable" onClick={() => setShowTab("followers")}>
            <span className="profile-stat-num">{followersCount}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat-divider"></div>
          <div className="profile-stat clickable" onClick={() => setShowTab("following")}>
            <span className="profile-stat-num">{followingCount}</span>
            <span className="profile-stat-label">Following</span>
          </div>
        </div>
      </div>

      <form className="follow-form" onSubmit={handleFollow}>
        <div className="follow-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="follow-input-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <input
            type="text"
            placeholder="Paste address to follow (0x...)"
            value={followAddr}
            onChange={(e) => setFollowAddr(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" disabled={acting || !followAddr.trim()}>
          {acting ? "..." : "Follow"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="profile-tabs">
        {["tweets", "following", "followers"].map((tab) => (
          <button
            key={tab}
            className={`tab ${showTab === tab ? "active" : ""}`}
            onClick={() => setShowTab(tab)}
          >
            {tab === "tweets" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            )}
            {tab === "following" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
            {tab === "followers" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            <span className="tab-count">
              {tab === "tweets" ? userTweets.length : tab === "following" ? followingCount : followersCount}
            </span>
          </button>
        ))}
      </div>

      {showTab === "tweets" && (
        <div className="profile-tweets">
          {userTweets.length === 0 ? (
            <div className="feed-empty">
              <div className="empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </div>
              <h3>No tweets yet</h3>
              <p>Your tweets will appear here</p>
            </div>
          ) : (
            userTweets.map((t) => (
              <div className="tweet-card" key={t.id}>
                <div className="tweet-card-left">
                  <div className="tweet-avatar">
                    {profilePic ? (
                      <img src={profilePic} alt="" className="avatar-img" />
                    ) : (
                      t.author.slice(2, 4).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="tweet-card-right">
                  <div className="tweet-header">
                    <span className="tweet-display-name">{displayName}</span>
                    <span className="tweet-dot">·</span>
                    <span className="tweet-time">
                      {new Date(t.createdAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <button
                      className="tweet-menu-btn"
                      onClick={() => handleDeleteTweet(t.id)}
                      disabled={acting}
                      title="Delete tweet"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  {(() => {
                    const { text, images } = parseTweetContent(t.content);
                    return (
                      <>
                        <p className="tweet-content">{text}</p>
                        {images.length > 0 && (
                          <div className="tweet-images">
                            {images.map((url, idx) => (
                              <img key={idx} src={url} alt="" className="tweet-image" onError={(e) => { e.target.style.display = 'none'; }} />
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="tweet-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {t.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showTab === "following" && (
        <div className="address-list">
          {followingList.length === 0 ? (
            <div className="feed-empty">
              <h3>Not following anyone</h3>
              <p>Follow someone using the address field above</p>
            </div>
          ) : (
            followingList.map((addr, i) => (
              <div className="address-item" key={i}>
                <div className="address-item-left">
                  <div className="tweet-avatar small">
                    {getProfilePic(addr, profiles) ? (
                      <img src={getProfilePic(addr, profiles)} alt="" className="avatar-img" />
                    ) : (
                      addr.slice(2, 4).toUpperCase()
                    )}
                  </div>
                  <div className="address-item-info">
                    <span className="address-name">{getDisplayName(addr, profiles)}</span>
                    <span className="address-text">{shortAddr(addr)}</span>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUnfollow(addr)}
                  disabled={acting}
                >
                  Unfollow
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showTab === "followers" && (
        <div className="address-list">
          {followers.length === 0 ? (
            <div className="feed-empty">
              <h3>No followers yet</h3>
              <p>Share your address to get followers</p>
            </div>
          ) : (
            followers.map((addr, i) => (
              <div className="address-item" key={i}>
                <div className="address-item-left">
                  <div className="tweet-avatar small">
                    {getProfilePic(addr, profiles) ? (
                      <img src={getProfilePic(addr, profiles)} alt="" className="avatar-img" />
                    ) : (
                      addr.slice(2, 4).toUpperCase()
                    )}
                  </div>
                  <div className="address-item-info">
                    <span className="address-name">{getDisplayName(addr, profiles)}</span>
                    <span className="address-text">{shortAddr(addr)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showEditProfile && (
        <EditProfile
          profile={myProfile}
          account={account}
          onSave={onSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  );
}

export default Profile;
