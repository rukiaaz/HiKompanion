import { v4 as uuidv4 } from 'uuid';
import phoneStorage from './phoneStorageService';

class SocialService {
  
  // ===== USER MANAGEMENT =====
  
  async createUser(userData) {
    try {
      const userId = `user_${uuidv4()}`;
      const profile = {
        uid: userId,
        username: userData.username,
        email: userData.email,
        displayName: userData.username,
        createdAt: new Date().toISOString(),
        friends: [],
        friendRequests: [],
        bio: 'HiKompanion user',
        profilePic: userData.profilePic || '',
        totalDistance: 0,
        totalHikes: 0,
        totalElevation: 0
      };
      
      await phoneStorage.saveUserProfile(userId, profile);
      
      // Save current user ID
      localStorage.setItem('currentUserId', userId);
      
      return { success: true, user: profile };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const userId = localStorage.getItem('currentUserId');
      if (!userId) return null;
      
      const result = await phoneStorage.getUserProfile(userId);
      return result.profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // ===== FRIEND SYSTEM =====
  
  async searchUsers(searchTerm) {
    try {
      // In local storage, we need to search through all profiles
      // This is a limitation - we can only search users we know about
      // For demo, we'll return mock data
      const mockUsers = [
        { uid: 'user_2', username: 'hiker_john', totalHikes: 12 },
        { uid: 'user_3', username: 'trail_master', totalHikes: 45 },
        { uid: 'user_4', username: 'mountain_lover', totalHikes: 23 },
        { uid: 'user_5', username: 'adventure_seeker', totalHikes: 8 }
      ].filter(u => u.username.includes(searchTerm.toLowerCase()));
      
      return { success: true, users: mockUsers };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message };
    }
  }

  async sendFriendRequest(targetUsername) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const request = {
        id: `req_${Date.now()}`,
        from: currentUser.uid,
        fromName: currentUser.username,
        to: targetUsername,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await phoneStorage.saveFriendRequest(request);
      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: error.message };
    }
  }

  async getFriendRequests() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const result = await phoneStorage.getFriendRequests();
      const requests = result.requests.filter(r => r.to === currentUser.username);
      
      return { success: true, requests };
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return { success: false, error: error.message };
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      await phoneStorage.acceptFriendRequest(requestId);
      return { success: true };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }
  }

  async getFriends() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const result = await phoneStorage.getFriends(currentUser.uid);
      
      // Get friend profiles (mock data for demo)
      const friends = result.friends.map(friendId => ({
        uid: friendId,
        username: friendId === 'user_2' ? 'hiker_john' : 'trail_master',
        totalHikes: 23,
        totalDistance: 45.6
      }));
      
      return { success: true, friends };
    } catch (error) {
      console.error('Error getting friends:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== FEED =====
  
  async shareHike(hikeData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      // Save image to phone storage
      let imageId = null;
      if (hikeData.imageUrl) {
        const imgResult = await phoneStorage.saveImage(hikeData.imageUrl, hikeData.id);
        if (imgResult.success) {
          imageId = imgResult.imageId;
        }
      }

      const post = {
        userId: currentUser.uid,
        username: currentUser.username,
        hikeData: {
          ...hikeData,
          imageId: imageId // Store reference instead of full image
        },
        likes: [],
        comments: []
      };
      
      await phoneStorage.addFeedPost(post);
      return { success: true };
    } catch (error) {
      console.error('Error sharing hike:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeed() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      // Get friends list
      const friendsResult = await phoneStorage.getFriends(currentUser.uid);
      const friendIds = friendsResult.friends;
      
      // Get feed
      const feedResult = await phoneStorage.getFeed(currentUser.uid, friendIds);
      
      // Load images for posts
      for (const post of feedResult.feed) {
        if (post.hikeData.imageId) {
          const imgResult = await phoneStorage.getImage(post.hikeData.imageId);
          if (imgResult.success) {
            post.hikeData.imageUrl = imgResult.image.data;
          }
        }
      }
      
      return { success: true, posts: feedResult.feed };
    } catch (error) {
      console.error('Error getting feed:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      await phoneStorage.likePost(postId, currentUser.uid);
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async addComment(postId, comment) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const commentData = {
        userId: currentUser.uid,
        username: currentUser.username,
        text: comment
      };
      
      await phoneStorage.addComment(postId, commentData);
      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== UPDATE STATS =====
  
  async updateUserStats(hikeData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const updatedProfile = {
        ...currentUser,
        totalDistance: (currentUser.totalDistance || 0) + hikeData.distance,
        totalHikes: (currentUser.totalHikes || 0) + 1,
        totalElevation: (currentUser.totalElevation || 0) + (hikeData.elevationGain || 0)
      };
      
      await phoneStorage.saveUserProfile(currentUser.uid, updatedProfile);
      return { success: true };
    } catch (error) {
      console.error('Error updating stats:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== LOGIN/SIGNUP MOCK (for demo) =====
  
  async signIn(email, password) {
    // For demo, create or get mock user
    let userId = localStorage.getItem('currentUserId');
    if (!userId) {
      userId = `user_${Date.now()}`;
      const mockUser = {
        uid: userId,
        username: email.split('@')[0],
        email: email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
        friends: [],
        friendRequests: [],
        bio: 'HiKompanion user',
        profilePic: '',
        totalDistance: 0,
        totalHikes: 0,
        totalElevation: 0
      };
      await phoneStorage.saveUserProfile(userId, mockUser);
      localStorage.setItem('currentUserId', userId);
    }
    
    const user = await this.getCurrentUser();
    return { success: true, user };
  }

  async signUp(email, password, username) {
    return this.createUser({ username, email });
  }

  async signInWithGoogle() {
    return this.createUser({ 
      username: `user_${Math.floor(Math.random() * 1000)}`,
      email: `demo${Date.now()}@gmail.com`
    });
  }

  async signOut() {
    localStorage.removeItem('currentUserId');
    return { success: true };
  }
}

export default new SocialService();