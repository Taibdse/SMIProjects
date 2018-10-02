let $sidenav = $('.side-nav');
let $mainContent = $('.main-content');
let $header = $('header');

$(window).resize(setTopSideNav);

setTopSideNav();

function setTopSideNav(){
  let val = $header.height() + 10;
  console.log(val);
  $sidenav.css({top: val + 'px' });
  $mainContent.css({marginTop: '-5px'});
}