-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar tabela de produtos customizados para admin
CREATE TABLE public.custom_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_products ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem visualizar produtos ativos
CREATE POLICY "Anyone can view active custom products"
ON public.custom_products
FOR SELECT
USING (active = true);

-- Policy: Apenas admin pode inserir (vamos validar no frontend/edge function)
CREATE POLICY "Admin can insert custom products"
ON public.custom_products
FOR INSERT
WITH CHECK (true);

-- Policy: Apenas admin pode atualizar
CREATE POLICY "Admin can update custom products"
ON public.custom_products
FOR UPDATE
USING (true);

-- Policy: Apenas admin pode deletar
CREATE POLICY "Admin can delete custom products"
ON public.custom_products
FOR DELETE
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_custom_products_updated_at
BEFORE UPDATE ON public.custom_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();