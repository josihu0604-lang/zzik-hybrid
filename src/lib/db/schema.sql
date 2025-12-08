-- 01. Users Extension
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT; -- Privy Wallet Address (0x...)
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_level INTEGER DEFAULT 0; -- 0: Free, 1: Silver, 2: Gold
ALTER TABLE users ADD COLUMN IF NOT EXISTS z_cash_balance DECIMAL(18, 2) DEFAULT 0; -- Off-chain Point

-- 02. Vibe Cards (NFT Metadata)
CREATE TABLE IF NOT EXISTS vibe_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  popup_id UUID REFERENCES popups(id),
  token_id TEXT, -- On-chain Token ID (if minted)
  image_url TEXT NOT NULL, -- Generated Image URL
  metadata JSONB, -- { "weather": "Sunny", "distance": "12km", "mood": "Excited" }
  is_minted BOOLEAN DEFAULT FALSE, -- 블록체인 기록 여부
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 03. Transactions (Ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(18, 2), -- +5.00 or -10.00
  type TEXT, -- 'MINT_REWARD', 'EXCHANGE', 'PAYMENT'
  status TEXT, -- 'PENDING', 'COMPLETED', 'FAILED'
  tx_hash TEXT, -- Blockchain Transaction Hash (Optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
