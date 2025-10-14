-- Crear enum para estado de gastos
CREATE TYPE expense_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Crear enum para categorías de gastos
CREATE TYPE expense_category AS ENUM ('meals', 'travel', 'transport', 'supplies', 'software', 'training', 'other');

-- Crear enum para prioridad
CREATE TYPE expense_priority AS ENUM ('normal', 'high', 'urgent');

-- Crear tabla de gastos
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category expense_category NOT NULL,
  project TEXT,
  notes TEXT,
  expense_date DATE NOT NULL,
  status expense_status NOT NULL DEFAULT 'pending',
  priority expense_priority NOT NULL DEFAULT 'normal',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios de carga solo ven sus propios gastos
CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'supervisor') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Política: Los usuarios de carga pueden crear gastos
CREATE POLICY "Users can create their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios gastos si están en borrador
CREATE POLICY "Users can update their own draft expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

-- Política: Los supervisores pueden aprobar/rechazar gastos
CREATE POLICY "Supervisors can approve/reject expenses"
  ON public.expenses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'supervisor') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Política: Los usuarios pueden eliminar sus propios gastos en borrador
CREATE POLICY "Users can delete their own draft expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Trigger para actualizar updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Agregar nuevos roles al enum existente
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'user';