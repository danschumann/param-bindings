var
  wrap,
  findArgs  = /:[^\s,=]+/g,
  debug     = require('debug')('param-bindings'),
  _         = require('underscore'),
  __slice   = [].slice;


wrap = function(connection, executeName) {
  var execute;
  execute = connection[executeName];

  return connection[executeName] = function(sql, args) {

    if (_.isArray(args)) {
      return execute.apply(connection, arguments);
    }

    var newArgs = []

    // paramNames == [':ham', ':yummy', ':boop', ':blip']
    var paramNames = sql.match(findArgs);
    debug('paramNames', paramNames);
    debug('before conversion', sql, args);

    _.each(paramNames, function(pn, n) {
      pn = pn.substring(1); // strip the : from the string
      sql = sql.replace(pn, (n + 1)); // replace :ham with :1
      newArgs.push(args[pn]);
    });

    debug('after conversion', sql, newArgs);

    // concat any further arguments passed in
    return execute.apply(execute, [sql, newArgs].concat(__slice.call(arguments, 2)));

  };
};


if (process.env.TEST_PARAM_BINDINGS) {

  console.log('Testing param bindings, please ensure DEBUG=param-bindings or DEBUG=* is also set');

  var fakeConnection = {
    fakeExecute: function(sql, args, cb) {
      debug('executing', arguments);
      cb()
    }
  }


  wrap( fakeConnection, 'fakeExecute' )

  fakeConnection.fakeExecute(
    'select * from users ' + 
      'join bacon on bacon.id = :ham, :column=:yummy ' + 
      'where beep=:boop and bop=:blip',
    {ham: 'pork', yummy: 10, boop: 2, blip: 'bop', column: 'fun'},
    function(){
      console.log('called back');
  });
}

module.exports = wrap;
