import React, { useState } from 'react';
import {
  Home,
  Plus,
  User,
  Compass,
  TrendingUp,
  Sparkles,
  Play
} from 'lucide-react';

const EnhancedNavigation = ({ currentView, onViewChange, userProfile }) => {
  const [activeHover, setActiveHover] = useState(null);

  const navItems = [
    {
      id: 'feed',
      icon: Home,
      label: 'Home',
      gradient: 'from-cyan-400 via-blue-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/50',
      hoverGradient: 'from-cyan-500 via-blue-600 to-blue-700'
    },
    {
      id: 'discover',
      icon: Compass,
      label: 'Discover',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      shadowColor: 'shadow-emerald-500/50',
      hoverGradient: 'from-emerald-500 via-teal-600 to-green-700'
    },
    {
      id: 'upload',
      icon: Plus,
      label: 'Create',
      special: true,
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      shadowColor: 'shadow-orange-500/50',
      hoverGradient: 'from-orange-500 via-red-600 to-pink-700'
    },
    {
      id: 'trending',
      icon: TrendingUp,
      label: 'Trending',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      shadowColor: 'shadow-yellow-500/50',
      hoverGradient: 'from-yellow-500 via-orange-600 to-red-600'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      shadowColor: 'shadow-blue-500/50',
      hoverGradient: 'from-blue-600 via-blue-700 to-cyan-700'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Main Navigation Container */}
      <div className="pointer-events-auto">
        {/* Premium Glassmorphism Background */}
        <div className="relative bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-3xl">
          {/* Animated Top Border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-emerald-500/50 animate-shimmer"></div>
          
          <div className="flex items-center justify-around py-3 px-2 max-w-md mx-auto relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              if (item.special) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    onMouseEnter={() => setActiveHover(item.id)}
                    onMouseLeave={() => setActiveHover(null)}
                    className="relative group -mt-8"
                  >
                    {/* Multi-layer Glow Effect */}
                    <div className={`absolute -inset-6 bg-gradient-to-r ${item.gradient} rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-all duration-500 animate-pulse`}></div>
                    <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} rounded-full blur-xl opacity-50 group-hover:opacity-90 transition-all duration-500`}></div>

                    {/* Main Button with Enhanced Design */}
                    <div className="relative">
                      {/* Rotating Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 animate-spin-slow"></div>

                      {/* Inner Button */}
                      <div className={`relative bg-gradient-to-r ${activeHover === item.id ? item.hoverGradient : item.gradient} p-5 rounded-full ${item.shadowColor} shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-active:scale-95`}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />

                        {/* Sparkle Effect */}
                        <div className="absolute -top-1 -right-1 animate-bounce">
                          <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
                        </div>

                        {/* Pulse Ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute -inset-2 rounded-full border border-white/20 animate-ping"></div>
                      </div>
                    </div>

                    {/* Enhanced Label */}
                    <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                        <span className="text-white text-xs font-bold whitespace-nowrap">{item.label}</span>
                      </div>
                    </div>
                  </button>
                );
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  onMouseEnter={() => setActiveHover(item.id)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative group flex flex-col items-center transition-all duration-300"
                >
                  {/* Enhanced Active Background Glow */}
                  {isActive && (
                    <>
                      <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} rounded-2xl blur-2xl opacity-50 animate-pulse`}></div>
                      <div className={`absolute -inset-3 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-60`}></div>
                    </>
                  )}

                  {/* Hover Glow */}
                  {activeHover === item.id && !isActive && (
                    <div className={`absolute -inset-3 bg-gradient-to-r ${item.gradient} rounded-2xl blur-lg opacity-30 transition-opacity duration-300`}></div>
                  )}

                  {/* Icon Container with Premium Effects */}
                  <div className={`relative z-10 p-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${item.gradient} ${item.shadowColor} shadow-2xl transform scale-110 border border-white/20`
                      : activeHover === item.id
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg border border-white/30`
                      : 'bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/15'
                  }`}>
                    <Icon className={`w-6 h-6 transition-all duration-300 ${
                      isActive || activeHover === item.id ? 'text-white drop-shadow-lg' : 'text-gray-400 group-hover:text-gray-200'
                    }`} strokeWidth={isActive ? 2.5 : 2} />

                    {/* Active Indicator Line */}
                    {isActive && (
                      <>
                        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg"></div>
                        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                      </>
                    )}
                  </div>

                  {/* Enhanced Label */}
                  <span className={`text-xs font-bold mt-2 transition-all duration-300 drop-shadow-lg ${
                    isActive
                      ? 'text-white scale-105'
                      : activeHover === item.id
                      ? 'text-white scale-100'
                      : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {item.label}
                  </span>

                  {/* Premium Notification Badge */}
                  {item.id === 'profile' && userProfile?.notifications && (
                    <div className="absolute -top-1 -right-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur animate-pulse"></div>
                        <div className="relative w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 border-2 border-black">
                          <span className="text-white text-xs font-black">!</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Bottom Safe Area for Mobile Devices with Gradient */}
          <div className="h-safe-area-inset-bottom bg-gradient-to-b from-black/60 to-black/90"></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNavigation;
