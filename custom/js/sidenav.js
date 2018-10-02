let $sidenav = $('.side-nav');
let $mainContent = $('.main-content');
$('.side-nav .cog').click(toggleSidenav);

function toggleSidenav(e){
  let left = $sidenav.css('left');
  if(left == '0px') $sidenav.css({left: '-260px'});
  else $sidenav.css({left: '0px'});
}