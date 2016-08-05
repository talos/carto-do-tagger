/*global firebase, $*/

function tableUrlToTableName(tableUrl) {

}

function tableUrlToSqlEndpoint(tableUrl) {

}

function saveMetadata(tableUrl, metadata) {

}

function getMetadata(tableUrl) {

}

function getColumns(tableUrl) {
  var tableName = tableUrlToTableName(tableUrl);
  $.get(tableUrlToSqlEndpoint(tableUrl), {
    q: 'SELECT * FROM ' + tableName + ' LIMIT 0'
  }).done(function (resp) {
    debugger
  }).error(function () {
    // TODO
  });
}

$('load', function () {
  $('dataset_url').change(function (evt) {
    var $el = $(evt.target),
        url = $el.val;

    getColumns(url);
  });
});
