//================================================
/*

Zoom
Zoom in or out on web content using the zoom button for more comfortable reading.
Copyright (C) 2017 Stefan vd
www.stefanvd.net

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

*/
//================================================

function $(id) { return document.getElementById(id); }
var currentRatio = 1; var ratio = 1; var job = null;
var allzoom; var allzoomvalue; var webjob; var websitezoom; var badge; var steps; var lightcolor; var zoomchrome; var zoomweb; var largepopup; var zoombydomain; var zoombypage; var defaultallscreen; var defaultsinglescreen;
var firstDate;

function zoom(ratio){
currentRatio = ratio / 100;
chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {zoomtab(tabs[0].id,currentRatio);});
}

function zoomtab(a,b){
    document.getElementById("number").value=Math.round(b*100);
    document.getElementById("range").value=Math.round(b*100);

    if(zoomchrome == true) {
        if(allzoom == true){
                chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        // only on http, https and ftp website (and not the chrome:extension url)
                        if(/^(f|ht)tps?:\/\//i.test(tab.url)) {
                        chrome.tabs.setZoom(tab.id, b);
                        if(badge == true){
                            chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                            chrome.browserAction.setBadgeText ( { text: ""+document.getElementById("number").value+"", tabId: tab.id } ); }
                        else { chrome.browserAction.setBadgeText({ text: "" }); }
                        }
                    });
                });
        }else{
            try{
                chrome.tabs.setZoom(a, b);
                if(badge == true){
                    chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                    chrome.browserAction.setBadgeText ( { text: ""+document.getElementById("number").value+"", tabId: a } ); }
                else { chrome.browserAction.setBadgeText({ text: "" }); }
            }
            catch(e){}
        }
    }else{
        if(allzoom == true){
                chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        try{
                            var supportsZoom = 'zoom' in document.body.style;
                            if(supportsZoom){
                                chrome.tabs.executeScript(tab.id,{code:"document.body.style.zoom=" + b});
                            }else{
                                chrome.tabs.executeScript(tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + b + ")'"});
                            }
                        }
                        catch(e){}
                        if(badge == true){
                           chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                           chrome.browserAction.setBadgeText ( { text: ""+document.getElementById("number").value+"" } ); }
                        else { chrome.browserAction.setBadgeText({ text: "" }); }
                    });
                });
        }else{
            chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        var pop = tab.url;
                        if(zoombydomain == true){var webpop = pop.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
                        else{var webpop = pop;}
                        if(webpop == webjob){// in current tab and not in popup window
                            try{
                                var supportsZoom = 'zoom' in document.body.style;
                                if(supportsZoom){
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.zoom=" + b});
                                }else{
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + b + ")'"});
                                }
                            }
                            catch(e){}
                            if(badge == true){
                               chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                               chrome.browserAction.setBadgeText ( { text: ""+document.getElementById("number").value+"", tabId: tab.id } ); }
                            else { chrome.browserAction.setBadgeText({ text: "" }); }
                        }
                    });
                });
        }
    }

    // saving feature
    if(allzoom == true){
        // save for all zoom feature
        chrome.storage.sync.set({"allzoomvalue": b});
    }else{
            var atbbuf = [];
            for(var domain in websitezoom){atbbuf.push(domain);atbbuf.sort();}
            for(var i = 0; i < atbbuf.length; i++){
                if (atbbuf[i] == webjob) { //update
                    if (b == 1) {
                        // remove from list
                        delete websitezoom['' + atbbuf[i] + ''];
                        atbbuf = websitezoom;
                        // save for zoom feature
                        chrome.storage.sync.set({ "websitezoom": JSON.stringify(websitezoom) });
                    } else {
                        // update ratio
                        websitezoom['' + atbbuf[i] + ''] = document.getElementById("number").value;
                        // save for zoom feature
                        chrome.storage.sync.set({ "websitezoom": JSON.stringify(websitezoom) });
                    }
                } else {
                        // The box is not empty -> but website is not inside
                        // add to list
                        websitezoom['' + webjob + ''] = document.getElementById("number").value;
                        // save for zoom feature
                        chrome.storage.sync.set({ "websitezoom": JSON.stringify(websitezoom) });
                }
            }
            // The box is empty -> so the list is really empty, then add this website in the list
            if(atbbuf.length == 0){
                    // add to list
                    websitezoom['' + webjob + ''] = document.getElementById("number").value;
                    // save for zoom feature
                    chrome.storage.sync.set({ "websitezoom": JSON.stringify(websitezoom) });
            }
    }
}

function zoomview(direction){zoom(nextratio(currentRatio*100,direction));}

function nextratio(ratio,direction){
ratio = Math.round(ratio);
var prevratio = parseInt(ratio)-parseInt(steps);
var nextratio = parseInt(ratio)+parseInt(steps);
if(direction==-1){
    if(ratio == 10){prevratio = 100;nextratio = 100;}
}else{
    if(ratio == 400){prevratio = 100;nextratio = 100;}
}
return (direction==-1)?prevratio:nextratio;
}

var tempcurrentpopupzoom = "";
function handle(delta) {
	tempcurrentpopupzoom = document.getElementById("number").value;
    if(delta < 0){ tempcurrentpopupzoom -= Number(1);
		if(tempcurrentpopupzoom != 0 && tempcurrentpopupzoom >= 1){ document.getElementById("number").value = tempcurrentpopupzoom; zoom(tempcurrentpopupzoom); }
	}
	else{
		if(tempcurrentpopupzoom != 0 && tempcurrentpopupzoom < 400){ tempcurrentpopupzoom = Number(tempcurrentpopupzoom) + Number(1);document.getElementById("number").value = tempcurrentpopupzoom; zoom(tempcurrentpopupzoom); }
	}
	tempcurrentpopupzoom = ""; // reset
}

function wheel(event){
    var delta = 0;
    delta = event.deltaY;
    if (delta){ handle(delta); } // do the UP and DOWN job
    // prevent the mouse default actions using scroll
    if (event.preventDefault){ event.preventDefault(); }
	event.returnValue = false;
}

document.addEventListener('DOMContentLoaded', function () {
// default settings
function displayinput(newValue) {document.getElementById("number").value=parseInt(newValue);}
function showValue(newValue){document.getElementById("range").innerHTML=parseInt(newValue);document.getElementById("number").value=parseInt(newValue);zoom(newValue);}
$("range").addEventListener('change', function() {showValue(this.value);});
$("number").addEventListener('change', function() {showValue(this.value);});
$("hund").addEventListener('click', function() {zoom(allzoomvalue*100);displayinput(allzoomvalue*100);});
$("minus").addEventListener('click', function() {zoomview(-1);});
$("plus").addEventListener('click', function() {zoomview(+1);});

// mouse scroll
window.addEventListener('wheel', wheel); // for modern

chrome.storage.sync.get(['firstDate','allzoom','allzoomvalue','websitezoom','badge','steps','lightcolor','zoomchrome','zoomweb','largepopup','zoombydomain','zoombypage','defaultallscreen','defaultsinglescreen','screenzoom'], function(response){
allzoom = response.allzoom;if(allzoom == null)allzoom = false; // default allzoom false
allzoomvalue = response.allzoomvalue;if(allzoomvalue == null)allzoomvalue = 1; // default allzoomvalue value
badge = response.badge;if(badge == null)badge = false;
lightcolor = response.lightcolor;if(lightcolor == null)lightcolor = "#3cb4fe";
steps = response.steps;if(steps == null)steps = 10;
zoomchrome = response.zoomchrome;if(zoomchrome == null)zoomchrome = false;
zoomweb = response.zoomweb;if(zoomweb == null)zoomweb = true;
websitezoom = response.websitezoom;
largepopup = response.largepopup;
zoombydomain = response.zoombydomain;if(zoombydomain == null)zoombydomain = true;
zoombypage = response.zoombypage;if(zoombypage == null)zoombypage = false;
if(largepopup == true){
document.getElementsByTagName("html")[0].className="large";
}else{
document.getElementsByTagName("html")[0].className="small";
}
defaultallscreen = response.defaultallscreen;
defaultsinglescreen = response.defaultsinglescreen;
        if(defaultallscreen == true){} // no change
        else if(defaultsinglescreen == true){
            var screenzoom = response['screenzoom'];  
            screenzoom = JSON.parse(screenzoom);
            var satbbuf = [];
            for(var domain in screenzoom)
                satbbuf.push(domain);
                satbbuf.sort();
                for(var i = 0; i < satbbuf.length; i++){
                if(satbbuf[i] == screen.width+"x"+screen.height){
                    allzoomvalue = screenzoom[satbbuf[i]]/100;
                }
                }
        }

// if empty use this
if(typeof websitezoom == "undefined" || websitezoom == null){
websitezoom = JSON.stringify({'https://www.stefanvd.net': ["90"], 'https://www.google.com': ["90"], 'https://www.nytimes.com': ["85"]});
}
websitezoom = JSON.parse(websitezoom);

    chrome.tabs.query({ active: true, currentWindow: true},
    function (tabs) {
        var job = tabs[0].url;
        if(zoombydomain == true){webjob = job.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
        else{webjob = job;}
        if (zoomchrome == true) {
            chrome.tabs.getZoom(tabs[0].id, function (zoomFactor) {
                ratio = zoomFactor;
                if (ratio == null) { ratio = 1 }
                currentRatio = ratio;
                document.getElementById("number").value = Math.round(ratio * 100);
                document.getElementById("range").value = Math.round(ratio * 100);
            });
        } else {
            chrome.tabs.sendMessage(tabs[0].id, { text: 'getwebzoom' }, function (info) {
                if (info == null || info == "") { info = 1 }
                ratio = info;
                currentRatio = ratio;
                document.getElementById("number").value = Math.round(ratio * 100);
                document.getElementById("range").value = Math.round(ratio * 100);
            });
        }
    });

});
});