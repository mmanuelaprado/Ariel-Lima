
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jiydryvurujhjxwftdxx.supabase.co';
const supabaseKey = 'sb_publishable_HuZF-b5nXoRoqAD4DNigEw_8oXpWaZy';

export const supabase = createClient(supabaseUrl, supabaseKey);
