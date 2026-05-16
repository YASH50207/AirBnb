class ExpressError extends Error {
    constructor(message, status) {
      super();
     
      this.statusCode = status;
      this.message = message;
    }
  }
  
  module.exports = ExpressError;