const cs = window.location.href.split('/');
const homeworkId = cs[cs.length-1];

$(document).ready(()=>{
    $("#logout").click(function() {
        localStorage.removeItem("token");
        window.location.href = "/login"; 
    });

    $('#file-id').on('change', ()=> {
        $('#upload-file').addClass('green');
    });

    $('#send-task').click(() =>{
        var file = $('#file-id')[0].files;
        var fd = new FormData();
        fd.append('file', file[0]);
        
        $.ajax({
            url: `http://34.241.224.108:3000/homeworks/submissions/${homeworkId}`,
            data: fd,
            cache: false,
            processData: false,
            contentType: false,
            type: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
            },
            success: function (data) {
                console.log(data);
            }
        });
    });

    $.ajax
    ({
        type: "GET",
        url: `http://34.241.224.108:3000/homeworks/submissions/${homeworkId}`,
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem("token")}`);
        },
        success: function (data) {
            if(data.submitted){
                $('#upload-file').addClass('green');
                $('#send-task').attr('id', '');
            }
        },
        
        error: function (XMLHttpRequest, textStatus, errorThrown){
            alert(XMLHttpRequest.responseJSON.message)
        }
    });

    $.ajax
    ({
        type: "GET",
        url: `http://34.241.224.108:3000/homeworks/${homeworkId}`,
        contentType: 'application/json',
        success: function (data) {
            populateHomework(data);
        },
        
        error: function (XMLHttpRequest, textStatus, errorThrown){
            alert(XMLHttpRequest.responseJSON.message)
        }
    });
});

function populateHomework(homework){
    $('#task-description').text(homework.description);
    $('#get-task').click(()=>{
        window.open(homework.files[0].url,'_blank');
    });
}