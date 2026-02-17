import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import socialService from '../services/socialService';

const CommunityScreen = ({ setCurrentScreen, user }) => {
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load feed
    const feedResult = await socialService.getFeed();
    if (feedResult.success) {
      setFeed(feedResult.posts || []);
      
      // Track which posts current user liked
      const liked = {};
      feedResult.posts.forEach(post => {
        liked[post.id] = post.likes?.includes(user?.uid) || false;
      });
      setLikedPosts(liked);
    }
    
    // Load friends
    const friendsResult = await socialService.getFriends();
    if (friendsResult.success) {
      setFriends(friendsResult.friends || []);
    }
    
    // Load friend requests
    const requestsResult = await socialService.getFriendRequests();
    if (requestsResult.success) {
      setFriendRequests(requestsResult.requests || []);
    }
    
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const result = await socialService.searchUsers(searchTerm);
    if (result.success) {
      setSearchResults(result.users);
    }
    setLoading(false);
  };

  const handleSendFriendRequest = async (targetUsername) => {
    const result = await socialService.sendFriendRequest(targetUsername);
    if (result.success) {
      alert(`Friend request sent to ${targetUsername}!`);
      // Remove from search results or update UI
      setSearchResults(prev => prev.filter(u => u.username !== targetUsername));
    } else {
      alert('Error sending friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const result = await socialService.acceptFriendRequest(requestId);
    if (result.success) {
      // Refresh data
      loadData();
      setShowRequests(false);
    }
  };

  const handleLikePost = async (postId) => {
    const result = await socialService.likePost(postId);
    if (result.success) {
      // Update local state
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      
      // Update feed likes count
      setFeed(prev => prev.map(post => {
        if (post.id === postId) {
          const newLikes = likedPosts[postId] 
            ? post.likes.filter(id => id !== user?.uid)
            : [...post.likes, user?.uid];
          return { ...post, likes: newLikes };
        }
        return post;
      }));
    }
  };

  const handleAddComment = async (postId) => {
    const comment = commentText[postId];
    if (!comment?.trim()) return;
    
    const result = await socialService.addComment(postId, comment);
    if (result.success) {
      // Clear comment input
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      // Refresh feed to show new comment
      const feedResult = await socialService.getFeed();
      if (feedResult.success) {
        setFeed(feedResult.posts || []);
      }
    }
  };

  const handleSharePost = async (post) => {
    if (window.confirm('Share this hike to your profile?')) {
      const result = await socialService.shareHike(post.hikeData);
      if (result.success) {
        alert('Post shared successfully!');
      }
    }
  };

  const pendingRequests = friendRequests.filter(r => r.status === 'pending');

  return (
    <div className="App">
      <div className="top-bar">
        <span className="time">{format(new Date(), 'h:mm a')}</span>
        <div className="menu-icons">
          <div className="menu-icon"></div>
          <div className="menu-icon"></div>
        </div>
      </div>

      <div className="content" style={{ paddingBottom: '80px' }}>
        <div className="detail-header">
          <button onClick={() => setCurrentScreen('home')} className="back-btn">
            ←
          </button>
          <div>
            <h2 className="detail-title">Community</h2>
            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
              Welcome, {user?.displayName || user?.username}!
            </p>
          </div>
          {pendingRequests.length > 0 && (
            <button 
              onClick={() => setShowRequests(!showRequests)}
              style={{
                background: '#ff4444',
                border: 'none',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                marginLeft: 'auto',
                cursor: 'pointer'
              }}
            >
              {pendingRequests.length} Request{pendingRequests.length > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Friend Requests Modal */}
        {showRequests && (
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ color: '#fff' }}>Friend Requests</h3>
              <button 
                onClick={() => setShowRequests(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            {pendingRequests.length === 0 ? (
              <p style={{ color: '#888' }}>No pending requests</p>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: '#222',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{request.fromName}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      {format(new Date(request.createdAt), 'MMM d')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      style={{
                        background: '#4CAF50',
                        border: 'none',
                        color: '#fff',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      style={{
                        background: '#666',
                        border: 'none',
                        color: '#fff',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search for friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: '12px 20px',
                background: '#333',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              🔍
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              marginTop: '10px',
              background: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333',
              padding: '10px'
            }}>
              {searchResults.map(user => (
                <div key={user.uid} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  borderBottom: '1px solid #333'
                }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{user.username}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      {user.totalHikes || 0} hikes
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(user.username)}
                    style={{
                      background: '#4CAF50',
                      border: 'none',
                      color: '#fff',
                      padding: '5px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #222',
          paddingBottom: '10px'
        }}>
          <button
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: activeTab === 'feed' ? '#fff' : '#666',
              padding: '10px',
              cursor: 'pointer',
              borderBottom: activeTab === 'feed' ? '2px solid #fff' : 'none'
            }}
          >
            Feed
          </button>
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: activeTab === 'friends' ? '#fff' : '#666',
              padding: '10px',
              cursor: 'pointer',
              borderBottom: activeTab === 'friends' ? '2px solid #fff' : 'none'
            }}
          >
            Friends ({friends.length})
          </button>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div>
            {loading ? (
              <p style={{ color: '#888', textAlign: 'center' }}>Loading feed...</p>
            ) : feed.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🌐</span>
                <h3 className="empty-title">No posts yet</h3>
                <p className="empty-text">
                  Add friends or share your hikes to see posts here!
                </p>
              </div>
            ) : (
              feed.map(post => (
                <div key={post.id} className="hike-item" style={{ padding: 0, marginBottom: '20px' }}>
                  {/* Post Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                    borderBottom: '1px solid #222'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#222',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '24px' }}>👤</span>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{post.username}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        {format(new Date(post.timestamp), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '5px' }}>
                      {post.hikeData?.title || 'Untitled Hike'}
                    </h3>
                    <p style={{ color: '#888', marginBottom: '10px' }}>
                      {post.hikeData?.description || ''}
                    </p>

                    {/* Hike Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                      background: '#0a0a0a',
                      padding: '10px',
                      borderRadius: '10px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>km</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {post.hikeData?.distance?.toFixed(1) || '0'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>time</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {post.hikeData?.duration || '00:00'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>gain</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {post.hikeData?.elevationGain || 0}m
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>diff</div>
                        <div style={{ color: '#fff', fontWeight: '600', textTransform: 'capitalize' }}>
                          {post.hikeData?.difficulty || 'easy'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                      <button
                        onClick={() => handleLikePost(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: likedPosts[post.id] ? '#ff4444' : '#888',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        ❤️ {post.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        💬 {post.comments?.length || 0}
                      </button>
                      <button
                        onClick={() => handleSharePost(post)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        ↗️ {post.shares || 0}
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#0a0a0a',
                        borderRadius: '8px'
                      }}>
                        {/* Existing Comments */}
                        {post.comments?.map(comment => (
                          <div key={comment.id} style={{
                            padding: '8px',
                            borderBottom: '1px solid #222'
                          }}>
                            <span style={{ color: '#fff', fontWeight: '600', marginRight: '8px' }}>
                              {comment.username}:
                            </span>
                            <span style={{ color: '#888' }}>{comment.text}</span>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              background: '#222',
                              border: '1px solid #333',
                              borderRadius: '5px',
                              color: '#fff'
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            style={{
                              padding: '8px 15px',
                              background: '#333',
                              border: 'none',
                              borderRadius: '5px',
                              color: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Your Friends ({friends.length})</h3>
            {friends.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>No friends yet. Search for friends above!</p>
            ) : (
              friends.map(friend => (
                <div key={friend.uid} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: '#0a0a0a',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  border: '1px solid #222'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px'
                  }}>
                    👤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{friend.username}</div>
                    <div style={{ color: '#888', fontSize: '13px' }}>
                      {friend.totalHikes || 0} hikes · {friend.totalDistance?.toFixed(1) || 0}km
                    </div>
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid #444',
                      color: '#888',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => setCurrentScreen('home')}>
          <span>🏠</span>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('history')}>
          <span>📋</span>
          <span>History</span>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('active')}>
          <span>➕</span>
          <span>New</span>
        </div>
        <div className="nav-item active" onClick={() => setCurrentScreen('community')}>
          <span>🌐</span>
          <span>Community</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;