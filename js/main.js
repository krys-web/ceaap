const menu = document.querySelector(".menu-mobile");
const nav = document.querySelector("nav");

menu.addEventListener("click", ()=>{

    if(nav.style.display==="block"){

        nav.style.display="none";

    }else{

        nav.style.display="block";

    }

});