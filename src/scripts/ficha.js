import * as Cart from './cart.js';
var B=import.meta.env.BASE_URL;
var P=JSON.parse(document.getElementById('product-data').textContent);
var IMG={"g3":B+"img/g3.jpg","hero1":B+"img/hero1.jpg","hero2":B+"img/hero2.jpg","mujer":B+"img/mujer.jpg","tienda1":B+"img/tienda1.jpg","tienda2":B+"img/tienda2.jpg","hombre":B+"img/hombre.jpg"};
var $=function(s){return document.querySelector(s)};
function clp(n){return '$'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstElementChild}

var BASE=P.price||0;
function fmt(n){return P.price?clp(n):'Consultar precio'}
var MUESTRA_COLOR={negro:'col01',cafe:'col02',morado:'col03',rosado:'col04',rosa:'col04',azul:'col05'};
function imgsFor(c){
  var ci=(P.colorImages&&P.colorImages[c.n])||[];
  var base=P.images||[];
  if(!P.muestra&&(ci.length||base.length)){
    /* fotos de la variación de este color primero, luego la galería del producto */
    return ci.concat(base.filter(function(s){return ci.indexOf(s)<0})).map(function(s){return {src:s,p:'50% 50%'}});
  }
  /* muestra: lentes solos (vista de este color y vista frontal) y una sola foto con modelo */
  var k=MUESTRA_COLOR[c.id]||'col01';
  var i=COLORS.indexOf(c);var f=FALL[(i<0?0:i)%FALL.length];
  return [{src:B+'img/yh101-'+k+'.jpg',p:'50% 50%'},{src:B+'img/yh101-front.jpg',p:'50% 50%'},{src:IMG[f.imgs[0]],p:f.pos[0]}];
}

/* Opciones del producto: salen de los atributos de WooCommerce (color, material, uso y tipo de cristal) */
function slug(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
var SWATCH={'negro':'#16181d','café':'linear-gradient(135deg,#c9a77c,#8a6238)','cafe':'linear-gradient(135deg,#c9a77c,#8a6238)','rosado':'#f07fb0','rosa':'#f07fb0','azul':'#1b3a78','transparente':'linear-gradient(135deg,#ffffff,#dfe8f3)','rojo':'#b3261e','dorado':'#c9a24a','plateado':'#b8bcc6','verde':'#2f6b4f','gris':'#7b8190','blanco':'#f3f4f7'};
var FALL=[
 {imgs:['g3','hero2','tienda2'],pos:['50% 30%','50% 30%','70% 25%']},
 {imgs:['hero1','mujer','g3'],pos:['38% 30%','36% 30%','50% 30%']},
 {imgs:['tienda1','hero1','mujer'],pos:['86% 30%','38% 30%','36% 30%']},
 {imgs:['hombre','tienda2','hero2'],pos:['55% 30%','70% 25%','50% 30%']}
];
var CR=P.cristales||{usos:{},tipos:{}};
function opts(list,def){return (list&&list.length?list:def)}
/* orden lógico según src/data/cristales.ts (WordPress entrega los valores por orden alfabético) */
function ordenar(list,ref){var k=Object.keys(ref||{});return list.slice().sort(function(a,b){var i=k.indexOf(a),j=k.indexOf(b);return (i<0?99:i)-(j<0?99:j)})}
var COLORS=opts(P.colors,['Negro']).map(function(n,i){var f=FALL[i%FALL.length];return {id:slug(n),n:n,c:SWATCH[n.toLowerCase()]||'#9aa3b6',imgs:f.imgs,pos:f.pos}});
var SIZES=opts(P.sizes,['Acetato']).map(function(n){return {id:slug(n),n:n}});
var LENS=ordenar(opts(P.usos,['Solo armazón','Monofocal']),CR.usos).map(function(n){var c=CR.usos[n]||{d:'',p:0};return {id:slug(n),n:n,d:c.d,p:c.p,wc:c.wc||null}});
var GLASS=ordenar(opts(P.tipos,['Transparente']),CR.tipos).map(function(n){var c=CR.tipos[n]||{d:'',p:0};return {id:slug(n),n:n,d:c.d,p:c.p,wc:c.wc||null}});

var S={color:COLORS[0].id,size:SIZES[0].id,lens:(LENS.filter(function(x){return x.id==='monofocal'})[0]||LENS[0]).id,glass:GLASS[0].id,img:0};

function build(){
  $('#colors').innerHTML=COLORS.map(function(c){return '<label title="'+c.n+'"><input type="radio" name="color" value="'+c.id+'"'+(c.id===S.color?' checked':'')+' aria-label="'+c.n+'"><span style="background:'+c.c+'"></span></label>'}).join('');
  $('#sizes').innerHTML=SIZES.map(function(s){return '<label class="opt"><input type="radio" name="size" value="'+s.id+'"'+(s.id===S.size?' checked':'')+'><div><b>'+s.n+'</b></div></label>'}).join('');
  $('#lens').innerHTML=LENS.map(function(l){return '<label class="opt"><input type="radio" name="lens" value="'+l.id+'"'+(l.id===S.lens?' checked':'')+'><div><b>'+l.n+'</b><small>'+l.d+'</small><span class="p">'+(l.p?'+'+clp(l.p):'Incluido')+'</span></div></label>'}).join('');
  $('#glass').innerHTML=GLASS.map(function(g){return '<label class="opt"><input type="radio" name="glass" value="'+g.id+'"'+(g.id===S.glass?' checked':'')+'><div><b>'+g.n+'</b><small>'+g.d+'</small><span class="p">'+(g.p?'+'+clp(g.p):'Incluido')+'</span></div></label>'}).join('');
}
function by(a,id){return a.filter(function(x){return x.id===id})[0]}
function cfgLines(){
  var c=by(COLORS,S.color),sz=by(SIZES,S.size),l=by(LENS,S.lens),g=by(GLASS,S.glass);
  var L=[[P.name,BASE],['Color: '+c.n,0],['Material: '+sz.n,0],['Receta: '+l.n,l.p]];
  if(S.lens!=='solo-armazon')L.push(['Cristal: '+g.n,g.p]);
  return L;
}
function total(){return cfgLines().reduce(function(a,x){return a+x[1]},0)}
function render(){
  var L=cfgLines();
  $('#lines').innerHTML=L.map(function(x){return '<li><span>'+x[0]+'</span><span>'+(x[1]?'+'+clp(x[1]):'—')+'</span></li>'}).join('');
  var T=total();$('#total').textContent=fmt(T);$('#price').textContent=fmt(T);
  var c=by(COLORS,S.color);$('#colorName').textContent=c.n;
  var sz=by(SIZES,S.size);$('#sizeName').textContent=sz.n;
  var solo=S.lens==='solo-armazon';
  $('#glassStep').hidden=solo;
  $('#rxHint').hidden=solo;
}
function gallery(first){
  var c=by(COLORS,S.color);
  var imgs=imgsFor(c);
  var m=$('#mainImg');
  if(first){m.src=imgs[0].src;m.style.objectPosition=imgs[0].p;S.img=0}
  $('#thumbs').innerHTML=imgs.map(function(x,i){return '<button type="button" data-i="'+i+'" aria-label="Foto '+(i+1)+'" aria-current="'+(i===S.img)+'"><img src="'+x.src+'" alt="" style="object-position:'+x.p+'"></button>'}).join('');
  $('#tag').textContent=c.n;
}
function setMain(i){
  var c=by(COLORS,S.color),m=$('#mainImg');S.img=i;
  m.classList.add('fade');
  setTimeout(function(){var it=imgsFor(c)[i];m.src=it.src;m.style.objectPosition=it.p;m.classList.remove('fade')},180);
  document.querySelectorAll('#thumbs button[data-i]').forEach(function(b){b.setAttribute('aria-current',+b.dataset.i===i)});
}
build();gallery(true);render();

document.addEventListener('change',function(e){
  var t=e.target,n=t.name;
  if(n==='color'){S.color=t.value;gallery(true)}
  else if(n==='size')S.size=t.value;
  else if(n==='lens')S.lens=t.value;
  else if(n==='glass')S.glass=t.value;
  render();
});
document.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.closest('#thumbs')&&b.dataset.i!==undefined)setMain(+b.dataset.i);
  else if(b.id==='add'){
    var c=by(COLORS,S.color),sz=by(SIZES,S.size),l=by(LENS,S.lens),g=by(GLASS,S.glass);
    var solo=S.lens==='solo-armazon';
    var lines=cfgLines().slice(1).map(function(x){return x[0]});
    if(!solo)lines.push('Receta: se envía por WhatsApp');
    /* variación de WooCommerce según color y material */
    var v=(P.variations||[]).filter(function(x){return x.attrs.color===c.id&&x.attrs.material===sz.id})[0];
    var wc=v?{id:v.id,variation:[{attribute:'Color',value:c.id},{attribute:'Material',value:sz.id}]}:null;
    /* cristales: productos de WooCommerce con su propio precio */
    var extras=[],ok=true;
    if(l.p>0){if(l.wc)extras.push({id:l.wc,name:'Cristal '+l.n});else ok=false}
    if(!solo&&g.p>0){if(g.wc)extras.push({id:g.wc,name:'Cristal '+g.n});else ok=false}
    Cart.add({name:P.name,total:total(),lines:lines,img:imgsFor(c)[0].src,wc:wc,extras:extras,extrasOk:ok});
  }
  else if(b.id==='wa')window.open('https://wa.me/56941603654?text='+encodeURIComponent('Hola, quiero consultar por el '+P.name+': '+cfgLines().slice(1).map(function(x){return x[0]}).join(', ')+'. Total referencial '+fmt(total())),'_blank','noopener');
});
