import React from "react";
import { getDisplayName, getProfilePic, shortAddr } from "../helpers/profile";

function Notifications({ notifications, profiles, account, markRead }) {
  React.useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markRead();
    }
  }, [notifications, markRead]);

  if (notifications.length === 0) {
    return (
      <div className="notifications">
        <div className="notif-empty">
          <div className="notif-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3>Nothing here yet</h3>
          <p>When someone follows you or likes your tweets, you'll see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications">

      <div className="notif-list">
        {notifications.map((n) => (
          <div className={`notif-item ${n.read ? '' : 'unread'}`} key={n.id}>
            {n.type === 'follow' && (
              <>
                <div className="notif-icon notif-icon-follow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div className="notif-avatar-wrap">
                  {getProfilePic(n.from, profiles) ? (
                    <img src={getProfilePic(n.from, profiles)} alt="" className="notif-avatar-img" />
                  ) : (
                    <div className="tweet-avatar small">
                      {n.from.slice(2, 4).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="notif-content">
                  <p>
                    <strong>{getDisplayName(n.from, profiles)}</strong>
                    {' '}started following you
                  </p>
                  <span className="notif-addr">{shortAddr(n.from)}</span>
                </div>
              </>
            )}

            {n.type === 'likes' && (
              <>
                <div className="notif-icon notif-icon-like">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div className="notif-avatar-wrap">
                  <div className="tweet-avatar small" style={{background: 'linear-gradient(135deg, #f91880, #e0245e)'}}>
                    ♥
                  </div>
                </div>
                <div className="notif-content">
                  <p>
                    Your tweet received <strong>{n.count} {n.count === 1 ? 'like' : 'likes'}</strong>
                  </p>
                  <span className="notif-addr">Tweet #{n.tweetId}</span>
                </div>
              </>
            )}


          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
