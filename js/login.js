const wrapper=document.querySelector('.wrapper'),
btnPopup=document.querySelector('.btnLogin-popup'),
iconClose=document.querySelector('.icon-close');

btnPopup.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
});
iconClose.addEventListener('click', ()=>{
    wrapper.classList.remove('active-popup')
});