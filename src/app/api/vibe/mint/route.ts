import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request
    const body = await req.json();
    const { checkinId, location } = body;

    // 3. Validate input
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // 4. Generate vibe card image URL (using placeholder for now)
    const imageUrl = 'https://images.unsplash.com/photo-1635322966219-b75ed3a90122?w=800&auto=format&fit=crop&q=60';

    // 5. Create vibe card in database
    const { data: vibeCard, error: cardError } = await supabase
      .from('vibe_cards')
      .insert({
        user_id: user.id,
        popup_id: checkinId || null,
        image_url: imageUrl,
        metadata: {
          location: location?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          rarity: 'RARE',
          vibes: ['Cyberpunk', 'Neon', 'Night'],
        },
        is_minted: false,
      })
      .select()
      .single();

    if (cardError) {
      console.error('[Vibe Mint] Failed to create card:', cardError);
      return NextResponse.json({ error: 'Failed to create vibe card' }, { status: 500 });
    }

    // 6. Update user's Z-CASH balance
    const rewardAmount = 5.0;
    const { error: balanceError } = await supabase.rpc('increment_z_cash_balance', {
      user_id: user.id,
      amount: rewardAmount,
    });

    // If RPC doesn't exist yet, update directly (less safe but works)
    if (balanceError) {
      console.warn('[Vibe Mint] RPC not available, using direct update:', balanceError);
      
      // Get current balance
      const { data: userData } = await supabase
        .from('users')
        .select('z_cash_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = userData?.z_cash_balance || 0;
      const newBalance = currentBalance + rewardAmount;

      // Update balance
      await supabase
        .from('users')
        .update({ z_cash_balance: newBalance })
        .eq('id', user.id);
    }

    // 7. Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: rewardAmount,
      type: 'MINT_REWARD',
      status: 'COMPLETED',
      tx_hash: null,
    });

    // 8. Get updated balance
    const { data: updatedUser } = await supabase
      .from('users')
      .select('z_cash_balance')
      .eq('id', user.id)
      .single();

    // 9. Return Result
    return NextResponse.json({
      success: true,
      card: {
        id: vibeCard.id,
        imageUrl: vibeCard.image_url,
        metadata: vibeCard.metadata,
        tokenId: vibeCard.token_id,
      },
      reward: {
        amount: rewardAmount,
        currency: 'Z-CASH',
        usdcValue: 0.05,
      },
      newBalance: updatedUser?.z_cash_balance || 0,
    });
  } catch (error) {
    console.error('[Vibe Mint] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
