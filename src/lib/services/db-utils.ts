import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/database.types'

// ── LocalStorage Mock Database Helpers ─────────────────────────────
const isBrowser = typeof window !== 'undefined';

function getLocalData<T>(key: string, defaultVal: T): T {
  if (!isBrowser) return defaultVal;
  const data = localStorage.getItem(`atcc_${key}`);
  if (!data) {
    localStorage.setItem(`atcc_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(`atcc_${key}`, JSON.stringify(value));
}

const defaultProjects: Database['public']['Tables']['projects']['Row'][] = [
  {
    id: 'proj-1',
    name: 'NH-48 Corridor Survey',
    location: 'Delhi-NCR',
    road_junction: 'Rajiv Chowk',
    status: 'Active',
    direction: 'Bidirectional',
    notes: '24-hour volume count for expressway expansion study.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    survey_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'proj-2',
    name: 'Ring Road Intersection Study',
    location: 'Bengaluru',
    road_junction: 'Silk Board Junction',
    status: 'Completed',
    direction: 'Northbound',
    notes: 'Peak hour congestion analysis.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    survey_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]
  }
];

const defaultVideos: Database['public']['Tables']['videos']['Row'][] = [
  {
    id: 'vid-1',
    project_id: 'proj-1',
    filename: 'rajiv_chowk_morning_peak.mp4',
    storage_url: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop', // placeholder visual
    status: 'Completed',
    duration: 180,
    resolution: '1920x1080',
    uploaded_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'vid-2',
    project_id: 'proj-1',
    filename: 'rajiv_chowk_afternoon.mp4',
    storage_url: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop',
    status: 'Processing',
    duration: 120,
    resolution: '1920x1080',
    uploaded_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const defaultJobs: Database['public']['Tables']['processing_jobs']['Row'][] = [
  {
    id: 'job-1',
    video_id: 'vid-1',
    status: 'Completed',
    progress: 100,
    logs: 'YOLOv8 initialized.\nByteTrack started.\nProcessing frames 1-5400.\nExport complete.',
    started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 4 + 45000).toISOString(),
    worker_node: 'LOCAL-GPU-MPS'
  },
  {
    id: 'job-2',
    video_id: 'vid-2',
    status: 'Processing',
    progress: 68,
    logs: 'YOLOv8 initialized.\nByteTrack started.\nProcessing frames 2000-3600...',
    started_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    completed_at: null,
    worker_node: 'LOCAL-CPU'
  }
];

// Helper to determine if we are in mock mode (failed or unconfigured Supabase)
function checkIsMock(supabase: SupabaseClient<Database>): boolean {
  const isSupabaseConfigured = supabase.supabaseUrl && !supabase.supabaseUrl.includes('localhost:54321');
  return !isSupabaseConfigured;
}

// ── Projects ───────────────────────────────────────────────────────

export async function getProjects(supabase: SupabaseClient<Database>) {
  if (checkIsMock(supabase)) {
    return getLocalData<typeof defaultProjects>('projects', defaultProjects);
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Supabase getProjects failed, falling back to local:', error);
    return getLocalData<typeof defaultProjects>('projects', defaultProjects);
  }
}

export async function getProjectById(supabase: SupabaseClient<Database>, id: string) {
  if (checkIsMock(supabase)) {
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const proj = projects.find(p => p.id === id);
    if (!proj) throw new Error('Project not found');
    return proj;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn(`Supabase getProjectById ${id} failed, falling back to local:`, error);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const proj = projects.find(p => p.id === id);
    if (!proj) throw new Error('Project not found');
    return proj;
  }
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  project: Database['public']['Tables']['projects']['Insert']
) {
  if (checkIsMock(supabase)) {
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const newProj: Database['public']['Tables']['projects']['Row'] = {
      id: Math.random().toString(36).substring(7),
      name: project.name,
      location: project.location || null,
      road_junction: project.road_junction || null,
      status: project.status || 'Active',
      direction: project.direction || null,
      notes: project.notes || null,
      created_at: new Date().toISOString(),
      survey_date: project.survey_date || new Date().toISOString().split('T')[0]
    };
    projects.unshift(newProj);
    setLocalData('projects', projects);
    return newProj;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(project as any)
      .select()
      .single()

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Supabase createProject failed, falling back to local:', error);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const newProj: Database['public']['Tables']['projects']['Row'] = {
      id: Math.random().toString(36).substring(7),
      name: project.name,
      location: project.location || null,
      road_junction: project.road_junction || null,
      status: project.status || 'Active',
      direction: project.direction || null,
      notes: project.notes || null,
      created_at: new Date().toISOString(),
      survey_date: project.survey_date || new Date().toISOString().split('T')[0]
    };
    projects.unshift(newProj);
    setLocalData('projects', projects);
    return newProj;
  }
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  id: string,
  project: Database['public']['Tables']['projects']['Update']
) {
  if (checkIsMock(supabase)) {
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...project } as any;
    setLocalData('projects', projects);
    return projects[idx];
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn(`Supabase updateProject ${id} failed, falling back to local:`, error);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...project } as any;
    setLocalData('projects', projects);
    return projects[idx];
  }
}

export async function deleteProject(supabase: SupabaseClient<Database>, id: string) {
  if (checkIsMock(supabase)) {
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const filtered = projects.filter(p => p.id !== id);
    setLocalData('projects', filtered);
    return;
  }

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error;
  } catch (error: any) {
    console.warn(`Supabase deleteProject ${id} failed, falling back to local:`, error);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    const filtered = projects.filter(p => p.id !== id);
    setLocalData('projects', filtered);
  }
}

// ── Videos ─────────────────────────────────────────────────────────

export async function getVideos(supabase: SupabaseClient<Database>, projectId?: string) {
  if (checkIsMock(supabase)) {
    let videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    if (projectId) {
      videos = videos.filter(v => v.project_id === projectId);
    }
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    return videos.map(v => ({
      ...v,
      projects: { name: projects.find(p => p.id === v.project_id)?.name || 'Unknown Project' }
    }));
  }

  try {
    let query = supabase
      .from('videos')
      .select('*, projects(name)')
      .order('uploaded_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Supabase getVideos failed, falling back to local:', error);
    let videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    if (projectId) {
      videos = videos.filter(v => v.project_id === projectId);
    }
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    return videos.map(v => ({
      ...v,
      projects: { name: projects.find(p => p.id === v.project_id)?.name || 'Unknown Project' }
    }));
  }
}

export async function createVideo(
  supabase: SupabaseClient<Database>,
  video: Database['public']['Tables']['videos']['Insert']
) {
  if (checkIsMock(supabase)) {
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const newVideo: Database['public']['Tables']['videos']['Row'] = {
      id: Math.random().toString(36).substring(7),
      filename: video.filename || 'Unknown.mp4',
      project_id: video.project_id || null,
      storage_url: video.storage_url || null,
      status: video.status || 'pending',
      duration: video.duration || null,
      resolution: video.resolution || null,
      uploaded_at: new Date().toISOString()
    };
    videos.unshift(newVideo);
    setLocalData('videos', videos);
    return newVideo;
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single()

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Supabase createVideo failed, falling back to local:', error);
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const newVideo: Database['public']['Tables']['videos']['Row'] = {
      id: Math.random().toString(36).substring(7),
      filename: video.filename || 'Unknown.mp4',
      project_id: video.project_id || null,
      storage_url: video.storage_url || null,
      status: video.status || 'pending',
      duration: video.duration || null,
      resolution: video.resolution || null,
      uploaded_at: new Date().toISOString()
    };
    videos.unshift(newVideo);
    setLocalData('videos', videos);
    return newVideo;
  }
}

export async function updateVideo(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['videos']['Update']
) {
  if (checkIsMock(supabase)) {
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const idx = videos.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Video not found');
    videos[idx] = { ...videos[idx], ...updates } as any;
    setLocalData('videos', videos);
    return videos[idx];
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn(`Supabase updateVideo ${id} failed, falling back to local:`, error);
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const idx = videos.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Video not found');
    videos[idx] = { ...videos[idx], ...updates } as any;
    setLocalData('videos', videos);
    return videos[idx];
  }
}

export async function deleteVideo(supabase: SupabaseClient<Database>, id: string) {
  if (checkIsMock(supabase)) {
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const filtered = videos.filter(v => v.id !== id);
    setLocalData('videos', filtered);
    return;
  }

  try {
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (error) throw error;
  } catch (error: any) {
    console.warn(`Supabase deleteVideo ${id} failed, falling back to local:`, error);
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const filtered = videos.filter(v => v.id !== id);
    setLocalData('videos', filtered);
  }
}

// ── Processing Jobs ────────────────────────────────────────────────

export async function getJobs(supabase: SupabaseClient<Database>, status?: string) {
  if (checkIsMock(supabase)) {
    let jobs = getLocalData<typeof defaultJobs>('jobs', defaultJobs);
    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status?.toLowerCase() === status.toLowerCase());
    }
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    
    return jobs.map(j => {
      const vid = videos.find(v => v.id === j.video_id);
      return {
        ...j,
        videos: vid ? {
          filename: vid.filename,
          project_id: vid.project_id,
          projects: { name: projects.find(p => p.id === vid.project_id)?.name || 'Unknown Project' }
        } : null
      };
    });
  }

  try {
    let query = supabase
      .from('processing_jobs')
      .select('*, videos(filename, project_id, projects(name))')
      .order('started_at', { ascending: false, nullsFirst: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Supabase getJobs failed, falling back to local:', error);
    let jobs = getLocalData<typeof defaultJobs>('jobs', defaultJobs);
    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status?.toLowerCase() === status.toLowerCase());
    }
    const videos = getLocalData<typeof defaultVideos>('videos', defaultVideos);
    const projects = getLocalData<typeof defaultProjects>('projects', defaultProjects);
    
    return jobs.map(j => {
      const vid = videos.find(v => v.id === j.video_id);
      return {
        ...j,
        videos: vid ? {
          filename: vid.filename,
          project_id: vid.project_id,
          projects: { name: projects.find(p => p.id === vid.project_id)?.name || 'Unknown Project' }
        } : null
      };
    });
  }
}

export async function retryJob(supabase: SupabaseClient<Database>, id: string) {
  if (checkIsMock(supabase)) {
    const jobs = getLocalData<typeof defaultJobs>('jobs', defaultJobs);
    const idx = jobs.findIndex(j => j.id === id);
    if (idx === -1) throw new Error('Job not found');
    jobs[idx] = {
      ...jobs[idx],
      status: 'queued',
      progress: 0,
      started_at: null,
      completed_at: null,
      logs: 'Retry requested...'
    };
    setLocalData('jobs', jobs);
    return;
  }

  try {
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

    if (error) throw error;
  } catch (error: any) {
    console.warn(`Supabase retryJob ${id} failed, falling back to local:`, error);
    const jobs = getLocalData<typeof defaultJobs>('jobs', defaultJobs);
    const idx = jobs.findIndex(j => j.id === id);
    if (idx === -1) throw new Error('Job not found');
    jobs[idx] = {
      ...jobs[idx],
      status: 'queued',
      progress: 0,
      started_at: null,
      completed_at: null,
      logs: 'Retry requested...'
    };
    setLocalData('jobs', jobs);
  }
}
