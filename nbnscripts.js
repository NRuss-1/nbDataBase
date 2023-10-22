/**
 * nbnscript.js
 * author Alleycat Dig
 * functions that runs the nbn database
 */

// imports




// initialization of globals





/**
 * user object
 * consist of roblox name, roblox id, and rank in group
 * consist of low, mid, and high rank 1-3 dates for information
 */
const user = {
    username: "",
    userID: -1,
    rank: "",
    l1Date: null,
    l2Date: null,
    l3Date: null,
    m1Date: null,
    m2Date: null,
    m3Date: null,
    h1Date: null,
    h2Date: null,
    h3Date: null,
}

/**
 * database object
 * consists of array of users
 */
const nbdatabase = {
    mainList: []
}

/**
 * gets the user id
 */
function databaseFromGroup(){
    var groupsFetch = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles").getContentText());
    Logger.log(groupsFetch)

    // create a new database instance
    var databaseGroup = [];

    for (var i = 2; i < 12; i++) {
        
        // sets roledata and roleId
        var roleData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles").getContentText());
        var roleId = ("id" in roleData.roles[i] ? (roleData.roles[i]['id']) : '');
        // fetches the entire set of data from group
        var allData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles/" + roleId + "/users?sortOrder=Asc&limit=100").getContentText());

        // sets the next page cursor
        var nextPageCursor = ('nextPageCursor' in allData ? (allData['nextPageCursor']) : '');

        // gets username and rank
        var username = ""
        var rankFetch = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/roles?ids=" + roleId).getContentText());
        var rank = ("name" in rankFetch.data[0] ? (rankFetch.data[0]['name']) : '');

        while(true){
            for(var i = 0; j < allData.data.length; j++){
                // fetches the username for the specific object
                username = ("username" in allData.data[n] ? (allData.data[n]['username']) : '');
                
                // creates a user object and pushes it onto the sample database
                if (username != undefined){
                    const user = {
                        username: username,
                        userID: -1,       // TO BE IMPLEMENTED TBI
                        rank: rank
                    }
                    databaseGroup.push(user)
                }
            }
            nextPageCursor = ('nextPageCursor' in allData ? (allData['nextPageCursor']) : '');
            //breaks if on last page, else next page
            if (nextPageCursor == null){
                break
            }
            else{
                allData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles/" + roleId + "/users?sortOrder=Asc&limit=100&cursor=" + nextPageCursor).getContentText());
            }
        }
    }

    return databaseGroup
}

function meow(){
    var list1 = databaseFromGroup()
    Logger.log(list1)
}
