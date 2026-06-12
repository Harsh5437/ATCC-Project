import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://giuguycgwesmefmxkwyq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWd1eWNnd2VzbWVmbXhrd3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzIxMjgsImV4cCI6MjA5NDQwODEyOH0.-5jLIjmThoMt_3FMKN6SPeXietTUdgqJ-VtEVg7Iqhc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCreate() {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: 'Test Project',
      location: 'Test Location',
      road_junction: 'Test Junction',
      survey_date: '2023-10-25',
      direction: 'North',
      status: 'Draft'
    })
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success:', data)
  }
}

testCreate()
