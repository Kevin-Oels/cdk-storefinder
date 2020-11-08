// run this with node from cli
'use strict'
let AWS = require('aws-sdk'),
fs = require("fs"),
path = require("path"),
documentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-2'});
const TableName = process.env.TABLE;
var params = {
    TableName : 'CdkstorefinderStack-storeservicelistOfStores20FA43E9-105KPWJ1SKEMX',
    Item: {}
}
AWS.config.update({region: 'eu-west-2'});
fs.readFile(__dirname +'\\data\\stores.json', function (err, data) {
    if (err) throw err
    let stores = JSON.parse(data)
    for (var store in stores) {
        params.Item = stores[store]
        documentClient.put(params, function(err, data) {
            if (err) console.log(JSON.stringify(err))
            else console.log(JSON.stringify(data))
        })
    }
})