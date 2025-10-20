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

function cloneDeep<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeWithFallback<T>(
  fallbackValue: T,
  sourceValue: unknown
): T {
  if (!isPlainObject(fallbackValue) || !isPlainObject(sourceValue)) {
    if (sourceValue === undefined || sourceValue === null) {
      return cloneDeep(fallbackValue);
    }
    return cloneDeep(sourceValue as T);
  }

  const result: Record<string, unknown> = {};
  const keys = new Set([
    ...Object.keys(fallbackValue as Record<string, unknown>),
    ...Object.keys(sourceValue)
  ]);

  for (const key of keys) {
    const fallbackChild = (fallbackValue as Record<string, unknown>)[key];
    const sourceChild = (sourceValue as Record<string, unknown>)[key];

    if (Array.isArray(sourceChild)) {
      result[key] = sourceChild;
      continue;
    }

    if (isPlainObject(fallbackChild) && isPlainObject(sourceChild)) {
      result[key] = mergeWithFallback(fallbackChild, sourceChild);
      continue;
    }

    if (sourceChild === undefined) {
      result[key] = cloneDeep(fallbackChild);
      continue;
    }

    if (isPlainObject(sourceChild)) {
      result[key] = mergeWithFallback({}, sourceChild);
      continue;
    }

    result[key] = sourceChild ?? null;
  }

  return result as T;
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
    if (query.isError || !query.data || query.data.content === undefined || query.data.content === null) {
      return { content: cloneDeep(fallbackContent), usedFallback: true };
    }

    const resolvedContent = query.data.content;

    if (isPlainObject(fallbackContent) && isPlainObject(resolvedContent)) {
      return {
        content: mergeWithFallback(fallbackContent, resolvedContent),
        usedFallback: false
      };
    }

    return { content: resolvedContent, usedFallback: false };
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
