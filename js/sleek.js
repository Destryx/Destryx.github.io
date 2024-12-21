//==============================================================
//========================== WARNING ===========================
//==============================================================
//= Do not edit this file if you don't know what you're doing! =
//==============================================================

//Array randomizer (Fisher-Yates algorithm)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// startsWith support
String.prototype.startsWith = function(string) {
	return this.indexOf(string) === 0;
}

function isGMod() {
	if (navigator.userAgent.indexOf("GMod/") !== -1) {
		return true;
	} else {
		return false;
	}
}

function isUsingYoutube() {
	for (var i = 0; i < l_musicPlaylist.length; i++) {
		if (l_musicPlaylist[i].youtube) {
			return true;
		}
	}
	return false;
}

function initMusic() {
	if (isUsingYoutube()) {
		loadYoutube();
	} else {
		nextMusic();
	}

	if (l_musicDisplay)	$("#music").fadeIn(2000);
}

var neededFiles;
var downloadedFiles = 0;

function GameDetails( servername, serverurl, mapname, maxplayers, steamid, gamemode ) {
	setGamemode(gamemode);
	setMapname(mapname);

	if (!l_serverName && !l_serverImage) {
		setServerName(servername);
	}

	if (l_bgImageMapBased) {
		$.backstretch(["backgrounds/images/"+mapname+".jpg"], {duration: l_bgImageDuration, fade: l_bgImageFadeVelocity});
	}
}

function DownloadingFile( fileName ) {
	downloadedFiles++;
	refreshProgress();

	setStatus("Téléchargement...");
}

function SetStatusChanged( status ) {
	if (status.indexOf("Addons #") != -1) {
		downloadedFiles++;
		refreshProgress();
	}else if (status == "Finalisation du Téléchargement...") {
		setProgress(100);
	}

	setStatus(status);
}

/* Useless...
function SetFilesTotal( total ) {
	console.log("SetFilesTotal("+total+")");
}*/

function SetFilesNeeded( needed ) {
	neededFiles = needed + 1;
}

function refreshProgress() {
	progress = Math.floor(((downloadedFiles / neededFiles)*100));

	setProgress(progress);
}

function setStatus(text) {
	$("#status").html(text);
}
function setProgress(progress) {
	$("#loading-progress").css("width", progress + "%");
}
function setGamemode(gamemode) {
	$("#gamemode").html(gamemode);
}
function setMapname(mapname) {
	$("#map").html(mapname);
}
function setServerName(servername) {
	$("#title").html(servername);
}
function setMusicName(name) {
	$("#music-name").fadeOut(2000, function() {
		$(this).html(name);
		$(this).fadeIn(2000);
	});
}

var youtubePlayer;
var actualMusic = -1;

$(function() {
	if (l_bgImagesRandom) l_bgImages = shuffle(l_bgImages);
	if (l_musicRandom) l_musicPlaylist = shuffle(l_musicPlaylist);
	if (l_messagesRandom) l_messages = shuffle(l_messages);
	//if (l_messagesEnabled) showMessage(0);
	if (l_displayMapGamemode) $("#subtitle").show();
	if (l_serverName && !l_serverImage) setServerName(l_serverName);
	if (l_serverImage) {
		if (isAbsoluteURL(l_serverImage)) {
			setServerName("<img src='"+l_serverImage+"' class='vunit vw49 vh35'>");
		}else{
			setServerName("<img src='images/"+l_serverImage+"' class='vunit vw49 vh35'>");
		}
	}
	if (l_bgOverlay) $("#overlay").css("background-image", "url('images/overlay.png')");
	if (l_centerLogo) $("#header").css("text-align", "center");

	if (l_music) {
		// music is enabled
		if (isGMod()) {
			// the user is in gmod, init music immediately
			initMusic();
		} else {
			// user is in browser, display the enable audio preview button
			var eleEnableAudio = document.getElementById("enable-audio");
			eleEnableAudio.style.display = "block";
			eleEnableAudio.onclick = function() {
				this.style.display = "none";
				initMusic();
			}
		}
	}

	if (l_bgVideo) {
		if (isAbsoluteURL(l_background)) {
			$("body").append("<video loop autoplay muted><source src='"+l_background+"' type='video/webm'></video>");
		}else{
			$("body").append("<video loop autoplay muted><source src='backgrounds/videos/"+l_background+"' type='video/webm'></video>");
		}
	}

	if (!l_bgVideo && !l_bgImageMapBased) {
		for (var i = 0; i < l_bgImages.length; i++) {
			if (!isAbsoluteURL(l_bgImages[i])) {
				l_bgImages[i] = "backgrounds/images/" + l_bgImages[i];
			}
		}
		$.backstretch(l_bgImages, {duration: l_bgImageDuration, fade: l_bgImageFadeVelocity});
	}

	$("#overlay").css("background-color", "rgba(0,0,0,"+(l_bgDarkening/100)+")");
});

function loadYoutube() {
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
	youtubePlayer = new YT.Player('player', {
	  height: '390',
	  width: '640',
	  events: {
	    'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange,
		'onError': onPlayerError
	  }
	});
}

function onPlayerReady(event) {
	youtubePlayer.setVolume(l_musicVolume);
	if (youtubePlayer.isMuted()) youtubePlayer.unMute();
	nextMusic();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
    	nextMusic();
	}
}

function onPlayerError(event) {
	var currentMusic = getCurrentMusic();
	var msg = "Unknown error";

	if (event.data === 2) {
		msg = "'"+currentMusic.name+"' could not be played, invalid video ID";
		msg += "<br>Please make sure the video is correct";
	}
	if (event.data === 5) {
		msg = "'"+currentMusic.name+"' could not be played, HTML5 error";
	}
	if (event.data === 100) {
		msg = "'"+currentMusic.name+"' could not be played, video not found";
		msg += "<br>Please make sure the video exists and is not private";
	}
	if (event.data === 101 || event.data === 150) {
		msg = "'"+currentMusic.name+"' could not be played, video not embeddable";
		msg += "<br>Please use another video";
	}

	showErrorMessage(msg);
	
	nextMusic();
}

function getCurrentMusic() {
	return l_musicPlaylist[actualMusic];
}
function nextMusic() {
	actualMusic++;

	if (actualMusic >= l_musicPlaylist.length) {
		actualMusic = 0;
	}

	var atual = l_musicPlaylist[actualMusic];

	if (atual.youtube) {
		youtubePlayer.loadVideoById( getYoutubeIdFromUrl(atual.youtube) );
	}else{
		if (isAbsoluteURL(atual.ogg)) {
			$("body").append('<audio src="'+atual.ogg+'" autoplay>');
		}else{
			$("body").append('<audio src="music/'+atual.ogg+'" autoplay>');
		}
		$("audio").prop('volume', l_musicVolume/100);
		$("audio").bind("ended", function() {
			$(this).remove();
			nextMusic();
		});
		$("audio").bind("error", function(err) {
			showErrorMessage("'"+getCurrentMusic().name+"' could not be played<br>Please make sure the file is valid and exists");
			$(this).remove();
			nextMusic();
		});
	}

	setMusicName(atual.name);
}

function showErrorMessage(msg) {
	if (isGMod() && !l_showErrorsIngame) return;

	var ele = document.createElement("div");
	ele.className = "error";
	ele.innerHTML = "<div class='error-title'>Error</div>"+msg;

	var closeButton = document.createElement("div");
	closeButton.className = "close-button";
	closeButton.innerHTML = "X";
	closeButton.onclick = function() {
		ele.style.display = "none";
	}

	if (isGMod()) {
		setTimeout(function() {
			$(ele).fadeOut(500);
		}, 4000);
	} else {
		ele.appendChild(closeButton);
	}

	var errorBoxEle = document.getElementById("error-box");
	errorBoxEle.insertBefore(ele, errorBoxEle.firstChild);
}

// function showMessage(message) {
// 	if (message >= l_messages.length)
// 		message = 0;

// 	$("#messages").fadeOut(l_messagesFade, function() {
// 		$(this).html(l_messages[message]);
// 		$(this).fadeIn(l_messagesFade);
// 	});

// 	setTimeout(function() {
// 		showMessage(message+1);
// 	}, l_messagesDelay + l_messagesFade*2);
// }

//function isAbsoluteURL(string) {
//	string = string.toLowerCase();

//	if (string.startsWith("http://") || string.startsWith("https://"))
//		return true;

//	return false;
//}

function getYoutubeIdFromUrl(url) {
	var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = url.match(regExp);
	var result;

	if (match && match[2].length == 11) {
		result = match[2];
	} else {
		result = url;
	}

	return result;
}
