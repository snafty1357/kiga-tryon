const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.wjjwpbduzoczvqwoocko:Snafty_Kiga1357!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to DB!');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS generations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        device_id TEXT NOT NULL,
        project_id TEXT,
        image_url TEXT,
        garment_types TEXT[],
        description TEXT,
        resolution TEXT,
        format TEXT,
        generation_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    
    console.log('generations table created successfully.');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

setup();
