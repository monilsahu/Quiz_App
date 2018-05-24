$(document).ready(function(){
    $('.dropdown-menu1 li').click(function(){
        var x = $(this).text();
        document.getElementById("dropdown-toggle1").innerHTML = x;
        document.getElementById("addquesans").value = x;
    });

    $('.dropdown-menu2 li').click(function(){
        var y = $(this).text();
        console.log(y); 
        document.getElementById("dropdown-toggle2").innerHTML = y;
        document.getElementById("addquescat").value = y;
        console.log(y);
    });
});