var profile;
var courses;

if(localStorage.getItem("token") == null){
    window.location.href = "/login"; 
}
$(document).ready(()=>{
    console.log("ceva");
    $("#logout").click(function() {
        localStorage.removeItem("token");
        window.location.href = "/login"; 
    });
})


$.ajax
({
    type: "GET",
    url: 'https://studious-backend-services.herokuapp.com/classrooms',
    contentType: 'application/json',
    success: function (data) {
        courses = data;

        $.ajax
            ({
                type: "GET",
                url: 'https://studious-backend-services.herokuapp.com/students/profile',
                contentType: 'application/json',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
                },
                success: function (data) {
                    profile = data;
                    console.log(profile);
                    populateCourses(courses);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown){
                    if(XMLHttpRequest.status == 401){
                        localStorage.removeItem("token");
                    }
                }
            });
    },
    error: function (XMLHttpRequest, textStatus, errorThrown){
        alert(XMLHttpRequest.responseJSON.message)
    }
})



function populateCourses(courses){
    const date = new Date();
    const dayOfTheWeek = date.getDay();

    const sortedCourses = courses.sort((c1, c2) => {
        if(c1.locale > c2.locale){
            return 1;
        }else{
            return -1;
        }
    })
    courses.forEach(course => {
        $("#media-container2").append(getHTMLForCourse(course));

        if(!profile.enrolled.includes(course._id)){
            $(`#enroll-${course._id}`).click(()=>{
                $.ajax
                ({
                    type: "POST",
                    url: 'https://studious-backend-services.herokuapp.com/students/enroll',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        classRoomId: course._id
                    }),
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
                    },
                    success: function (data) {
                        window.location.href = "/";
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown){
                        alert(XMLHttpRequest.responseJSON.message)
                    }
                })
            });
        }else{
            $("#media-container1").append(getHTMLForCourse(course));
        }
    });

    $('#calendar_events').append(`<p class="ce_title" id="today-date">${getDayOfTheWeek(dayOfTheWeek)} ${date.getDate()} ${date.toLocaleString('en-us', { month: 'short' })}</p>`);
    sortedCourses.forEach(course => {
        if(profile.enrolled.includes(course._id) && dayOfTheWeek == course.day){
            $("#calendar_events").append(getHTMLForLeftBanner(course));
        }
    });

    $("#select-courses").on('change' , function(){
        if(this.value == "1"){
            $("#media-container1").removeClass("hidden");
            $("#media-container2").addClass("hidden");
        }else if(this.value == "2"){
            $("#media-container2").removeClass("hidden");
            $("#media-container1").addClass("hidden");
        }
    });

    $("#search-bar").on('input', function(e){
        const text = this.value;
    
        if(text == ""){
            $(".card-view").each(function() {
                $(this).removeClass("hidden");
            });
        }else{
            $(".card-view").each(function() {
                const title = $(this).find('.card-movie-title').text();
    
                if(!title.toLowerCase().includes(text.toLowerCase())){
                    $(this).addClass("hidden");
                }else{
                    $(this).removeClass("hidden");
                }
            });
        }
    });
}

function getHTMLForLeftBanner(course){
    return `
    <div class="event_item" onclick="location.href='/course/${course._id}';">
        <div class="ei_Dot"></div>
        <div class="ei_Title">${course.locale}</div>
        <div class="ei_Copy">${course.classroomName}</div>
    </div>
    `
}

function getHTMLForCourse(course){
    const enrolled = profile.enrolled.includes(course._id);
    return `
<div class="card-view" x-name="${course.classroomName}">
    <div class="card-header coverImage" style="background: url(placeholder.jpg); background-size: cover;">
        <div class="card-header-icon">
        </div>
    </div>
    <div class="card-movie-content">
        <div class="card-movie-content-head">
            <a href="/course/${course._id}">
                <h3 class="card-movie-title">${course.classroomName}</h3>
            </a>
            <div class="seed-ratio"><span class="seed">${getDayOfTheWeek(course.day)} ${course.locale}</span ></div>
        </div>
        <div class="card-movie-info">
            <div class="movie-running-time">
                <label>Join Course</label>
                <div class="loading-div" id="enroll-${course._id}"><span class="${enrolled? 'loaded-torrent': 'load-media'}">${enrolled? 'ENROLLED': 'ENROLL'}</span></div>
            </div>
        </div>
    </div>
</div>
    `
}

function getDayOfTheWeek(day){
    switch(day){
        case 0:{
            return 'Sun';
        }
        case 1:{
            return 'Mon';
        }
        case 2:{
            return 'Tue';
        }
        case 3:{
            return 'Wen';
        }
        case 4:{
            return 'Thu'
        }
        case 5:{
            return 'Fri'
        }
        case 6:{
            return 'Sat'
        }
    }
}