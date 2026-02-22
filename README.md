# 🐦 Tweeter — Decentralized Social Media on Ethereum

A fully decentralized, Twitter/X-inspired social media platform built on the **Ethereum Holesky Testnet**.
Every tweet, like, follow, and message is powered by smart contracts — no centralized backend, no censorship, and true user ownership.

🚀 **Live Demo:** [https://tweeter-dapp.vercel.app](https://tweeter-dapp.vercel.app)

💻 **GitHub:** [https://github.com/SanojYadav17/twitter-web3](https://github.com/SanojYadav17/twitter-web3)

---

## ✨ Overview

Tweeter demonstrates how a modern social media experience can be built using **Solidity smart contracts** and a **React-based Web3 frontend** without relying on a traditional backend.

The platform focuses on:

- Decentralization and transparency
- Wallet-based identity
- On-chain social interactions
- A clean, production-ready user experience

---

## 🌟 Key Features

### 🧵 Core Social Features

- **Tweet** — Post tweets on-chain
- **Like / Unlike** — Like any tweet (one per wallet per tweet)
- **Delete** — Remove your own tweets
- **Follow / Unfollow** — Follow any wallet address
- **Direct Messages** — Wallet-to-wallet on-chain messaging
- **Share** — Forward tweets via direct message

### 👤 Profile System

- Custom display name, bio, and location
- Profile picture and cover photo with built-in Image Editor
- Profile data stored locally per wallet address using `localStorage`

### 🖼️ Built-in Image Editor

- **Crop** — 1:1, 4:3, 16:9, 3:4
- **Adjust** — Brightness, contrast, saturation, warmth, blur
- **Filters** — Vivid, Warm, Cool, B&W, Vintage, Dramatic, Fade, Noir
- **Transform** — Rotate (90° increments), flip horizontal/vertical

### 🤖 AI-Powered Tweet Composer

Multiple AI enhancement options across categories:

- **Style** — Enhance, Professional, Casual, Motivational, Storytelling
- **Tools** — Fix Grammar, Shorten, Hashtags, Emoji Boost
- **Engage** — Add Hook, Add CTA, Thread Format
- **Translate** — Hinglish (English → Hindi-English mix)

Also includes a **Generate** feature to create tweets by topic (Web3, Tech, Motivation, General).

### 🖼️ Image Upload

- Upload images (JPG, PNG, GIF, WEBP)
- Images are stored on **Cloudinary** for scalable and optimized delivery
- Media is integrated into the dApp for posts and profiles

### ⚡ Real-time UI

- Notification system for likes and follows
- Dynamic trending sidebar
- Network statistics (tweets, users, likes)
- Character counter with progress indicator

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Ethereum Holesky Testnet (Chain ID: 17000) |
| Smart Contracts | Solidity |
| Development | Hardhat |
| Frontend | React |
| Blockchain Library | Ethers.js |
| Wallet | MetaMask |
| Image Storage | Cloudinary |
| Deployment | Vercel |

---

## 📦 Project Structure

```
twitter-web3/
├── contracts/
│   └── tweeter.sol
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── helpers/
│       ├── App.js
│       └── index.js
├── hardhat.config.js
├── package.json
└── .env
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MetaMask browser extension
- Holesky testnet ETH (from a faucet)

### 1. Clone & Install

```bash
git clone https://github.com/SanojYadav17/twitter-web3.git
cd twitter-web3

npm install
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```
SEPOLIA_RPC_URL=https://holesky.drpc.org
PRIVATE_KEY=your_wallet_private_key_here
```

### 3. Deploy Smart Contract (Optional)

The contract is already deployed at:

```
0x27fB721aB9B385D9E3b8Df13acbB8c949b7DdA87
```

To redeploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Then update the address in `frontend/src/contract.js`.

### 4. Run Frontend

```bash
cd frontend
npm start
```

Open: [http://localhost:3000](http://localhost:3000)

---

## 🔗 Smart Contract

- **Network:** Holesky Testnet
- **Address:** `0x27fB721aB9B385D9E3b8Df13acbB8c949b7DdA87`

### Main Functions

| Function | Description |
|---|---|
| `tweet(string)` | Post a new tweet |
| `deleteTweet(uint)` | Delete your own tweet |
| `likeTweet(uint)` / `unlikeTweet(uint)` | Like or unlike a tweet |
| `follow(address)` / `unfollow(address)` | Follow or unfollow a wallet |
| `sendMessage(string, address)` | Send a direct message |
| `allow(address)` / `disallow(address)` | Operator delegation |
| `getLatestTweets(uint)` | Fetch recent tweets |
| `getConversation(address, address)` | Fetch DM conversation |

---

## 🎨 UI & Design

- Dark theme with modern layout
- 3-column layout (Sidebar · Feed · Right panel)
- Fully responsive across devices
- Dedicated connect page with animated hero section

---

## 📝 Notes

- No traditional backend server
- On-chain data + browser `localStorage` for profile metadata
- Images are stored on Cloudinary
- Holesky testnet = no real gas cost
- MetaMask is required

---

## 📄 License

MIT
