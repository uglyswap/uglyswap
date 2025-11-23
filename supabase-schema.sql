-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table (for API keys)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  credits INTEGER DEFAULT 10,
  plan TEXT DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Models table
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT,
  description TEXT,
  cost_per_credit INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  context_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt Templates table
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  prompt_text TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Fields table
CREATE TABLE template_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'number')),
  placeholder TEXT,
  help_text TEXT,
  required BOOLEAN DEFAULT true,
  options JSONB,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  model_used TEXT,
  inputs JSONB,
  full_prompt TEXT,
  result TEXT,
  credits_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Plans table
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  credits INTEGER,
  price_monthly INTEGER,
  price_yearly INTEGER,
  features JSONB,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES pricing_plans(id),
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_template_id ON generations(template_id);
CREATE INDEX idx_template_fields_template_id ON template_fields(template_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all settings
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Everyone can view active models
CREATE POLICY "Anyone can view active models" ON ai_models
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Admins can manage models
CREATE POLICY "Admins can manage models" ON ai_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Everyone can view active templates
CREATE POLICY "Anyone can view active templates" ON prompt_templates
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Admins can manage templates
CREATE POLICY "Admins can manage templates" ON prompt_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Everyone can view template fields
CREATE POLICY "Anyone can view template fields" ON template_fields
  FOR SELECT USING (true);

-- Admins can manage template fields
CREATE POLICY "Admins can manage template fields" ON template_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can view their own generations
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert generations
CREATE POLICY "Users can insert generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Everyone can view active pricing plans
CREATE POLICY "Anyone can view active plans" ON pricing_plans
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Admins can manage pricing plans
CREATE POLICY "Admins can manage plans" ON pricing_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default plans
INSERT INTO pricing_plans (name, credits, price_monthly, price_yearly, features, is_active, order_index)
VALUES
  ('Gratuit', 10, 0, 0, '["10 credits par mois", "Acces aux modeles standards", "Historique limite"]', true, 1),
  ('Pro', 500, 1900, 19000, '["500 credits par mois", "Acces a tous les modeles", "Historique illimite", "Support prioritaire"]', true, 2),
  ('Business', 2000, 4900, 49000, '["2000 credits par mois", "Acces a tous les modeles", "Historique illimite", "Support prioritaire", "API access"]', true, 3);
