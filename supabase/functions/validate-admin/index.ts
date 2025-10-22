import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()
    
    console.log('Validating admin password')
    
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração de senha não encontrada' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const isValid = password === adminPassword
    
    console.log('Password validation result:', isValid)
    
    if (isValid) {
      // Generate a simple token (in production, use JWT)
      const token = crypto.randomUUID()
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          token,
          message: 'Autenticado com sucesso' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Senha incorreta' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Error validating admin:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro ao validar senha' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
