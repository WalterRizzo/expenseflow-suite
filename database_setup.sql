-- SUPABASE DATABASE SETUP
-- Ejecuta este SQL en tu panel de Supabase (SQL Editor)

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('employee', 'supervisor', 'admin', 'finance');

-- Create profiles table (WITHOUT role column for security)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (secure role management)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'EUR',
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expense_approvals table for approval workflow
CREATE TABLE IF NOT EXISTS public.expense_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Supervisors and admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supervisor') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'finance')
  );

-- RLS Policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft expenses" ON public.expenses
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'draft'
  );

CREATE POLICY "Supervisors can view all expenses" ON public.expenses
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supervisor') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Supervisors can approve/reject expenses" ON public.expenses
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supervisor') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'finance')
  );

-- RLS Policies for expense_approvals
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approvers can view their assigned approvals" ON public.expense_approvals
  FOR SELECT USING (auth.uid() = approver_id);

CREATE POLICY "Expense owners can view their expense approvals" ON public.expense_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can manage all approvals" ON public.expense_approvals
  FOR ALL USING (
    public.has_role(auth.uid(), 'supervisor') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'finance')
  );

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', '')
  );
  
  -- Insert role in separate table
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role::app_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_expense_approvals_updated_at BEFORE UPDATE ON public.expense_approvals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();