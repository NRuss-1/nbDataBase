var cellUsername = ["D3","B"];
var cellSecondaryUsername = ["D5","C"];
var cellRank = ["D7","E"];
var cellDateJoined = ["D9","G"];
var cellAbleDate = ["D11","I"];
var cellMidDate = ["D13","K"];
var cellLieuDate = ["D15","N"];
var cellCmndDate = ["D17","Q"];
var cellCapDate = ["D19","T"];
var cellCommDate = ["D21","W"];
var cellVAdmDate = ["D23","Z"];
var cellAdmDate = ["D25","AC"];

function cnm() {
  var spreadsheet = SpreadsheetApp.getActive().getSheetByName("CurrentNavyMembers");
  spreadsheet.getRange('J2:M996').activate();
  spreadsheet.setCurrentCell(spreadsheet.getRange('L996'));
  spreadsheet.getRange('J2:M2').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
}
function getUserID(username){

  var payload = JSON.stringify({
  
  'usernames': [
	username
  ],
  'excludeBannedUsers': false,
  })

  Logger.log(payload)

  var headers = {
  
  'Content-Type': 'application/json',
  }

  var options = {
  'method': 'POST',
  'payload': payload,
  'contentType': 'application/json',
  'headers': headers,

  };

  var userIdFetch = JSON.parse(UrlFetchApp.fetch('https://users.roblox.com/v1/usernames/users', options).getContentText());
  Logger.log(userIdFetch);
  var userId = ("id" in userIdFetch.data[0] ? (userIdFetch.data[0]['id']) : '')
  Logger.log(userId)
  return userId
}


function getImage(my_username){

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSS = ss.getSheetByName("Dashboard");
  username = my_username
  formSS.getImages().map(function(img){img.remove();});

  Logger.log(username)

  var userId = getUserID(username)

  Logger.log(userId)

  var imageFetch = JSON.parse(UrlFetchApp.fetch("https://thumbnails.roblox.com/v1/users/avatar?userIds=" + userId + "&size=420x420&format=Png&isCircular=false").getContentText());


  var headshot = ("imageUrl" in imageFetch.data[0] ? (imageFetch.data[0]['imageUrl']) : '')
  Logger.log(headshot)
  formSS.insertImage(headshot, 10, 30);
  
  
  
}

function submitData(){
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSS = ss.getSheetByName("Dashboard");
  var datasheet = SpreadsheetApp.getActive().getSheetByName("Main");
  var concatsheet = SpreadsheetApp.getActive().getSheetByName("concatnames");
  var lastrow = datasheet.getLastRow();

  var action = formSS.getRange(2,1).getValue();
  var my_secondaryname = formSS.getRange(cellSecondaryUsername[0]).getValue();
  var my_rank = formSS.getRange(cellRank[0]).getValue();
  var my_joindate = formSS.getRange(cellDateJoined[0]).getValue();
  var my_abledate = formSS.getRange(cellAbleDate[0]).getValue();
  var my_middate = formSS.getRange(cellMidDate[0]).getValue();
  var my_lieudate =formSS.getRange(cellLieuDate[0]).getValue();
  var my_cmnddate = formSS.getRange(cellCmndDate[0]).getValue();
  var my_capddate = formSS.getRange(cellCapDate[0]).getValue();
  var my_commdate = formSS.getRange(cellCommDate[0]).getValue();
  var my_vadmdate = formSS.getRange(cellVAdmDate[0]).getValue();
  var my_admdate = formSS.getRange(cellAdmDate[0]).getValue();
  var my_username = formSS.getRange(3,4).getValue();

  var rankInGroup = checkRank(my_username);
  Logger.log("Rank in group: " + rankInGroup)
  if (rankInGroup != 1){
  Logger.log("passed 1")
  if (rankInGroup != my_rank){
	my_rank = rankInGroup
	if (rankInGroup == "Citizen"){
	if (my_rank == "Citizen"){
	  my_rank = "Crewman"
	}
	}
	Logger.log("New rank in group: " + my_rank)
  }
  }
if (action == "Entry") { //input
	var values = [[
		 my_username,my_secondaryname,'',my_rank,'',my_joindate,'',my_abledate,'',my_middate,'','',my_lieudate,'','',my_cmnddate,'','',my_capddate,'','', my_commdate,'','', my_vadmdate,'','', my_admdate
		]];
	if (findInRow(my_username) == -1){
	concatsheet.insertRowAfter(concatsheet.getLastRow())
	datasheet.insertRowAfter(datasheet.getLastRow())
	datasheet.getRange(datasheet.getLastRow()+1, 2, 1, 28).setValues(values);
	concat();
	UpdateRankOrder();
	clear_screen();
	} 
	else{
	SpreadsheetApp.getUi().alert("This user already exists on the database, please edit their existing value!")
	}
  } else if (action == "Update/Search") { //update mode
	if (findInRow(my_username) == -1){
	SpreadsheetApp.getUi().alert("User does not exist on this database.. You can add them in the 'Entry' tab.")
	}
	else{
	  var rowIndex = findInRow(my_username)+8;
  var rangesToSetValues = [cellUsername[1], cellSecondaryUsername[1], cellRank[1], cellDateJoined[1], cellAbleDate[1], cellMidDate[1], cellLieuDate[1], cellCmndDate[1],cellCapDate[1], cellCommDate[1], cellVAdmDate[1],cellAdmDate[1]];
  var values = [
		 my_username,my_secondaryname,my_rank,my_joindate,my_abledate,my_middate,my_lieudate,my_cmnddate,my_capddate,my_commdate,my_vadmdate,my_admdate
		];
  for (var i=0; i<rangesToSetValues.length; i++) {
	Logger.log(ss.getActiveSheet())
	Logger.log(rangesToSetValues[i]+rowIndex)
	datasheet.getRange(rangesToSetValues[i]+rowIndex).setValue(values[i]);

   }
  UpdateRankOrder();
  }
  } else { //remove mode
	 if (findInRow(my_username) == -1){
	SpreadsheetApp.getUi().alert("User does not exist on this database..")
	}
	else{
	  var response = ui.alert("This will remove the selected user's data from the database. Are you sure you wish to continue?",ui.ButtonSet.YES_NO);
	  if (response == ui.Button.YES){
	  var rowIndex = findInRow(my_username)+8;
	  datasheet.deleteRow(rowIndex)
	  concatsheet.deleteRow(rowIndex + 1)
   }
	UpdateRankOrder();
	concat();
	}     
  }
  }


function findInRow(my_username) {
  var sheetDatabase = SpreadsheetApp.getActive().getSheetByName('Main');
  var rows  = sheetDatabase.getRange("B10:B").getValues();

  for (var r=0; r<rows.length; r++) {
  if ( rows[r][0].toString().toLowerCase() == my_username.toString().toLowerCase() ) {
	Logger.log(r+2)
	return r+2;
  }
  }
  Logger.log(-1)
  return -1;

}


function clear_screen() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var rangesToClear = [cellUsername[0], cellSecondaryUsername[0], cellRank[0], 
	cellDateJoined[0], cellAbleDate[0], cellMidDate[0], cellLieuDate[0], cellCmndDate[0], cellCapDate[0], cellCommDate[0], cellVAdmDate[0],cellAdmDate[0]];
  for (var i=0; i<rangesToClear.length; i++) {
  	sheet.getRange(rangesToClear[i]).clearContent();
  }
  sheet.getRange(cellSecondaryUsername[0]).setValue("No Secondary Name")
  var myCellUsername = sheet.getRange(cellUsername[0]);
  myCellUsername.activateAsCurrentCell();

}

function clear_dates() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var rangesToClear = [cellSecondaryUsername[0], cellRank[0], cellDateJoined[0], cellAbleDate[0], 
	cellMidDate[0], cellLieuDate[0], cellCmndDate[0],cellCapDate[0], cellCommDate[0], cellVAdmDate[0],cellAdmDate[0]];
  debugger
  for (var i=0; i<rangesToClear.length; i++) {
  	debugger
  	sheet.getRange(rangesToClear[i]).clearContent();
  	debugger
  }
  sheet.getRange(cellSecondaryUsername[0]).setValue("No Secondary Name")
  var myCellUsername = sheet.getRange(cellUsername[0]);
  myCellUsername.activateAsCurrentCell();

}

function concat() {
  var spreadsheet = SpreadsheetApp.getActive().getSheetByName('concatnames');
  var dashboard = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var lastrow = spreadsheet.getLastRow() + 1
  spreadsheet.getRange('A10:D' + lastrow).activate();
  spreadsheet.getRange('A10:D10').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  dashboard.setCurrentCell(dashboard.getRange('A1'));
};


function UpdateRankOrder() {
  var spreadsheet = SpreadsheetApp.getActive().getSheetByName('Main');
  var lastrow = spreadsheet.getLastRow()
  spreadsheet.getRange('D9:D' + lastrow).activate();
  spreadsheet.getRange('D9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('8:8').activate();
  spreadsheet.showRows(8, 1);
  spreadsheet.getRange('D8').activate();
  spreadsheet.getFilter().sort(4, true);
  spreadsheet.getRange('H9:H' + lastrow).activate();
  spreadsheet.getRange('H9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('J9:J'+ lastrow).activate();
  spreadsheet.getRange('J9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('L9:M'+ lastrow).activate();
  spreadsheet.getRange('L9:M9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('O9:P'+lastrow).activate();
  spreadsheet.getRange('O9:P9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('R9:S'+lastrow).activate();
  spreadsheet.getRange('R9:S9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('U9:V'+lastrow).activate();
  spreadsheet.getRange('U9:V9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('X9:Y'+lastrow).activate();
  spreadsheet.getRange('X9:Y9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('AA9:AB'+lastrow).activate();
  spreadsheet.getRange('AA9:AB9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('AD9:AE'+lastrow).activate();
  spreadsheet.getRange('AD9:AE9').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange('9:9').activate();
  spreadsheet.hideRows(spreadsheet.getActiveRange().getRow(), spreadsheet.getActiveRange().getNumRows());
  spreadsheet.getRange('10:10').activate();
  spreadsheet.getRange('D:D').activate();
  spreadsheet.hideColumns(spreadsheet.getActiveRange().getColumn(), spreadsheet.getActiveRange().getNumColumns());
  spreadsheet.getRange('E:E').activate();
};


function getMember(my_username) {
  var sheetData = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var rangesToSetValues = [cellUsername[0], cellSecondaryUsername[0], cellRank[0], cellDateJoined[0], cellAbleDate[0], cellMidDate[0], cellLieuDate[0], cellCmndDate[0],cellCapDate[0], cellCommDate[0], cellVAdmDate[0],cellAdmDate[0]]
  var rowIndex = findInRow(my_username)+8;
  if (rowIndex != 7){
  var sheetDatabase = SpreadsheetApp.getActive().getSheetByName('Main');

	var values = [
		  sheetDatabase.getRange(cellUsername[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellSecondaryUsername[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellRank[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellDateJoined[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellAbleDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellMidDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellLieuDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellCmndDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellCapDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellCommDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellVAdmDate[1]+rowIndex).getValue(),
		  sheetDatabase.getRange(cellAdmDate[1]+rowIndex).getValue(),
		  ];
	for (var i=0; i<rangesToSetValues.length; i++) {
	sheetData.getRange(rangesToSetValues[i]).setValue(values[i]);
  }
  getImage(my_username)
  }
  else{
  SpreadsheetApp.getUi().alert("User does not exist on this database.. You can add them in the 'Entry' tab.")
  }
}


function lookUpId(my_username) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSS = ss.getSheetByName("Dashboard");
  var action = formSS.getRange(2,1).getValue();
  if (action == "Entry")  { //Data Centre mode
  	clear_dates();
  }
  else { //lookup mode
  	getMember(my_username);
  }
}

function onSearch() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var my_username = sheet.getRange(cellUsername[0]).getValue();
  var action = sheet.getRange(2,1).getValue();
  var userId = getUserID(my_username)
  var url = "https://www.roblox.com/users/"+userId+"/profile"
  if (action == "Update/Search"){
  	sheet.getRange(2,10).setFormula("=HYPERLINK("+'"'+url+'"'+","+'"'+"Roblox Profile"+'"'+")")
  	if (my_username != ""){
		clear_dates();
		lookUpId(my_username);
  	}
  	else {
		clear_dates();
  	}
  }
  else {
  	SpreadsheetApp.getUi().alert("You cannot search on this mode! Please switch to the 'Update/Search' tab.")
  }
}


function onEdit(e) {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Dashboard');
  var rangeRowId = sheet.getActiveCell().getRow();
  var rangeColId = sheet.getActiveCell().getColumn();
  if(rangeRowId == 2 && rangeColId == 1) {
  	var action = sheet.getRange(2,1).getValue();
  	if (action == "Entry"){
		sheet.getImages().map(function(img){img.remove();})
		clear_dates();
		sheet.getRange(7,4).setValue("Crewman")
		}	
 }
  if(rangeRowId == 3 && rangeColId == 4) {
  var my_username = sheet.getRange(3,4).getValue();
  if (my_username == ""){
	clear_dates();
  }
  }
}


function groupCheck(){
	groupObj.playerObj.username.rank


  var sheet = SpreadsheetApp.getActive().getSheetByName('CurrentNavyMembers');
  sheet.getRange('A2:B1000').clearContent()
  var num = 1
  var roleData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles").getContentText());
  for (var i=2; i<12; i++) {
  Logger.log(i)
  var roleId = ("id" in roleData.roles[i] ? (roleData.roles[i]['id']) : '');
  Logger.log(roleId)
  var allData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles/" + roleId + "/users?sortOrder=Asc&limit=100").getContentText());
  var nextPageCursor = ('nextPageCursor' in allData ? (allData['nextPageCursor']) : '');
  var username = ""

	num = num
	var rankFetch = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/roles?ids=" + roleId).getContentText());
	var rank = ("name" in rankFetch.data[0] ? (rankFetch.data[0]['name']) : '');
	var done = false
	while (done != true){
	for (var n=0; n<allData.data.length; n++) {
	  username = ("username" in allData.data[n] ? (allData.data[n]['username']) : '');
	  if (username != undefined){
	  	Logger.log(username)
	  	Logger.log(num)
	  	sheet.getRange(num+1,1).setValue(username)
	  	sheet.getRange(num+1,2).setValue(rank)
	  	num = num + 1
	  }
	}
	nextPageCursor = ('nextPageCursor' in allData ? (allData['nextPageCursor']) : '');
	if (nextPageCursor == null){
		done = true
		Logger.log(done)}
	else{
		allData = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/groups/2845412/roles/" + roleId + "/users?sortOrder=Asc&limit=100&cursor=" + nextPageCursor).getContentText());
	}
	}

  }
  cnm()
}



function checkRank(my_username){
  //get user id
  var userId = getUserID(my_username);
  Logger.log(userId)

  var group = ""
  var groupsFetch = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v2/users/" + userId + "/groups/roles").getContentText());
  Logger.log(groupsFetch.data.length)
  for (var i = 0; i<groupsFetch.data.length; i++){
  var groupData = ('name' in groupsFetch.data[i].group ? (groupsFetch.data[i].group['name']) : '')
  Logger.log (groupData);
  if (groupData == "Nova Balreska"){
	var roleId = ('id' in groupsFetch.data[i].role ? (groupsFetch.data[i].role['id']) : '')
	var inGroup = "Yes"
	Logger.log("Role ID: " + roleId)
  }
  }
  if (inGroup == "Yes"){
	//check rank in group  
	var rankFetch = JSON.parse(UrlFetchApp.fetch("https://groups.roblox.com/v1/roles?ids=" + roleId).getContentText());
	var my_rank = ("name" in rankFetch.data[0] ? (rankFetch.data[0]['name']) : '');
	Logger.log("Rank: " + my_rank)
	return my_rank
  }
  else{
	return 1
  }

}


function mass(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSS = ss.getSheetByName("CurrentNavyMembers");
  var datasheet = SpreadsheetApp.getActive().getSheetByName("Main");

  var countRow = ["N15"]
  var count = formSS.getRange(countRow).getValue();
  var currentcount = count;
  Logger.log(count)

for ( var x = count - 1; x<201; x++){
  var massrank = ["R"+x]
  Logger.log(massrank)
var my_username = formSS.getRange(massrank).getValue();
var rowIndex = findInRow(my_username)+8;
  var rangesToSetValues = [cellUsername[1], cellSecondaryUsername[1], cellRank[1], cellDateJoined[1], cellAbleDate[1], cellMidDate[1], cellLieuDate[1], cellCmndDate[1],cellCapDate[1], cellCommDate[1], cellVAdmDate[1],cellAdmDate[1]];
  var values = [
		 "","","","","","","","","","","",""
		];
  for (var i=0; i<rangesToSetValues.length; i++) {
	Logger.log(ss.getActiveSheet())
	Logger.log(rangesToSetValues[i]+rowIndex)
	datasheet.getRange(rangesToSetValues[i]+rowIndex).setValue(values[i]);
  }
	formSS.getRange(countRow).setValue(currentcount + 1);
	currentcount = currentcount + 1
}
}


function massUserId(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSS = ss.getSheetByName("masstool");

  var countRow = ["I1"]
  var count = formSS.getRange(countRow).getValue();

for ( var x = count - 1; x<131; x++){
  var massrank = ["M"+x]
  var massrankid = ["N"+x]
  Logger.log(massrank)
var my_username = formSS.getRange(massrank).getValue();
var userId = getUserID(my_username);
formSS.getRange(massrankid).setValue(userId);

}
}

