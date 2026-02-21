import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, HOLESKY_CHAIN_ID } from "./contract";
import { getProfiles, saveProfileData } from "./helpers/profile";
import Navbar from "./components/Navbar";
import RightSidebar from "./components/RightSidebar";
import CreateTweet from "./components/CreateTweet";
import TweetFeed from "./components/TweetFeed";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import Notifications from "./components/Notifications";
import "./App.css";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isConnecting = useRef(false);

  const reloadProfiles = useCallback(() => setProfiles(getProfiles()), []);
  useEffect(() => { reloadProfiles(); }, [reloadProfiles]);

  const handleSaveProfile = (address, data) => {
    saveProfileData(address, data);
    reloadProfiles();
  };

  const disconnectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (_) {}
    }
    setAccount("");
    setContract(null);
    setTweets([]);
    setActiveTab("feed");
  }, []);

  const connectWallet = async () => {
    setError("");
    if (!window.ethereum) {
      setError("Please install MetaMask first!");
      return;
    }
    isConnecting.current = true;
    try {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (_) {}

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        setError("No account selected. Try again.");
        isConnecting.current = false;
        return;
      }

      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: HOLESKY_CHAIN_ID,
            chainName: "Holesky Testnet",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://holesky.drpc.org"],
            blockExplorerUrls: ["https://holesky.etherscan.io"],
          }],
        });
      } catch (_) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: HOLESKY_CHAIN_ID }],
          });
        } catch (_) {}
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const cont = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setContract(cont);
      setAccount(addr);
      setError("");
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected. Click Connect again.");
      } else {
        setError("Wallet connect failed. Try again.");
      }
    }
    isConnecting.current = false;
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const handleChange = () => {
      if (!isConnecting.current) window.location.reload();
    };
    window.ethereum.on("accountsChanged", handleChange);
    window.ethereum.on("chainChanged", handleChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleChange);
      window.ethereum.removeListener("chainChanged", handleChange);
    };
  }, []);

  const loadTweets = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const nextId = await contract.nextTweetId();
      if (nextId === 0n) {
        setTweets([]);
        setLoading(false);
        return;
      }
      const count = nextId > 20n ? 20n : nextId;
      const rawTweets = await contract.getLatestTweets(count);
      const tweetsWithLikes = await Promise.all(
        rawTweets.map(async (t) => {
          const likes = await contract.likesCount(t.id);
          const liked = account ? await contract.hasLiked(t.id, account) : false;
          return {
            id: Number(t.id),
            author: t.author,
            content: t.content,
            createdAt: Number(t.createdAt),
            likes: Number(likes),
            liked,
          };
        })
      );
      setTweets(tweetsWithLikes);
    } catch (_) {}
    setLoading(false);
  }, [contract, account]);

  useEffect(() => { loadTweets(); }, [loadTweets]);

  const loadNotifications = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const notifs = [];
      const followersList = await contract.getFollowers(account);
      for (const f of followersList) {
        notifs.push({ id: `follow_${f.toLowerCase()}`, type: 'follow', from: f, read: false });
      }
      const tweetIds = await contract.getTweetsOf(account);
      for (const id of tweetIds) {
        const likes = Number(await contract.likesCount(id));
        if (likes > 0) {
          notifs.push({ id: `likes_${Number(id)}`, type: 'likes', tweetId: Number(id), count: likes, read: false });
        }
      }
      const readIds = JSON.parse(localStorage.getItem(`tweeter_read_${account.toLowerCase()}`) || '[]');
      const readSet = new Set(readIds);
      notifs.forEach(n => { n.read = readSet.has(n.id); });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch {}
  }, [contract, account]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markNotificationsRead = useCallback(() => {
    const readIds = notifications.map(n => n.id);
    localStorage.setItem(`tweeter_read_${account.toLowerCase()}`, JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications, account]);

  const postTweet = async (content) => {
    const tx = await contract["tweet(string)"](content);
    await tx.wait();
    await loadTweets();
  };

  const likeTweet = async (id) => {
    const tx = await contract.likeTweet(id);
    await tx.wait();
    await loadTweets();
  };

  const unlikeTweet = async (id) => {
    const tx = await contract.unlikeTweet(id);
    await tx.wait();
    await loadTweets();
  };

  const deleteTweet = async (id) => {
    const tx = await contract.deleteTweet(id);
    await tx.wait();
    await loadTweets();
  };

  const shareTweet = async (tweetId, tweetContent, tweetAuthor, toAddress) => {
    const shareMsg = `Shared Tweet #${tweetId} by ${tweetAuthor}: "${tweetContent}"`;
    const tx = await contract.sendMessage(shareMsg, toAddress);
    await tx.wait();
  };

  if (!account) {
    return (
      <div className="connect-page">
        <div className="connect-left">
          <div className="connect-hero">
            {/* Animated background orbs */}
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>

            <div className="connect-hero-logo">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </div>

            <h2 className="hero-title">
              The <span className="hero-gradient">Future</span> of<br />
              Social Media
            </h2>
            <p className="hero-subtitle">DECENTRALIZED. IMMUTABLE. YOURS.</p>

            <div className="hero-badges">
              <div className="hero-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                <div>
                  <strong>Holesky Testnet</strong>
                  <span>Zero gas cost</span>
                </div>
              </div>
              <div className="hero-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <div>
                  <strong>No Censorship</strong>
                  <span>Fully on-chain</span>
                </div>
              </div>
              <div className="hero-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <div>
                  <strong>Community</strong>
                  <span>Web3 builders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="connect-right">
          <div className="connect-card">
            <div className="connect-card-header">
              <div className="connect-logo-wrap">
                <div className="connect-logo-glow"></div>
                <svg className="connect-logo-svg" width="36" height="36" viewBox="0 0 24 24" fill="var(--accent)">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </div>
              <h1>Happening now</h1>
              <p className="connect-tagline">Join Tweeter today.</p>
            </div>

            <div className="connect-features">
              <div className="connect-feature">
                <div className="connect-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div className="connect-feature-text">
                  <strong>On-Chain & Permanent</strong>
                  <span>All tweets stored on Ethereum blockchain forever</span>
                </div>
              </div>
              <div className="connect-feature">
                <div className="connect-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="connect-feature-text">
                  <strong>Self-Custody</strong>
                  <span>Your keys, your identity, your data</span>
                </div>
              </div>
              <div className="connect-feature">
                <div className="connect-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="connect-feature-text">
                  <strong>Full Social Features</strong>
                  <span>Tweet, follow, like, message & share</span>
                </div>
              </div>
              <div className="connect-feature">
                <div className="connect-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="connect-feature-text">
                  <strong>AI-Powered Writing</strong>
                  <span>Smart compose, grammar fix, multiple styles</span>
                </div>
              </div>
            </div>

            <div className="connect-divider"></div>

            {error && <p className="error-text center">{error}</p>}
            <button className="connect-btn" onClick={connectWallet}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M22 10H2" />
                <path d="M6 14h.01" />
              </svg>
              Connect with MetaMask
            </button>

            <div className="connect-alt-text">
              <span className="connect-alt-line"></span>
              <span>Powered by Ethereum</span>
              <span className="connect-alt-line"></span>
            </div>

            <div className="connect-bottom">
              <span className="connect-hint">
                <span className="hint-dot"></span> Holesky Testnet — Zero real cost
              </span>
              <p className="connect-terms">
                By connecting, you agree to interact with the smart contract on Holesky Testnet.
                No real ETH required.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar
        account={account}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        disconnectWallet={disconnectWallet}
        profiles={profiles}
        unreadCount={unreadCount}
      />
      <main className="main-content">
        <div className="main-inner">
          {activeTab === "feed" && (
            <div className="main-header">
              <h2 className="main-header-title">Home</h2>
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="main-header">
              <h2 className="main-header-title">Notifications</h2>
            </div>
          )}
          {activeTab === "messages" && (
            <div className="main-header">
              <h2 className="main-header-title">Messages</h2>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
          {activeTab === "feed" && (
            <>
              <CreateTweet postTweet={postTweet} account={account} profiles={profiles} />
              <TweetFeed
                tweets={tweets}
                loading={loading}
                account={account}
                likeTweet={likeTweet}
                unlikeTweet={unlikeTweet}
                deleteTweet={deleteTweet}
                shareTweet={shareTweet}
                profiles={profiles}
              />
            </>
          )}
          {activeTab === "profile" && (
            <Profile
              contract={contract}
              account={account}
              profiles={profiles}
              onSaveProfile={handleSaveProfile}
            />
          )}
          {activeTab === "messages" && <Messages contract={contract} account={account} />}
          {activeTab === "notifications" && (
            <Notifications
              notifications={notifications}
              profiles={profiles}
              account={account}
              markRead={markNotificationsRead}
            />
          )}
        </div>
      </main>
      <RightSidebar account={account} tweets={tweets} />
    </div>
  );
}

export default App;
