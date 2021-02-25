const LoanController = require('./controllers/loan.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const AGENT = config.permissionLevels.AGENT;
const USER = config.permissionLevels.CUSTOMER;

exports.routesConfig = function (app) {

  app.post('/loan/createLoan', [
      ValidationMiddleware.validJWTNeeded,
      PermissionMiddleware.requiredPermissionLevel(AGENT),
      LoanController.createLoan
  ]);
  app.get('/loan/loans', [
      ValidationMiddleware.validJWTNeeded,
      PermissionMiddleware.minimumPermissionLevelRequired(AGENT),
      LoanController.list
  ]);
  app.get('/loan/:loanId', [
      ValidationMiddleware.validJWTNeeded,
      PermissionMiddleware.minimumPermissionLevelRequired(AGENT),
      LoanController.getByLoanId
  ]);

  app.post('/loan/filter', [
      ValidationMiddleware.validJWTNeeded,
      PermissionMiddleware.minimumPermissionLevelRequired(USER),
      LoanController.filterBy
  ]);

  app.patch('/loan/editLoan/:loanId', [
      ValidationMiddleware.validJWTNeeded,
      PermissionMiddleware.minimumPermissionLevelRequired(AGENT),
      LoanController.patchByLoanId
  ]);

};
