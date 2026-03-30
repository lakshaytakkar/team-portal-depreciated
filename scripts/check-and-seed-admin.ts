import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: users, error } = await supabase.from('users').select('id,email,role').limit(20);
  console.log('Existing users:', JSON.stringify(users, null, 2));
  if (error) console.log('Fetch error:', error);

  const existing = users?.find((u: any) => u.email === 'admin@suprans.in');
  if (existing) {
    console.log('Admin user already exists, updating password...');
    const hashed = await bcrypt.hash('Suprans@123', 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('email', 'admin@suprans.in');
    console.log(updateError ? 'Update error:' + updateError.message : 'Password updated successfully!');
  } else {
    console.log('Creating admin user...');
    const hashed = await bcrypt.hash('Suprans@123', 10);
    const { data, error: insertError } = await supabase.from('users').insert({
      name: 'Admin',
      email: 'admin@suprans.in',
      password: hashed,
      role: 'superadmin',
      phone: null,
      avatar: null,
    }).select().single();
    console.log(insertError ? 'Insert error: ' + insertError.message : 'Admin created:', data);
  }
}

run().catch(console.error);
