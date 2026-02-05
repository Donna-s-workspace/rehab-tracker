// Deploy database schema to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://dzapjthijbykwtdrlbzq.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deploySchema() {
  console.log('📦 Reading schema file...');
  const schema = readFileSync('./supabase-schema.sql', 'utf-8');
  
  console.log('🚀 Deploying to Supabase...');
  console.log('⚠️  Note: SQL execution via API is limited.');
  console.log('📋 Please paste the following SQL in Supabase Dashboard → SQL Editor:\n');
  console.log('─'.repeat(80));
  console.log(schema);
  console.log('─'.repeat(80));
  console.log('\n✅ After pasting, run this script again to verify tables.');
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables...');
  
  const tables = ['profiles', 'sessions', 'exercises', 'session_sets', 'coaching_logs'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(0);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

// Check if we're verifying or deploying
if (process.argv[2] === '--verify') {
  verifyTables();
} else {
  deploySchema();
}
