export interface User {
  id: string
  email: string
  name: string | null
  credits: number
  plan: string
  is_admin: boolean
  stripe_customer_id: string | null
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  encrypted: boolean
  updated_at: string
}

export interface AIModel {
  id: string
  model_id: string
  name: string
  provider: string | null
  description: string | null
  cost_per_credit: number
  is_active: boolean
  category: string | null
  context_length: number | null
  created_at: string
}

export interface PromptTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  prompt_text: string
  icon: string | null
  is_active: boolean
  usage_count: number
  created_at: string
}

export interface TemplateField {
  id: string
  template_id: string
  variable_name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder: string | null
  help_text: string | null
  required: boolean
  options: string[] | null
  order_index: number
  created_at: string
}

export interface Generation {
  id: string
  user_id: string
  template_id: string
  model_used: string
  inputs: Record<string, string>
  full_prompt: string
  result: string
  credits_used: number
  created_at: string
  template?: PromptTemplate
}

export interface PricingPlan {
  id: string
  name: string
  credits: number
  price_monthly: number
  price_yearly: number
  features: string[]
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  is_active: boolean
  order_index: number
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string | null
  created_at: string
  plan?: PricingPlan
}

export interface TemplateWithFields extends PromptTemplate {
  fields: TemplateField[]
}
