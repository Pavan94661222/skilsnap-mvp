import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './firebase/config';
import { onAuthChange } from './firebase/auth';
import { 
  createUserProfile, 
  getUserProfile, 
  listenToVideosFeed, 
  listenToUserProfile,
  likeVideo,
  tipVideo,
  createVideo
} from './firebase/firestore';
import { fetchMixedSkillVideos, fetchVideosBySkill } from './services/videoService';
import AuthScreen from './components/AuthScreen';
import EnhancedVideoFeed from './components/EnhancedVideoFeed';
import EnhancedNavigation from './components/EnhancedNavigation';
import DiscoverPage from './components/DiscoverPage';
import CreatorProfile from './components/CreatorProfile';
import UploadModal from './components/UploadModal';
import HireMeModal from './components/HireMeModal';

function App() {
  const [firebaseServices, setFirebaseServices] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [currentView, setCurrentView] = useState('feed');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Initialize Firebase on component mount
  useEffect(() => {
    const initFirebase = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Firebase initialization timeout - using fallback');
        setError('Firebase initialization timeout. Using demo mode.');
        setLoading(false);
        
        // Set demo user and data
        setUser({ uid: 'demo-user', displayName: 'Demo User' });
        setUserProfile({
          name: 'Demo User',
          skillTag: 'demo',
          location: 'Demo Location',
          vCoins: 100,
          isGuru: false
        });
        setVideos([
          {
            id: '1',
            title: 'Basic Plumbing Repair',
            skillTag: 'plumbing',
            userId: 'guru1',
            creatorName: 'John Plumber',
            videoUrl: '#4f46e5',
            likes: 42,
            tips: 15
          },
          {
            id: '2',
            title: 'Welding Basics',
            skillTag: 'welding',
            userId: 'guru2',
            creatorName: 'Sarah Welder',
            videoUrl: '#7c3aed',
            likes: 38,
            tips: 22
          }
        ]);
      }, 5000); // 5 second timeout

      try {
        console.log('🔥 Starting Firebase initialization...');
        
        // Initialize Firebase services
        const services = initializeFirebase();
        console.log('✅ Firebase services initialized:', services);
        setFirebaseServices(services);
        
        // Clear timeout if successful
        clearTimeout(timeoutId);
        
        // Listen to authentication state changes
        const unsubscribe = onAuthChange(services.auth, async (user) => {
          console.log('🔐 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
          setUser(user);
          
          if (user) {
            try {
              console.log('👤 Getting user profile...');
              let profile = await getUserProfile(services.db, services.appId, user.uid);
              
              if (!profile) {
                console.log('📝 Creating new user profile...');
                profile = await createUserProfile(services.db, services.appId, user.uid, {
                  name: user.displayName || 'User',
                  isGuru: false
                });
              }
              
              console.log('✅ User profile loaded:', profile);
              setUserProfile(profile);
              
              // Listen to profile changes
              console.log('👂 Setting up profile listener...');
              const profileUnsubscribe = listenToUserProfile(
                services.db, 
                services.appId, 
                user.uid, 
                (updatedProfile) => {
                  console.log('📊 Profile updated:', updatedProfile);
                  setUserProfile(updatedProfile);
                }
              );
              
              // Listen to videos feed
              console.log('🎥 Setting up videos listener...');
              const videosUnsubscribe = listenToVideosFeed(
                services.db, 
                services.appId, 
                (videosList) => {
                  console.log('📺 Videos updated:', videosList.length, 'videos');
                  setVideos(videosList);
                }
              );
              
              // Cleanup function
              return () => {
                console.log('🧹 Cleaning up listeners...');
                profileUnsubscribe();
                videosUnsubscribe();
              };
              
            } catch (profileError) {
              console.error('❌ Profile error:', profileError);
              setError(`Profile error: ${profileError.message}`);
              setLoading(false);
            }
          } else {
            console.log('🚫 No user authenticated');
            setUserProfile(null);
            setVideos([]);
            setLoading(false);
          }
        });
        
        return unsubscribe;
        
      } catch (err) {
        console.error('❌ Firebase initialization error:', err);
        clearTimeout(timeoutId);
        setError(`Firebase error: ${err.message}`);
        setLoading(false);
      }
    };

    initFirebase().catch((error) => {
      console.error('❌ Init Firebase failed:', error);
      setError(`Initialization failed: ${error.message}`);
      setLoading(false);
    });
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = async (authData) => {
    if (!firebaseServices || !user) return;
    
    try {
      // Update user profile with auth data
      await createUserProfile(firebaseServices.db, firebaseServices.appId, user.uid, {
        name: user.displayName || 'User',
        isGuru: authData.isGuru,
        skillTag: '',
        location: ''
      });
    } catch (error) {
      console.error('Profile creation error:', error);
      setError('Failed to create user profile');
    }
  };

  // Handle video interactions
  const handleLike = async (videoId) => {
    if (!firebaseServices) return;
    
    try {
      await likeVideo(firebaseServices.db, firebaseServices.appId, videoId);
      console.log('Video liked successfully');
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleTip = async (videoId, creatorId) => {
    if (!firebaseServices || !user) return;
    
    try {
      await tipVideo(firebaseServices.db, firebaseServices.appId, videoId, creatorId);
      console.log('Tip sent successfully');
      
      // Show success animation or notification
      showTipSuccess();
    } catch (error) {
      console.error('Tip error:', error);
    }
  };

  const handleHire = (creatorId, creatorName) => {
    const creatorData = {
      userId: creatorId,
      creatorName: creatorName,
      skillTag: videos.find(v => v.userId === creatorId)?.skillTag || 'Expert'
    };
    setSelectedCreator(creatorData);
    setShowHireModal(true);
  };

  const handleUpload = async (uploadData) => {
    if (!firebaseServices || !user) return;
    
    try {
      await createVideo(firebaseServices.db, firebaseServices.appId, {
        ...uploadData,
        userId: user.uid,
        videoUrl: generateRandomColor() // Simulate video with color
      });
      console.log('Video uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleViewChange = (view) => {
    if (view === 'upload') {
      setShowUploadModal(true);
    } else {
      setCurrentView(view);
    }
  };

  // Helper functions
  const generateRandomColor = () => {
    const colors = ['#4f46e5', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const showTipSuccess = () => {
    // Create floating V-Coin animation
    const coin = document.createElement('div');
    coin.innerHTML = '🪙';
    coin.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      font-size: 2rem;
      z-index: 9999;
      animation: tipFloat 2s ease-out forwards;
      pointer-events: none;
    `;
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#tip-animation-style')) {
      const style = document.createElement('style');
      style.id = 'tip-animation-style';
      style.textContent = `
        @keyframes tipFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-50px) scale(1.5); opacity: 1; }
          100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 2000);
  };

  // Load real YouTube videos
  const loadYouTubeVideos = async () => {
    try {
      console.log('🎥 Loading YouTube videos...');
      const youtubeVideos = await fetchMixedSkillVideos();
      console.log('✅ YouTube videos loaded:', youtubeVideos.length);
      setVideos(youtubeVideos);
    } catch (error) {
      console.error('❌ Error loading YouTube videos:', error);
      // Fallback to demo videos
      setVideos([
        {
          id: 'demo1',
          title: 'Professional Plumbing Repair Techniques',
          skillTag: 'plumbing',
          userId: 'guru1',
          creatorName: 'Master Plumber Pro',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          likes: 1250,
          tips: 89,
          views: 45000,
          duration: '8:45',
          channelIcon: 'https://via.placeholder.com/40x40/4f46e5/ffffff?text=MP',
          description: 'Learn professional plumbing repair techniques step by step!'
        },
        {
          id: 'demo2',
          title: 'Advanced Welding Techniques for Beginners',
          skillTag: 'welding',
          userId: 'guru2',
          creatorName: 'Weld Master Sarah',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          likes: 890,
          tips: 156,
          views: 32000,
          duration: '12:30',
          channelIcon: 'https://via.placeholder.com/40x40/7c3aed/ffffff?text=WM',
          description: 'Master advanced welding techniques with this comprehensive tutorial!'
        },
        {
          id: 'demo3',
          title: 'Carpentry Masterclass: Building Furniture',
          skillTag: 'carpentry',
          userId: 'guru3',
          creatorName: 'Carpenter Mike',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          likes: 2100,
          tips: 234,
          views: 78000,
          duration: '15:20',
          channelIcon: 'https://via.placeholder.com/40x40/f59e0b/ffffff?text=CM',
          description: 'Build beautiful furniture with professional carpentry techniques!'
        }
      ]);
    }
  };

  // Manual bypass function
  const handleBypassLoading = async () => {
    console.log('🚀 Manual bypass activated');
    setLoading(false);
    setUser({ uid: 'demo-user', displayName: 'Demo User' });
    setUserProfile({
      name: 'Demo User',
      skillTag: 'demo',
      location: 'Demo Location',
      vCoins: 100,
      isGuru: false
    });
    
    // Load real YouTube videos
    await loadYouTubeVideos();
  };

  // Premium Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="text-center max-w-lg mx-auto p-8 relative z-10">
          <div className="relative mb-10">
            {/* Premium Animated Logo */}
            <div className="relative w-28 h-28 mx-auto">
              {/* Rotating Rings */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

              {/* Center Icon */}
              <div className="absolute inset-2 bg-gradient-to-br from-slate-950 to-slate-900 rounded-full flex items-center justify-center shadow-2xl">
                <div className="text-5xl animate-float">🎓</div>
              </div>
            </div>

            {/* Multi-layer Glow */}
            <div className="absolute -inset-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -inset-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent animate-gradient">SkilSnap</span>
          </h1>
          <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">Loading Your Skills Network</h2>
          <p className="text-gray-300 mb-8 text-lg">Connecting to amazing tutorials...</p>

          {/* Premium Loading Progress Bar */}
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-8 backdrop-blur-sm border border-white/10">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 rounded-full animate-shimmer shadow-lg shadow-blue-500/50"></div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-2xl mb-6 shadow-2xl">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
          
          {/* Premium bypass button */}
          <button
            onClick={handleBypassLoading}
            className="group relative w-full"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-600 hover:from-cyan-400 hover:via-blue-500 hover:to-emerald-500 text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-white/20">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-3xl animate-bounce">🚀</span>
                <div className="text-left">
                  <div className="text-lg font-black">Launch Demo Mode</div>
                  <div className="text-xs text-cyan-100 font-medium">Experience the full app instantly</div>
                </div>
              </div>
            </div>
          </button>

          <p className="text-gray-400 text-sm mt-5 font-medium">
            Skip the wait and explore with demo content
          </p>
        </div>
      </div>
    );
  }

  // Show authentication screen if user not authenticated
  if (!user || !userProfile) {
    return (
      <AuthScreen 
        auth={firebaseServices?.auth}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // Main app interface with premium styling
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative">
      {/* Main Content */}
      {currentView === 'feed' && (
        <EnhancedVideoFeed 
          videos={videos}
          currentUser={user}
          userProfile={userProfile}
          onLike={handleLike}
          onTip={handleTip}
          onHire={handleHire}
        />
      )}
      
      {currentView === 'discover' && (
        <DiscoverPage 
          onVideoSelect={(video) => {
            // Add selected video to feed and switch to it
            setVideos(prev => [video, ...prev]);
            setCurrentView('feed');
          }}
          onSkillSelect={async (skill) => {
            try {
              const skillVideos = await fetchVideosBySkill(skill, 10);
              setVideos(skillVideos);
              setCurrentView('feed');
            } catch (error) {
              console.error('Error loading skill videos:', error);
            }
          }}
        />
      )}
      
      {currentView === 'trending' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center pb-20 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="text-center max-w-md mx-auto p-6 relative z-10">
            <div className="relative mb-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <span className="text-4xl animate-bounce">🔥</span>
                </div>
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-2xl opacity-30 animate-ping"></div>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 drop-shadow-lg">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Trending Skills</span>
            </h2>
            <p className="text-gray-300 mb-8 text-lg">Discover the hottest tutorials right now</p>
            <button
              onClick={() => setCurrentView('discover')}
              className="group relative w-full max-w-xs mx-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-white/20">
                Explore Trending
              </div>
            </button>
          </div>
        </div>
      )}
      
      {currentView === 'profile' && (
        <CreatorProfile 
          userProfile={userProfile}
          currentUser={user}
          onUpload={() => setShowUploadModal(true)}
        />
      )}

      {/* Navigation */}
      <EnhancedNavigation 
        currentView={currentView}
        onViewChange={handleViewChange}
        userProfile={userProfile}
      />

      {/* Modals */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        userProfile={userProfile}
      />

      <HireMeModal 
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        creatorData={selectedCreator}
        userProfile={userProfile}
      />
    </div>
  );
}

export default App;
