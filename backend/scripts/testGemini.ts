/**
 * Test script to verify live connectivity with Google Gemini API
 */
import { LLMService } from '../src/services/llmService';
import { env } from '../src/config/env';

async function main() {
  console.log('----------------------------------------------------');
  console.log('JurisAccess AI - Gemini Live Connectivity Test');
  console.log('----------------------------------------------------');
  console.log(`LLM Provider Configured: ${env.LLM_PROVIDER}`);
  
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
    console.error('❌ ERROR: GEMINI_API_KEY is empty or missing in your .env file.');
    console.error('Please make sure you have saved your .env file (Cmd + S).');
    process.exit(1);
  }

  const maskedKey = env.GEMINI_API_KEY.substring(0, 4) + '...' + env.GEMINI_API_KEY.substring(env.GEMINI_API_KEY.length - 4);
  console.log(`API Key Detected: ${maskedKey} (length: ${env.GEMINI_API_KEY.length})`);
  console.log(`Sending test prompt to Google Gemini (${env.GEMINI_MODEL})...`);

  const startTime = Date.now();
  try {
    const response = await LLMService.generate(
      'Respond with a valid JSON object verifying the connection: {"status": "CONNECTED", "model": "gemini-1.5-flash", "civilJusticeGreeting": "JurisAccess AI online."}'
    );
    const duration = Date.now() - startTime;

    console.log(`\n✅ SUCCESS! Received response in ${duration}ms:`);
    console.log(response);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('\n❌ Gemini API Request Failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
