import { NextResponse } from 'next/server';

export async function GET() {
  // Mock Balance Data
  return NextResponse.json({
    walletAddress: '0x71C...9A21',
    zCash: {
      balance: 1250.00,
      usdcValue: 12.50,
    },
    history: [
      { id: 1, type: 'MINT', amount: 5.00, date: '2025-12-08T10:00:00Z' },
      { id: 2, type: 'MINT', amount: 5.00, date: '2025-12-07T14:30:00Z' },
    ],
  });
}
