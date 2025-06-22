import * as dotenv from 'dotenv';
import { LlamaAPIClient } from 'llama-api-client';

// Load environment variables
dotenv.config();

async function quickTest() {
  console.log('🧪 Quick Llama API Schema Test...\n');
  
  try {
    const apiKey = process.env.LLAMA_API_KEY;
    if (!apiKey) {
      throw new Error('LLAMA_API_KEY not found');
    }
    
    console.log(`✅ API key loaded: ${apiKey.substring(0, 10)}...`);
    
    const client = new LlamaAPIClient({ apiKey });
    
    console.log('🦙 Testing simple chat completion...');
    
    const response = await client.chat.completions.create({
      model: 'Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'user',
          content: 'Say hello and respond with exactly: {"message": "Hello from Llama!"}'
        }
      ],
      temperature: 0.1,
      max_completion_tokens: 100
    });
    
    console.log('✅ Basic response received');
    console.log('Response:', response);
    
    // Test structured response
    console.log('\n🧠 Testing structured JSON response...');
    
    const structuredResponse = await client.chat.completions.create({
      model: 'Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'user',
          content: 'Create a simple test object'
        }
      ],
      temperature: 0.1,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'TestResponse',
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              success: { type: 'boolean' }
            },
            required: ['message', 'success']
          }
        }
      }
    });
    
    console.log('✅ Structured response received');
    console.log('Structured Response:', structuredResponse);
    
    console.log('\n🎉 Schema validation fixes are working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error && error.message.includes('400')) {
      console.error('\n🔧 This is still a schema validation issue');
    }
  }
}

quickTest();
