import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  name: string;
  cpf: string;
  amount: number;
  productName: string;
  quantity: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, cpf, amount, productName, quantity }: PaymentRequest = await req.json();

    console.log('Generating PIX QR Code for:', { name, cpf, amount, productName, quantity });

    // Validate input
    if (!name || !cpf || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const risepayToken = Deno.env.get('RISEPAY_PRIVATE_TOKEN');
    
    if (!risepayToken) {
      console.error('RISEPAY_PRIVATE_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Sistema de pagamento não configurado' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Integração com Rise Pay API
    console.log('Calling Rise Pay API...');
    
    const risepayResponse = await fetch('https://api.risepay.com.br/api/External/Transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': risepayToken,
      },
      body: JSON.stringify({
        amount: amount,
        payment: {
          method: "pix"
        },
        customer: {
          name: name,
          email: "cliente@email.com", // Email opcional
          cpf: cpf.replace(/\D/g, ''),
          phone: "(00) 00000-0000" // Telefone opcional
        }
      }),
    });

    if (!risepayResponse.ok) {
      const errorData = await risepayResponse.text();
      console.error('Rise Pay API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar QR Code',
          details: errorData 
        }),
        { 
          status: risepayResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const paymentData = await risepayResponse.json();
    
    console.log('Rise Pay response:', JSON.stringify(paymentData));

    // Verifica se a resposta foi bem-sucedida
    if (!paymentData.success || !paymentData.object?.pix?.qrCode) {
      console.error('Rise Pay error:', paymentData.message);
      return new Response(
        JSON.stringify({ 
          error: paymentData.message || 'Erro ao gerar QR Code',
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('PIX QR Code generated successfully via Rise Pay');

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: paymentData.object.pix.qrCode,
        paymentId: paymentData.object.identifier,
        status: paymentData.object.status,
        amount: paymentData.object.amount,
        fee: paymentData.object.fee,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating PIX QR Code:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
