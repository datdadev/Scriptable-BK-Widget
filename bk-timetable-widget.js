/* --------------------------------------------------------------
Script: bk-timetable-widget
Author: DatDaDev
Version: 0.0.1
Description:
- Displays the today's and tomorrow's timetable of subjects for students studying at Ho Chi Minh University of Techology (HCMUT).
- Better works with medium-sized or larger size iOS widget for the better view.
Usage: Visit https://github.com/datdadev/BK-Widget
-------------------------------------------------------------- */

const widget = new ListWidget();

const currentDate = new Date();
// The widget will be refreshed in every 1 hour.
widget.refreshAfterDate = new Date(currentDate.now + (3600*1000));

// Get weekNumber of current week
startDate = new Date(currentDate.getFullYear(), 0, 1);
var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
var weekNumber = Math.ceil(days / 7);
const weekDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const currentDay = currentDate.getDay()+1;

let gradient = new LinearGradient();
const colorA = Color.dynamic(new Color("EFCDDF"), Color.orange())
const colorB = Color.dynamic(new Color("FFED80"), Color.blue())
gradient.colors = [colorA, colorB];
gradient.locations = [-2.5,2.5]

widget.backgroundGradient = gradient;

Script.setWidget(widget);
Script.complete();

let errorText = "Please input your timetable correctly in widget's parameter!";
function Error(){
  let gradient = new LinearGradient();
  gradient.colors = [Color.black(), Color.black()];
  widget.backgroundGradient = gradient;
  
  const stack = widget.addStack();
  stack.addSpacer();
	const alert = stack.addText(errorText);
	alert.centerAlignText();
  alert.font = Font.boldSystemFont(20);
  alert.textColor = Color.red();
  stack.addSpacer();
	widget.presentMedium();
	return;
}

let timetable = String(args.widgetParameter);
if(timetable != "")
{
  // Analyze the information
  let subjectsDetail = [];
	subjects = timetable.split(/\ (?=[A-Z0-9]{6}\t)/)
	for(let i = 0; i < subjects.length; i++)
  	subjectsDetail.push(subjects[i].split(/\t/));
  
  let stack = widget.addStack();
  let hStack1 = widget.addStack();
  hStack1.layoutHorizontally();
  
  let hStack2 = widget.addStack();
  hStack2.layoutHorizontally();
  let vStack1 = hStack2.addStack();
  hStack2.addSpacer();
  hStack2.addSpacer(1);
  hStack2.addSpacer();
  let vStack2 = hStack2.addStack();
  vStack1.layoutVertically();
  vStack2.layoutVertically();
  
  function Calculation(week, day, i, j, vStack)
  {
  	if(week == subjectsDetail[i][10][j])
    {
      if(parseInt(subjectsDetail[i][5]) == day)
    	{
        vStack.addSpacer(7.5)
      	subject = vStack.addText(subjectsDetail[i][1]);
      	subject.font = Font.boldSystemFont(14)
      	detail = vStack.addText(subjectsDetail[i][7] + ` [${subjectsDetail[i][8]}]`);
      	detail.font = Font.systemFont(10);
        return 1;
    	}
    }
    return 0;
  }
  
  // Throw error if somethings went wrong
  try{
  let noClassCheck = [0, 0];
  // Checking date&time then output
  for(let i = 0; i < subjectsDetail.length; i++)
  {
   	if(subjectsDetail[i][10].match(/\w+\|/gm) != null)
    {
      let arr = subjectsDetail[i][10].match(/\w+\|/gm).map(
    		function(n){ 
      		return parseInt(n.replace(/\|/g,''));
    		}
  		);
  		// Replace the parsed studyWeek into the its former index
  		subjectsDetail[i].splice(10, 1, Array.from(arr));
    }
    
    for(let j = 0; j < subjectsDetail[i][10].length; j++)
    { 
      noClassCheck[0] = (noClassCheck[0] | Calculation(weekNumber, currentDay, i, j, vStack1));
      
      let nextWeekNumber = weekNumber;
      let nextDay = currentDay + 1;
      if(currentDay == 1)
      {
      	nextWeekNumber++;
        nextDay = 2;
      }
      noClassCheck[1] = (noClassCheck[1] | Calculation(nextWeekNumber, nextDay, i, j, vStack2));
    }
  }
  
  // Checking if class is available or not then ouput it
	for(let i = 0; i < 2; i++)
  {
    if(noClassCheck[i] == 0)
    {
    	let stack = 0;
      if(i == 0)
      	stack = vStack1;
      else
      	stack = vStack2;
      stack.addSpacer(7.5)
    	const text = stack.addText("No Class")
      text.font = Font.italicSystemFont(14)
    }
  }}catch(e){
    Error();
    return;
  }

	// Titile showing weekNumber and currentDay
	const todayText = hStack1.addText(String(currentDate.getDate()));
  todayText.textOpacity = 0.35;
  hStack1.addSpacer();
  const weekText = hStack1.addText("Week " + String(weekNumber) + " - " + weekDay[currentDay - 1]);
  weekText.centerAlignText();
  weekText.font = Font.blackSystemFont(18);
  hStack1.addSpacer();
  const nextDay = new Date(currentDate);
	nextDay.setDate(currentDate.getDate() + 1);
	const tomorrowText = hStack1.addText(String(nextDay.getDate()));
  tomorrowText.textOpacity = 0.35;
  
  widget.addSpacer();
	widget.presentMedium();
}
else
{
  return Error();
}
