import { AxiosError } from 'axios';

type ApiErrorBody = { message?: string };

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }
  return undefined;
};

export const isApiError = (error: unknown): error is AxiosError<ApiErrorBody> => error instanceof AxiosError;
