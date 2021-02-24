db.projectlists.createIndex( { "projectId": 1, 'name': 1 }, { name: "projectLists_projectId_name", unique: true } );

db.projectlists.dropIndex( { "projectLists_createdBy_name": 1 } );


db.users.updateMany({},{$set: { integrations: {}}});

db.datasources.updateMany({},{$unset: {price : []}});

db.datasources.update({ key: "sweetStarterPack"}, {$set: {logos: ["/images/logos/Group_13.png", "images/logos/combinedLogos.png"]}});

db.users.updateMany({},{$set:{verified: true}});

db.datasources.updateMany({},{$set: {prices: {
    year: "399",
    month: "50"}}});


// updates below here!

db.createView("projectlist_counts","projectlists",[
        {
            $project: {
                "projectId" : 1.0,
                "createdBy": 1.0
            }
        },
        {
            $group: {
                _id : "$projectId",
                projectId: { $last : "$projectId"},
                createdBy: { $last : "$createdBy"},
                "count" : { "$sum" : 1.0 }
            }
        },
    ]
);

db.datasources.update({ key: "sweetStarterPack"}, {$set: {label: "Sweet Starter Pack"}});
