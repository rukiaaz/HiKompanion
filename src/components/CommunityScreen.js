import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const CommunityScreen = ({ setCurrentScreen, user }) => {
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    // Mock data for demo
    const mockFeed = [
      {
        id: 1,
        username: 'hiker_john',
        userPhoto: '',
        hikeData: {
          title: 'Morning Trail Run',
          description: 'Beautiful sunrise hike!',
          distance: 8.5,
          duration: '01:45:00',
          elevationGain: 320,
          difficulty: 'medium',
          imageUrl: null
        },
        likes: ['user1', 'user2'],
        comments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        username: 'trail_master',
        userPhoto: '',
        hikeData: {
          title: 'Mountain Summit',
          description: 'Reached the top!',
          distance: 12.2,
          duration: '03:30:00',
          elevationGain: 850,
          difficulty: 'hard',
          imageUrl: null
        },
        likes: ['user3'],
        comments: [],
        createdAt: new Date().toISOString()
      }
    ];
    
    const mockFriends = [
      { uid: 'user2', username: 'hiker_john', totalHikes: 12, totalDistance: 45.6 },
      { uid: 'user3', username: 'trail_master', totalHikes: 23, totalDistance: 89.2 }
    ];
    
    setFeed(mockFeed);
    setFriends(mockFriends);
    setLoading(false);
  };

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
            Friends
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
                <div key={post.id} className="hike-item" style={{ padding: 0 }}>
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
                        {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '5px' }}>
                      {post.hikeData.title}
                    </h3>
                    <p style={{ color: '#888', marginBottom: '10px' }}>
                      {post.hikeData.description}
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
                          {post.hikeData.distance.toFixed(1)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>time</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {post.hikeData.duration}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>gain</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {post.hikeData.elevationGain}m
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>diff</div>
                        <div style={{ color: '#fff', fontWeight: '600', textTransform: 'capitalize' }}>
                          {post.hikeData.difficulty}
                        </div>
                      </div>
                    </div>

                    {/* Like Button */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <button
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
                        ❤️ {post.likes?.length || 0}
                      </button>
                    </div>
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
              <p style={{ color: '#888', textAlign: 'center' }}>No friends yet. Find some in the search tab!</p>
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