//****************************************************************
// TIMEKEEPER standalone Google Apps Script
//
// Co-op members can
// 1. log service hours to Google Sheet data storage
// 2. get a report of previously logged hours  
// 3. 'self-register' for app by adding their name to list
//
// David Wilder
// thereal.david.wilder@gmail.com
// webmaster@thecircleschool.org
// 2016-03-01
//
// *********************
// Helpful resources...
// *********************
// Touchspin spinner library
// http://www.virtuosoft.eu/code/bootstrap-touchspin/
//
// Bootstrap responsive function to work with standalone GAS -> viewport meta tag how to
// https://code.google.com/p/google-apps-script-issues/issues/detail?id=4659
//
// Bootstrap-Select jQuery plugin for select boxes
// https://silviomoreto.github.io/bootstrap-select/
//
// Google SpreadsheetApp API
// https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app
//
// Google Apps Script HTMLService API
// https://developers.google.com/apps-script/reference/html/
//
// HTML Service: Best Practices
// https://developers.google.com/apps-script/guides/html/best-practices
// jQuery note from Google Developers site
// 'We take special care to ensure that jQuery works with our Caja sanitization 
// and encourage developers to leverage it in their applications.'
//
//****************************************************************
// TO DO:
// X DONE! On tabbing to 'Check Time' blank out any existing time report XXXXXXX
// X DONE! Cache DOM selectors in variables XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// Use fewer ID and more class attributes
// Rename sheet variables to be more meaningful in this context - borrowed code from old app


//****************************************************************
// Spreadsheet key to Google Sheet storing data
// this key will change if a different sheet is used for data storage
// look at URL in browser address bar to see spreadsheet key - copy / paste as needed
// https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
var itemSpreadsheetKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Open the Google Sheet and reference specific sheets
var openedSS = SpreadsheetApp.openById(itemSpreadsheetKey);
var targetSheet = openedSS.getSheetByName("Form Responses 1");
var sourceSheet = openedSS.getSheetByName("Pivot Table Family Names"); //rename to nameSheet
var taskSheet = openedSS.getSheetByName("Sheet Coop Jobs");
var nameSheet = openedSS.getSheetByName("Sheet Family Names");



// use this form of 'doGet' with templating
function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1"); // need for bootstrap
}



//****************************************************************
// Get options for select drop downs - family names and co-op tasks
//****************************************************************

// NOT USED! for load select boxes in template
// per best practices not used - preference is for asynchronous loading
function getListItems(type){
var sheet = '';
  
  if(type === "names"){
   sheet = sourceSheet; 
  }
  else if(type === "tasks"){
    sheet = taskSheet;
  }

  if(sheet){ // is one of list types?
    var numRow = sheet.getLastRow() - 1; //-1 header row 
    return sheet.getRange(2, 1, numRow, 1).getValues(); 
  }

}

// Asynchronously load select boxes - Google preferred method vs template
// for load select boxes when called from browser 
function getListItemsHTML(type) {
  var sheet = '';
  var placeholder = '';
  
  if(type === "names"){
   sheet = sourceSheet; 
   placeholder = "<option value='placeholder'>Select Family Name</option>";
  }
  else if(type === "tasks"){
    sheet = taskSheet;
    placeholder = "<option value='placeholder'>Select Co-op Task</option>"
  }

  if(sheet){ // is one of list types?
    var numRow = sheet.getLastRow() - 1; //-1 header row //varies from alpha
    var list = sheet.getRange(2, 1, numRow, 1).getValues(); //varies from alpha
    var htmlList = '';
  
    htmlList += placeholder;
    
    list.forEach( function(item){
      htmlList += "<option value='" + item + "'>" + item + "</option>"
    });

    return htmlList;
  }
  //return error; //how to return error here !!!!!!!!!!!!!!!!!!!!!!
}



//****************************************************************
// Push log entry to db
//****************************************************************
function setCoopHours(name, job, date, hours, notes){
  var timeStamp = Utilities.formatDate(new Date(), openedSS.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:mm:ss"); //create timestamp
  
  // write to spreadsheet at bottom below existing data
  var lastRow = targetSheet.getLastRow();
  var targetRange = targetSheet.getRange(lastRow+1, 1, 1, 6).setValues([[timeStamp,name,hours,job,date,notes]]); 
}


//****************************************************************
// Add a family name to list - self-register
//****************************************************************
function setFamilyName(name){
  var lastRow = nameSheet.getLastRow();
  nameSheet.getRange(lastRow+1, 1).setValue([name]);
}

//****************************************************************
// Get a report of previously logged hours
//****************************************************************
function getTimeReport(name){
  var rawArray = targetSheet.getDataRange().getValues();
  var filArray = [];
  var tableString = '';
  var totalHrs = 0.0;
  
  // all records into array
  for(var i = 1; i < rawArray.length; i++){
    //filter by target name
    if( rawArray[i][1] === name){ 
      filArray.push( rawArray[i] );
    }
  }
  
  //header row
  tableString += "<tr><th>Name</th><th>Hours</th><th>Desc</th><th>Date</th><th>Notes</th></tr>";
  
  for(var j = 0; j < filArray.length; j++){
    totalHrs += filArray[j][2];
    
    tableString += "<tr><td>"+filArray[j][1]+ "</td><td>"+filArray[j][2]+ "</td><td>"  + 
        filArray[j][3]+ "</td><td class='text-nowrap'>" 
        + Utilities.formatDate(filArray[j][4] ,Session.getTimeZone(),"MM-dd-yyyy")
        + "</td><td>" +filArray[j][5]+ "</td></tr>";
  }  
  
  var total = "<tr><td>TOTAL</td><td>" + totalHrs.toFixed(2) + "</td></tr>";
  tableString = total +  tableString + total;

  return tableString;
}
