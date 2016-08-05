/*global firebase, $*/

var TYPE_MAP = {
  number: 'Numeric',
  string: 'Text'
};

// https://team.carto.com/u/solutions/dataset/thai_districts
//    -> thai_districts
// https://observatory.cartodb.com/tables/obs_table
//    -> obs_table
function tableUrlToTableName(tableUrl) {
  var split = tableUrl.split('/');
  return split[split.length - 1];
}

// https://team.carto.com/u/solutions/dataset/thai_districts
//    -> https://solutions.carto.com/api/v2/sql/
// https://observatory.cartodb.com/tables/obs_table
//    -> https://observatory.carto.com/api/v2/sql/
function tableUrlToSqlEndpoint(tableUrl) {
  var user;
  if (tableUrl.search('/u/') === -1) {
    user = tableUrl.split('//')[1].split('.carto')[0];
  } else {
    user = tableUrl.split('/u/')[1].split('/')[0];
  }
  return 'https://' + user + '.carto.com/api/v2/sql/';
}

function saveMetadata(tableUrl, fields) {

  firebase.database().ref('tables/' + encodeURIComponent(tableUrl)).push({
    fields: fields
  });
}

function getMetadata(tableUrl) {
  var $dfd = new $.Deferred();
  $dfd.reject();
  return $dfd.promise();
}

function renderField(orig_colname, field) {
  var sqlType = TYPE_MAP[field.type] ? TYPE_MAP[field.type] : field.type;
  var $el = $(
    '<div> ' +
    '  <input type="text" name="orig_colname" value="' + orig_colname + '" placeholder="Original column name" disabled />' +
    '  <input type="text" name="orig_type" value="' + field.type + '" placeholder="Original type" disabled />' +
    '  <input type="text" name="type" value="' + sqlType + '" placeholder="Type" />' +
    '  <input type="text" name="colname" value="' + orig_colname + '" placeholder="colname" />' +
    '  <input type="text" name="name" placeholder="Name" />' +
    '  <input type="text" name="description" placeholder="Description" />' +
    '  <select name="aggregate">' +
    '   <option value="none" selected>No aggregation</option> ' +
    '   <option value="sum">Sum</option> ' +
    '   <option value="median">Median</option> ' +
    '   <option value="average">Average</option> ' +
    '  </select>' +
    '  <input type="text" name="tags" placeholder="Relations" />' +
    '  <input type="text" name="tags" placeholder="Tags" />' +
    '</div>'
  );
  $el.appendTo($('#columns'));
}

function renderFields(fields) {
  $('#columns').empty();
  for (var k in fields) {
    var field = fields[k];
    renderField(k, field);
  }
}

function getColumns(tableUrl) {
  var tableName = tableUrlToTableName(tableUrl);
  var $dfd = new $.Deferred();
  $.get(tableUrlToSqlEndpoint(tableUrl), {
    q: 'SELECT * FROM ' + tableName + ' LIMIT 0'
  }).done(function (resp) {
    $dfd.resolve(resp.fields);
  }).fail(function (error) {
    $dfd.reject(error);
  });
  return $dfd.promise();
}

$('ready', function () {
  $('#dataset_url').change(function (evt) {
    var $el = $(evt.target),
        url = $el.val();

    if (url) {
      getMetadata(url).done(function (fields) {
        renderFields(fields);
      }).fail(function (error) {
        getColumns(url)
          .done(function (fields) {
            renderFields(fields);
          })
          .fail(function (error) {

          });
      });
    }
  });
  $('#dataset_url').trigger('change');
});
