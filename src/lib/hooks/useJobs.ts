import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import { getJobs, retryJob } from '../services/db-utils';

export function useJobs(status?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['jobs', status],
    queryFn: () => getJobs(supabase, status),
    refetchInterval: (query) => {
      // Poll if any job is in processing or queued status
      const data = query.state.data as any[];
      const hasActiveJobs = data?.some(job => ['queued', 'processing'].includes(job.status));
      return hasActiveJobs ? 3000 : false;
    },
  });
}

export function useRetryJob() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => retryJob(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
