import { NextResponse } from 'next/server';

export async function GET() {
  // Mock Data: User's NFT Collection
  const collection = Array.from({ length: 6 }).map((_, i) => ({
    id: `card-${i}`,
    title: i === 0 ? 'Genesis Vibe' : `Vibe #${100 + i}`,
    imageUrl: i === 0 
      ? 'https://images.unsplash.com/photo-1635322966219-b75ed3a90122?w=800&auto=format&fit=crop&q=60' 
      : `https://source.unsplash.com/random/400x600?cyberpunk&sig=${i}`,
    metadata: {
      location: 'Seoul, KR',
      date: '2025.12.08',
      rarity: i === 0 ? 'LEGENDARY' : 'COMMON',
    },
    isMinted: true
  }));

  return NextResponse.json({
    success: true,
    data: collection
  });
}
