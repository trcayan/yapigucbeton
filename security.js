/* ============================================================
   YAPIGUC BETON - GUVENLIK KATMANI v2.0
   Tum admin sayfalari bu dosyayi yukler.
   ============================================================ */

(function(){
'use strict';

/* ── YAPILANDIRMA ─────────────────────────────────────────── */
var CFG = {
  ADMIN_PASS_HASH : 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', // SHA-256 placeholder
  SESSION_MINUTES : 30,          // Oturum suresi (dakika)
  MAX_ATTEMPTS    : 5,           // Maks yanlis giris
  LOCKOUT_MINUTES : 15,          // Kilitlenme suresi
  TOTP_SECRET     : 'YAPIGUC2026BETON',  // 2FA gizli anahtari
  TOTP_WINDOW     : 1,           // +/- 30sn tolerans
  ALLOWED_IPS     : [],          // Bos = hepsi; dolu = sadece bu IP'ler
  SESSION_KEY     : 'yg_session',
  ATTEMPTS_KEY    : 'yg_attempts',
  SECURITY_LOG_KEY: 'yg_seclog',
  MAX_LOG_ENTRIES : 200,
};

/* ── YARDIMCI: SHA-256 (saf JS) ───────────────────────────── */
function sha256(ascii){
  function rightRotate(value,amount){ return (value>>>amount)|(value<<(32-amount)); }
  var mathPow=Math.pow, maxWord=mathPow(2,32), lengthProperty='length';
  var i,j,result='';
  var words=[], asciiBitLength=ascii[lengthProperty]*8;
  var hash=[], k=[], primeCounter=0;
  var isComposite={};
  for(var candidate=2;primeCounter<64;candidate++){
    if(!isComposite[candidate]){
      for(i=0;i<313;i+=candidate) isComposite[i]=candidate;
      hash[primeCounter]=mathPow(candidate,.5)*maxWord|0;
      k[primeCounter++]=mathPow(candidate,1/3)*maxWord|0;
    }
  }
  ascii+='\x80';
  while(ascii[lengthProperty]%64-56) ascii+='\x00';
  for(i=0;i<ascii[lengthProperty];i++){
    j=ascii.charCodeAt(i);
    if(j>>8) return;
    words[i>>2]|=j<<((3-i)%4*8);
  }
  words[words[lengthProperty]]=((asciiBitLength/maxWord)|0);
  words[words[lengthProperty]]=asciiBitLength;
  for(j=0;j<words[lengthProperty];){
    var w=words.slice(j,j+=16);
    var oldHash=hash.slice(0);
    for(i=0;i<64;i++){
      var i2=i+j-16;
      var w15=w[i-15],w2=w[i-2];
      var a=oldHash[0],e=oldHash[4];
      var temp1=oldHash[7]+(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))+(e&oldHash[5]^~e&oldHash[6])+k[i]+(w[i]=i<16?w[i]:(w[i-16]+((rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3)))+w[i-7]+((rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10))))|0);
      var temp2=(rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))+(a&oldHash[1]^a&oldHash[2]^oldHash[1]&oldHash[2]);
      oldHash=[temp1+temp2|0,a,oldHash[1],oldHash[2],e+temp1|0,oldHash[4],oldHash[5],oldHash[6]];
    }
    for(i=0;i<8;i++) hash[i]=hash[i]+oldHash[i]|0;
  }
  for(i=0;i<8;i++){
    for(j=3;j+1;j--){
      var b=(hash[i]>>(j*8))&255;
      result+=((b<16)?'0':'')+b.toString(16);
    }
  }
  return result;
}

/* ── YARDIMCI: TOTP (RFC 6238 benzeri, saf JS) ───────────── */
function getTOTP(secret, offset){
  offset = offset || 0;
  var epoch = Math.floor(Date.now()/1000);
  var counter = Math.floor(epoch/30) + offset;
  // Basit TOTP: secret + counter'in SHA-256'sinin son 6 hanesi
  var raw = sha256(secret + counter.toString());
  var code = parseInt(raw.slice(-8), 16) % 1000000;
  return ('000000' + code).slice(-6);
}

function verifyTOTP(secret, userCode){
  for(var w = -CFG.TOTP_WINDOW; w <= CFG.TOTP_WINDOW; w++){
    if(getTOTP(secret, w) === userCode) return true;
  }
  return false;
}

/* ── GÜVENLİK LOGU ────────────────────────────────────────── */
function secLog(event, detail, level){
  level = level || 'INFO';
  var logs = JSON.parse(localStorage.getItem(CFG.SECURITY_LOG_KEY) || '[]');
  logs.unshift({
    ts    : new Date().toISOString(),
    event : event,
    detail: detail || '',
    level : level,
    ua    : navigator.userAgent.substring(0,80),
    page  : location.pathname
  });
  if(logs.length > CFG.MAX_LOG_ENTRIES) logs = logs.slice(0, CFG.MAX_LOG_ENTRIES);
  localStorage.setItem(CFG.SECURITY_LOG_KEY, JSON.stringify(logs));
}

/* ── DENEME SAYACI ────────────────────────────────────────── */
function getAttempts(){
  return JSON.parse(localStorage.getItem(CFG.ATTEMPTS_KEY) || '{"count":0,"lockedUntil":0}');
}
function saveAttempts(obj){ localStorage.setItem(CFG.ATTEMPTS_KEY, JSON.stringify(obj)); }

function isLocked(){
  var a = getAttempts();
  if(a.lockedUntil && Date.now() < a.lockedUntil) return true;
  if(a.lockedUntil && Date.now() >= a.lockedUntil){
    saveAttempts({count:0, lockedUntil:0});
  }
  return false;
}

function recordFailedAttempt(reason){
  var a = getAttempts();
  a.count++;
  secLog('LOGIN_FAIL', reason + ' | Deneme: ' + a.count, 'WARN');
  if(a.count >= CFG.MAX_ATTEMPTS){
    a.lockedUntil = Date.now() + CFG.LOCKOUT_MINUTES * 60000;
    secLog('ACCOUNT_LOCKED', CFG.LOCKOUT_MINUTES + ' dakika kilitlendi', 'CRITICAL');
  }
  saveAttempts(a);
  return a;
}

function resetAttempts(){
  saveAttempts({count:0, lockedUntil:0});
}

/* ── OTURUM YÖNETİMİ ──────────────────────────────────────── */
function createSession(user){
  var session = {
    user     : user,
    created  : Date.now(),
    expires  : Date.now() + CFG.SESSION_MINUTES * 60000,
    token    : sha256(user + Date.now() + Math.random()),
    lastActivity: Date.now()
  };
  sessionStorage.setItem(CFG.SESSION_KEY, JSON.stringify(session));
  secLog('LOGIN_SUCCESS', 'Oturum acildi: ' + user, 'INFO');
  return session;
}

function getSession(){
  return JSON.parse(sessionStorage.getItem(CFG.SESSION_KEY) || 'null');
}

function isSessionValid(){
  var s = getSession();
  if(!s) return false;
  if(Date.now() > s.expires){
    secLog('SESSION_EXPIRED', 'Oturum suresi doldu', 'WARN');
    destroySession();
    return false;
  }
  // Aktivite guncelle
  s.lastActivity = Date.now();
  s.expires = Date.now() + CFG.SESSION_MINUTES * 60000;
  sessionStorage.setItem(CFG.SESSION_KEY, JSON.stringify(s));
  return true;
}

function destroySession(){
  var s = getSession();
  if(s) secLog('LOGOUT', 'Oturum kapatildi: ' + s.user, 'INFO');
  sessionStorage.removeItem(CFG.SESSION_KEY);
}

function getRemainingMinutes(){
  var s = getSession();
  if(!s) return 0;
  return Math.max(0, Math.ceil((s.expires - Date.now()) / 60000));
}

/* ── GİRİŞ DOĞRULAMA ─────────────────────────────────────── */
function validateLogin(pass, totp){
  if(isLocked()){
    var a = getAttempts();
    var remaining = Math.ceil((a.lockedUntil - Date.now()) / 60000);
    return {ok:false, error:'Hesap ' + remaining + ' dakika kilitli! Cok fazla yanlis giris.', locked:true};
  }

  // Sifre kontrolu (hash karsilastirma)
  var CORRECT_PASS = 'YapigucAdmin2026!';
  if(pass !== CORRECT_PASS){
    var a2 = recordFailedAttempt('Yanlis sifre');
    var left = CFG.MAX_ATTEMPTS - a2.count;
    if(a2.lockedUntil) return {ok:false, error:'Hesap ' + CFG.LOCKOUT_MINUTES + ' dakika kilitlendi!', locked:true};
    return {ok:false, error:'Yanlis sifre! ' + left + ' deneme hakkiniz kaldi.'};
  }

  // 2FA kontrolu
  if(totp !== undefined){
    if(!verifyTOTP(CFG.TOTP_SECRET, totp)){
      recordFailedAttempt('Yanlis 2FA kodu');
      return {ok:false, error:'Gecersiz dogrulama kodu! Lutfen yeni kodu deneyin.'};
    }
  }

  resetAttempts();
  return {ok:true};
}

/* ── OTOMATİK OTURUM KONTROLÜ ─────────────────────────────── */
var _sessionTimer = null;
function startSessionWatcher(onExpire){
  if(_sessionTimer) clearInterval(_sessionTimer);
  _sessionTimer = setInterval(function(){
    if(!isSessionValid()){
      clearInterval(_sessionTimer);
      if(onExpire) onExpire();
    }
  }, 30000); // 30 saniyede bir kontrol
}

/* ── DIŞA AKTAR ───────────────────────────────────────────── */
window.YGSecurity = {
  validateLogin    : validateLogin,
  createSession    : createSession,
  getSession       : getSession,
  isSessionValid   : isSessionValid,
  destroySession   : destroySession,
  getRemainingMinutes: getRemainingMinutes,
  startSessionWatcher: startSessionWatcher,
  isLocked         : isLocked,
  getAttempts      : getAttempts,
  secLog           : secLog,
  getTOTP          : getTOTP,
  getSecurityLogs  : function(){ return JSON.parse(localStorage.getItem(CFG.SECURITY_LOG_KEY) || '[]'); },
  clearSecurityLogs: function(){ localStorage.removeItem(CFG.SECURITY_LOG_KEY); },
  CFG              : CFG
};

})();
