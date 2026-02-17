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
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      // Get all users from phoneStorage
      const result = await phoneStorage.getAllUsers();
      
      if (!result.success) {
        return { success: false, error: result.error, users: [] };
      }

      // Filter users:
      // 1. Not the current user
      // 2. Username includes search term (case insensitive)
      // 3. Not already friends
      const friends = await this.getFriends();
      const friendUsernames = friends.success ? friends.friends.map(f => f.username) : [];

      const filteredUsers = result.users.filter(user => 
        user.uid !== currentUser.uid && // Not current user
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) && // Matches search
        !friendUsernames.includes(user.username) // Not already friends
      );

      // Check for pending friend requests
      const requests = await this.getFriendRequests();
      const pendingRequests = requests.success ? requests.requests.map(r => r.to) : [];

      // Mark users who have pending requests
      const usersWithStatus = filteredUsers.map(user => ({
        uid: user.uid,
        username: user.username,
        totalHikes: user.totalHikes || 0,
        totalDistance: user.totalDistance || 0,
        pending: pendingRequests.includes(user.username)
      }));

      return { success: true, users: usersWithStatus };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message, users: [] };
    }
  }

  async sendFriendRequest(targetUsername) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      // Check if request already exists
      const requests = await this.getFriendRequests();
      const existingRequest = requests.requests?.find(r => 
        r.to === targetUsername && r.from === currentUser.uid && r.status === 'pending'
      );

      if (existingRequest) {
        return { success: false, error: 'Friend request already sent' };
      }

      const request = {
        id: `req_${Date.now()}_${Math.random()}`,
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
      
      // Filter requests for this user (incoming only)
      const incomingRequests = result.requests.filter(r => r.to === currentUser.username);
      
      return { success: true, requests: incomingRequests };
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return { success: false, error: error.message, requests: [] };
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');

      const result = await phoneStorage.acceptFriendRequest(requestId);
      
      if (result.success) {
        // Update user's friend list in profile
        const updatedUser = await this.getCurrentUser();
        return { success: true, user: updatedUser };
      }
      
      return result;
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
      
      // Get friend profiles
      const friends = [];
      for (const friendId of result.friends) {
        const profile = await phoneStorage.getUserProfile(friendId);
        if (profile.success && profile.profile) {
          friends.push({
            uid: friendId,
            username: profile.profile.username,
            totalHikes: profile.profile.totalHikes || 0,
            totalDistance: profile.profile.totalDistance || 0
          });
        }
      }
      
      return { success: true, friends };
    } catch (error) {
      console.error('Error getting friends:', error);
      return { success: false, error: error.message, friends: [] };
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
        if (post.hikeData?.imageId) {
          const imgResult = await phoneStorage.getImage(post.hikeData.imageId);
          if (imgResult.success) {
            post.hikeData.imageUrl = imgResult.image.data;
          }
        }
      }
      
      return { success: true, posts: feedResult.feed };
    } catch (error) {
      console.error('Error getting feed:', error);
      return { success: false, error: error.message, posts: [] };
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