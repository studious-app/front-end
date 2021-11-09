var dragDrop = require('drag-drop')
var hark = require('hark');

const socket = io("http://localhost:3333");

var myPeer;
var sharePeer;

$(document).ready(function(){
    let url = window.location.href;
    if(url.split("?").length > 1){
        temp = url.split("?")[1];
        if(temp.split("=").length > 1){
            room = temp.split("=")[1];
            socket.emit("check-room", room);
        }
    }
})

socket.on("connect", () => {
  // or with emit() and custom event names
  socket.emit("request_media");
  myPeer =  new Peer(id = socket.id);
  sharePeer = new Peer(id = makeid(8));
});

socket.on("room-valid", roomId =>{
    if(videoChatRoom && videoChatRoom!=''){
        leaveRoom();
        joinRoom(roomId, "join");
    }else{
        
        joinRoom(roomId, "join");
    }
    
});

socket.on("room-invalid", () => {
    window.history.pushState("ceva", "Title", "/");
    displayError("Room is not valid")
});

socket.on("mute", socketId => {
    $(`#${socketId}`).addClass("mute");
});

socket.on("unmute", socketId => {
    $(`#${socketId}`).removeClass("mute");
});

socket.on("request-mute-status", () => {
    socket.emit(`${microphoneOn ? "unmute" : "mute"}`);
});

//Video
const videoGrid = document.getElementById('media-container'); //this is the UL element that will contain all the video streams including the local one
const videoGridLeft = document.getElementById('video-grid');
const myVideo = document.createElement('video'); //this will be the video element for our local stream
const screenShareGrid = document.getElementById('md-player');

var localStream;
var shareStream;

//control variables to know when the user is muted and when it is not
var cameraOn = false;
var microphoneOn = false;
var isSharing = false;

//control variable to know the room the user is in
var videoChatRoom;


$('#create-button').on("click", function(e) {
    if(!videoChatRoom || videoChatRoom == ""){
        let room = makeid(8);
        joinRoom(room, "create");
    }else{
        leaveRoom();
    }
});

$('#join-button').on("click", function(e) {
    if(!videoChatRoom || videoChatRoom == ""){
        var room = prompt("Enter room id: ");
        if(room != null && room!=""){
            socket.emit("check-room", room);
        }else{
            displayError("Invalid input")
        }
    }else{
        var room = prompt("Enter room id: ");
        if(room != null && room!=""){
            leaveRoom();
            socket.emit("check-room", room);
        }else{
            displayError("Invalid input")
        }
    }
});

function joinRoom(room, type){
    //changing the URL to contain the room number 
    window.history.pushState("ceva", "Title", `?room=${room}`);

    //create the new localstream
    createNewLocalStreamAndJoinRoom(cameraOn, microphoneOn, room, type);

    //change the page elements accordignly
    $("#voice-chat").removeClass("hidden");
    $("#title-tag").text(`Room: ${room}`);
    $('#create-button').text("Leave Room");
}

function leaveRoom(){
    //changing the URL to remove the room number
    window.history.pushState("ceva", "Title", "/");

    //closing the local stream
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    
    //Modify the page structure so it will be back to the initial state
    $("#title-tag").text("bear2bear");
    $("#media-container").html("");
    $('#create-button').text("Create Room");
    $("#voice-chat").addClass("hidden");

    $('#microphone-icon').removeClass("fa-microphone");
    $('#microphone-icon').addClass("fa-microphone-slash");

    $('#camera-icon').removeClass("fa-video");
    $('#camera-icon').addClass("fa-video-slash");
    
    $('#md-player').addClass("hidden");

    //Reset the control variables
    videoChatRoom = "";
    microphoneOn = false;
    cameraOn = false;
    currentlyWatching = false;

    //Announce the other members in the room that we are leaving
    socket.emit("leave-room", "");
}

function createOnCallProcedure(){
    myPeer.on('call', call => { // When we join someone's room we will receive a call from them
        call.answer(localStream) // Stream them our video/audio
        const video = document.createElement('video') // Create a video tag for them
        call.on('stream', userVideoStream => { // When we recieve their stream
            addVideoStream(video, userVideoStream, call.peer) // Display their video to ourselves
            socket.emit("request-mute-status");
        });
    })
}


$('#microphone-icon').click(function(){
    if(microphoneOn){
        microphoneOn = false;
        $('#microphone-icon').removeClass("fa-microphone");
        $('#microphone-icon').addClass("fa-microphone-slash");
        $('#localstream').addClass("mute");
        localStream.getTracks()[0].enabled = false;
        
        socket.emit("mute");
        
    }else{
        microphoneOn = true;
        $('#microphone-icon').removeClass("fa-microphone-slash");
        $('#microphone-icon').addClass("fa-microphone");
        $('#localstream').removeClass("mute");
        localStream.getTracks()[0].enabled = true;
        
        socket.emit("unmute");
    }
});

$('#camera-icon').click(async function(){
    if(cameraOn){
        cameraOn = false;
        $('#camera-icon').removeClass("fa-video");
        $('#camera-icon').addClass("fa-video-slash");
        localStream.getTracks()[1].enabled = false;
       
    }else{
        cameraOn = true;
        $('#camera-icon').removeClass("fa-video-slash");
        $('#camera-icon').addClass("fa-video");

        localStream.getTracks()[1].enabled = true;   
    } 
});  

$('#share-icon').click(async function() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

    createNewScreenShareStream(stream);
});

socket.on('user-connected', userId => { // If a new user connect
    connectToNewUser(userId, localStream) 
});

socket.on('share-screen', shareId => {
    const call = sharePeer.call(shareId, new MediaStream());
    console.log(call);
    call.on('stream', stream => {
        console.log("ceva");
        isSharing = true;
        moveVideoStreamsToLeft();
    
        const screenShare = document.createElement('video');
        screenShare.srcObject = stream;
        screenShare.addEventListener('loadedmetadata', () => { // Play the video as it loads
            screenShare.play()
        });
        screenShareGrid.append(screenShare);
    });
});

socket.on('user-disconnected', userId => {
    $(`#${userId}`).remove();
    displayMessage("An user left", 2000);
});

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    
    const call = myPeer.call(userId, stream); // Call the user who just joined
    
    // Add their video
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userId);
        $(video).addClass("mute");
    })
    // If they leave, remove their video
    call.on('close', () => {
        video.remove()
    });
}

function addVideoStream(video, stream, userId) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
        video.play()
    });
    video.id = userId;
    
    if(!isSharing){
        videoGrid.append(video); // Append video element to videoGrid
    }else{
        videoGridLeft.append(video);
    }
    speechEvent = hark(stream);

    speechEvent.on('speaking', function() {
        $(`#${userId}`).addClass("speaking");

        if(userId != "localstream"){
            $(`#${userId}`).insertAfter("#localstream");
        }
    });

    speechEvent.on('stopped_speaking', function() {
        $(`#${userId}`).removeClass("speaking");
    });
}

function createNewScreenShareStream(stream){
    shareStream = stream;
    isSharing = true;
    moveVideoStreamsToLeft();

    sharePeer.on('call', call => { // When we join someone's room we will receive a call from them
        call.answer(shareStream) // Stream them our video/audio

        call.on('stream', stream => {
            console.log(stream);
        })
    });

    socket.emit('share-screen', sharePeer.id);

    const screenShare = document.createElement('video');
    screenShare.srcObject = shareStream;
    screenShare.addEventListener('loadedmetadata', () => { // Play the video as it loads
        screenShare.play()
    });
    screenShareGrid.append(screenShare);
}

function moveVideoStreamsToLeft(){
    $('#media-container').children().each(function (){
        $(this).appendTo('#video-grid');
    })
}

function createNewLocalStreamAndJoinRoom(video, audio, roomId, type){
    myVideo.muted = true;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream, 'localstream') // Display our video to ourselves
        localStream = stream;
        $(myVideo).addClass("mute");

        localStream.getTracks()[0].enabled = audio;
        localStream.getTracks()[1].enabled = video;

        createOnCallProcedure();

        socket.emit(`${type}-room`, roomId, myPeer.id);
        videoChatRoom = roomId;
    });
    
}

//helpers

$("#title-tag").click(function(){
    if(videoChatRoom && videoChatRoom != ''){
        copyToClipboard(window.location.href);
    }
})

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    displayMessage("Copied to clipboard", 2000)
  };

function displayMessage(message, timeout=0){
    $("#message-pop").css("background-color", "#1663a0")
    $("#message-pop-text").text(message);
    $("#message-pop").toggle();

    if(timeout > 0){
        setTimeout(resetDisplayMessage, timeout);
    }
}

function displayError(message, timeout=2000){
    $("#message-pop").css("background-color", "#a01616")
    $("#message-pop-text").text(message);
    $("#message-pop").toggle();

    setTimeout(resetDisplayMessage, timeout);
}

function resetDisplayMessage(){
    $("#message-pop").toggle();
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

setInterval(function(){

}, 1500);
