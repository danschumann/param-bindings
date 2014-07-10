var
  wrap,
  findArgs  = /:[^\s,=()]+/g,
  debug     = require('debug')('param-bindings'),
  _         = require('underscore'),
  __slice   = [].slice;


wrap = function(connection, executeName, options) {
  var execute;
  execute = connection[executeName];

  options = options || {};
  options.key = options.key || '?';
  if (options.increment && options.startAt == null)
    throw new Error('param-bindings:  To specify .increment, you must also specify .startAt (usually 1)');

  return connection[executeName] = function(sql, args) {

    if (_.isArray(args) || _.isFunction(args) || !_.isObject(args)) {
      return execute.apply(connection, arguments);
    }

    var newArgs = []

    // paramNames == [':ham', ':yummy', ':boop', ':blip']
    var paramNames = sql.match(findArgs);
    debug('paramNames', paramNames);
    debug('before conversion', sql, args);

    // if we zipper paramNames and pieces, they would equal the original
    var pieces = sql.split(findArgs);
    debug('pieces', pieces);

    compiled = [pieces.shift()];

    var pName;
    var n = options.startAt;

    while(pieces.length) {
      pName = paramNames.shift();
      compiled.push(options.increment ? ':' + n++ : '?');
      compiled.push(pieces.shift());

      newArgs.push(args[pName.substring(1)]);
    }

    sql = compiled.join('');

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

  debug('TEST question mark');

  fakeConnection.fakeExecute(
    'select * from users ' + 
      'join bacon on bacon.id = :ham, :column=:yummy ' + 
      'where beep=:boop and bop=:blip',
    {ham: 'pork', yummy: 10, boop: 2, blip: 'bop', column: 'fun'},
    function(){
      console.log('called back');
  });

  wrap( fakeConnection, 'fakeExecute', {increment: true, startAt: 1})
  wrap( fakeConnection, 'fakeExecute', {startAt: 1})

  debug('TEST increment');

  fakeConnection.fakeExecute(
    'select * from users ' + 
      'join bacon on bacon.id in (:ham), :column=:yummy ' + 
      'where beep=:boop and bop = :blip',
    {ham: 'pork', yummy: 10, boop: 2, blip: 'bop', column: 'fun'},
    function(){
      console.log('called back');
  });
}

module.exports = wrap;
