-- 1. Agregar soporte de multimonedas a expenses
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS' NOT NULL,
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 1.0 NOT NULL,
ADD COLUMN IF NOT EXISTS amount_in_pesos NUMERIC GENERATED ALWAYS AS (amount * exchange_rate) STORED;

COMMENT ON COLUMN public.expenses.currency IS 'Moneda del gasto (ARS, USD, EUR, etc.)';
COMMENT ON COLUMN public.expenses.exchange_rate IS 'Tasa de cambio al peso argentino';
COMMENT ON COLUMN public.expenses.amount_in_pesos IS 'Monto convertido a pesos argentinos';

-- 2. Agregar balance a profiles para gestión de saldo
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.profiles.balance IS 'Saldo disponible del usuario en pesos';

-- 3. Crear bucket para attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-attachments', 'expense-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas RLS para storage bucket
CREATE POLICY "Users can view their own expense attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expense-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own expense attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expense-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own draft expense attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'expense-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Mejorar RLS para que NO se puedan borrar gastos aprobados/rechazados (solo draft y pending)
DROP POLICY IF EXISTS "Users can delete their own draft expenses" ON public.expenses;

CREATE POLICY "Users can delete their own draft or pending expenses"
ON public.expenses
FOR DELETE
USING (
  auth.uid() = user_id AND 
  status IN ('draft'::expense_status, 'pending'::expense_status)
);