// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvfpbjoxilxcxezyxcnk.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZnBiam94aWx4Y3hlenl4Y25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDc2NjEsImV4cCI6MjA2MTA4MzY2MX0.xBEK3SbLZ72sKXaVRrWk75b7Hq1BV5D39H57sD53ow4'; 

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
