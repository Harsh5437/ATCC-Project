import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/database.types'

export async function getProjects(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error(error.message)
  }

  return data
}

export async function getProjectById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    throw new Error(error.message)
  }

  return data
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  project: Database['public']['Tables']['projects']['Insert']
) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error(error.message)
  }

  return data
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  id: string,
  project: Database['public']['Tables']['projects']['Update']
) {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating project ${id}:`, error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteProject(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    console.error(`Error deleting project ${id}:`, error)
    throw new Error(error.message)
  }
}


export async function getVideos(supabase: SupabaseClient<Database>, projectId?: string) {
  let query = supabase
    .from('videos')
    .select('*, projects(name)')
    .order('uploaded_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching videos:', error)
    throw new Error(error.message)
  }

  return data
}

export async function createVideo(
  supabase: SupabaseClient<Database>,
  video: Database['public']['Tables']['videos']['Insert']
) {
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single()

  if (error) {
    console.error('Error creating video record:', error)
    throw new Error(error.message)
  }

  return data
}

export async function updateVideo(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['videos']['Update']
) {
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating video ${id}:`, error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteVideo(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from('videos').delete().eq('id', id)

  if (error) {
    console.error(`Error deleting video ${id}:`, error)
    throw new Error(error.message)
  }
}

export async function getJobs(supabase: SupabaseClient<Database>, status?: string) {
  let query = supabase
    .from('processing_jobs')
    .select('*, videos(filename, project_id, projects(name))')
    .order('started_at', { ascending: false, nullsFirst: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching jobs:', error)
    throw new Error(error.message)
  }

  return data
}

export async function retryJob(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase
    .from('processing_jobs')
    .update({ 
      status: 'queued', 
      progress: 0, 
      started_at: null, 
      completed_at: null,
      logs: 'Retry requested...'
    })
    .eq('id', id)

  if (error) {
    console.error(`Error retrying job ${id}:`, error)
    throw new Error(error.message)
  }
}
