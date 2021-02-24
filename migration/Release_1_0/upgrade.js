db.users.createIndex( { "emailAddress": 1 }, { name: "users_emailAddress", unique: true } );

db.datasources.insertMany([{
    "_id" : ObjectId("59c1386f1b0ce92b2c467360"),
    "key" : "googleKGraph",
    "label" : "Google Knowledge Graph",
    "__v" : NumberInt(0),
    "isRecommended" : true,
    "description" : "Get information related to your search terms",
    "price" : "$9.99"
},
    {
        "_id" : ObjectId("59c138ab15c43b52bc778ef9"),
        "key" : "yelpCitySearch",
        "label" : "Yelp City Search",
        "__v" : NumberInt(0),
        "isRecommended" : true,
        "description" : "Great for industry and city information",
        "price" : "$9.99"
    },
    {
        "_id" : ObjectId("59c13d9315c43b52bc778efc"),
        "key" : "googleCustomSearch",
        "label" : "Google Custom Search",
        "__v" : NumberInt(0),
        "isRecommended" : true,
        "description" : "This is your basic google result set",
        "price" : "$9.99"
    },
    {
        "_id" : ObjectId("59c144bc15c43b2d94e9231b"),
        "key" : "bingSearch",
        "label" : "Azure Cognitive Services",
        "__v" : NumberInt(0),
        "isRecommended" : true,
        "description" : "Get information for a specific company",
        "price" : "$9.99"
    }]);

db.datasources.updateMany({},{$unset: {"isRecommended" : 1}});
db.datasources.updateMany({},{$set: {"price" : "19.99"}});

db.users.updateMany({},{$set: {subscriptions: []}});
db.users.updateMany({},{$unset: {firstName: 1, lastName: 1, }});

db.users.updateMany({},{$set: {
    company: "Acme",
    dateOfBirth: "1999/09/09",
    fullName: "test name",
    phoneNumber: '555-555-5555',
    termsOfSerive: true }});

db.datasources.updateMany({},{$set: {active: true}});

db.projectlists.createIndex( { "createdBy": 1, 'name': 1 }, { name: "projectLists_createdBy_name", unique: true } );

db.datasources.updateMany({},{$set: {logos: []}});
