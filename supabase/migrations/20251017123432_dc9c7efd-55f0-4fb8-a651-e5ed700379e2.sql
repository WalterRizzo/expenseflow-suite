-- Agregar columna supervisor_id a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN supervisor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Crear índice para mejorar rendimiento en consultas
CREATE INDEX idx_profiles_supervisor_id ON public.profiles(supervisor_id);

-- Comentario explicativo
COMMENT ON COLUMN public.profiles.supervisor_id IS 'ID del supervisor directo del usuario';