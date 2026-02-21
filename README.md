# 🐦 Tweeter — Decentralized Social Media on Ethereum

A fully on-chain Twitter/X clone built on the **Holesky Testnet**. Every tweet, like, follow, and message is stored immutably on the Ethereum blockchain. No servers, no censorship — just your wallet and the smart contract.

---

## ✨ Features

### Core Social Features
- **Tweet** — Post up to 280-byte tweets on-chain
- **Like / Unlike** — Like any tweet (one per wallet per tweet)
- **Delete** — Remove your own tweets permanently
- **Follow / Unfollow** — Follow any wallet address
- **Direct Messages** — Send on-chain messages to any wallet (up to 1000 bytes)
- **Share** — Forward any tweet to another wallet via DM

### Profile System
- Custom display name, bio, location
- Profile picture and cover photo with built-in **Image Editor**
- All profile data stored locally per wallet address (`localStorage`)

### Image Editor
- **Crop** — Free, 1:1, 4:3, 16:9, 3:4 aspect ratios with draggable handles
- **Adjust** — Brightness, contrast, saturation, warmth, blur sliders
- **Filters** — 9 presets (Vivid, Warm, Cool, B&W, Vintage, Dramatic, Fade, Noir)
- **Transform** — Rotate (90° increments), flip horizontal/vertical

### AI-Powered Tweet Composer
13 AI enhancement options in 4 categories:

| Category | Options |
|----------|---------|
| **Style** | ✨ Enhance, 💼 Professional, 😎 Casual, 💪 Motivational, 📖 Storytelling |
| **Tools** | 📝 Fix Grammar, 📏 Shorten, #️⃣ Hashtags, 🎨 Emoji Boost |
| **Engage** | 🎣 Add Hook, 📢 Add CTA, 🧵 Thread Format |
| **Translate** | 🇮🇳 Hinglish (English → Hindi-English mix) |

Plus a **Generate** feature that creates new tweets by topic (Web3, Tech, Motivation, General).

### Image Upload
- Drag & drop or click to upload (JPG, PNG, GIF, WEBP — max 5MB)
- Auto-compression to save space
- Images stored in `localStorage` with short IDs, referenced on-chain as `local:xxxxxxxx`

### Real-time UI
- Notification system (follows + likes) with read/unread states
- Dynamic trending sidebar (extracts hashtags & keywords from live tweets)
- Network stats (tweet count, user count, total likes)
- Character counter with circular progress ring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.20 |
| **Blockchain** | Holesky Testnet (Chain ID: 17000) |
| **Development** | Hardhat 2.22.0 |
| **Frontend** | React 19.2.4 |
| **Blockchain Lib** | ethers.js 6.16.0 |
| **Wallet** | MetaMask |

---

## 📦 Project Structure

```
tweeter-project/
├── contracts/
│   └── tweeter.sol              # Smart contract (TweetContract)
├── scripts/
│   └── deploy.js                # Hardhat deployment script
├── frontend/
│   ├── public/
│   │   ├── index.html           # HTML template
│   │   └── logo.png             # App logo
│   └── src/
│       ├── index.js             # React entry point
│       ├── App.js               # Main component (wallet connect, routing, state)
│       ├── App.css              # All styles (dark theme, 3-column layout)
│       ├── contract.js          # Contract address + ABI
│       ├── helpers/
│       │   ├── profile.js       # Profile CRUD (localStorage)
│       │   └── ai.js            # 13 AI options + content generator
│       └── components/
│           ├── Navbar.js        # Left sidebar navigation
│           ├── CreateTweet.js   # Tweet composer + image upload + AI tools
│           ├── TweetFeed.js     # Tweet cards with like/delete/share
│           ├── Profile.js       # Profile page (stats, tweets, followers)
│           ├── EditProfile.js   # Profile edit modal
│           ├── Messages.js      # On-chain messaging
│           ├── Notifications.js # Follow & like notifications
│           ├── RightSidebar.js  # Trending, network stats, about
│           └── ImageEditor.js   # Crop, adjust, filter, transform
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Root dependencies (Hardhat)
└── .env                         # Private key & RPC URL (not committed)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension
- Holesky testnet ETH (free from [faucets](https://holesky-faucet.pk910.de/))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd tweeter-project

# Install Hardhat dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL=https://holesky.drpc.org
PRIVATE_KEY=your_wallet_private_key_here
```

### 3. Deploy Smart Contract (optional — already deployed)

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

The app opens at **http://localhost:3000** (or next available port).

---

## 🔗 Smart Contract

**Address:** `0x27fB721aB9B385D9E3b8Df13acbB8c949b7DdA87`  
**Network:** Holesky Testnet  
**Explorer:** [View on Etherscan](https://holesky.etherscan.io/address/0x27fB721aB9B385D9E3b8Df13acbB8c949b7DdA87)

### Contract Functions

| Function | Description |
|----------|------------|
| `tweet(string)` | Post a new tweet |
| `deleteTweet(uint)` | Delete your own tweet |
| `likeTweet(uint)` | Like a tweet |
| `unlikeTweet(uint)` | Unlike a tweet |
| `follow(address)` | Follow a wallet |
| `unfollow(address)` | Unfollow a wallet |
| `sendMessage(string, address)` | Send a direct message |
| `allow(address)` / `disallow(address)` | Operator delegation |
| `getLatestTweets(uint)` | Fetch recent tweets |
| `getConversation(address, address)` | Fetch DM conversation |

---

## 🎨 Design

- **Dark theme** with CSS variables for easy customization
- **3-column layout** — Left sidebar (275px) · Main content (600px) · Right sidebar (350px)
- **Responsive** — Breakpoints at 1280px, 1024px, 768px, and 500px
- **Connect page** — Split layout with animated hero (floating orbs, gradient text, badges) on the left, features + connect button on the right

---

## 📝 Notes

- **No backend server** — All data is on-chain or in browser `localStorage`
- **Images are stored locally** — They are compressed and saved in `localStorage`, not uploaded to IPFS or any server. Images only persist on the device where they were uploaded.
- **Profile data is local** — Stored per wallet address in `localStorage`. Not visible to other users on different devices.
- **Zero transaction cost** — Holesky is a testnet with free ETH from faucets.
- **MetaMask required** — The app auto-switches to Holesky network on connect.

---

## 📄 License

MIT
