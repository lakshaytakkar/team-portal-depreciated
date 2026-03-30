import bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const hashed = await bcrypt.hash('Suprans@123', 10);
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.admin%40suprans.in`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ password: hashed }),
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

run().catch(console.error);
