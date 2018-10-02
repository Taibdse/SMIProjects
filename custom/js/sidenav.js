let $sidenav = $('.side-nav');
let $mainContent = $('.main-content');
let $header = $('header');

$(window).resize(setTopSideNav);
$(window).scroll(setHeightSideNav)
setTopSideNav();

function setTopSideNav(e){
  let val = $header.height() + 10;
  $sidenav.css({top: val + 'px' });
  $mainContent.css({marginTop: '-5px'});
}

function setHeightSideNav(){
  let scrollTop = $(window).scrollTop();
  let val = $header.height() + 10;
  if(scrollTop > $header.height()) $sidenav.css({top: 0});
  else $sidenav.css({top: val + 'px' });
}