export const CONTRACT_ADDRESS = "0x27fB721aB9B385D9E3b8Df13acbB8c949b7DdA87";

export const HOLESKY_CHAIN_ID = "0x4268"; // 17000 in hex

export const CONTRACT_ABI = [
  "function tweet(string _content) public",
  "function tweet(address _from, string _content) public",
  "function deleteTweet(uint _tweetId) public",
  "function likeTweet(uint _tweetId) public",
  "function unlikeTweet(uint _tweetId) public",
  "function sendMessage(string _content, address _to) public",
  "function sendMessage(address _from, address _to, string _content) public",
  "function follow(address _followed) public",
  "function unfollow(address _unfollowed) public",
  "function allow(address _operator) public",
  "function disallow(address _operator) public",
  "function getLatestTweets(uint count) public view returns (tuple(uint id, address author, string content, uint createdAt)[])",
  "function getLatestTweetsOf(address user, uint count) public view returns (tuple(uint id, address author, string content, uint createdAt)[])",
  "function getTweetsOf(address user) public view returns (uint[])",
  "function getFollowing(address user) public view returns (address[])",
  "function getFollowers(address user) public view returns (address[])",
  "function getFollowingCount(address user) public view returns (uint)",
  "function getFollowersCount(address user) public view returns (uint)",
  "function getConversation(address userA, address userB) public view returns (tuple(uint id, string content, address from, address to, uint createdAt)[])",
  "function tweets(uint) public view returns (uint id, address author, string content, uint createdAt)",
  "function likesCount(uint) public view returns (uint)",
  "function hasLiked(uint, address) public view returns (bool)",
  "function isFollowing(address, address) public view returns (bool)",
  "function nextTweetId() public view returns (uint)",
  "function MAX_TWEET_LENGTH() public view returns (uint)",
  "event TweetCreated(uint indexed id, address indexed author, string content, uint createdAt)",
  "event TweetDeleted(uint indexed id, address indexed author)",
  "event TweetLiked(uint indexed tweetId, address indexed liker)",
  "event TweetUnliked(uint indexed tweetId, address indexed unliker)",
  "event Followed(address indexed follower, address indexed followed)",
  "event Unfollowed(address indexed follower, address indexed unfollowed)",
  "event MessageSent(uint indexed id, address indexed from, address indexed to, string content, uint createdAt)"
];
