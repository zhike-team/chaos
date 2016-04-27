'use strict';

module.exports = class Exception {
  constructor(code, msg) {
    this.code = code;
    this.msg = msg || errors[code];
    Error.captureStackTrace(this, Exception);
  }
};
