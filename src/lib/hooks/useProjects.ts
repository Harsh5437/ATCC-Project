import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '../supabase/client'
import { getProjects, createProject, getProjectById, updateProject, deleteProject } from '../services/db-utils'
import { Database } from '../supabase/database.types'

export function useProjects() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(supabase),
  })
}

export function useProject(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProjectById(supabase, id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (project: Database['public']['Tables']['projects']['Insert']) => 
      createProject(supabase, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, project }: { id: string; project: Database['public']['Tables']['projects']['Update'] }) =>
      updateProject(supabase, id, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
