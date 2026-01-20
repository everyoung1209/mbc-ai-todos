
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://teclgsfzruliuqtcfugs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_t7MdETvZCRiPS5OpeoOPag_uqSbsbJr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
