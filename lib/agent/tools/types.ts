export type ToolSuccess<T> = {
  ok: true;
  data: T;
  source: string;
  fetched_at: string;
  cached?: boolean;
  cache_age_seconds?: number;
};

export type ToolFailure = {
  ok: false;
  error: string;
  source: string;
  fetched_at: string;
};

export type ToolResult<T> = ToolSuccess<T> | ToolFailure;
