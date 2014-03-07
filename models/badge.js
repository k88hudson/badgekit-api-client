const utils = require('../lib/modelUtils');

const ActionableModel = require('./_actionable');

// Prevents race condition errors
var models;
function loadModels () {
  if (models) return;

  models = {
    Issuer: require('./issuer'),
    Program: require('./program'),
    System: require('./system'),
    Application: require('./application'),
    BadgeInstance: require('./instance'),
    Code: require('./code')
  }
}

/**
 *
 */
function Badge (data, parent) {
  ActionableModel.apply(this, arguments);

  loadModels();

  if (this.system)
    this.system = new models.System(this.system, this._heritage.client);

  if (this.issuer)
    this.issuer = new models.Issuer(this.issuer, this.system);

  if (this.program)
    this.program = new models.Program(this.program, this.issuer);
}

utils.initModel(Badge, '/badges', {
  addApplication: function addApplication (application, callback) {
    application = new models.Application(application, this);
    application.create(callback);
  },
  addClaimCode: function addClaimCode (code, callback) {
    code = new models.Code(code, this);
    code.create(callback);
  },
  generateClaimCode: function generateClaimCode (callback) {
    const options = {
      path: this._path + models.Code.pathPart + '/random',
      filter: 'code',
      generator: new utils.Generator(models.Code, this)
    }

    this._remote.post(options, callback);
  },
  getInstances: function getInstances () {
    const options = {
      path: this._path + models.BadgeInstance.pathPart,
      filter: 'instances',
      generator: new utils.Generator(models.BadgeInstance, this)
    }

    this._remote.get(options, callback);
  }
}, ActionableModel);

exports = module.exports = Badge;
