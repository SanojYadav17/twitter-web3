import React from "react";
import { getDisplayName, getProfilePic } from "../helpers/profile";

function Navbar({ account, activeTab, setActiveTab, disconnectWallet, profiles, unreadCount }) {
  const displayName = getDisplayName(account, profiles);
  const profilePic = getProfilePic(account, profiles);
  const shortAddr = account.slice(0, 6) + "..." + account.slice(-4);

  const navItems = [
    {
      id: "feed",
      label: "Home",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill={activeTab === "feed" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      badge: unreadCount,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill={activeTab === "notifications" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "messages",
      label: "Messages",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill={activeTab === "messages" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill={activeTab === "profile" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-top">
          <div className="sidebar-logo" onClick={() => setActiveTab("feed")} role="button" tabIndex={0}>
            <img src="/logo.png" alt="Tweeter" className="sidebar-logo-img" />
          </div>

          <div className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="sidebar-icon-wrap">
                  {item.icon}
                  {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
                </div>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            className="sidebar-post-btn"
            onClick={() => {
              setActiveTab("feed");
              setTimeout(() => {
                const ta = document.querySelector(".create-tweet textarea");
                if (ta) ta.focus();
              }, 100);
            }}
          >
            <svg className="sidebar-post-icon-mobile" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="sidebar-post-label">Post</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user" onClick={disconnectWallet} role="button" tabIndex={0} title="Click to disconnect">
            <div className="sidebar-user-avatar">
              {profilePic ? (
                <img src={profilePic} alt="" className="sidebar-user-img" />
              ) : (
                <span className="sidebar-user-letter">{account.slice(2, 4).toUpperCase()}</span>
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName !== shortAddr ? displayName : "Anonymous"}</span>
              <span className="sidebar-user-handle">@{shortAddr}</span>
            </div>
            <svg className="sidebar-user-more" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
