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