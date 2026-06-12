import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://giuguycgwesmefmxkwyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWd1eWNnd2VzbWVmbXhrd3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzIxMjgsImV4cCI6MjA5NDQwODEyOH0.-5jLIjmThoMt_3FMKN6SPeXietTUdgqJ-VtEVg7Iqhc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, projects(name)')
    .order('uploaded_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching videos:', error);
  } else {
    console.log('Videos fetched successfully:', data);
  }
}

test();
