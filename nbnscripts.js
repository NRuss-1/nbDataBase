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
 * creates a database structure from the group
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
            for(var j = 0; j < allData.data.length; j++){
                // fetches the username for the specific object
                usernameGet = ("username" in allData.data[j] ? (allData.data[j]['username']) : '');
                userIdGet = ("userId" in allData.data[j] ? (allData.data[j]['userId']) : '');
                
                // creates a user object and pushes it onto the sample database
                if (username != undefined){
                    const user = {
                        username: usernameGet,
                        userId: userIdGet,
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

/**
 * create a database structure from the sheet
 */
function databaseFromSheet(){
    var databaseSheet = []
    var main = SpreadsheetApp.getActive().getSheetByName("Main");
    main.activate();
    var last = main.getLastRow()
    var values = main.getDataRange().getValues()
    for(var i = 9; i < last; i++){
        var username = values[i][1]
        var userID = values[i][2]
        var rank = values[i][3]
        var l1 = values[i][6]
        var l2 = values[i][8]
        var l3 = values[i][10]
        var m1 = values[i][13]
        var m2 = values[i][16]
        var m3 = values[i][19]
        var h1 = values[i][22]
        var h2 = values[i][25]
        var h3 = values[i][28]

        const user = {
            username: username,
            userId: userID,
            rank: rank,
            l1: l1,
            l2: l2,
            l3: l3,
            m1: m1,
            m2: m2,
            m3: m3,
            h1: h1,
            h2: h2,
            h3: h3,
        }
        databaseSheet.push(user)
    }
    return databaseSheet
}

/**
 * compares 2 databases and returns entires that are different
 * d1 should be base database (sheet), d2 should be new database (group)
 */
function compareDatabases(d1, d2){
    var databaseSheet = []
    var count = 0
    // double for loop to search
    for(i in d1){
        
        for(j in d2){
            //if it equals name, then match
            if(d1[i].username == d2[j].username){
                Logger.log(d1[i].username)
                count++
                if(d1[i].rank != d2[j].rank){
                    const user = {
                        username: d2[j].username,
                        userId: d2[j].userId,
                        rank: d2[j].rank
                    }
                    databaseSheet.push(user)
                }
            }
        }
    }
    Logger.log(count)
    return databaseSheet
}

function meow(){
    var list1 = databaseFromSheet()
    Logger.log("meow1")
    var list2 = databaseFromGroup()
    Logger.log("meow2")
    var compare = compareDatabases(list1, list2)
    for(i in compare){
        Logger.log(compare[i])
        
    }
    
}
