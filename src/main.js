const button1 = document.querySelector("#CirculationButton");
const button2 = document.querySelector("#ArchivalButton");
const button3 = document.querySelector("#MemberButton");
const button4 = document.querySelector("#Meryem");

button1.addEventListener("click", clicked);
button2.addEventListener("click", clicked);
button3.addEventListener("click", clicked);
button4.addEventListener("click", clicked);

function clicked(button){
    if(button.currentTarget.id === "CirculationButton"){
        window.location.href= "./circulations.html";
    }
    else if(button.currentTarget.id === "ArchivalButton"){
        window.location.href= "./archival.html";
    }
    else if(button.currentTarget.id === "MemberButton"){
        window.location.href="./member.html";
    }
    else if(button.currentTarget.id === "Meryem"){
        window.location.href="./main.html";
    }    
  
}