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
    l1Date: null, l2Date: null, l3Date: null,
    m1Date: null, m2Date: null, m3Date: null,
    h1Date: null, h2Date: null, h3Date: null,
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
            username: username, userId: userID, rank: rank, 
            l1: l1, l2: l2, l3: l3, m1: m1, m2: m2, m3: m3, h1: h1, h2: h2, h3: h3,
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
    // d1 is base database sheet
    for(i in d1){
        var flagInGroup = false;
        for(j in d2){
            //case in group and in database = update

            //found username
            if(d1[i].username == d2[j].username){
                flagInGroup = true;
                
                count++
                if(d1[i].rank != d2[j].rank){
                    const entry = {
                        username: d2[j].username,
                        userId: d2[j].userId,
                        rank: d2[j].rank,
                        action: "update"
                    }
                    databaseSheet.push(entry)
                }
            }

        }
        //case in database but not in group = remove 
        if(flagInGroup == false){
            const entry = {
                username: d1[i].username,
                userId: d1[i].userId,
                rank: d1[i].rank,
                action: "remove"
            }
            databaseSheet.push(entry)
        }
    }
    //case in group but not in sheet
    for(j in d2){
        var flagInSheet = false;
        for(i in d1){
            if(d1[i].username == d2[j].username){
                flagInSheet = true;
            }
        }
        if(flagInSheet == false){
            const entry = {
                username: d2[j].username,
                userId: d2[j].userId,
                rank: d2[j].rank,
                action: "addition"
            }
            databaseSheet.push(entry)
        }
    }
    Logger.log(count)
    return databaseSheet
}

/**
 * uses the d1 base database (sheets) and process the list of entries in e1.
 * returns the updated database to parse onto the sheet.
 */
function setDatabase(d1, e1){

}

/**
 * updates the sheets with the database object
 * pulls the formula down
 */
function updateSheet(d1){

}

/**
 * sorts the sheet by the existing sort parameter
 */
function sortSheet(){

}

// if group, not database = addition to database
// if not group, database = removal from database
// if group, and database = update

function meow(){
    var list1 = databaseFromSheet()
    var list2 = databaseFromGroup()
    var compare = compareDatabases(list1, list2)
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    for(i in compare){
        Logger.log(compare[i])
        
    }

    Logger.log(date)
}
