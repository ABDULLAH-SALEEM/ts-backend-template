interface ErrorObject {
  message: string;
  code: number;
  errors?: any[];
}

export const manageError = (err: any): ErrorObject => {
  const errObject: ErrorObject = {
    message: 'Error in operation',
    code: 400,
    ...err,
  };

  const code: number | string = err.code || err.statusCode;

  if (Array.isArray(err.errors)) {
    let msg = '';
    err.errors.forEach(function (error: any) {
      if (msg) msg += ' ,';
      msg += error.message;
    });

    errObject.message = msg;

    // Set default status code to 422
    errObject.code = 422;
  }

  if (err.message && code) {
    if (code === 11000) {
      let message = '';
      errObject.code = 400;
      errObject.errors = [];
      for (const prop in err.keyValue) {
        errObject.errors.push({
          [prop]: `${err.keyValue[prop]} already exists`,
        });
        if (message) {
          message += ', ';
        }
        message += `${prop} with ${err.keyValue[prop]} already exists!`;
      }
      errObject.message = message;
    } else if (code === 'ECONNREFUSED') {
      errObject.code = 400;
      errObject.message = `Invalid url or host not found: ${err.config.url}`;
    } else {
      errObject.message = err.message;
      errObject.code = code as number;
    }
  } else if (err.message && err.name == 'TypeError') {
    errObject.message = err.message;
    errObject.code = 422;
  } else if (err.message && err.name == 'JsonWebTokenError') {
    errObject.message = 'Invalid token!';
    errObject.code = 422;
  } else if (err.message && err.name == 'TokenExpiredError') {
    errObject.message = 'Token has been expired!';
    errObject.code = 422;
  } else if (err.message) {
    errObject.message = err.message;
    errObject.code = 422;
  }

  // Handle server errors
  if (
    typeof errObject.code !== 'number' ||
    errObject.code > 500 ||
    errObject.code < 400
  ) {
    errObject.code = 400;
    errObject.message = 'Please contact with admin for this issue!';
  }

  return errObject;
};

export const generateErrorObject = (
  errorCode: number,
  message: string,
  errors: any[] = [],
): ErrorObject => {
  return {
    code: errorCode,
    message,
    errors,
  };
};
