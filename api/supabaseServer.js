// supabaseAdmin.js (or supabaseServer.js)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvfpbjoxilxcxezyxcnk.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZnBiam94aWx4Y3hlenl4Y25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUwNzY2MSwiZXhwIjoyMDYxMDgzNjYxfQ.P4jLG98y3wg5yUMUf-mv2yUMnWxWGQst54S7HDnAjZU';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabaseAdmin;
