/* Carrito compartido (todas las páginas). Guarda en localStorage y, al pagar, pasa los ítems al carrito de WooCommerce
   (Store API, mismo dominio en producción) y redirige a su checkout con Webpay. */
var KEY='oc_cart_v1';
var $=function(s){return document.querySelector(s)};
function clp(n){return '$'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

var cart=[];
try{cart=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(cart))cart=[]}catch(e){cart=[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}

export function toast(t){var e=$('#toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},3200)}

export function draw(){
  var box=$('#items');if(!box)return;
  var n=cart.length,b=$('#badge');
  if(b){b.hidden=!n;b.textContent=n}
  box.innerHTML=n?'':'<p class="empty">Tu carrito está vacío.</p>';
  var sub=0;
  cart.forEach(function(it,i){
    sub+=it.total;
    var d=document.createElement('div');d.className='item';
    d.innerHTML='<img src="'+esc(it.img||'')+'" alt=""><div><b>'+esc(it.name)+'</b><ul>'+it.lines.map(function(l){return '<li>'+esc(l)+'</li>'}).join('')+'</ul><div class="pr"><span>1 unidad</span><b>'+clp(it.total)+'</b></div><button class="rm" type="button" data-i="'+i+'">Quitar</button></div>';
    box.appendChild(d);
  });
  var s=$('#sub');if(s)s.textContent=clp(sub);
  var p=$('#pay');if(p)p.disabled=!n;
}

export function open(o){
  document.body.classList.toggle('open',o);
  var c=$('#cart');if(c)c.inert=!o;
  if(o){var x=$('#closeCart');if(x)x.focus()}
}

/* item: {name,img,total,lines:[texto], wc:{id,variation:[{attribute,value}]}|null, extras:[{id,name}]} */
export function add(item){cart.push(item);save();draw();open(true);toast('Agregado al carrito')}

/* ---- pago ---- */
function mensajeWhatsApp(){
  var t=['Hola, quiero hacer este pedido:'];
  cart.forEach(function(it,i){t.push((i+1)+'. '+it.name+' — '+it.lines.join(', ')+' — '+clp(it.total))});
  t.push('Total: '+clp(cart.reduce(function(a,x){return a+x.total},0)));
  return t.join('\n');
}
function aWhatsApp(){window.open(($('#cart').dataset.wa||'https://wa.me/56941603654')+'?text='+encodeURIComponent(mensajeWhatsApp()),'_blank','noopener')}

async function api(wp,path,opts,st){
  opts=opts||{};
  var h={'Content-Type':'application/json'};
  if(st.nonce)h['Nonce']=st.nonce;
  var r=await fetch(wp+'/wp-json/wc/store/v1'+path,{method:opts.method||'GET',headers:h,credentials:'include',body:opts.body?JSON.stringify(opts.body):undefined});
  var nn=r.headers.get('Nonce')||r.headers.get('X-WC-Store-API-Nonce');if(nn)st.nonce=nn;
  if(!r.ok){var j={};try{j=await r.json()}catch(e){}var err=new Error(j.message||('HTTP '+r.status));err.status=r.status;throw err}
  return r.status===204?null:r.json();
}

async function pagar(){
  if(!cart.length)return;
  var wp=($('#cart').dataset.wp||'').replace(/\/$/,'');
  var completo=wp&&cart.every(function(it){return it.wc&&it.wc.id&&it.extrasOk!==false});
  if(!completo){toast('Este pedido lo terminamos por WhatsApp');aWhatsApp();return}
  var btn=$('#pay');btn.disabled=true;var txt=btn.textContent;btn.textContent='Preparando pago…';
  var st={nonce:null};
  try{
    await api(wp,'/cart',{},st);                         /* abre la sesión y entrega el nonce */
    await api(wp,'/cart/items',{method:'DELETE'},st);    /* parte desde un carrito limpio */
    for(var i=0;i<cart.length;i++){
      var it=cart[i];
      await api(wp,'/cart/add-item',{method:'POST',body:{id:it.wc.id,quantity:1,variation:it.wc.variation||[]}},st);
      var ex=it.extras||[];
      for(var k=0;k<ex.length;k++)await api(wp,'/cart/add-item',{method:'POST',body:{id:ex[k].id,quantity:1}},st);
    }
    window.location.href=wp+'/finalizar-compra/';
  }catch(e){
    console.warn('[carrito]',e);
    btn.disabled=false;btn.textContent=txt;
    toast('No pudimos abrir el pago ahora. Te dejamos el pedido por WhatsApp.');
    aWhatsApp();
  }
}

/* ---- eventos ---- */
function cartButton(e){var b=e.target.closest('button');return b&&!b.closest('#cart')&&/carrito/i.test(b.getAttribute('aria-label')||'')?b:null}
document.addEventListener('click',function(e){
  if(cartButton(e)){open(true);return}
  var b=e.target.closest('button');if(!b)return;
  if(b.id==='closeCart')open(false);
  else if(b.id==='pay')pagar();
  else if(b.classList.contains('rm')){cart.splice(+b.dataset.i,1);save();draw()}
});
document.addEventListener('click',function(e){if(e.target.id==='scrim')open(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('open'))open(false)});
window.addEventListener('storage',function(e){if(e.key===KEY){try{cart=JSON.parse(e.newValue||'[]')}catch(x){cart=[]}draw()}});
window.addEventListener('pageshow',function(){$('#pay')&&draw()});
draw();
