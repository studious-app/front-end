var choiseStudent = true;

if(localStorage.getItem("token") != null){
    window.location.href = "/"; 
}

$("#change-student").click(function(){
    
    if(!choiseStudent){
        choiseStudent = true;
        $("#change-professor").removeClass("active")
        $("#change-professor").addClass("inactive underlineHover");

        $("#change-student").removeClass("inactive underlineHover")
        $("#change-student").addClass("active");

        $("#professor-login").addClass("hidden");
        $("#student-login").removeClass("hidden");
    }
});

$("#change-professor").click(function(){
    
    if(choiseStudent){
        choiseStudent = false;
        $("#change-student").removeClass("active")
        $("#change-student").addClass("inactive underlineHover");

        $("#change-professor").removeClass("inactive underlineHover")
        $("#change-professor").addClass("active");
        
        $("#student-login").addClass("hidden");
        $("#professor-login").removeClass("hidden");
    }
});


$( "#student-login" ).submit(function( event ){
    event.preventDefault();

    var inputs = $('#student-login :input');

    var values = {};
    inputs.each(function() {
        values[this.name] = $(this).val();
    });

    const credentials = {
        email: values.email,
        pwd: values.password
    }


    $.ajax
    ({
        type: "POST",
        url: 'https://studious-backend-services.herokuapp.com/auth/login',
        contentType: 'application/json',
        data: JSON.stringify(credentials),
        success: function (data) {
            localStorage.setItem("token", data.token);
            window.location.href = "/";
        },
        error: function (XMLHttpRequest, textStatus, errorThrown){
            alert(XMLHttpRequest.responseJSON.message)
        }
    })
});