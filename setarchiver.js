var sets = [];
var started = false;
var in_set = false;
var number = 0;
var starttime = new Date();
var current_set;
var updateInterval;
var player1box = U.$("match_info_player1");
var player2box = U.$("match_info_player2");
var bracket_box = U.$("match_info_bracket");
var game_box = U.$("match_info_game");
var start_box = U.$("match_info_start_timestamp");
var end_box = U.$("match_info_end_timestamp");
var match_info_number = U.$("match_info_number");

var selected_set;

var default_set = {number:"1", player1:"Player 1", player2:"Player 2", bracket:"", start_timestamp:"0", end_timestamp:"0"}

function startTracking(){
    starttime = new Date();
	started = true;
	U.$('match_button').innerHTML = "Click to start set";
	U.removeEvent(U.$('match_button'), 'click', startTracking);
	U.addEvent(U.$('match_button'), 'click', startSet);
}

function generate_timestamp(){
    var elapsed = new Date(new Date() - starttime);
    return ("0" + elapsed.getUTCHours()).slice(-2) + ":" + ("0" + elapsed.getUTCMinutes()).slice(-2) + ":" + ("0" + elapsed.getUTCSeconds()).slice(-2) + "." + ("0" + elapsed.getUTCMilliseconds()).slice(-3);
}

function startSet(){
    U.$('match_button').innerHTML = "Click to stop set";
    U.removeEvent(U.$('match_button'), 'click', startSet);
	U.addEvent(U.$('match_button'), 'click', stopSet);
	
    sets.push({id:number, player1:"Player 1", player2:"Player 2", bracket:"Bracket", game:"Smash Bros.", start_timestamp:generate_timestamp(), end_timestamp:generate_timestamp()});
	current_set = sets[number]
	selected_set = number;
	updateSets();
	makeSetsSelectable();
	selectSet(selected_set);
	scrollToBottomSet();
	number += 1;
	updateInterval = setInterval(function(){updateTimestamp(current_set);}, 1);
	U.addEvent(player1box, 'keyup', updateSetValues);
    U.addEvent(player2box, 'keyup', updateSetValues);	
	U.addEvent(bracket_box, 'keyup', updateSetValues);
	U.addEvent(game_box, 'keyup', updateSetValues);
	U.addEvent(start_box, 'keyup', updateSetValues);
	U.addEvent(end_box, 'keyup', updateSetValues);
	U.addEvent(U.$("event_name"), 'keyup', updateSetValues);
    U.addEvent(U.$("file_name"), 'keyup', updateSetValues);	
}

function stopSet(){
    clearInterval(updateInterval);
    U.$('match_button').innerHTML = "Click to start set";
    U.removeEvent(U.$('match_button'), 'click', stopSet);
	U.addEvent(U.$('match_button'), 'click', startSet);	
	generateFFmpegOutput();
}

function updateSetValues(){
    sets[selected_set].player1 = player1box.value;
	sets[selected_set].player2 = player2box.value;
	sets[selected_set].bracket = bracket_box.value;
	sets[selected_set].game = game_box.value;
	sets[selected_set].start_timestamp = start_box.value;
	
	if (current_set !== sets[selected_set]){
	    sets[selected_set].end_timestamp = end_box.value;
	}
	updateSets();
	makeSetsSelectable();	
	generateFFmpegOutput();
}

function selectSet(selection){
    selected_set = selection;
	selection = sets[selection];
	
    player1box.value = selection.player1;
	player2box.value = selection.player2;
	bracket_box.value = selection.bracket;
	game_box.value = selection.game;
	start_box.value = selection.start_timestamp;
	end_box.value = selection.end_timestamp;
	match_info_number.innerHTML = "MATCH " + selection.id;
}

function bind_event(i){
    var bind_set = U.$("set"+i);
	U.addEvent(bind_set, 'click', function(){selectSet(i)});
}

function makeSetsSelectable(){	
	for(var i = 0; i < sets.length; i++){
        bind_event(i);
	}
}



function updateTimestamp(){
    current_set.end_timestamp = generate_timestamp();
	document.getElementById("set" + current_set.id.toString()).getElementsByClassName("end_timestamp")[0].innerHTML = current_set.end_timestamp;
	if (sets[selected_set] == current_set){
	    end_box.value = current_set.end_timestamp;
	}
}

function selectNewSet(new_set){
	selected_set = sets[new_set];
	selectSet(selected_set);
}

function generateFFmpegOutput(){
    var output = "ffmpeg -i ";
	
	var event_name = U.$("event_name").value;
	
	output += U.$("file_name").value;
	
	for (var i = 0; i < sets.length; i++){
	    output += " -codec copy -ss ";
		output += sets[i].start_timestamp;
		output += " -to ";
		output += sets[i].end_timestamp;
        output += " \"";
		output += event_name;
		output += " ";
		output += sets[i].game;
		output += " ";
		output += sets[i].bracket;
		output += " ";
        output += sets[i].player1;
        output += " vs ";
        output += sets[i].player2;
        output += ".mp4\"";
	}
	
	U.$("output").value = output;
}

function updateSets(current_set){
    sets_html = U.$('sets');
	
	while (sets_html.firstChild){
        sets_html.removeChild(sets_html.firstChild);	
	}
	
	var len = sets.length;
	for (var i=0; i<len; ++i){
	    if (i in sets){
		    var s = sets[i];
			var new_set = document.createElement("div");
			new_set.id = "set"+i;
			new_set.className = "set";
			
			
			var new_set_number = document.createElement("div");
			new_set_number.className = "set_number";
			new_set_number.innerHTML = i;
			new_set.appendChild(new_set_number);
			
			var new_set_match_info = document.createElement("div");
			new_set_match_info.className = "match_info";			
			
			var new_set_match_info_players = document.createElement("div");
			new_set_match_info_players.className = "players";
			
			var new_set_match_info_players_player1 = document.createElement("div");
			new_set_match_info_players_player1.className = "player1";
			new_set_match_info_players_player1.innerHTML = s.player1;
			new_set_match_info_players.appendChild(new_set_match_info_players_player1);
			
			var new_set_match_info_players_player2 = document.createElement("div");
			new_set_match_info_players_player2.className = "player2";
			new_set_match_info_players_player2.innerHTML = s.player2;
			new_set_match_info_players.appendChild(new_set_match_info_players_player2);
			
			new_set_match_info.appendChild(new_set_match_info_players);
			
			var new_set_match_info_bracket = document.createElement("div");
			new_set_match_info_bracket.className = "bracket_placement";
			new_set_match_info_bracket.innerHTML = s.bracket;
			new_set_match_info.appendChild(new_set_match_info_bracket);
			
			new_set_match_info_game = document.createElement("div");
			new_set_match_info_game.className = "game";
			new_set_match_info_game.innerHTML = s.game;
			new_set_match_info.appendChild(new_set_match_info_game);
			
			var new_set_match_info_timestamps = document.createElement("div");
			new_set_match_info_timestamps.className = "timestamps";
			
			var new_set_match_info_timestamps_start_timestamp = document.createElement("div");
			new_set_match_info_timestamps_start_timestamp.className = "start_timestamp";
			new_set_match_info_timestamps_start_timestamp.innerHTML = s.start_timestamp;
			new_set_match_info_timestamps.appendChild(new_set_match_info_timestamps_start_timestamp);
			
			var new_set_match_info_timestamps_end_timestamp = document.createElement("div");
			new_set_match_info_timestamps_end_timestamp.className = "end_timestamp";
			new_set_match_info_timestamps_end_timestamp.innerHTML = s.end_timestamp;
			new_set_match_info_timestamps.appendChild(new_set_match_info_timestamps_end_timestamp);
			
			new_set_match_info.appendChild(new_set_match_info_timestamps);
			
			new_set.appendChild(new_set_match_info);
			
			
			sets_html.appendChild(new_set);
		}
	}
}

function compactWindow(){
    window.resizeBy("200","400");    
}

function scrollToBottomSet(){
    var objDiv = U.$("sets");
	objDiv.scrollTop = objDiv.scrollHeight;	
}
	
	
	

window.onload = function(){
    'use strict';
	U.addEvent(U.$('match_button'), 'click', startTracking);
}