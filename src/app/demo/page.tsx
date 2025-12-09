/**
 * ZZIK Demo Page - Component Showcase
 * 
 * Demonstrates all Wave 2 components and features
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  Trophy,
  Users,
  CreditCard,
  Bell,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// Demo sections
const DEMO_SECTIONS = [
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'review', name: 'Reviews', icon: Star },
  { id: 'social', name: 'Social', icon: Users },
  { id: 'gamification', name: 'Gamification', icon: Trophy },
  { id: 'queue', name: 'Queue', icon: Bell },
];

// ===========================================
// Demo Page Component
// ===========================================

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState('payment');
  
  return (
    <div className="min-h-screen bg-[#08090a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#08090a]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B5B] to-[#CC4A3A] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">ZZIK Demo</h1>
                <p className="text-xs text-white/50">Wave 2 Component Showcase</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="sticky top-16 z-40 bg-[#121314]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {DEMO_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#FF6B5B] text-white' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'payment' && <PaymentDemo />}
            {activeSection === 'review' && <ReviewDemo />}
            {activeSection === 'social' && <SocialDemo />}
            {activeSection === 'gamification' && <GamificationDemo />}
            {activeSection === 'queue' && <QueueDemo />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ===========================================
// Payment Demo Section
// ===========================================

function PaymentDemo() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Payment Integration"
        description="Z-Point wallet, payment methods, and transaction history"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Card Demo */}
        <DemoCard title="Z-Point Wallet">
          <div className="bg-gradient-to-br from-[#FF6B5B]/20 to-[#CC4A3A]/20 rounded-2xl p-6 border border-[#FF6B5B]/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm">Available Balance</span>
              <span className="text-xs bg-[#FFD93D]/20 text-[#FFD93D] px-2 py-1 rounded-full">Gold</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ₩ 125,000
            </div>
            <div className="text-sm text-white/50">≈ $92.59 USD</div>
            <div className="flex gap-2 mt-6">
              <button className="flex-1 py-3 rounded-xl bg-[#FF6B5B] text-white font-medium hover:bg-[#CC4A3A] transition-colors">
                Charge
              </button>
              <button className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                History
              </button>
            </div>
          </div>
        </DemoCard>
        
        {/* Payment Methods Demo */}
        <DemoCard title="Payment Methods">
          <div className="space-y-3">
            {[
              { type: 'Z-Point', balance: '₩125,000', isDefault: true },
              { type: 'Visa', last4: '4242', isDefault: false },
              { type: 'USDC', balance: '92.59', isDefault: false },
            ].map((method, i) => (
              <div
                key={i}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer
                  ${method.isDefault 
                    ? 'bg-[#FF6B5B]/10 border-[#FF6B5B]/50' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{method.type}</div>
                      <div className="text-white/50 text-sm">
                        {method.last4 ? `•••• ${method.last4}` : method.balance}
                      </div>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="text-xs bg-[#FF6B5B]/20 text-[#FF6B5B] px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DemoCard>
        
        {/* Transaction History Demo */}
        <DemoCard title="Recent Transactions" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              { type: 'payment', merchant: 'K-POP Experience', amount: -50000, time: '2 hours ago' },
              { type: 'charge', merchant: 'Z-Point Charge', amount: 100000, time: 'Yesterday' },
              { type: 'refund', merchant: 'Concert Ticket Refund', amount: 75000, time: '2 days ago' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${tx.amount > 0 ? 'bg-green-500/20' : 'bg-white/10'}
                  `}>
                    <CreditCard className={`w-5 h-5 ${tx.amount > 0 ? 'text-green-500' : 'text-white/70'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">{tx.merchant}</div>
                    <div className="text-white/50 text-sm">{tx.time}</div>
                  </div>
                </div>
                <div className={`font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-white'}`}>
                  {tx.amount > 0 ? '+' : ''}₩{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  );
}

// ===========================================
// Review Demo Section
// ===========================================

function ReviewDemo() {
  const [rating, setRating] = useState(0);
  
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Review System"
        description="Star ratings, review cards, and review forms"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Input Demo */}
        <DemoCard title="Rating Input">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'text-[#FFD93D] fill-[#FFD93D]'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-white/70">
              {rating === 0 ? 'Tap to rate' : `${rating} Star${rating > 1 ? 's' : ''}`}
            </span>
          </div>
        </DemoCard>
        
        {/* Review Card Demo */}
        <DemoCard title="Review Card">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B5B] to-[#CC4A3A]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Sarah K.</span>
                  <span className="text-xs bg-[#FFD93D]/20 text-[#FFD93D] px-2 py-0.5 rounded-full">
                    Gold
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= 5 ? 'text-[#FFD93D] fill-[#FFD93D]' : 'text-white/20'
                      }`}
                    />
                  ))}
                  <span className="text-white/50 text-xs ml-1">• 2 days ago</span>
                </div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Amazing VIP experience! Got to meet my favorite K-POP group and took photos with them. 
              The staff was super friendly and organized everything perfectly. Worth every penny! 🎤✨
            </p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              <button className="flex items-center gap-1 text-white/50 hover:text-[#FF6B5B] transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">24</span>
              </button>
              <span className="text-white/30 text-sm">• 3 replies</span>
            </div>
          </div>
        </DemoCard>
        
        {/* Review Form Demo */}
        <DemoCard title="Write Review" className="lg:col-span-2">
          <div className="space-y-4">
            <textarea
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#FF6B5B]/50"
              placeholder="Share your experience..."
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['#kpop', '#concert', '#vip'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="px-6 py-2 rounded-xl bg-[#FF6B5B] text-white font-medium hover:bg-[#CC4A3A] transition-colors">
                Submit Review
              </button>
            </div>
          </div>
        </DemoCard>
      </div>
    </div>
  );
}

// ===========================================
// Social Demo Section
// ===========================================

function SocialDemo() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Social Features"
        description="User profiles, followers, and activity feed"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Demo */}
        <DemoCard title="User Profile">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FF6B5B] to-[#CC4A3A] mb-4" />
            <h3 className="text-white font-bold text-lg">Kim Soo-yeon</h3>
            <p className="text-white/50 text-sm mb-4">@sooyeon_kpop</p>
            <div className="flex justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-white font-bold">152</div>
                <div className="text-white/50 text-xs">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">89</div>
                <div className="text-white/50 text-xs">Following</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">24</div>
                <div className="text-white/50 text-xs">Reviews</div>
              </div>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#FF6B5B] text-white font-medium hover:bg-[#CC4A3A] transition-colors">
              Follow
            </button>
          </div>
        </DemoCard>
        
        {/* Activity Feed Demo */}
        <DemoCard title="Activity Feed" className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { user: 'Min-ji L.', action: 'attended', target: 'BTS Soundcheck', time: '2h ago', type: 'booking' },
              { user: 'Tae-hyung K.', action: 'reviewed', target: 'BLACKPINK Meet & Greet', time: '5h ago', type: 'review' },
              { user: 'Ji-won P.', action: 'earned', target: 'K-POP Expert Badge', time: '1d ago', type: 'badge' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50" />
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-white/70"> {activity.action} </span>
                    <span className="text-[#FF6B5B]">{activity.target}</span>
                  </p>
                  <span className="text-white/50 text-sm">{activity.time}</span>
                </div>
                <button className="text-white/30 hover:text-white/70 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  );
}

// ===========================================
// Gamification Demo Section
// ===========================================

function GamificationDemo() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Gamification"
        description="Points, badges, achievements, and leaderboard"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Display Demo */}
        <DemoCard title="Points & Tier">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD93D]/20 text-[#FFD93D] mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">Gold Tier</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2">12,450</div>
            <div className="text-white/50 mb-4">Points</div>
            <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-[#FFD93D] h-full rounded-full" style={{ width: '62%' }} />
            </div>
            <div className="text-white/50 text-sm">7,550 points to Platinum</div>
          </div>
        </DemoCard>
        
        {/* Badges Demo */}
        <DemoCard title="Earned Badges">
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'First Review', emoji: '✍️', tier: 'bronze' },
              { name: 'K-POP Lover', emoji: '🎤', tier: 'silver' },
              { name: 'VIP Explorer', emoji: '🌟', tier: 'gold' },
              { name: 'Social Star', emoji: '👥', tier: 'bronze' },
              { name: 'Concert Pro', emoji: '🎵', tier: 'silver' },
              { name: 'Review Master', emoji: '📝', tier: 'gold' },
              { name: 'Early Bird', emoji: '🐦', tier: 'bronze' },
              { name: 'Trendsetter', emoji: '🔥', tier: 'platinum' },
            ].map((badge, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className={`
                  w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2
                  transition-transform group-hover:scale-110
                  ${badge.tier === 'platinum' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50' :
                    badge.tier === 'gold' ? 'bg-[#FFD93D]/20 border border-[#FFD93D]/50' :
                    badge.tier === 'silver' ? 'bg-gray-400/20 border border-gray-400/50' :
                    'bg-orange-700/20 border border-orange-700/50'
                  }
                `}>
                  {badge.emoji}
                </div>
                <span className="text-white/70 text-xs">{badge.name}</span>
              </div>
            ))}
          </div>
        </DemoCard>
        
        {/* Leaderboard Demo */}
        <DemoCard title="Weekly Leaderboard" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Soo-min K.', points: 45200, country: '🇰🇷' },
              { rank: 2, name: 'Yuki T.', points: 38500, country: '🇯🇵' },
              { rank: 3, name: 'Lisa W.', points: 32100, country: '🇹🇭' },
              { rank: 4, name: 'James L.', points: 28900, country: '🇺🇸' },
              { rank: 5, name: 'You', points: 12450, country: '🇰🇷', isUser: true },
            ].map((entry, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-4 p-4 rounded-xl
                  ${entry.isUser 
                    ? 'bg-[#FF6B5B]/20 border border-[#FF6B5B]/50' 
                    : 'bg-white/5'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center font-bold
                  ${entry.rank === 1 ? 'bg-[#FFD93D]/20 text-[#FFD93D]' :
                    entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                    entry.rank === 3 ? 'bg-orange-700/20 text-orange-700' :
                    'bg-white/10 text-white/50'
                  }
                `}>
                  #{entry.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {entry.name} {entry.country}
                    </span>
                    {entry.isUser && (
                      <span className="text-xs bg-[#FF6B5B]/30 text-[#FF6B5B] px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-white font-bold">{entry.points.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  );
}

// ===========================================
// Queue Demo Section
// ===========================================

function QueueDemo() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Queue Management"
        description="Real-time queue tracking and notifications"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Ticket Demo */}
        <DemoCard title="Your Queue Ticket">
          <div className="bg-gradient-to-br from-[#FF6B5B]/20 to-[#CC4A3A]/20 rounded-2xl p-6 border border-[#FF6B5B]/30 text-center">
            <div className="text-6xl font-bold text-white mb-2">
              #12
            </div>
            <div className="text-white/70 mb-6">Your Position</div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">~15</div>
                <div className="text-white/50 text-sm">min wait</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-white/50 text-sm">ahead</div>
              </div>
            </div>
            <div className="text-[#FF6B5B] text-sm animate-pulse">
              🔔 Almost your turn!
            </div>
          </div>
        </DemoCard>
        
        {/* Queue List Demo */}
        <DemoCard title="Live Queue">
          <div className="space-y-2">
            {[
              { position: 9, name: 'K*** J.', party: 2, status: 'seated' },
              { position: 10, name: 'P*** M.', party: 4, status: 'called' },
              { position: 11, name: 'L*** S.', party: 3, status: 'waiting' },
              { position: 12, name: 'You', party: 2, status: 'waiting', isUser: true },
              { position: 13, name: 'C*** K.', party: 5, status: 'waiting' },
            ].map((entry, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  ${entry.isUser 
                    ? 'bg-[#FF6B5B]/20 border border-[#FF6B5B]/50' 
                    : entry.status === 'called'
                    ? 'bg-green-500/20 border border-green-500/50'
                    : entry.status === 'seated'
                    ? 'bg-white/5 opacity-50'
                    : 'bg-white/5'
                  }
                `}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 text-sm font-medium">
                  #{entry.position}
                </div>
                <div className="flex-1">
                  <span className="text-white">{entry.name}</span>
                  <span className="text-white/50 text-sm ml-2">{entry.party} guests</span>
                </div>
                <span className={`
                  text-xs px-2 py-1 rounded-full
                  ${entry.status === 'seated' ? 'bg-white/10 text-white/50' :
                    entry.status === 'called' ? 'bg-green-500/20 text-green-500' :
                    'bg-white/10 text-white/70'
                  }
                `}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </DemoCard>
      </div>
    </div>
  );
}

// ===========================================
// Helper Components
// ===========================================

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/50">{description}</p>
    </div>
  );
}

function DemoCard({ 
  title, 
  children, 
  className = '' 
}: { 
  title: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#121314] rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-medium">{title}</h3>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
