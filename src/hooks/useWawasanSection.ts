import { useMemo } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchWawasanSection } from '@/api/wawasan';
import type { WawasanKey, WawasanSection } from '@/types/api';

interface UseWawasanSectionOptions<T> {
  key: WawasanKey;
  fallback: {
    content: T;
    title: string;
    mediaUrl?: string | null;
  };
}

interface WawasanMetadata {
  id?: string;
  key: WawasanKey;
  title: string;
  mediaUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type WawasanQueryResult<T> = UseQueryResult<WawasanSection<T>, Error>;

interface UseWawasanSectionResult<T> {
  content: T;
  metadata: WawasanMetadata;
  isLoading: WawasanQueryResult<T>['isLoading'];
  isFetching: WawasanQueryResult<T>['isFetching'];
  isError: WawasanQueryResult<T>['isError'];
  usedFallback: boolean;
  refetch: WawasanQueryResult<T>['refetch'];
  error: WawasanQueryResult<T>['error'];
}

export function useWawasanSection<T>({ key, fallback }: UseWawasanSectionOptions<T>): UseWawasanSectionResult<T> {
  const query = useQuery<WawasanSection<T>, Error>({
    queryKey: ['wawasan', key],
    queryFn: () => fetchWawasanSection<T>(key),
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  const fallbackContent = fallback.content;
  const fallbackTitle = fallback.title;
  const fallbackMediaUrl = fallback.mediaUrl ?? null;

  const { content, usedFallback } = useMemo(() => {
    if (query.isError || !query.data || query.data.content === undefined) {
      return { content: fallbackContent, usedFallback: true };
    }

    return { content: query.data.content, usedFallback: false };
  }, [query.data, query.isError, fallbackContent]);

  const metadata: WawasanMetadata = useMemo(
    () => ({
      id: query.data?.id,
      key,
      title: query.data?.title ?? fallbackTitle,
      mediaUrl: query.data?.mediaUrl ?? fallbackMediaUrl,
      createdAt: query.data?.createdAt,
      updatedAt: query.data?.updatedAt
    }),
    [query.data, key, fallbackTitle, fallbackMediaUrl]
  );

  return {
    content,
    metadata,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError ?? false,
    usedFallback,
    refetch: query.refetch,
    error: query.error ?? null
  };
}
