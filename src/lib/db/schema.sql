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

-- 04. Row Level Security (RLS)
ALTER TABLE vibe_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own vibe cards
CREATE POLICY "Users can read own vibe cards"
  ON vibe_cards FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vibe cards
CREATE POLICY "Users can insert own vibe cards"
  ON vibe_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 05. Helper Function: Increment Z-CASH Balance
CREATE OR REPLACE FUNCTION increment_z_cash_balance(
  user_id UUID,
  amount DECIMAL(18, 2)
)
RETURNS DECIMAL(18, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance DECIMAL(18, 2);
BEGIN
  UPDATE users
  SET z_cash_balance = z_cash_balance + amount
  WHERE id = user_id
  RETURNING z_cash_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;
