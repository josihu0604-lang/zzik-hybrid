/**
 * Queue System Demo Page
 * Showcase real-time waiting system
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Clock, Bell, Zap, ArrowRight, Play } from 'lucide-react';

const demoRestaurants = [
  { id: 'rest_1', name: 'Seoul BBQ House', waiting: 12, avgWait: 25 },
  { id: 'rest_2', name: 'Tokyo Ramen Bar', waiting: 8, avgWait: 15 },
  { id: 'rest_3', name: 'Shanghai Dim Sum', waiting: 18, avgWait: 35 },
];

export default function QueueDemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Real-time Queue System
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Experience the future of restaurant waiting with live updates,
              smart notifications, and zero language barriers
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/queue/rest_1')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all"
            >
              <Play className="w-6 h-6" />
              Try Live Demo
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Live Updates"
              description="Real-time position tracking with WebSocket/SSE technology"
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Smart Notifications"
              description="Get notified when your turn approaches with push alerts"
              color="from-purple-500 to-pink-500"
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Instant Estimates"
              description="AI-powered wait time predictions based on real data"
              color="from-green-500 to-emerald-500"
              delay={0.2}
            />
          </motion.div>

          {/* Demo Restaurants */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Try with Demo Restaurants
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {demoRestaurants.map((restaurant, index) => (
                <motion.button
                  key={restaurant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/queue/${restaurant.id}`)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-left hover:bg-white/15 transition-all group"
                >
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-200 transition-colors">
                    {restaurant.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {restaurant.waiting} waiting
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        ~{restaurant.avgWait} min avg
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-pink-200 font-medium group-hover:gap-3 transition-all">
                    <span>View Queue</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Built for Modern Tourists
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureDetail
              title="Multi-language Support"
              description="Seamlessly switch between English, Korean, Japanese, and Chinese"
              features={['Localized notifications', 'Cultural time formats', 'Native fonts']}
            />

            <FeatureDetail
              title="Progressive Web App"
              description="Install on your device for native-like experience"
              features={['Offline support', 'Push notifications', 'Home screen icon']}
            />

            <FeatureDetail
              title="Smart Algorithms"
              description="Advanced wait time predictions using ML"
              features={['Rush hour detection', 'Party size optimization', 'Historical data']}
            />

            <FeatureDetail
              title="Privacy First"
              description="Your data stays secure and anonymous"
              features={['No tracking', 'End-to-end encryption', 'GDPR compliant']}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6"
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </motion.div>
  );
}

function FeatureDetail({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-700">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
