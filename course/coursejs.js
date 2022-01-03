const cs = window.location.href.split('/');
const courseId = cs[cs.length-1];

$(document).ready(()=>{
$.ajax
({
    type: "GET",
    url: `https://studious-backend-services.herokuapp.com/classrooms/${courseId}`,
    contentType: 'application/json',
    success: function (data) {
        course = data;
        console.log(course);
        $('#join-button').click(()=>{
            window.location.href = `/${course.videoId}`
        })
    },
    error: function (XMLHttpRequest, textStatus, errorThrown){
        alert(XMLHttpRequest.responseJSON.message)
    }
})
});