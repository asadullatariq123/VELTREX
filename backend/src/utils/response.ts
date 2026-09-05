import { Response } from 'express';

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  total?: number;
  totalPages?: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  pagination?: PaginationParams,
  statusCode = 200,
  metaExtra?: Record<string, any>
): void => {
  let meta: Record<string, any> | undefined = undefined;

  if (pagination) {
    const limit = pagination.limit || 20;
    const total = pagination.total || 0;
    const page = pagination.page || (pagination.offset !== undefined ? Math.floor(pagination.offset / limit) + 1 : 1);
    const totalPages = pagination.totalPages || Math.ceil(total / limit);

    meta = {
      page,
      limit,
      total,
      totalPages,
      ...metaExtra,
    };
  } else if (metaExtra) {
    meta = metaExtra;
  }

  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta, pagination: meta }), // Include both meta and pagination for backward compatibility
  });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400
): void => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
