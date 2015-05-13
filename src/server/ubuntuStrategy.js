var OpenIDStrategy = require('passport-openid').Strategy;
var util = require('util');
var openid = require('openid');

function Strategy(options, verify) {
  options.profile = false;
  options.providerURL = options.providerURL || 'https://login.ubuntu.com/';
  OpenIDStrategy.call(this, options, verify);
  this.name = 'ubuntu';

  var sreg = new openid.SimpleRegistration({
    'fullname' : true,
    'nickname' : 'required',
    'email' : 'required',
    'dob' : true,
    'gender' : true,
    'postcode' : true,
    'country' : true,
    'timezone' : true,
    'language' : true
  });
  this._relyingParty.extensions.push(sreg);

  var ax = new openid.AttributeExchange({
    'http://axschema.org/namePerson' : 'required',
    'http://axschema.org/namePerson/first': 'required',
    'http://axschema.org/namePerson/last': 'required',
    'http://axschema.org/contact/email': 'required',
    'http://axschema.org/namePerson/friendly': 'required'
  });
  this._relyingParty.extensions.push(ax);
}

util.inherits(Strategy, OpenIDStrategy);

Strategy.prototype._parseProfileExt = function(params) {
  return params;
};

exports.Strategy = Strategy;
