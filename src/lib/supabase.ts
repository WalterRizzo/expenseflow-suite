import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lovable.dev/projects/f09aa267-28aa-4afa-a085-c661247a1caf'
const supabaseAnonKey = 'hy9zihPdjpGugj6T'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type AppRole = 'employee' | 'supervisor' | 'admin' | 'finance'

export interface Profile {
  id: string
  email: string
  full_name: string
  department: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  created_at: string
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