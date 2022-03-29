const cs = window.location.href.split('/');
const courseId = cs[cs.length-1];



$(document).ready(()=>{

$("#logout").click(function() {
    console.log("ceva");
    localStorage.removeItem("token");
    window.location.href = "/login"; 
});


$.ajax
({
    type: "GET",
    url: `http://34.241.224.108:3000/homeworks`,
    contentType: 'application/json',
    success: function (data) {

        for(hw of data){

            let homework = hw
            $.ajax
            ({
                type: "GET",
                url: `http://34.241.224.108:3000/users/profile`,
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
                },
                success: function (data) {
                    if(data.role == 'STUDENT'){
                        if(homework.classRoomId == courseId){
                            const currentHw = homework;
            
                            $.ajax
                            ({
                                type: "GET",
                                url: `http://34.241.224.108:3000/homeworks/submissions/${currentHw._id}`,
                                contentType: 'application/json',
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
                                },
                                success: function (data) {
                                    $('#homeworks').append(getHTMLforHomework(homework, data.submitted));
                                    $(`#homework_${currentHw._id}`).click(() => {
                                        location.href = `/homework/${currentHw._id}`;
                                    });
                                },
                                
                                error: function (XMLHttpRequest, textStatus, errorThrown){
                                    alert(XMLHttpRequest.responseJSON.message)
                                }
                            })
            
                            //
                        }
                    }
                    else if(data.role == 'TEACHER'){
                        $('#homeworks').append(getHTMLforHomeworkTeacher(homework));
                        $(`#homework_${homework._id}`).click(() => {
                            location.href = `/submissions/${homework._id}`;
                        });
                    }
                },
                
                error: function (XMLHttpRequest, textStatus, errorThrown){
                    alert(XMLHttpRequest.responseJSON.message)
                }
            })



        }
    },
    error: function (XMLHttpRequest, textStatus, errorThrown){
        alert(XMLHttpRequest.responseJSON.message)
    }
})    


$.ajax
({
    type: "GET",
    url: `http://34.241.224.108:3000/classrooms/${courseId}`,
    contentType: 'application/json',
    success: function (data) {
        course = data;
        //console.log(course);
        $('#course_title').text(course.classroomName)
        $('#join-button').click(()=>{
            window.location.href = `/${course.videoId}`
        })
    },
    error: function (XMLHttpRequest, textStatus, errorThrown){
        alert(XMLHttpRequest.responseJSON.message)
    }
})

$.ajax
({
    type: "GET",
    url: `http://34.241.224.108:3000/posts/classrooms/${courseId}`,
    contentType: 'application/json',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
    },
    success: function (data) {
        const posts = data;

        for(let post of posts){
            $.ajax
            ({
                type: "GET",
                url: `http://34.241.224.108:3000/users/${post.post.ownerId}`,
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
                },
                success: function (data) {
                    populatePost(post, data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown){
                    alert(XMLHttpRequest.responseJSON.message)
                }
            })
        }

        
    },
    error: function (XMLHttpRequest, textStatus, errorThrown){
        alert(XMLHttpRequest.responseJSON.message)
    }
})




});

function populatePost(post, owner){
    const postDate = randomDate(new Date(2022, 2, 1), new Date(2022, 2, 30));
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const str = `
    <div class="forum-post">
        <p class="form-name">${owner.lastName} ${owner.firstName}<span class="form-date">${postDate.toLocaleDateString("en-US", options)}</span></p>
        <p class="form-text form-main-text">${post.post.description}</p>
        <input id="post-comment-${post.post._id}" class="form-control form-control-dark w-100 search-bar add-reply" type="text" placeholder="Reply..." aria-label="Search">
        
        <div id="post-comments-${post.post._id}"></div>
    </div>
    `
    
    $("#media-container").append(str);
    $(`#post-comment-${post.post._id}`).keypress(function(e){
        if(e.which == 13 && $(this).val() != ''){
            const comment = $(this).val();

            $.ajax
            ({
                type: "POST",
                url: `http://34.241.224.108:3000/comments/posts/${post.post._id}`,
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
                },
                data: JSON.stringify({description: comment}),
                success: function (data) {
                    location.reload();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown){
                    alert(XMLHttpRequest.responseJSON.message)
                }
            })
        }
    });
    populateComent(post.comments, post.post._id)

    
}

function populateComent(comments, id){

    const commentsDate = randomDate(new Date(2022, 2, 20), new Date(2022, 2, 29))

    for(let comment of comments){
        $.ajax
        ({
            type: "GET",
            url: `http://34.241.224.108:3000/users/${comment.ownerId}`,
            contentType: 'application/json',
            success: function (data) {
                $(`#post-comments-${id}`).append(`
                <div class="form-comment">
                    <p class="form-name">${data.lastName} ${data.firstName}<span class="form-date"></span></p>
                    <p class="form-text">${comment.description}</p>
                </div>
                `);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown){
                return 'Hopa'
            }
        })
    }    

}

function getHTMLforHomework(homework, submitted){
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const isOverdue = new Date(homework.deadline) < new Date();


    return `
    <div class="event_item" id="homework_${homework._id}">
        <div class="ei_Dot ${submitted ? 'ei_Green' : isOverdue ? 'ei_Red' : 'ei_White'}"></div>
        <div class="ei_Title">${homework.description.substr(0,20)}...</div>
        <div class="ei_Copy">${new Date(homework.deadline).toLocaleDateString("en-US", options)}</div>
    </div>
    `;
}

function getHTMLforHomeworkTeacher(homework){
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return `
    <div class="event_item" id="homework_${homework._id}">
        <div class="ei_Title">${homework.description.substr(0,20)}...</div>
        <div class="ei_Copy">${new Date(homework.deadline).toLocaleDateString("en-US", options)}</div>
    </div>
    `;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


  