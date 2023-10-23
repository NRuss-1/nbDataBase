/**
 * nbnscript.js
 * author Alleycat peer reviewed by DrDig
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
    userId: -1,
    rank: "",
    dates: ["", "", "", "", "", "", "", "", "", ""]
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
    // gets main sheet from and sets active
    var databaseSheet = []
    var main = SpreadsheetApp.getActive().getSheetByName("Main");
    main.activate();
    var last = main.getLastRow()

    // gets the values into an array
    var values = main.getDataRange().getValues()

    // for loop that converts the sheets into entries 
    // loops through rows
    for(var i = 9; i < last; i++){
        // sets user parameters
        var username = values[i][1]
        var userId = values[i][2]
        var rank = values[i][3]
        // list of dates is a date array
        var dateArray =[values[i][6], values[i][8], values[i][10], values[i][12], values[i][15], values[i][18], values[i][21], values[i][24], values[i][27], values[i][30]]

        //pushes the user onto database object
        const user = {
            username: username, userId: userId, rank: rank, 
            dates: dateArray
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
    // d1 is base database sheet
    for(i in d1){
        var flagInGroup = false;
        for(j in d2){
            //case in group and in database = update

            //found username
            if(d1[i].username == d2[j].username){
                flagInGroup = true;
                
                // if matches username then add an entry for update
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
            //add an entry for removal
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
        //check if in sheet
        var flagInSheet = false;
        for(i in d1){
            if(d1[i].username == d2[j].username){
                flagInSheet = true;
            }
        }
        // if not in sheet, then add an entry for addition
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
    return databaseSheet
}
/**
 * helper function for set Database, gets and sets the date array
 */
function getDateArray(e1, e2, date){
    //sets the dates to old dates, or none if new entry
    if(e1 == null){
        var dateArray = ["", "", "", "", "", "", "", "", "", ""]
    } else{
        var dateArray = e1.dates
    }
    
    // copies new dates onto the old date array
    var rank = 0;
    if(e2.rank == "Crewman"){
        dateArray[0] = date
        rank = 0
    } else if(e2.rank == "Able Crewman"){
        dateArray[1] = date
        rank = 1
    } else if(e2.rank == "Specialist"){
        dateArray[2] = date
        rank = 2
    } else if(e2.rank == "Midshipman"){
        dateArray[3] = date
        rank = 3
    } else if(e2.rank == "Lieutenant"){
        dateArray[4] = date
        rank = 4
    } else if(e2.rank == "Commander"){
        dateArray[5] = date
        rank = 5
    } else if(e2.rank == "Captain"){
        dateArray[6] = date
        rank = 6
    } else if(e2.rank == "Commodore"){
        dateArray[7] = date
        rank = 7
    } else if(e2.rank == "Vice Admiral"){
        dateArray[8] = date
        rank = 8
    } else if(e2.rank == "Admiral"){
        dateArray[9] = date
        rank = 9
    }
    // sets every rank above current rank to none
    for(var j = rank + 1; j < 10; j++){
        dateArray[j] = ""
    }
    
    return dateArray
}
/**
 * uses the d1 base database (sheets) and process the list of entries in e1.
 * returns the updated database to parse onto the sheet.
 */
function setDatabase(d1, e1, date){
    
    // for every entry in e1 pushed
    for(i in e1){

        // if the entry is action, eg rank as crewman
        if(e1[i].action == "addition"){
            // sets up the date array to be used
            dateArray = getDateArray(null, e1[i], date)
            const entry = {
                username: e1[i].username,
                userId: e1[i].userId,
                rank: e1[i].rank,
                dates: dateArray
            }
            d1.push(entry)
        }
        else{
            for(j in d1){
                //matches the index to update or remove
                if(e1[i].username == d1[j].username){
                    //if action is remove
                    if(e1[i].action == "remove"){
                        d1.splice(j, 1)
                    } 
                    //else action is update
                    else if(e1[i].action == "update"){ 
                        // sets up the date array to be used
                        dateArray = getDateArray(d1[j], e1[i], date)

                        // sets the ranks
                        d1[j].rank = e1[i].rank
                        d1.dates = dateArray
                    }
                }
            }
        } //done with each entry
    } // done with all entries
    return d1

}

/**
 * gets the rank as a number, and returns
 * helper function for sort
 */
function getRankAsNumber(b){
    var rank2 = 0;
    if(b.rank == "Crewman"){
        rank2 = 0
    } else if(b.rank == "Able Crewman"){
        rank2 = 1
    } else if(b.rank == "Specialist"){
        rank2 = 2
    } else if(b.rank == "Midshipman"){
        rank2 = 3
    } else if(b.rank == "Lieutenant"){
        rank2 = 4
    } else if(b.rank == "Commander"){
        rank2 = 5
    } else if(b.rank == "Captain"){
        rank2 = 6
    } else if(b.rank == "Commodore"){
        rank2 = 7
    } else if(b.rank == "Vice Admiral"){
        rank2 = 8
    } else if(b.rank == "Admiral"){
        rank2 = 9
    }
    return rank2
}

/**
 * compare function for the sorter
 */
function compareByRankDate(a, b) {
    var ranka = getRankAsNumber(a)
    var rankb = getRankAsNumber(b)
    //if a is bigger than b means a is higher rank and comes BEFORE
    if (ranka > rankb) {
        return -1;
    // if a is smaller than b means a is a lower rank and comes AFTER
    } else if (ranka < rankb) {
        return 1;

    // else SAME RANK
    } else{
        // a date is less than b date = BEFORE
        if(a.dates[ranka] < b.dates[rankb]){
            return -1
        }
        // else it just comes after
        else{
            return 1
        }
    }
  }

/**
 * sorts the sheet by the existing sort parameter
 */
function sortSheet(d1){
    d1.sort(compareByRankDate)
    return d1
}

/**
 * function that gets the username, userid, and rank in a 2d array
 * returns a 2d array in row major, eg [[b5, c5], [b6, c6]]
 */
function getUserInfo(d1){
    var result = []
    for(var i = 0; i < d1.length; i++){
        row = [d1[i].username, d1[i].userId, d1[i].rank]
        result.push(row)
    }
    return result
}

/**
 * function that gets the dates in a 2d array, skips certain ones
 * returns a 2d array in row major, eg [[b5, c5], [b6, c6]]
 */
function getDatesInfo(d1){
    var result = []
    for(var i = 0; i < d1.length; i++){
        var dates = d1[i].dates
        // dates with seperators
        row = [dates[0], "", dates[1], "", dates[2], "", dates[3], "", "", 
            dates[4], "", "", dates[5], "", "", dates[6], "", "",
            dates[7], "", "", dates[8], "", "", dates[9], "", ""]
        result.push(row)
    }
    return result
}
/**
 * updates the sheets with the database object
 * pulls the formula down
 */
function updateSheet(d1){
    // gets main sheet from and sets active
    var databaseSheet = []
    var main = SpreadsheetApp.getActive().getSheetByName("Main");
    main.activate();
    var last = main.getLastRow()
    var targetRows = d1.length + 9
    // add the required amount of rows
    if(targetRows > last){
        main.insertRowsAfter(last, targetRows - last)
    }
    // or remove if smaller
    else if(targetRows < last){
        main.deleteRows(last - (last - targetRows), last - targetRows)
    }
    // else nothing happens

    // paste in the data from d1 from users header information
    var userInfoRange = main.getRange("B10:D" + targetRows)
    
    userInfoRange.setValues(getUserInfo(d1))

    // paste in the data from d1 from users dates information
    var userInfoRange2 = main.getRange("G10:AG" + targetRows)
    
    userInfoRange2.setValues(getDatesInfo(d1))

    // pull down the formulas from the formula row

    // array in [copy from, copy to range] format
    var l1e = [main.getRange('H9'), main.getRange('H9:H')]
    var l2e = [main.getRange('J9'), main.getRange('J9:J')]
    var l3e = [main.getRange('L9'), main.getRange('L9:L')]
    var l4e = [main.getRange('N9:O9'), main.getRange('N9:O')]
    var m1e = [main.getRange('Q9:R9'), main.getRange('Q9:R')]
    var m2e = [main.getRange('T9:U9'), main.getRange('T9:U')]
    var m3e = [main.getRange('W9:X9'), main.getRange('W9:X')]
    var h1e = [main.getRange('Z9:AA9'), main.getRange('Z9:AA')]
    var h2e = [main.getRange('AC9:AD9'), main.getRange('AC9:AD')]
    var h3e = [main.getRange('AF9:AG9'), main.getRange('AF9:AG')]
    var ms = [main.getRange('AI9:AL9'), main.getRange('AI9:AL')]
    var eventArray = [l1e, l2e, l3e, l4e, m1e, m2e, m3e, h1e, h2e, h3e, ms]

    // copys down the formulas
    for(var i = 0; i < eventArray.length; i++){
        eventArray[i][0].copyTo(eventArray[i][1], SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false)
    }
    // hide the hidden rows/columns
    var userHidec= main.getRange("E:E")
    main.hideColumn(userHidec)
    var userHider= main.getRange("9:9")
    main.hideRow(userHider)
}   

// if group, not database = addition to database
// if not group, database = removal from database
// if group, and database = update

/**
 * main (meow) function, automatically update it
 */
function meow(){
    //gets base list and dest list
    var list1 = databaseFromSheet()
    Logger.log("from sheet completed")
    var list2 = databaseFromGroup()
    Logger.log("from group completed")
    // compare and return the differences
    var compare = compareDatabases(list1, list2)

    // sets up date
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // process the entries from compare onto base
    var result = setDatabase(list1, compare, date);

    // sorts the list
    var sortedResult = sortSheet(result)
    Logger.log("processing completed")

    // update the spreadsheet to hasve the new base
    updateSheet(sortedResult);
    Logger.log("updating completed")

}

/**
 * manual override update function, macros and runs the sheet
 */
function meowMacro(){
    meow()
}
