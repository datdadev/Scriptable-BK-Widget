/* --------------------------------------------------------------
Script: bk-task-widget
Author: DatDaDev
Version: 0.0.1
Description:
- Show all available tasks (quizzes, assignments of subjects for students studying at Ho Chi Minh University of Techology (HCMUT)) in the current month through the calendar.
- Display up to 4 upcoming tasks in detail from present.
- Only available for medium-sized widget.
Usage: Visit https://github.com/datdadev/BK-Widget
-------------------------------------------------------------- */

let errorText = "Invalid token";
function Error(){
  let gradient = new LinearGradient();
  gradient.colors = [Color.black(), Color.black()];
  widget.backgroundGradient = gradient;
  
  const stack = widget.addStack();
  stack.addSpacer();
	const alert = stack.addText(errorText);
	alert.centerAlignText();
  alert.font = Font.boldSystemFont(24);
  alert.textColor = Color.red();
  stack.addSpacer();
	widget.presentMedium();
	return;
}

const daySpace = 6;
const rowSpace = 2.5;
const dayFont = Font.regularSystemFont(10.5);
let dayColor = Color.dynamic(Color.black(), Color.white());
const otherWeekDayColor = Color.dynamic(new Color('#000', 0.5), new Color('#ddd', 0.5));
const todayHighlight = 'ffcc3f';
const startTimeHighlight = 'd0f2c7';
const endTimeHighlight = 'ffd1fd';

let currentDate = new Date();
let currentDay = currentDate.getDate();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let widget = new ListWidget();
// The widget will be refreshed in every 3 hour.
widget.refreshAfterDate = new Date(currentDate.now + (3*3600*1000));

endOfPreviousMonth = new Date(currentDate.setDate(0));
endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
endOfNextMonth = new Date(currentYear, currentMonth + 2, 0);

let data = [];
function weekChecking(startTime, endTime, response)
{
    if(new Date(endOfPreviousMonth.getFullYear(), endOfPreviousMonth.getMonth(), 20).getTime() < startTime && startTime < new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), 10).getTime() || new Date(endOfPreviousMonth.getFullYear(), endOfPreviousMonth.getMonth(), 20).getTime() < endTime && endTime < new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), 10).getTime())
  		data.push([startTime, endTime, response["name"]]);
}

// Getting Data
let key = String(args.widgetParameter);
let quizzesReq = new Request(`https://e-learning.hcmut.edu.vn/webservice/rest/server.php?wstoken=${key}&wsfunction=mod_quiz_get_quizzes_by_courses&moodlewsrestformat=json`);
quizzesReq.method = "get";
let quizzesRes = await quizzesReq.loadJSON();
if(quizzesRes["message"] == "Invalid token - token not found")
	return Error();
quizzesRes["quizzes"].filter(
    function(quizz){
        startTime = quizz["timeopen"] * 1000;
        endTime = quizz["timeclose"] * 1000;
    	weekChecking(startTime, endTime, quizz);
	}
);
let assignmentsReq = new Request(`https://e-learning.hcmut.edu.vn/webservice/rest/server.php?wstoken=${key}&wsfunction=mod_assign_get_assignments&moodlewsrestformat=json`);
assignmentsReq.method = "get";
let assignmentsRes = await assignmentsReq.loadJSON();
for(let i = 0; i < assignmentsRes['courses'].length; i++)
{
	assignmentsRes["courses"][i]["assignments"].filter(
		function(assignment){
            startTime = assignment["allowsubmissionsfromdate"] * 1000;
        	endTime = assignment["duedate"] * 1000;
            weekChecking(startTime, endTime, assignment);
   		}
  	);
}

widget.addSpacer(6.5);
let mainStack = widget.addStack();
mainStack.layoutHorizontally();
let vStack1 = mainStack.addStack();
vStack1.layoutVertically();
mainStack.addSpacer();
let vStack2 = mainStack.addStack();
vStack2.layoutVertically();

// These for later check
let _data = data.map(x => [new Date(x[0]).setHours(0, 0, 0, 0), new Date(x[1]).setHours(0, 0, 0, 0), x[2]]);
let dataStartTime = _data.map(x => x[0]).flat();
let dataEndTime = _data.map(x => x[1]).flat();
let startTimeTaskDensity = {};
dataStartTime.forEach(function (x) { startTimeTaskDensity[x] = (startTimeTaskDensity[x] || 0) + 1; });
let endTimeTaskDensity = {};
dataEndTime.forEach(function (x) { endTimeTaskDensity[x] = (endTimeTaskDensity[x] || 0) + 1; });

// Building Calendar
const months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];
let monthStack = vStack2.addStack();
let monthText = monthStack.addText(months[currentMonth].toUpperCase());
monthText.font = Font.blackSystemFont(16);
vStack2.addSpacer(3.5);

// Calendar Header
const headerTexts = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
header = vStack2.addStack();
header.addSpacer(3);
for(let i = 0; i < 7; i++)
{
    let e = header.addStack();
    e.layoutHorizontally();
    e.setPadding(1.25, 0, 0, 0);
    e.size = new Size(10, 12.5);
    
    let text = e.addText(headerTexts[i]);
    text.font = Font.boldSystemFont(10.5);
    text.textColor = dayColor;
    text.centerAlignText();
    header.addSpacer(daySpace + 5);
}
vStack2.addSpacer(rowSpace);

let row = [];
let rowCount = 0;
let dayCount = 1;
const mondayOffset = 6;
widget.addSpacer(rowSpace);
for (let i = 0; i < 42; i++) {
  if (i % 7 == 0) {
      rowCount++;
      row[rowCount] = vStack2.addStack();
      vStack2.addSpacer(rowSpace);
  }
  if(i < mondayOffset) {
    let dayOffset = endOfPreviousMonth.getDate() - mondayOffset + 1 + i
    addDaysRow(new Date(endOfPreviousMonth.getFullYear(), endOfPreviousMonth.getMonth(), dayOffset), otherWeekDayColor, row[rowCount], true);
  }
  else if(i >= mondayOffset && i < endOfCurrentMonth.getDate() + mondayOffset)
  {
    addDaysRow(new Date(currentYear, currentMonth, dayCount), dayColor, row[rowCount]);
    dayCount++;
  }
  if(i >= endOfCurrentMonth.getDate() + mondayOffset)
  {
    if(i == endOfCurrentMonth.getDate() + mondayOffset)
    	dayCount = 0;
    dayCount++;
    addDaysRow(new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), dayCount), otherWeekDayColor, row[rowCount], true);
  }
  row[rowCount].addSpacer(daySpace);
}

function addDaysRow(date, color, row, otherWeekDay = false)
{
    dateTime = date.getTime();
    let e = row.addStack();
    e.layoutHorizontally();
    e.setPadding(1.25, 0, 0, 0);
    e.size = new Size(15, 15);
    if(dateTime == new Date(currentYear, currentMonth, currentDay).getTime() && !otherWeekDay)
    {
      e.setPadding(0, 0, 0, 0);
      const highlightedDate = dayHighlight(date.getDate().toString(), todayHighlight, 3);
      e.addImage(highlightedDate);
    }
    else if(dataStartTime.includes(dateTime) || dataEndTime.includes(dateTime))
    {
      e.setPadding(0, 0, 0, 0);
      highlightedDate = 0;
      if(dataStartTime.includes(dateTime))
      {
        highlightedDate = dayHighlight(date.getDate().toString(), startTimeHighlight, startTimeTaskDensity[dateTime], otherWeekDay);
      }
      else
      {
        highlightedDate = dayHighlight(date.getDate().toString(), endTimeHighlight, endTimeTaskDensity[dateTime], otherWeekDay);
      }
      e.addImage(highlightedDate);
    }
    else
    {
      let dayText = e.addText(date.getDate().toString());
      dayText.font = dayFont;
      dayText.textColor = color;
      dayText.centerAlignText();
    } 
}

function dayHighlight(day, highlight, _opacity = 1, otherWeekDay = false) {
  const drawContent = new DrawContext();
  const drawSize = 35;
  drawContent.size = new Size(drawSize, drawSize);
  drawContent.opaque = false;

  _opacity = 0.25 + 0.25 * _opacity - (otherWeekDay ? 0.2 : 0);
  drawContent.setFillColor(new Color(highlight, _opacity));
  drawContent.fillEllipse(new Rect(0, 0, drawSize, drawSize));
  
  drawContent.setFont(otherWeekDay ? Font.regularSystemFont(20) : Font.blackSystemFont(20));
  drawContent.setTextAlignedCenter();
  drawContent.setTextColor(Color.black());
  drawContent.drawTextInRect(day, new Rect(0, 5, drawSize - 1, drawSize - 1));
  
  return drawContent.getImage();
}

// Sorting Time
let sortedDataStartTime = [];
for(let i = 0; i < dataStartTime.length; i++)
	if(dataStartTime[i] >= new Date(currentYear, currentMonth, currentDay).getTime())
    	sortedDataStartTime.push([dataStartTime[i], 0]);
let sortedDataEndTime = [];
for(let i = 0; i < dataEndTime.length; i++)
	if(dataEndTime[i] >= new Date(currentYear, currentMonth, currentDay).getTime())
    	sortedDataEndTime.push([dataEndTime[i], 1]);
sortedDataTime = sortedDataEndTime.concat(sortedDataStartTime);
sortedDataTime.sort(sortFunction);

function sortFunction(x, y) {
    if (x[0] === y[0]) {
        return 0;
    }
    else {
        return (x[0] < y[0]) ? -1 : 1;
    }
}

// Show current and upcoming Tasks
let taskCount = 0;
let taskLimit = 4;
let hStack = [];
showingTask(sortedDataTime);

function showingTask(dataTime) // time = 0 -> Green; 1 -> Red
{
    for(let i = 0; i < dataTime.length; i++)
    {
        timeStamp = dataTime[i][0];
        time = dataTime[i][1];
        for(let j = 0; j < _data.length; j++)
        {
            if(taskCount >= taskLimit)
        			return;
        		if(_data[j][time] == timeStamp)
            {
                hStack[i] = vStack1.addStack();
                hStack[i].size = new Size(150, 30);
                hStack[i].addImage(bulletCircle(timeStamp, time));
                
                let vStack = [];
                hStack[i].addSpacer(10);
                vStack[i] = hStack[i].addStack();
                vStack[i].layoutVertically();
                taskText = vStack[i].addText(_data[j][2]);
                taskText.leftAlignText();
                taskText.font = Font.boldSystemFont(14);
                startDate = new Date(data[j][0]);
                endDate = new Date(data[j][1]);
                vStack[i].addSpacer(1);
                timeText = vStack[i].addText(`${startDate.getDate()}/${startDate.getMonth() + 1} [${pad(startDate.getHours())}:${pad(startDate.getMinutes())}] - ${endDate.getDate()}/${endDate.getMonth() + 1} [${pad(endDate.getHours())}:${pad(endDate.getMinutes())}]`);
                timeText.leftAlignText();
                timeText.font = Font.regularSystemFont(7.5);
                hStack[i].addSpacer();
                if(taskCount < taskLimit - 1)
                	vStack1.addSpacer(6.5);
                _data.splice(j, 1);
                data.splice(j, 1);
                taskCount++;
                break;
            }
        }
    }
}

function pad(val){
  return (val < 10) ? '0' + val : val;
}

function bulletCircle(date, time) // time = 0 -> Green; 1 -> Red
{
  const drawContent = new DrawContext();
  const drawSize = 37.5;
  drawContent.size = new Size(drawSize - 15, drawSize);
  drawContent.opaque = false;

  let color = 'fff';
  if(date == new Date(currentYear, currentMonth, currentDay).getTime())
    color = todayHighlight;
  else if(time == 0)
    color = startTimeHighlight;
  else
    color = endTimeHighlight;
  drawContent.setFillColor(new Color(color));
  drawContent.fillEllipse(new Rect(7.5, 12.5, drawSize - 25, drawSize - 25));
  
  return drawContent.getImage();
}

Script.setWidget(widget);
Script.complete();

widget.presentMedium();
