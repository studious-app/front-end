const cs = window.location.href.split('/');
const homeworkId = cs[cs.length-1];

$(document).ready(()=>{
    $.ajax
    ({
        type: "GET",
        url: `http://34.241.224.108:3000/homeworks/${homeworkId}`,
        contentType: 'application/json',
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
        },
        success: function (data) {
            populateTable(data.submissions);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown){
            if(XMLHttpRequest.status == 401){
                //localStorage.removeItem("token");
            }
        }
    });
});

function populateTable(submissions){
    for(submission of submissions){
        $('#submissions').append(`
        <tr>
        <td>
            ${submission.studentId}
        </td>
        <td>
            <a href="${submission.url}">Download</a>
        </td>
        </tr>
        `)
    }
}

