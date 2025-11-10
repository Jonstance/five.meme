"use strict";

import { ErrorRequestHandler, Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";

const _hasOwnProperty = Object.prototype.hasOwnProperty;

const Status = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNSUPPORTED_ACTION: 405,
  VALIDATION_FAILED: 422,
  SERVER_ERROR: 500,
  CREATED: 201,
};

function statusMessage(status: number) {
  switch (status) {
    case Status.BAD_REQUEST:
      return "Bad Request";
    case Status.UNAUTHORIZED:
      return "Unauthorized";
    case Status.FORBIDDEN:
      return "Forbidden";
    case Status.NOT_FOUND:
      return "Not Found";
    case Status.UNSUPPORTED_ACTION:
      return "Unsupported Action";
    case Status.VALIDATION_FAILED:
      return "Validation Failed";
    case Status.SERVER_ERROR:
      return "Internal Server Error";
    case Status.CREATED:
      return "Created";
  }
}

function jsonResponse(res: any, body: any, options: any) {
  options = options || {};
  options.status = options.status || Status.OK;
  res.status(options.status).json(body || null);
}

const Api = {
  ok(request: Request, res: Response, data: any) {
    jsonResponse(res, data, {
      status: Status.OK,
    });
  },

  badRequest(request: Request, res: Response , errors: any) {
    errors = Array.isArray(errors) ? errors : [errors];

    const body = {
      message: statusMessage(Status.BAD_REQUEST),
      errors,
    };

    jsonResponse(res, body, {
      status: Status.BAD_REQUEST,
    });
  },

  unauthorized(request: any, res: any, error: any) {
    const body = {
      message: statusMessage(Status.UNAUTHORIZED),
      error,
    };

    jsonResponse(res, body, {
      status: Status.UNAUTHORIZED,
    });
  },

  forbidden(request
    : Request, res: Response) {
    const body = {
      message: statusMessage(Status.FORBIDDEN),
    };

    jsonResponse(res, body, {
      status: Status.FORBIDDEN,
    });
  },
  notFound(request: Request, res: Response ) {
    const body = {
      message: statusMessage(Status.NOT_FOUND),
    };

    jsonResponse(res, body, {
      status: Status.NOT_FOUND,
    });
  },

  unsupportedAction(request: Request, res: Response) {
    const body = {
      message: statusMessage(Status.UNSUPPORTED_ACTION),
    };

    jsonResponse(res, body, {
      status: Status.UNSUPPORTED_ACTION,
    });
  },

  invalid(request: Request, res: Response, errors: any) {
    errors = Array.isArray(errors) ? errors : [errors];

    const body = {
      message: statusMessage(Status.VALIDATION_FAILED),
      errors,
    };

    jsonResponse(res, body, {
      status: Status.VALIDATION_FAILED,
    });
  },
  serverError(request: Request, res: Response, error: any) {
    if (error instanceof Error) {
      error = {
        message: error.message,
        stacktrace: error.stack,
      };
    }
    const body = {
      message: statusMessage(Status.SERVER_ERROR),
      error,
    };

    jsonResponse(res, body, {
      status: Status.SERVER_ERROR,
    });
  },

  requireParams(request: Request, res: Response , parameters: any, next: NextFunction) {
    const missing : any[] = [];

    parameters = Array.isArray(parameters) ? parameters : [parameters];

    parameters.forEach((parameter: any) => {
      if (
        !(request.body && _hasOwnProperty.call(request.body, parameter)) &&
        !(request.params && _hasOwnProperty.call(request.params, parameter)) &&
        !_hasOwnProperty.call(request.query, parameter)
      ) {
        missing.push(`Missing required parameter: ${parameter}`);
      }
    });

    if (missing.length) {
      Api.badRequest(request, res , missing);
    } else {
      next();
    }
  },
  created(request: Request, res: Response , data: any) {
    jsonResponse(res, data, {
      status: Status.OK,
    });
  },

  requireHeaders(request: Request, res: Response , headers: any, next: NextFunction) {
    const missing: any[]= [];

    headers = Array.isArray(headers) ? headers : [headers];

    headers.forEach((header: any) => {
      if (!(request.headers && _hasOwnProperty.call(request.headers, header))) {
        missing.push(`Missing required header parameter: ${header}`);
      }
    });

    if (missing.length) {
      Api.badRequest(request, res, missing);
    } else {
      next();
    }
  },
};

export { Api };