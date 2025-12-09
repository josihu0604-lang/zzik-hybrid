/**
 * Queue Management Page
 * Real-time restaurant queue with live updates
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, UserMinus, RefreshCw } from 'lucide-react';
import { LiveQueueDisplay } from '@/components/queue/LiveQueueDisplay';
import { QueuePositionTracker } from '@/components/queue/QueuePositionTracker';
import { QueueNotifications, QueueNotificationBadge } from '@/components/queue/QueueNotifications';
import { useRealtimeQueue } from '@/lib/realtime-queue';
import { useQueueStore } from '@/stores/queue-store';

// Mock user data (replace with actual auth)
const MOCK_USER = {
  id: 'user_123',
  name: 'John Doe',
};

export default function QueuePage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [partySize, setPartySize] = useState(2);

  const { queue, userEntry, connectionStatus, error, refresh } = useRealtimeQueue(
    restaurantId,
    MOCK_USER.id
  );

  // Restaurant name (get from DB in production)
  const restaurantName = queue?.restaurantName || 'Restaurant';

  const handleJoinQueue = async () => {
    setIsJoining(true);
    try {
      const response = await fetch(`/api/queue/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER.id,
          userName: MOCK_USER.name,
          partySize,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join queue');
      }

      await refresh();
    } catch (err) {
      console.error('Failed to join queue:', err);
      alert(err instanceof Error ? err.message : 'Failed to join queue');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!confirm('Are you sure you want to leave the queue?')) return;

    setIsLeaving(true);
    try {
      const response = await fetch(
        `/api/queue/${restaurantId}?userId=${MOCK_USER.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to leave queue');
      }

      await refresh();
    } catch (err) {
      console.error('Failed to leave queue:', err);
      alert('Failed to leave queue');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900">{restaurantName}</h1>
              <p className="text-sm text-gray-600">Real-time Queue</p>
            </div>

            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <RefreshCw
                  className="w-5 h-5 text-gray-700"
                  onClick={refresh}
                />
              </button>
              <QueueNotificationBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <p className="text-red-700 text-sm">
              Connection error: {error.message}
            </p>
          </motion.div>
        )}

        {/* User in Queue */}
        {userEntry ? (
          <div className="space-y-6">
            {/* Position Tracker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <QueuePositionTracker
                entry={userEntry}
                totalInQueue={queue?.totalWaiting || 0}
                locale="en"
              />
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <QueueNotifications
                entry={userEntry}
                restaurantName={restaurantName}
                locale="en"
              />
            </motion.div>

            {/* Leave Queue Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLeaveQueue}
              disabled={isLeaving}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLeaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Leaving...</span>
                </>
              ) : (
                <>
                  <UserMinus className="w-5 h-5" />
                  <span>Leave Queue</span>
                </>
              )}
            </motion.button>
          </div>
        ) : (
          /* Join Queue */
          <div className="space-y-6">
            {/* Party Size Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Select Party Size
              </h2>
              
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPartySize(size)}
                    className={`aspect-square rounded-2xl font-bold text-lg transition-all ${
                      partySize === size
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-4 text-center">
                Selected: <span className="font-semibold">{partySize} people</span>
              </p>
            </motion.div>

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinQueue}
              disabled={isJoining}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Join Queue</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Live Queue Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <LiveQueueDisplay
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            userId={MOCK_USER.id}
            showFullQueue={true}
          />
        </motion.div>
      </main>
    </div>
  );
}
