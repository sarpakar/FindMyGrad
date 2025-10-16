import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { programId } = await req.json();
    console.log('Generating summary for program:', programId);

    if (!programId) {
      return new Response(JSON.stringify({ error: 'Program ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch program details
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (fetchError || !program) {
      console.error('Error fetching program:', fetchError);
      return new Response(JSON.stringify({ error: 'Program not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate AI summary
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic advisor. Generate a concise, insightful summary for graduate programs that highlights key strengths, research opportunities, and what makes the program unique.'
          },
          {
            role: 'user',
            content: `Generate a compelling summary for this graduate program:\n\nProgram: ${program.name}\nUniversity: ${program.university}\nCountry: ${program.country}\nDegree: ${program.degree_type}\nDescription: ${program.description}\nResearch Areas: ${program.research_areas?.join(', ')}\nProfessors: ${program.professors?.join(', ')}\nTags: ${program.tags?.join(', ')}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add funds to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices[0]?.message?.content || '';
    console.log('Generated summary:', summary);

    // Update program with AI summary
    const { data: updatedProgram, error: updateError } = await supabase
      .from('programs')
      .update({ ai_summary: summary })
      .eq('id', programId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating program:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to save summary' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ summary, program: updatedProgram }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-summary:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
