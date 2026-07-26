/* YAPIGUC BETON AI CHATBOT v2.0 | Cloudflare Worker Proxy */
(function(){
var ENDPOINT='https://yapigucbeton.com.tr/api/chat';
var m=[],o=false,b=false;
document.head.insertAdjacentHTML('beforeend','<style>#yb{position:fixed;bottom:24px;right:24px;z-index:8500}#ybt{width:54px;height:54px;background:#c0001a;border-radius:50%;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(192,0,26,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;transition:all .3s}#ybt:hover{transform:scale(1.1)}#ybg{position:absolute;top:-3px;right:-3px;background:#16a34a;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:8px;font-family:Arial}#yw{position:fixed;bottom:88px;right:24px;width:300px;height:440px;background:#fff;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:8501;display:none;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif}#yw.on{display:flex;animation:ygup .3s ease}@keyframes ygup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}#yh{background:linear-gradient(135deg,#c0001a,#8a0012);color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px}#yh b{font-size:13px;flex:1}#yc{background:none;border:none;color:#fff;font-size:17px;cursor:pointer}#ym{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:7px;background:#f9fafb}.yg{max-width:85%;padding:8px 11px;border-radius:11px;font-size:13px;line-height:1.5;word-wrap:break-word}.yg.b{background:#fff;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,.08)}.yg.u{background:#c0001a;color:#fff;align-self:flex-end}.yt{display:flex;gap:4px;padding:8px 11px;background:#fff;border-radius:11px;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,.08)}.yt span{width:6px;height:6px;background:#c0001a;border-radius:50%;animation:yd .8s infinite}.yt span:nth-child(2){animation-delay:.15s}.yt span:nth-child(3){animation-delay:.3s}@keyframes yd{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}#yq{padding:6px 10px;display:flex;gap:4px;flex-wrap:wrap;background:#fff;border-top:1px solid #f3f4f6}.yqb{background:#fff5f5;border:1px solid #fca5a5;color:#c0001a;padding:3px 8px;border-radius:9px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s}.yqb:hover{background:#c0001a;color:#fff}#ya{padding:8px 10px;display:flex;gap:6px;background:#fff;border-top:1px solid #f3f4f6}#yi{flex:1;padding:7px 10px;border:1.5px solid #e5e7eb;border-radius:16px;font-size:13px;outline:none}#yi:focus{border-color:#c0001a}#ys{width:32px;height:32px;background:#c0001a;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center}#ys svg{width:14px;height:14px;fill:#fff}#yft{text-align:center;font-size:10px;color:#9ca3af;padding:3px;background:#fff}</style>');
var w=document.createElement('div');
w.innerHTML='<div id="yb"><button id="ybt" onclick="YC.t()"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><span id="ybg">AI</span></button></div><div id="yw"><div id="yh"><b>Yapiguc Asistan</b><button id="yc" onclick="YC.t()">&#x2715;</button></div><div id="ym"></div><div id="yq"><button class="yqb" onclick="YC.q(0)">&#x1F4B0; Fiyat</button><button class="yqb" onclick="YC.q(1)">&#x1F69B; Teslimat</button><button class="yqb" onclick="YC.q(2)">&#x1F4E6; Urunler</button><button class="yqb" onclick="YC.q(3)">&#x1F4CB; Teklif</button></div><div id="ya"><input id="yi" type="text" placeholder="Mesajinizi yazin..." maxlength="200"/><button id="ys" onclick="YC.s()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div><div id="yft">Yapiguc Beton AI | yapigucbeton.com.tr</div></div>';
document.body.appendChild(w);
document.getElementById('yi').addEventListener('keydown',function(e){if(e.key==='Enter')YC.s();});
var Q=['Fiyat bilgisi almak istiyorum','Teslimat yapıyor musunuz?','Hangi urunler var?','Teklif almak istiyorum'];
function am(t,r){var x=document.getElementById('ym');var d=document.createElement('div');d.className='yg '+r;d.textContent=t;x.appendChild(d);x.scrollTop=x.scrollHeight;}
function st(){var x=document.getElementById('ym');var d=document.createElement('div');d.className='yt';d.id='yt';d.innerHTML='<span></span><span></span><span></span>';x.appendChild(d);x.scrollTop=x.scrollHeight;}
function ht(){var t=document.getElementById('yt');if(t)t.remove();}
window.YC={
  t:function(){o=!o;document.getElementById('yw').classList.toggle('on',o);if(o&&m.length===0){setTimeout(function(){am('Merhaba! Yapiguc Beton\'a hos geldiniz. Parke tasi, bordur, sev tasi ve beton bariyer konularinda yardimci olabilirim!','b');m.push({role:'assistant',content:'Merhaba!'});},300);}if(o)document.getElementById('yi').focus();},
  q:function(i){document.getElementById('yi').value=Q[i];YC.s();},
  s:function(){
    if(b)return;
    var i=document.getElementById('yi');var t=i.value.trim();if(!t)return;
    i.value='';am(t,'u');m.push({role:'user',content:t});b=true;st();
    if(window.gtag)gtag('event','chatbot_msg',{event_category:'engagement',event_label:t.substring(0,50)});
    var x=new XMLHttpRequest();
    x.open('POST',ENDPOINT);
    x.setRequestHeader('Content-Type','application/json');
    x.onload=function(){ht();b=false;if(x.status===200){var d=JSON.parse(x.responseText);am(d.reply,'b');m.push({role:'assistant',content:d.reply});}else{am('Uzgunum, su an yanit veremiyorum. Lutfen 0532 374 69 45 arayin.','b');}};
    x.onerror=function(){ht();b=false;am('Baglanti hatasi. Lutfen 0532 374 69 45 arayin.','b');};
    x.send(JSON.stringify({message:t,history:m.slice(-6)}));
  }
};
setTimeout(function(){if(!o){var g=document.getElementById('ybg');if(g)g.textContent='1';}},5000);
})();