'use strict'
var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.TABLE

exports.main = function(event, context, callback){
    const latitude = Number.parseFloat(event.queryStringParameters.latitude)
    const longitude = Number.parseFloat(event.queryStringParameters.longitude)
    const distance = Number.parseFloat(event.queryStringParameters.distance) // numerical distance in miles
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
        var response = {
            "statusCode": 400,
            "body": "Please Use numeric values for latitude, longitude & distance \n"+JSON.stringify(event.queryStringParameters),
        }
        callback(null, response)
    }

    // every degree is roughly 69 miles. we can use this and the search distance to filter our dynamodb query
    const searchDog = distance/100 * 69

    var params = {
        TableName : TableName,
        FilterExpression: 'latitude < :latMax and latitude > :latMin and longitude < :longMax and longitude > :longMin',
        ExpressionAttributeValues: {
            ":latMax": latitude + searchDog,
            ":latMin": latitude - searchDog,
            ":longMax": longitude + searchDog,
            ":longMin": longitude - searchDog,
        }
    }

    documentClient.scan(params, function(err, data){
        if(err){
            callback(err, null)
        }else{
            let nearByStores = []
            data.Items.forEach((store) => {
                // get  distance of each store
                const storeLoc = {
                    lat: Number.parseFloat(store.latitude),
                    lng: Number.parseFloat(store.longitude)
                } 
                const providedLoc = {
                    lat: Number.parseFloat(latitude), 
                    lng: Number.parseFloat(longitude)
                }
                
                const calculatedDist = distanceCalc(storeLoc, providedLoc)

                if(calculatedDist < distance) {
                    // If less than request distance, add it to the return array. Also add the distance to the object to show on the UI.
                    store.distance = calculatedDist
                    nearByStores.push(store)
                }
            })
            // Sort so closest is displayed first.
            nearByStores = nearByStores.sort(function(a, b){
                return a.distance - b.distance
            })
            
            var response = {
                    "statusCode": 200,
                    "body": JSON.stringify(nearByStores),
                }
            callback(null, response)
        }
    })
}

// Haversine formula for converting two points of the earth to miles 
// reference https://www.movable-type.co.uk/scripts/latlong.html
function distanceCalc(point1, point2) {
  
    var R = 6371 // Radius of the earth in km
    var dLat = (point2.lat - point1.lat) * Math.PI / 180  // deg2rad below
    var dLon = (point2.lng - point1.lng) * Math.PI / 180
    var a = 
       0.5 - Math.cos(dLat)/2 + 
       Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
       (1 - Math.cos(dLon))/2
    var d = R * 2 * Math.asin(Math.sqrt(a))
  
    //this returns all measurements in KM , lets format this as miles.
    var miles = d/1.609344
    
    return miles
}