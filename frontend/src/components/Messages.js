import React, { useState, useCallback, useRef, useEffect } from "react";

function Messages({ contract, account }) {
  const [targetAddr, setTargetAddr] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const shortAddr = (a) => a.slice(0, 6) + "..." + a.slice(-4);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const loadConversation = useCallback(
    async (addr) => {
      if (!contract || !addr) return;
      setLoadingChat(true);
      try {
        const msgs = await contract.getConversation(account, addr);
        const parsed = msgs.map((m) => ({
          from: m.from,
          to: m.to,
          content: m.content,
          createdAt: Number(m.createdAt),
        }));
        setChatMessages(parsed);
        setActiveChat(addr);
        setError("");
      } catch (err) {
        setError("Failed to load: " + (err.reason || err.message));
      }
      setLoadingChat(false);
    },
    [contract, account]
  );

  const openChat = (e) => {
    e.preventDefault();
    if (!targetAddr.trim()) return;
    loadConversation(targetAddr.trim());
    setTargetAddr("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChat || !msgContent.trim()) return;
    setSending(true);
    setError("");
    try {
      const tx = await contract.sendMessage(msgContent, activeChat);
      await tx.wait();
      setMsgContent("");
      await loadConversation(activeChat);
    } catch (err) {
      setError(err.reason || err.message);
    }
    setSending(false);
  };

  const handleBack = () => {
    setActiveChat(null);
    setChatMessages([]);
  };

  return (
    <div className="messages">
      <div className="messages-top">
        <form className="open-chat-form" onSubmit={openChat}>
          <div className="chat-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by wallet address (0x...)"
              value={targetAddr}
              onChange={(e) => setTargetAddr(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!targetAddr.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </button>
        </form>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!activeChat ? (
        <div className="no-chat">
          <div className="no-chat-illustration">
            <div className="no-chat-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="no-chat-title">Your Messages</h3>
          <p>Send private, on-chain messages to any wallet address</p>
          <div className="no-chat-features">
            <div className="no-chat-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Blockchain secured</span>
            </div>
            <div className="no-chat-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
              <span>Permanent & immutable</span>
            </div>
            <div className="no-chat-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Direct delivery</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-area">
          <div className="chat-header">
            <button className="chat-back-btn" onClick={handleBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className="chat-header-info">
              <div className="tweet-avatar small">{activeChat.slice(2, 4).toUpperCase()}</div>
              <div>
                <h3>{shortAddr(activeChat)}</h3>
                <span className="chat-status">On Holesky Testnet</span>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => loadConversation(activeChat)}
              disabled={loadingChat}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {loadingChat ? "..." : "Refresh"}
            </button>
          </div>

          <div className="chat-messages">
            {loadingChat ? (
              <div className="feed-loading">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="chat-empty">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((m, i) => (
                <div
                  className={`message-bubble ${
                    m.from.toLowerCase() === account.toLowerCase() ? "sent" : "received"
                  }`}
                  key={i}
                >
                  <p>{m.content}</p>
                  <span className="msg-time">
                    {new Date(m.createdAt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={msgContent}
              onChange={(e) => setMsgContent(e.target.value)}
              maxLength={1000}
            />
            <button className="btn btn-primary send-btn" disabled={sending || !msgContent.trim()}>
              {sending ? (
                <span className="btn-spinner"></span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;
