import localforage from 'localforage';

// Configure localforage for different data types
const hikeImagesStore = localforage.createInstance({
  name: 'HiKompanion',
  storeName: 'hike_images',
  description: 'Store hike photos'
});

const userProfilesStore = localforage.createInstance({
  name: 'HiKompanion',
  storeName: 'user_profiles',
  description: 'Store user profiles'
});

const socialDataStore = localforage.createInstance({
  name: 'HiKompanion',
  storeName: 'social_data',
  description: 'Store friends, feed, etc.'
});

class PhoneStorageService {
  
  // ===== IMAGE STORAGE =====
  
  async saveImage(imageData, hikeId) {
    try {
      // Generate unique ID for image
      const imageId = `img_${hikeId}_${Date.now()}`;
      
      // Store in IndexedDB
      await hikeImagesStore.setItem(imageId, {
        id: imageId,
        data: imageData, // Base64 or blob
        hikeId: hikeId,
        timestamp: Date.now()
      });
      
      return { success: true, imageId };
    } catch (error) {
      console.error('Error saving image:', error);
      return { success: false, error: error.message };
    }
  }

  async getImage(imageId) {
    try {
      const image = await hikeImagesStore.getItem(imageId);
      return { success: true, image };
    } catch (error) {
      console.error('Error getting image:', error);
      return { success: false, error: error.message };
    }
  }

  async getImagesByHike(hikeId) {
    try {
      const images = [];
      await hikeImagesStore.iterate((value, key) => {
        if (value.hikeId === hikeId) {
          images.push(value);
        }
      });
      return { success: true, images };
    } catch (error) {
      console.error('Error getting hike images:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteImage(imageId) {
    try {
      await hikeImagesStore.removeItem(imageId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== USER PROFILE STORAGE =====
  
  async saveUserProfile(userId, profileData) {
    try {
      const profile = {
        ...profileData,
        lastUpdated: Date.now()
      };
      await userProfilesStore.setItem(`user_${userId}`, profile);
      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await userProfilesStore.getItem(`user_${userId}`);
      return { success: true, profile };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SOCIAL DATA STORAGE =====
  
  async saveFriendRequest(request) {
    try {
      const requests = await this.getFriendRequests() || [];
      requests.push({
        ...request,
        id: `req_${Date.now()}`,
        timestamp: Date.now()
      });
      await socialDataStore.setItem('friend_requests', requests);
      return { success: true };
    } catch (error) {
      console.error('Error saving friend request:', error);
      return { success: false, error: error.message };
    }
  }

  async getFriendRequests() {
    try {
      const requests = await socialDataStore.getItem('friend_requests') || [];
      return { success: true, requests };
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return { success: false, error: error.message };
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      // Get all requests
      const { requests } = await this.getFriendRequests();
      
      // Find and remove the request
      const request = requests.find(r => r.id === requestId);
      const updatedRequests = requests.filter(r => r.id !== requestId);
      
      // Save updated requests
      await socialDataStore.setItem('friend_requests', updatedRequests);
      
      // Add to friends list
      if (request) {
        await this.addFriend(request.from, request.to);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }
  }

  async addFriend(userId1, userId2) {
    try {
      // Get current friends
      const friends = await socialDataStore.getItem('friends') || [];
      
      // Add friendship (bidirectional)
      friends.push({
        user1: userId1,
        user2: userId2,
        since: Date.now()
      });
      
      await socialDataStore.setItem('friends', friends);
      return { success: true };
    } catch (error) {
      console.error('Error adding friend:', error);
      return { success: false, error: error.message };
    }
  }

  async getFriends(userId) {
    try {
      const friends = await socialDataStore.getItem('friends') || [];
      const userFriends = friends.filter(f => 
        f.user1 === userId || f.user2 === userId
      ).map(f => f.user1 === userId ? f.user2 : f.user1);
      
      return { success: true, friends: userFriends };
    } catch (error) {
      console.error('Error getting friends:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== FEED STORAGE =====
  
  async addFeedPost(post) {
    try {
      const feed = await socialDataStore.getItem('feed') || [];
      feed.unshift({
        ...post,
        id: `post_${Date.now()}`,
        timestamp: Date.now(),
        likes: [],
        comments: []
      });
      await socialDataStore.setItem('feed', feed);
      return { success: true };
    } catch (error) {
      console.error('Error adding feed post:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeed(userId, friendIds = []) {
    try {
      const feed = await socialDataStore.getItem('feed') || [];
      
      // Filter posts from user and friends
      const relevantPosts = feed.filter(post => 
        post.userId === userId || friendIds.includes(post.userId)
      );
      
      return { success: true, feed: relevantPosts };
    } catch (error) {
      console.error('Error getting feed:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId, userId) {
    try {
      const feed = await socialDataStore.getItem('feed') || [];
      const postIndex = feed.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        if (!feed[postIndex].likes.includes(userId)) {
          feed[postIndex].likes.push(userId);
        } else {
          feed[postIndex].likes = feed[postIndex].likes.filter(id => id !== userId);
        }
        await socialDataStore.setItem('feed', feed);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async addComment(postId, comment) {
    try {
      const feed = await socialDataStore.getItem('feed') || [];
      const postIndex = feed.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        feed[postIndex].comments.push({
          ...comment,
          id: `comment_${Date.now()}`,
          timestamp: Date.now()
        });
        await socialDataStore.setItem('feed', feed);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== DATA EXPORT/IMPORT =====
  
  async exportAllData() {
    try {
      const data = {
        profiles: await userProfilesStore.iterate((value, key) => ({ [key]: value })),
        images: await hikeImagesStore.iterate((value, key) => ({ [key]: value })),
        social: await socialDataStore.iterate((value, key) => ({ [key]: value }))
      };
      return { success: true, data };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error.message };
    }
  }

  async importAllData(data) {
    try {
      // Clear existing data
      await userProfilesStore.clear();
      await hikeImagesStore.clear();
      await socialDataStore.clear();
      
      // Import new data
      for (const [key, value] of Object.entries(data.profiles || {})) {
        await userProfilesStore.setItem(key, value);
      }
      for (const [key, value] of Object.entries(data.images || {})) {
        await hikeImagesStore.setItem(key, value);
      }
      for (const [key, value] of Object.entries(data.social || {})) {
        await socialDataStore.setItem(key, value);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== CLEAR DATA =====
  
  async clearAllData() {
    try {
      await userProfilesStore.clear();
      await hikeImagesStore.clear();
      await socialDataStore.clear();
      return { success: true };
    } catch (error) {
      console.error('Error clearing data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PhoneStorageService();