import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Parse Request
    const body = await req.json();
    const { checkinId, location } = body;

    // 2. Validate (Mock)
    if (!checkinId && !location) {
      // Allow location-only for Phase 1 demo
    }

    // 3. Simulate Processing (DB + Blockchain)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Mock Vibe Card Generation
    const vibeCard = {
      id: crypto.randomUUID(),
      imageUrl: 'https://images.unsplash.com/photo-1635322966219-b75ed3a90122?w=800&auto=format&fit=crop&q=60', // Cyberpunk Placeholder
      metadata: {
        location: location?.name || 'Seoul, Korea',
        timestamp: new Date().toISOString(),
        rarity: 'RARE',
        vibes: ['Cyberpunk', 'Neon', 'Night'],
      },
      tokenId: `0x${crypto.randomUUID().replace(/-/g, '')}`,
    };

    // 5. Return Result
    return NextResponse.json({
      success: true,
      card: vibeCard,
      reward: {
        amount: 5.00,
        currency: 'Z-CASH',
        usdcValue: 0.05,
      },
      newBalance: 125.00,
    });

  } catch (error) {
    console.error('Minting Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
