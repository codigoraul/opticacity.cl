(function(){
  var B=import.meta.env.BASE_URL;
  var IMG={"g1": B+"img/g1.jpg", "g2": B+"img/g2.jpg", "g3": B+"img/g3.jpg", "g4": B+"img/g4.jpg", "hero1": B+"img/hero1.jpg", "hero2": B+"img/hero2.jpg", "hero3": B+"img/hero3.jpg", "hombre": B+"img/hombre.jpg", "mujer": B+"img/mujer.jpg", "sol": B+"img/sol.jpg", "tienda1": B+"img/tienda1.jpg", "tienda2": B+"img/tienda2.jpg"};
  var $=function(s){return document.querySelector(s)};
  var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')};
  var words=function(t){return t.trim().split(/\s+/).map(function(w,i){return '<span class="w"><span style="--i:'+i+'">'+esc(w)+'</span></span>'}).join(' ')};
  var arrow=function(d){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'};

  /* menú */
  var menu=[
    {t:'Anteojos',s:['Todos los anteojos','Mujer','Hombre','En oferta','Anteojos recientes']},
    {t:'Anteojos de sol',s:['Todos','Mujer','Hombre','Graduados']},
    {t:'Cristales',s:['Monofocales','Bifocales','Progresivos','Filtro luz azul','Fotocromáticos']},
    {t:'Contactología',a:'#contacto'},
    {t:'Nosotros',a:'#nosotros'}
  ];
  $('#nav').innerHTML=menu.map(function(m){
    if(m.a)return '<li><a href="'+m.a+'">'+m.t+'</a></li>';
    return '<li><button type="button" aria-haspopup="true">'+m.t+'</button><div class="panel">'+m.s.map(function(x){return '<a href="#productos">'+x+'</a>'}).join('')+'</div></li>';
  }).join('');
  $('#nav').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var o=b.parentElement.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  $('#menuBtn').onclick=function(){var o=$('#nav').classList.toggle('open');this.setAttribute('aria-expanded',o)};

  /* slider */
  var slides=[
    {k:'hero1',side:'right',pos:'50% 30%',alt:'Mujer sonriendo con anteojos de armazón transparente',lab:'Nueva temporada',h:'Mira el mundo con tu propio estilo',p:'Armazones livianos, cristales a tu medida y atención de un Tecnólogo Médico Optómetra.',c1:'Ver anteojos',c2:'Personalizar'},
    {k:'hero2',side:'left',pos:'50% 22%',alt:'Hombre con anteojos de armazón negro frente a un fondo turquesa',lab:'Colección hombre',h:'Líneas limpias, presencia de sobra',p:'Modelos exclusivos para hombre, desde clásicos hasta formas más atrevidas.',c1:'Ver hombre',c2:'Cristales'},
    {k:'hero3',side:'left',pos:'50% 35%',alt:'Mujer con anteojos de sol de armazón carey bajo el sol',lab:'Anteojos de sol',h:'Luz de verano, cuida tu mirada',p:'Anteojos de sol con protección y estilo. También con tu receta.',c1:'Ver anteojos de sol',c2:'Más información'}
  ];
  $('#slides').innerHTML=slides.map(function(s,i){
    return '<div class="slide'+(s.side==='right'?' right':'')+(i===0?' on':'')+'" role="group" aria-roledescription="diapositiva" aria-label="'+(i+1)+' de '+slides.length+'"'+(i?' inert':'')+'>'+
      '<img src="'+IMG[s.k]+'" alt="'+s.alt+'" style="object-position:'+s.pos+'"'+(i?' loading="lazy"':'')+'><div class="shade"></div>'+
      '<div class="wrap"><div class="copy"><span class="label">'+s.lab+'</span><h2>'+words(s.h)+'</h2><p>'+s.p+'</p><div class="row"><a class="btn pink" href="#productos">'+s.c1+'</a><a class="btn line" href="#configurador">'+s.c2+'</a></div></div></div></div>';
  }).join('');
  $('#dots').innerHTML=slides.map(function(s,i){return '<button class="dot" type="button" aria-label="Ir a la diapositiva '+(i+1)+'" data-i="'+i+'"><i></i></button>'}).join('');
  var cur=0,timer=null,paused=false,DUR=6500;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sl=$('#slider');
  function show(n){
    cur=(n+slides.length)%slides.length;
    var els=document.querySelectorAll('.slide');
    els.forEach(function(e,i){var on=i===cur;e.classList.toggle('on',on);if(on)e.removeAttribute('inert');else e.setAttribute('inert','')});
    document.querySelectorAll('.dot').forEach(function(d,i){
      d.setAttribute('aria-current',i===cur?'true':'false');
      var b=d.firstChild;b.style.animation='none';void b.offsetWidth;b.style.animation='';
    });
    schedule();
  }
  function schedule(){clearTimeout(timer);if(paused||reduce)return;timer=setTimeout(function(){show(cur+1)},DUR)}
  function setPaused(p){
    paused=p;sl.classList.toggle('paused',p);
    $('#pause').setAttribute('aria-label',p?'Reanudar presentación':'Pausar presentación');
    $('#pauseIc').innerHTML=p?'<path d="M7 5l12 7-12 7z"/>':'<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
    if(p)clearTimeout(timer);else show(cur);
  }
  if(reduce){sl.classList.add('static');paused=true}
  $('#prev').onclick=function(){show(cur-1)};
  $('#next').onclick=function(){show(cur+1)};
  $('#pause').onclick=function(){setPaused(!paused)};
  $('#dots').addEventListener('click',function(e){var d=e.target.closest('.dot');if(d)show(+d.getAttribute('data-i'))});
  var tx=null;
  sl.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  sl.addEventListener('touchend',function(e){if(tx==null)return;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));tx=null});
  sl.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
  show(0);

  /* categorías */
  var tiles=[
    {n:'Anteojos para mujer',k:'mujer',pos:'50% 30%',alt:'Mujer pelirroja sonriendo con anteojos transparentes'},
    {n:'Anteojos para hombre',k:'hombre',pos:'48% 30%',alt:'Hombre con anteojos redondos y bigote'},
    {n:'Anteojos de sol',k:'sol',pos:'40% 40%',alt:'Mujer con anteojos de sol y el pelo al viento'},
    {n:'Filtro luz azul',k:'g3',pos:'46% 35%',alt:'Hombre ajustándose los anteojos con tirantes y camisa blanca'}
  ];
  $('#tiles').innerHTML=tiles.map(function(t){
    return '<a class="tile" href="#productos"><img src="'+IMG[t.k]+'" alt="'+t.alt+'" style="object-position:'+t.pos+'" loading="lazy"><div class="tx"><h3>'+t.n+'</h3><span>Descubrir</span></div></a>';
  }).join('');

  document.querySelector('.car').addEventListener('click',function(e){
    var f=e.target.closest('.fav');
    if(f){f.setAttribute('aria-pressed',String(f.getAttribute('aria-pressed')!=='true'));return}
    var n=e.target.closest('.nv');
    if(n){var r=$('#rail');r.scrollBy({left:+n.getAttribute('data-dir')*r.clientWidth*.8,behavior:'smooth'});return}
    if(e.target.closest('[data-add]')){var b=$('#badge');b.hidden=false;b.textContent=(+b.textContent||0)+1}
  });

  /* banda y novedades */
  $('#bandImg').src=IMG.tienda1;
  $('#newsImg').src=IMG.hero3;

  /* cristales */
  var lens=[
    {n:'Monofocales',d:'Visión nítida de lejos o de cerca.',bg:'radial-gradient(circle at 30% 28%,#ffffff,#d6e5fb 70%)'},
    {n:'Bifocales',d:'Lejos y cerca en un mismo cristal.',bg:'linear-gradient(180deg,#e7f0ff 0 58%,#aac7f2 58% 100%)'},
    {n:'Progresivos',d:'Todas las distancias, sin línea visible.',bg:'linear-gradient(180deg,#eaf2ff,#9dbfee)'},
    {n:'Filtro luz azul',d:'Más comodidad frente a las pantallas.',bg:'radial-gradient(circle at 30% 28%,#bcd6ff,#3f78d6 80%)'},
    {n:'Fotocromáticos',d:'Se oscurecen con el sol y se aclaran en interiores.',bg:'linear-gradient(90deg,#f3f6fb 0%,#9aa3b6 55%,#2f3649 100%)'}
  ];
  $('#lens').innerHTML=lens.map(function(l){
    return '<a class="lc" href="#configurador"><span class="orb" style="background:'+l.bg+'"></span><h3>'+l.n+'</h3><p>'+l.d+'</p></a>';
  }).join('');

  /* galería */
  var gal=[['g1','Mujer con anteojos mirando por una ventana'],['g2','Mujer con anteojos en una calle de ciudad'],['g4','Mujer mayor ajustándose los anteojos'],['tienda2','Hombre con anteojos de armazón fino'],['hero2','Hombre con anteojos frente a un fondo turquesa'],['mujer','Mujer sonriendo con anteojos transparentes']];
  $('#gal').innerHTML=gal.map(function(g){return '<a href="https://www.instagram.com/opticacitycl/" target="_blank" rel="noopener noreferrer"><img src="'+IMG[g[0]]+'" alt="'+g[1]+'" loading="lazy"></a>'}).join('');

  /* animaciones al hacer scroll: títulos palabra por palabra, bloques que suben e imágenes que se descubren */
  if(!reduce&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;
      var el=e.target;io.unobserve(el);el.classList.add('in');
      // al terminar, se quitan los estilos de entrada para no interferir con los hover propios de cada bloque
      if(el.hasAttribute('data-rv'))setTimeout(function(){el.removeAttribute('data-rv');el.classList.remove('in');el.style.removeProperty('--s')},1800+(+el.style.getPropertyValue('--s')||0)*110);
    })},{rootMargin:'0px 0px -8% 0px',threshold:.12});
    document.querySelectorAll('.head h2,.band h2,.trust h2,.news h2').forEach(function(h){h.innerHTML=words(h.textContent);h.classList.add('rvw');io.observe(h)});
    document.querySelectorAll('.tile').forEach(function(el){
      el.setAttribute('data-rv','');
      el.style.setProperty('--s',Math.min(Array.prototype.indexOf.call(el.parentElement.children,el),5));
      io.observe(el);
    });
    document.querySelectorAll('.band .pic,.news .pic').forEach(function(el){el.setAttribute('data-rv','img');io.observe(el)});
  }

  /* novedades: valida el formato; esta muestra no envía correos */
  $('#nl').addEventListener('submit',function(e){
    e.preventDefault();
    var v=$('#mail').value.trim();
    $('#msg').textContent=/^\S+@\S+\.\S+$/.test(v)?'Correo válido. En esta muestra no se envían suscripciones.':'Escribe un correo válido, por ejemplo nombre@correo.cl.';
  });
})();
