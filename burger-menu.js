const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const buttons = document.querySelector('.buttons');
const dropdownTrigger = document.querySelector('.has-dropdown > a');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  nav.classList.toggle('active');
  buttons.classList.toggle('hide-desktop-buttons');
  document.body.classList.toggle('no-scroll');
});

dropdownTrigger.addEventListener('click', function (e) {
    if (window.innerWidth <= 1024) {
        const linkRect = this.getBoundingClientRect();
        const triggerZone = linkRect.width * 0.3;

        if (e.clientX > linkRect.right - triggerZone) {
            e.preventDefault();
            const parentLi = this.closest('.has-dropdown');
            parentLi.classList.toggle('open');
        }
    }
});


document.addEventListener('click', function (e) {
    const isDropdown = e.target.closest('.has-dropdown');
    if (!isDropdown && window.innerWidth <= 1024) {
        document.querySelectorAll('.has-dropdown.open').forEach(drop => drop.classList.remove('open'));
    }
});
