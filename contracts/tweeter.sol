// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TweetContract {

    error EmptyContent();
    error ContentTooLong(uint maxLength);
    error ZeroAddress();
    error SelfAction();
    error NotAuthorized();
    error TweetNotFound();
    error TweetAlreadyDeleted();
    error OnlyAuthor();
    error AlreadyLiked();
    error NotLiked();
    error AlreadyFollowing();
    error NotFollowing();
    error AlreadyOperator();
    error NotOperator();
    error InvalidCount();
    error NoEthAccepted();

    uint public constant MAX_TWEET_LENGTH = 280;
    uint public constant MAX_MESSAGE_LENGTH = 1000;

    struct Tweet {
        uint id;
        address author;
        string content;
        uint createdAt;
    }

    struct Message {
        uint id;
        string content;
        address from;
        address to;
        uint createdAt;
    }

    event TweetCreated(uint indexed id, address indexed author, string content, uint createdAt);
    event TweetDeleted(uint indexed id, address indexed author);
    event MessageSent(uint indexed id, address indexed from, address indexed to, string content, uint createdAt);
    event Followed(address indexed follower, address indexed followed);
    event Unfollowed(address indexed follower, address indexed unfollowed);
    event OperatorAllowed(address indexed user, address indexed operator);
    event OperatorDisallowed(address indexed user, address indexed operator);
    event TweetLiked(uint indexed tweetId, address indexed liker);
    event TweetUnliked(uint indexed tweetId, address indexed unliker);

    mapping(uint => Tweet) public tweets;
    mapping(address => uint[]) public tweetsOf;
    mapping(address => mapping(address => Message[])) public conversations;
    mapping(address => mapping(address => bool)) public operators;
    mapping(address => address[]) public following;
    mapping(address => address[]) public followers;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint => mapping(address => bool)) public hasLiked;
    mapping(uint => uint) public likesCount;

    uint public nextTweetId;
    uint public nextMessageId;

    receive() external payable { revert NoEthAccepted(); }
    fallback() external payable { revert NoEthAccepted(); }

    function _tweet(address _from, string memory _content) internal {
        uint len = bytes(_content).length;
        if (len == 0) revert EmptyContent();
        if (len > MAX_TWEET_LENGTH) revert ContentTooLong(MAX_TWEET_LENGTH);
        tweets[nextTweetId] = Tweet(nextTweetId, _from, _content, block.timestamp);
        tweetsOf[_from].push(nextTweetId);
        emit TweetCreated(nextTweetId, _from, _content, block.timestamp);
        nextTweetId++;
    }

    function _sendMessage(address _from, address _to, string memory _content) internal {
        if (_to == address(0)) revert ZeroAddress();
        if (_from == _to) revert SelfAction();
        uint len = bytes(_content).length;
        if (len == 0) revert EmptyContent();
        if (len > MAX_MESSAGE_LENGTH) revert ContentTooLong(MAX_MESSAGE_LENGTH);
        Message memory newMsg = Message(nextMessageId, _content, _from, _to, block.timestamp);
        conversations[_from][_to].push(newMsg);
        conversations[_to][_from].push(newMsg);
        emit MessageSent(nextMessageId, _from, _to, _content, block.timestamp);
        nextMessageId++;
    }

    function tweet(string memory _content) public {
        _tweet(msg.sender, _content);
    }

    function tweet(address _from, string memory _content) public {
        if (_from != msg.sender && !operators[_from][msg.sender]) revert NotAuthorized();
        _tweet(_from, _content);
    }

    function deleteTweet(uint _tweetId) public {
        if (_tweetId >= nextTweetId) revert TweetNotFound();
        Tweet storage t = tweets[_tweetId];
        if (t.author == address(0)) revert TweetAlreadyDeleted();
        if (t.author != msg.sender) revert OnlyAuthor();
        uint[] storage userTweets = tweetsOf[msg.sender];
        for (uint i = 0; i < userTweets.length; i++) {
            if (userTweets[i] == _tweetId) {
                userTweets[i] = userTweets[userTweets.length - 1];
                userTweets.pop();
                break;
            }
        }
        delete tweets[_tweetId];
        emit TweetDeleted(_tweetId, msg.sender);
    }

    function likeTweet(uint _tweetId) public {
        if (_tweetId >= nextTweetId) revert TweetNotFound();
        if (tweets[_tweetId].author == address(0)) revert TweetAlreadyDeleted();
        if (hasLiked[_tweetId][msg.sender]) revert AlreadyLiked();
        hasLiked[_tweetId][msg.sender] = true;
        likesCount[_tweetId]++;
        emit TweetLiked(_tweetId, msg.sender);
    }

    function unlikeTweet(uint _tweetId) public {
        if (_tweetId >= nextTweetId) revert TweetNotFound();
        if (!hasLiked[_tweetId][msg.sender]) revert NotLiked();
        hasLiked[_tweetId][msg.sender] = false;
        likesCount[_tweetId]--;
        emit TweetUnliked(_tweetId, msg.sender);
    }

    function sendMessage(string memory _content, address _to) public {
        _sendMessage(msg.sender, _to, _content);
    }

    function sendMessage(address _from, address _to, string memory _content) public {
        if (_from != msg.sender && !operators[_from][msg.sender]) revert NotAuthorized();
        _sendMessage(_from, _to, _content);
    }

    function follow(address _followed) public {
        if (_followed == address(0)) revert ZeroAddress();
        if (_followed == msg.sender) revert SelfAction();
        if (isFollowing[msg.sender][_followed]) revert AlreadyFollowing();
        following[msg.sender].push(_followed);
        followers[_followed].push(msg.sender);
        isFollowing[msg.sender][_followed] = true;
        emit Followed(msg.sender, _followed);
    }

    function unfollow(address _unfollowed) public {
        if (!isFollowing[msg.sender][_unfollowed]) revert NotFollowing();
        address[] storage myFollowing = following[msg.sender];
        for (uint i = 0; i < myFollowing.length; i++) {
            if (myFollowing[i] == _unfollowed) {
                myFollowing[i] = myFollowing[myFollowing.length - 1];
                myFollowing.pop();
                break;
            }
        }
        address[] storage theirFollowers = followers[_unfollowed];
        for (uint i = 0; i < theirFollowers.length; i++) {
            if (theirFollowers[i] == msg.sender) {
                theirFollowers[i] = theirFollowers[theirFollowers.length - 1];
                theirFollowers.pop();
                break;
            }
        }
        isFollowing[msg.sender][_unfollowed] = false;
        emit Unfollowed(msg.sender, _unfollowed);
    }

    function allow(address _operator) public {
        if (_operator == address(0)) revert ZeroAddress();
        if (_operator == msg.sender) revert SelfAction();
        if (operators[msg.sender][_operator]) revert AlreadyOperator();
        operators[msg.sender][_operator] = true;
        emit OperatorAllowed(msg.sender, _operator);
    }

    function disallow(address _operator) public {
        if (!operators[msg.sender][_operator]) revert NotOperator();
        operators[msg.sender][_operator] = false;
        emit OperatorDisallowed(msg.sender, _operator);
    }

    function getLatestTweets(uint count) public view returns (Tweet[] memory) {
        if (count == 0) revert InvalidCount();
        uint totalActive = 0;
        for (uint i = 0; i < nextTweetId; i++) {
            if (tweets[i].author != address(0)) totalActive++;
        }
        if (count > totalActive) count = totalActive;
        Tweet[] memory _tweets = new Tweet[](count);
        uint j = 0;
        for (uint i = nextTweetId; i > 0 && j < count; i--) {
            if (tweets[i - 1].author != address(0)) {
                _tweets[j] = tweets[i - 1];
                j++;
            }
        }
        return _tweets;
    }

    function getLatestTweetsOf(address user, uint count) public view returns (Tweet[] memory) {
        uint[] storage ids = tweetsOf[user];
        if (count == 0) revert InvalidCount();
        if (count > ids.length) count = ids.length;
        Tweet[] memory _tweets = new Tweet[](count);
        uint j = 0;
        for (uint i = ids.length - count; i < ids.length; i++) {
            _tweets[j] = tweets[ids[i]];
            j++;
        }
        return _tweets;
    }

    function getTweetsOf(address user) public view returns (uint[] memory) {
        return tweetsOf[user];
    }

    function getFollowing(address user) public view returns (address[] memory) {
        return following[user];
    }

    function getFollowers(address user) public view returns (address[] memory) {
        return followers[user];
    }

    function getFollowingCount(address user) public view returns (uint) {
        return following[user].length;
    }

    function getFollowersCount(address user) public view returns (uint) {
        return followers[user].length;
    }

    function getConversation(address userA, address userB) public view returns (Message[] memory) {
        return conversations[userA][userB];
    }
}