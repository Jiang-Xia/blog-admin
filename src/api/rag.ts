import request from '@/api/request';
import type { HttpResponse } from '@/api/request';

export interface RagStats {
  todayQueries: number;
  weekQueries: number;
  successToday: number;
  quotaExceededToday: number;
  chunkCount: number;
  indexing: boolean;
  embeddingMode?: 'remote' | 'local';
  /** 环境变量是否已配置远程 Embedding（与 embeddingMode 独立） */
  embeddingRemoteConfigured?: boolean;
  embeddingModel?: string;
  lastJob?: {
    id: string;
    articleId: number;
    status: string;
    chunkCount: number;
    errorMsg?: string | null;
    createAt?: string;
  };
  topUsers: Array<{ uid: number; count: string }>;
  dailyTrend: Array<{ date: string; count: string }>;
}

export interface RagReindexResult {
  job: Record<string, unknown>;
  embeddingMode: 'remote' | 'local';
  indexing: boolean;
  message: string;
}

export const getRagStats = (): Promise<HttpResponse<RagStats>> =>
  request({ url: '/admin/rag/stats', method: 'get' });

export const getRagQueryLogs = (params: Record<string, unknown>) =>
  request({ url: '/admin/rag/query-logs', method: 'get', params });

export const getRagIndexJobs = (params: Record<string, unknown>) =>
  request({ url: '/admin/rag/index-jobs', method: 'get', params });

export const getRagChunks = (params: Record<string, unknown>) =>
  request({ url: '/admin/rag/chunks', method: 'get', params });

export const triggerRagReindex = (data?: {
  articleId?: number;
}): Promise<HttpResponse<RagReindexResult>> =>
  request({ url: '/admin/rag/reindex', method: 'post', data: data || {} });
