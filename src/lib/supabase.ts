import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'employee' | 'supervisor' | 'admin' | 'finance'
  department: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  title: string
  amount: number
  currency: string
  category: string
  description: string
  receipt_url?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  submitted_at?: string
  approved_at?: string
  rejected_at?: string
  approved_by?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}