/*
	ADD DROP DOWNS TO THE REGULAR BUGS
*/
var values = [
["", "To do", "To Investigate", "To Test", "Waiting for answer", "Needs BA/discussion", "WIP", "Awaiting code review", "To Redo/fix", "Ready for check-in", "Checked in", "Done"]
/*
To add a new dropdown, add a comma and an array, as follows:
,["element 1", "element 2", ...]
*/
];

function findElements(name){
	var array = [];
	var tmp = document.getElementById("ghx-content-group").getElementsByTagName("*");
	var regex = new RegExp("(^|\\s)" + name + "(\\s|$)");
	for (var i = 0; i<tmp.length;i++){
		if (tmp[i].className.indexOf(name) > -1){
			array.push(tmp[i]);
		}
	}
	return array;
}

function saveDropDowns(){
	var elements = findElements("ghx-issue-compact");
	for (var i=0;i<elements.length; i++){		
		var curr = elements[i];
		var rightEdge = curr.childNodes[0].childNodes[1];
		if (rightEdge == null){
			rightEdge = curr.childNodes[1].childNodes[3].childNodes[1];
		}
		
		if (rightEdge != null){
			for (var iterator =0; iterator < rightEdge.childNodes.length; ++iterator){
				try {
					var id = rightEdge.childNodes[iterator].getAttribute("id");
					if (id != null){
							var currNode = (rightEdge.childNodes[iterator]);
							if (currNode != null){
								var value = currNode.value;
								localStorage.setItem(currNode.getAttribute("id"), value);
							}
						}
				//Not a great solution, but need to figure it out
				//}catch(err){console.log(err)}
				}catch(err){}
			} 
		}
	}
}

function createSelectNode(currId, finished = false, array){
	var select = document.createElement("select");
	select.setAttribute("id", currId + "customSelect" + array);
	for (var j=0;j<values[array].length;j++){
		var option = document.createElement('option');				
		option.text = values[array][j];
		select.add(option, j);
	}
	if  (finished == true){
		select.value = 'Done';
		select.disabled = true;
	} else {
		select.value= localStorage.getItem(select.getAttribute("id"));
	}
	select.addEventListener("click", saveDropDowns);
	return select;
}

function createInputNode(currId){
	var input = document.createElement("input");
	input.setAttribute("id",currId+ "customInput");
	var inputValue = localStorage.getItem(input.getAttribute("id"));
	if (inputValue != 'undefined'){
		input.value = inputValue;
	}
	input.addEventListener("blur", saveDropDowns);
	return input;
}

function addDropDowns(){
	var location = window.location.href;
	if (location.indexOf("browse") != -1){
		document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createCopyPasteButton());
		var currId = document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].childNodes[1].childNodes[0].getAttribute("data-issue-key");
		document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createStashButton(getLocationInStash(currId)!=-1));
		for (var counter=0;counter<values.length;counter++){
			document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createSelectNode(currId, false, counter));
		}
		document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createInputNode(currId));
	}
	else if (location.indexOf("RapidBoard.jspa") != -1){
		var elements = findElements("ghx-issue-compact");
		for (var i=0;i<elements.length; i++){		
			var curr = elements[i];
			
			var rightEdge = curr.childNodes[0].childNodes[1];
			currId = curr.getAttribute("data-issue-key");
			rightEdge.insertBefore(createInputNode(currId), rightEdge.childNodes[0]);
			for (var counter=0;counter<values.length;counter++){
				rightEdge.insertBefore(createSelectNode(currId, false, counter), rightEdge.childNodes[0]);
			}
		}
	}
}




/*
	CREATE BUG STASH
*/

function createStashComponent(){
	var location = window.location.href;
	if (location.indexOf("RapidBoard.jspa") != -1){
		var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
		if (issues == null){
			localStorage.setItem("CustomIssueStash", JSON.stringify([]));
		}
		if (issues != null && issues[0] != null){
			var firstPart = '<div class="ghx-backlog-container ghx-sprint-active js-sprint-container ghx-open" id="testing"> <div class="ghx-backlog-header js-sprint-header"> <div class="ghx-expander"> <span class="ghx-iconfont aui-icon aui-icon-small aui-iconfont-expanded"/> </div> <div class="ghx-name"> <span class="field-value ghx-readonly">Bug Stash</span> </div> </div> <div class="ghx-meta ghx-disabled"> <div class="ghx-issues js-issue-list ghx-has-issues">';
			var middle = "";
			for (var i=0; i<issues.length; ++i){
				var input = document.createElement("input");
				input.setAttribute("id", "stashNote"+issues[i][0]);
				input.setAttribute("class", "stashNote");
				middle += '<div class="js-issue ghx-issue-compact ghx-type-52" data-issue-key="'+issues[i][0]+'"> <div class="ghx-issue-content"> <div class="ghx-row"> <div class="ghx-key"> <a href="/browse/' + issues[i][0] + '" title="'+ issues[i][0] +'" class="js-key-link">'+issues[i][0]+'</a> </div> <div class="ghx-summary" title="'+issues[i][1]+'"> <span class="ghx-inner">'+issues[i][1]+'</span> </div> </div> <div class="ghx-end ghx-row"> <span class="ghx-end"> '+ input.outerHTML +'  </div> </div> <div class="ghx-grabber" style="background-color:#8dcafd;"/> <div class="ghx-move-count"> </div> </div> </div>';
			}
			var lastPart =  '</div> </div> </div>';

			var div = document.createElement("div");
			div.innerHTML = firstPart + middle + lastPart;
			var contentGroup = document.getElementById("ghx-content-group");
			contentGroup.insertBefore(div, contentGroup.childNodes[0]);
			var inputs = document.getElementsByClassName("stashNote");
			for (var ctr = 0; ctr<inputs.length; ++ctr){
				document.getElementById(inputs[ctr].getAttribute("id")).value = localStorage.getItem(inputs[ctr].getAttribute("id"));
				document.getElementById(inputs[ctr].getAttribute("id")).addEventListener("blur", saveDropDowns);
				document.getElementById(inputs[ctr].getAttribute("id")).size = 100;
			}
		}
	}
}

function createStashButton(inStash = false){
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", "stashButton");
	var label = "stash";
	if(inStash === true){
		label = "destash";
	}
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", stashButtonListener);
	return btn;
}

function stashButtonListener(){
	var key = document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].childNodes[1].childNodes[0].getAttribute("data-issue-key");
	var label = document.getElementsByClassName("aui-page-header-main")[0].childNodes[1].childNodes[0].textContent;
	var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
	if (issues == null){
		issues = [];
	}
	var loc = getLocationInStash(key);
	if (loc>-1){
		issues.splice(loc, 1);
	} else {
		issues.push([key, label, '']);
	}
	localStorage.setItem("CustomIssueStash", JSON.stringify(issues));
	toggleButton();
}

function toggleButton(){
	var buttonText = document.getElementById('stashButton').childNodes[0].textContent;
	if (buttonText == "stash"){
		document.getElementById("stashButton").childNodes[0].textContent = 'destash';
	} else {
		document.getElementById("stashButton").childNodes[0].textContent = 'stash';
	}
}

function getLocationInStash(key){
	var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
	if (issues == null){
		localStorage.setItem("CustomIssueStash", JSON.stringify([]))
		issues = [];
	}
	var location = -1;
	for (var it = 0; it<issues.length; ++it){
		var curr = issues[it];
		if (curr != null){
			if (curr[0] === key){
				location = it;
				break;
			}
		}
	}
	return location;
}


/*
	AUTOMATIC COPY PASTE
*/

function createCopyPasteButton(){
	var btn = document.createElement("button");
	btn.setAttribute("id", "copyButton");
	var label = "copy";
	var text = document.createTextNode(label);
	btn.appendChild(text);
	var key = document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].childNodes[1].childNodes[0].getAttribute("data-issue-key");
	var label = document.getElementsByClassName("aui-page-header-main")[0].childNodes[1].childNodes[0].textContent;
	btn.addEventListener("click", function() {
		var copyFrom = document.createElement("textarea");
		var key = document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].childNodes[1].childNodes[0].getAttribute("data-issue-key");
		var label = document.getElementsByClassName("aui-page-header-main")[0].childNodes[1].childNodes[0].textContent;
		copyFrom.textContent = key + "\n" + label;
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(copyFrom);
		copyFrom.select();
		document.execCommand('copy');
		body.removeChild(copyFrom);
		document.getElementById("copyButton").childNodes[0].textContent = 'copied!';
		setTimeout(function() {document.getElementById("copyButton").childNodes[0].textContent = 'copy';}, 1000);
	});
	return btn;
}


/*
	DRIVER FUNCTION
*/
function triggerCustomization(){
	//DEBUG
	//localStorage.setItem('CustomIssueStash',JSON.stringify([['pmo-41748', 'test', 'test']]));
	//END DEBUG
	addDropDowns();
	createStashComponent();
}

/*TODO: find more elegant solution*/
setTimeout(triggerCustomization, 750);