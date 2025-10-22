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

// Função auxiliar para gerar payload PIX no formato EMV
function generatePixPayload(
  pixKey: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  description: string
): string {
  // ID do Payload Format Indicator
  const payloadFormatIndicator = "000201";
  
  // Merchant Account Information (PIX)
  const merchantAccountInfo = `26${(pixKey.length + 14).toString().padStart(2, '0')}0014br.gov.bcb.pix01${pixKey.length.toString().padStart(2, '0')}${pixKey}`;
  
  // Merchant Category Code (não especificado)
  const merchantCategoryCode = "52040000";
  
  // Transaction Currency (BRL = 986)
  const transactionCurrency = "5303986";
  
  // Transaction Amount
  const amountStr = amount.toFixed(2);
  const transactionAmount = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  
  // Country Code
  const countryCode = "5802BR";
  
  // Merchant Name
  const merchantNameFormatted = merchantName.toUpperCase().substring(0, 25);
  const merchantNameField = `59${merchantNameFormatted.length.toString().padStart(2, '0')}${merchantNameFormatted}`;
  
  // Merchant City
  const merchantCityFormatted = merchantCity.toUpperCase().substring(0, 15);
  const merchantCityField = `60${merchantCityFormatted.length.toString().padStart(2, '0')}${merchantCityFormatted}`;
  
  // Additional Data Field Template
  const descriptionFormatted = description.substring(0, 50);
  const additionalDataField = `62${(descriptionFormatted.length + 4).toString().padStart(2, '0')}05${descriptionFormatted.length.toString().padStart(2, '0')}${descriptionFormatted}`;
  
  // Concatena tudo
  const payload = payloadFormatIndicator + merchantAccountInfo + merchantCategoryCode + 
                  transactionCurrency + transactionAmount + countryCode + 
                  merchantNameField + merchantCityField + additionalDataField + "6304";
  
  // CRC16 (simplificado - em produção use biblioteca apropriada)
  const crc = calculateCRC16(payload);
  
  return payload + crc;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
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

    const podpayApiKey = Deno.env.get('PODPAY_API_KEY');
    
    if (!podpayApiKey) {
      console.error('PODPAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============================================
    // TODO: Integração real com Podpay
    // ============================================
    // Você precisa substituir esta seção com a chamada real à API da Podpay
    // Consulte a documentação da Podpay para obter:
    // - Endpoint correto (ex: https://api.podpay.com.br/v1/payments/pix)
    // - Formato do payload
    // - Headers de autenticação necessários
    //
    // Exemplo de chamada (ajuste conforme documentação):
    // const podpayResponse = await fetch('ENDPOINT_REAL_DA_PODPAY', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${podpayApiKey}`,
    //     // ou 'X-API-Key': podpayApiKey
    //   },
    //   body: JSON.stringify({
    //     amount: amount,
    //     customer: {
    //       name: name,
    //       document: cpf.replace(/\D/g, ''),
    //     },
    //     description: `${productName} x${quantity}`,
    //   }),
    // });
    //
    // if (!podpayResponse.ok) {
    //   const errorData = await podpayResponse.text();
    //   console.error('Podpay API error:', errorData);
    //   
    //   return new Response(
    //     JSON.stringify({ 
    //       error: 'Failed to generate QR Code',
    //       details: errorData 
    //     }),
    //     { 
    //       status: podpayResponse.status, 
    //       headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    //     }
    //   );
    // }
    //
    // const paymentData = await podpayResponse.json();
    // ============================================
    
    // Por enquanto, gerando QR Code PIX usando padrão EMV
    // Este é um QR Code válido, mas você deve substituir pela resposta da Podpay
    const pixKey = "suachavepix@email.com"; // Substitua pela sua chave PIX
    const merchantName = "CACAMBAS DE ENTULHOS";
    const merchantCity = "SAO PAULO";
    
    // Formato EMV do PIX (padrão brasileiro)
    const pixPayload = generatePixPayload(pixKey, merchantName, merchantCity, amount, productName);

    console.log('PIX QR Code generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: pixPayload,
        paymentId: `ORDER-${Date.now()}`,
        message: 'QR Code gerado com sucesso. Para produção, integre com a API da Podpay.',
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
