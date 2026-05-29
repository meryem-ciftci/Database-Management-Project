const button1 = document.querySelector("#CirculationButton");
const button2 = document.querySelector("#ArchivalButton");

button1.addEventListener("click", clicked);
button2.addEventListener("click", clicked);

function clicked(button){
    if(button.currentTarget.id === "CirculationButton"){
        window.location.href= "./circulations.html";
    }
    else if(button.currentTarget.id === "ArchivalButton"){
        window.location.href= "./archival.html";
    }
  
}