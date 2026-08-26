/* ===== الأيقونات والشعار ===== */
const I={
home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
 plane:'<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
compass:'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
map:'<polygon points="1 6 1 22 8 18 15 22 23 18 23 2 15 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="15" y1="6" x2="15" y2="22"/>',
cam:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
chat:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
hotel:'<path d="M3 21h18"/><path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/><path d="M9 9h1M9 13h1M14 9h1M14 13h1"/>',
food:'<path d="M5 2v6a3 3 0 0 0 6 0V2"/><line x1="8" y1="11" x2="8" y2="22"/><path d="M19 2c-2.5 4-2.5 8 0 10v10"/>',
star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
cloud:'<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
nav:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>'
};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const LOGO=`<svg viewBox="0 0 32 32" fill="none" role="img" aria-label="أيقونة My Sindbad">
 <path d="M4 20L8 16L12 20L16 16L20 20L24 16L28 20" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"/>
 <path d="M8 20V26H24V20" fill="#D4AF37"/>
 <path d="M16 8V16" stroke="#D4AF37" stroke-width="2"/>
 <path d="M16 8L22 12L16 16Z" fill="#D4AF37"/>
</svg><span class="logo-copy"><strong>My Sindbad</strong><small>رفيق السفر</small></span>`;

function applyDynamicTheme() {
  if (!window.MySindbadTimeUtils || !session) return;
  const { getTimePeriod, getGreeting, getBackgroundConfig } = window.MySindbadTimeUtils;
  const period = getTimePeriod();
  const greeting = getGreeting();
  const bgClasses = getBackgroundConfig();
  const greetingElement = document.getElementById('greeting-text') || document.querySelector('h1');
  if (greetingElement) greetingElement.textContent = greeting;

  // Preserve the app's existing body classes while adding the dynamic theme classes.
  document.body.classList.add(...bgClasses.split(/\s+/), 'transition-all', 'duration-700', 'ease-in-out', 'min-h-screen');
  document.body.dataset.timePeriod = period;

  // The project is plain HTML/JS, so provide a visual fallback when Tailwind is not loaded.
  const fallbackBackgrounds = {
    fajr: 'linear-gradient(to bottom, #0A192F, #334e68)',
    morning: 'linear-gradient(to bottom, #38bdf8, #bae6fd)',
    day: 'linear-gradient(to bottom, #93c5fd, #dbeafe)',
    sunset: 'linear-gradient(to bottom, #fb923c, #f472b6, #a855f7)',
    night: '#0A192F'
  };
  document.body.style.background = fallbackBackgrounds[period];
}


/* ===== البيانات ===== */
const CITIES={
 istanbul:{n:'إسطنبول',c:'تركيا',lat:41.01,lon:28.97,hotels:[{n:'فندق سينوم هوتل',p:120,r:4.7},{n:'فندق راديسون بلو',p:150,r:4.5},{n:'فندق CW بيوغلو',p:90,r:4.3}],rest:[{n:'مطعم حمادي',t:'مأكولات تركية'},{n:'مطعم سلطان المشاوي',t:'مشاوي'},{n:'مقهى بييرا',t:'حلويات وقهوة'}],spots:[{n:'آيا صوفيا',d:'تحفة معمارية تاريخية'},{n:'البازار الكبير',d:'سوق تاريخي بآلاف المحلات'},{n:'برج غلطة',d:'إطلالة بانورامية على المدينة'}]},
 marrakech:{n:'مراكش',c:'المغرب',lat:31.63,lon:-7.99,hotels:[{n:'رياض النخيل',p:70,r:4.8},{n:'فندق المنارة',p:110,r:4.6},{n:'دار الضيافة القديمة',p:45,r:4.4}],rest:[{n:'مطعم دار يسيف',t:'طبخ مغربي'},{n:'كافيه غلوريا',t:'عصري'},{n:'مطعم المدينة',t:'مشاوي'}],spots:[{n:'جامع الفنا',d:'ساحة تاريخية نابضة'},{n:'حديقة ماجوريل',d:'حديقة عالمية شهيرة'},{n:'قصر الباهية',d:'عمارة أندلسية رائعة'}]},
 dubai:{n:'دبي',c:'الإمارات',lat:25.2,lon:55.27,hotels:[{n:'فندق العنوان',p:220,r:4.8},{n:'روف داون تاون',p:130,r:4.5},{n:'إيبس النجمة',p:80,r:4.2}],rest:[{n:'مطعم أربيان تيبس',t:'خليجي'},{n:'مطعم بيت البحر',t:'بحري'},{n:'كافيه رايتش',t:'فطور وحلويات'}],spots:[{n:'برج خليفة',d:'أعلى برج في العالم'},{n:'دبي مول',d:'أكبر مركز تسوق'},{n:'خور دبي',d:'جولة بالقوارب التقليدية'}]},
 cairo:{n:'القاهرة',c:'مصر',lat:30.04,lon:31.24,hotels:[{n:'فندق النيل الكبير',p:95,r:4.6},{n:'فندق وسط البلد',p:60,r:4.3},{n:'دار مصر القديمة',p:40,r:4.4}],rest:[{n:'مطعم أم كلثوم',t:'شرقي'},{n:'كشري التحرير',t:'شعبي'},{n:'قهوة الفيشاوي',t:'تاريخي'}],spots:[{n:'أهرامات الجيزة',d:'أعجوبة الدنيا القديمة'},{n:'المتحف المصري',d:'آثار فرعونية'},{n:'خان الخليلي',d:'سوق تاريخي'}]},
 paris:{n:'باريس',c:'فرنسا',lat:48.85,lon:2.35,hotels:[{n:'فندق اللوفر',p:190,r:4.7},{n:'hotel مونمارتر',p:110,r:4.4},{n:'إيبس باستيل',p:85,r:4.2}],rest:[{n:'مطعم لوتيس',t:'فرنسي راق'},{n:'كافيه دو باري',t:'مقهى'},{n:'مطعم الشام',t:'شرقي'}],spots:[{n:'برج إيفل',d:'رمز باريس'},{n:'متحف اللوفر',d:'أكبر متحف فني'},{n:'قوس النصر',d:'معلم تاريخي'}]}
};
 // <!-- QA14-IMG -->
 const CITY_IMAGES={
 istanbul:'./images/istanbul.jpg',
  marrakech:'./images/marrakech.jpg',
   chefchaouen:'./images/chefchaouen.jpg',
 dubai:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=82',
 cairo:'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=700&q=82',
 paris:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=82'
};
const RATES={USD:1,EUR:.92,GBP:.79,TRY:33,MAD:10.1,AED:3.67,SAR:3.75,EGP:47.5};
 const NAVB=[{id:'home',t:'الرئيسية',i:'home'},{id:'trip',t:'رحلتي',i:'plane'},{id:'map',t:'الخريطة',i:'map'},{id:'explore',t:'استكشف',i:'compass'},{id:'community',t:'المجتمع',i:'users'},{id:'profile',t:'حسابي',i:'user'}];
const $=id=>document.getElementById(id);
const ls=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const lg=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d;}catch(e){return d;}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session=lg('sb_session',null), city='istanbul', page='home', tab='hotels', authTab='login', chat=[];

/* ===== الدخول ===== */
function render(){ $('shell').innerHTML = session ? appHTML() : authHTML(); bind(); }
function authHTML(){return `
 <div class="auth">
  <div class="logo">${LOGO}</div>
  <h1 class="en">My Sindbad</h1>
   <div class="tag">رفيقك لاكتشاف العالم</div>
  <div class="auth-card">
   <div class="tabs">
    <button class="${authTab==='login'?'on':''}" onclick="authTab='login';render()">تسجيل الدخول</button>
    <button class="${authTab==='reg'?'on':''}" onclick="authTab='reg';render()">حساب جديد</button>
   </div>
   ${authTab==='reg'?'<label>الاسم الكامل<input class="inp" id="rName" placeholder="الاسم الكريم"></label>':''}
   <label>البريد الإلكتروني<input class="inp" id="aEmail" type="email" placeholder="name@example.com"></label>
   <label>كلمة المرور<input class="inp" id="aPass" type="password" placeholder="••••••••"></label>
   <div class="err" id="aErr"></div>
   <button class="btn navy w" onclick="${authTab==='reg'?'doReg()':'doLogin()'}">${authTab==='reg'?'إنشاء حساب':'تسجيل الدخول'}</button>
   <button class="btn ghost w" style="margin-top:.6rem" onclick="session={name:'مسافر',guest:1};ls('sb_session',session);render()">المتابعة دون حساب</button>
  </div>
  <div class="feat"><span>تخطيط رحلات متكامل</span><span>خرائط وإرشادات</span><span>تجارب المسافرين</span></div>
 </div>`;}
 async function doLogin(){const email=$('aEmail').value.trim(),pass=$('aPass').value;
  if(!email||!pass){$('aErr').textContent='أدخل البريد الإلكتروني وكلمة المرور.';return;}
  try{if(window.supabaseConfigured){const user=await Auth.signIn(email,pass);session={name:user.user_metadata?.full_name||user.email,email:user.email};ls('sb_session',session);render();return;}
   const u=lg('sb_users',[]).find(x=>x.email===email&&x.pass===pass);if(u){session={name:u.name,email:u.email};ls('sb_session',session);render();}else $('aErr').textContent='البريد أو كلمة المرور غير صحيحة.';
  }catch(error){$('aErr').textContent='تعذر تسجيل الدخول: '+(error.message||'تحقق من بياناتك.');}}
 async function doReg(){const name=$('rName').value.trim(),email=$('aEmail').value.trim(),pass=$('aPass').value;
 if(!name||!email||pass.length<4){$('aErr').textContent='المرجو ملء جميع الخانات (كلمة المرور 4 أحرف فأكثر).';return;}
  try{if(window.supabaseConfigured){const user=await Auth.signUp(email,pass,name);if(!user){$('aErr').textContent='تحقق من بريدك الإلكتروني لتفعيل الحساب.';return;}session={name:user.user_metadata?.full_name||name,email:user.email};ls('sb_session',session);render();return;}
   const u=lg('sb_users',[]);if(u.find(x=>x.email===email)){$('aErr').textContent='هذا البريد مسجل من قبل.';return;}u.push({name,email,pass});ls('sb_users',u);session={name,email};ls('sb_session',session);render();
  }catch(error){$('aErr').textContent='تعذر إنشاء الحساب: '+(error.message||'تحقق من البيانات.');}}
function doOut(){session=null;ls('sb_session',null);render();}

/* ===== الهيكل ===== */
 function appHTML(){return `
  <div data-site-header></div>
 <div class="content" id="pg"></div>
      <nav data-site-nav data-active="${page}"></nav>`;}
function go(p){page=p;render();}
function bind(){const P=$('pg');if(!P)return;({home:pgHome,trip:pgTrip,explore:pgExplore,map:pgMap,community:pgCommunity,bot:pgBot})[page](P);}
const cityChips=()=>`<div class="row" style="margin-bottom:.85rem">${Object.keys(CITIES).map(c=>`<button class="chip ${c===city?'on':''}" onclick="city='${c}';render()">${CITIES[c].n}</button>`).join('')}</div>`;

/* ===== الصفحات ===== */
function pgHome(P){const t=lg('sb_trip',null)||lg('currentTrip',null);
 P.innerHTML=`
  <div class="home-hero">
        <span class="greeting text-white" id="greeting-text">MY SINDBAD · أهلًا ${esc(session.name)}</span>
   <h2 data-i18n="home_heading">إلى أين تأخذك الرحلة؟</h2>
   <div class="home-search">
    <input class="inp" id="q" placeholder="ابحث عن مدينة أو وجهة..." data-i18n-placeholder="home_search_placeholder" onkeydown="if(event.key==='Enter')doSearch()">
    <button class="btn navy sm" onclick="doSearch()">${ic('nav',14)} بحث</button>
   </div>
  </div>
  ${t?`<a href="./today.html" class="today-entry" style="display:block;margin:0 0 .85rem;padding:1rem;border-radius:1rem;background:linear-gradient(135deg,#D4AF37,#b8941f);color:#0A192F;text-decoration:none"><b>وضع اليوم — شنو ندير الآن؟</b><small style="display:block;margin-top:.25rem">افتح نشاطك الحالي والطقس والتقدم اليومي.</small></a>`:''}
  <div class="how-it-works" style="margin:0 0 .85rem;padding:.9rem 1rem;border:1px solid #D4AF37;border-radius:1rem;background:#fffaf0"><b>كيف يعمل؟</b><div style="display:flex;justify-content:space-between;gap:.4rem;margin-top:.5rem;font-size:.75rem;color:#64748b"><span>١ خطط</span><span>٢ استكشف</span><span>٣ سافر برفقة</span></div></div>
     <div class="service-rail" aria-label="خدمات التطبيق">
       <button class="service-slide" onclick="tab='hotels';go('explore')"><span class="service-icon">${ic('hotel',18)}</span><strong data-i18n="service_hotels">الفنادق</strong><small data-i18n="service_hotels_desc">إقامات مناسبة لرحلتك</small><span class="service-arrow">←</span></button>
       <button class="service-slide" onclick="tab='rest';go('explore')"><span class="service-icon">${ic('food',18)}</span><strong data-i18n="service_restaurants">المطاعم</strong><small data-i18n="service_restaurants_desc">تجارب ومذاقات محلية</small><span class="service-arrow">←</span></button>
       <button class="service-slide" onclick="tab='spots';go('explore')"><span class="service-icon">${ic('pin',18)}</span><strong data-i18n="service_places">الأماكن</strong><small data-i18n="service_places_desc">معالم تستحق الزيارة</small><span class="service-arrow">←</span></button>
       <button class="service-slide" onclick="go('trip')"><span class="service-icon">${ic('cal',18)}</span><strong data-i18n="service_trip">رحلتي</strong><small data-i18n="service_trip_desc">خطة سفر منظمة</small><span class="service-arrow">←</span></button>
       <button class="service-slide" onclick="go('bot')"><span class="service-icon">${ic('chat',18)}</span><strong data-i18n="service_assistant">مساعد السفر</strong><small data-i18n="service_assistant_desc">رفيقك في كل خطوة</small><span class="service-arrow">←</span></button>
  </div>
  <div class="sec" data-i18n="home_upcoming">رحلتي القادمة</div>
  ${t?`
  <div class="trip-summary">
   <div><h2>رحلتك إلى ${CITIES[t.city]?CITIES[t.city].n:esc(t.city)}</h2><p>${esc(t.from || t.dates?.start || '')} ← ${esc(t.to || t.dates?.end || '')}</p></div>
   <button class="btn sm ghost" onclick="go('trip')" data-i18n="view_plan">عرض الخطة</button>
  </div>`:`
  <div class="empty-state">
   <div class="es-icon">${ic('plane',22)}</div>
   <h3>ابدأ رحلتك القادمة</h3>
   <p>أنشئ خطة سفر مخصصة، وأضف الأيام والمهام التي تهمك.</p>
   <a class="btn navy sm" href="./create-trip.html">إنشاء رحلة</a>
  </div>`}
   
   <div class="destination-grid">
    ${Object.keys(CITIES).map(c=>`<button class="destination-card" onclick="city='${c}';go('explore')" aria-label="استكشف ${CITIES[c].n}">
       <img src="${CITY_IMAGES[c]}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.dataset.city='${esc(CITIES[c].n)}';this.parentElement.classList.add('image-fallback')">
      <span class="dc-arrow">←</span>
      <span class="dc-copy"><b>${CITIES[c].n}</b><span>${CITIES[c].c}</span></span>
    </button>`).join('')}
   </div>`;}
// <!-- QA14-SEARCH -->
function doSearch(){const q=$('q')?.value.trim();if(!q)return;sessionStorage.setItem('sb_destination_query',q);ls('sb_destination_query',q);window.location.href=`./explore.html?dest=${encodeURIComponent(q)}`;}

function pgTrip(P){let t=lg('sb_trip',null);
 if(!t){P.innerHTML=`<div class="sec">تخطيط رحلة جديدة</div>
  <div class="empty-state" style="margin-bottom:1rem">
   <div class="es-icon">${ic('plane',22)}</div>
   <h3>ابدأ رحلتك الأولى</h3>
  </div>
  <div class="card"><label>الوجهة<select class="inp" id="tCity">${Object.keys(CITIES).map(c=>`<option value="${c}">${CITIES[c].n} — ${CITIES[c].c}</option>`).join('')}</select></label>
  <div class="grid2">
   <label>تاريخ الذهاب<input class="inp" type="date" id="tFrom" value="2026-09-01"></label>
   <label>تاريخ العودة<input class="inp" type="date" id="tTo" value="2026-09-03"></label>
  </div>
  <button class="btn navy w" style="margin-top:.4rem" onclick="mkTrip()">${ic('plane',16)} إنشاء خطة الرحلة</button></div>`;return;}
  t.days=Array.isArray(t.days)?t.days:[];t.check=Array.isArray(t.check)?t.check:[];
  const days=Math.min(7,Math.max(1,Math.round((new Date(t.to)-new Date(t.from))/864e5)+1));
 while(t.days.length<days)t.days.push([]);
 P.innerHTML=`
  <div class="trip-summary">
   <div><h2>رحلتك إلى ${CITIES[t.city]?CITIES[t.city].n:esc(t.city)}</h2><p>${esc(t.from)} ← ${esc(t.to)} • ${days} أيام</p></div>
   <button class="btn sm ghost" onclick="if(confirm('حذف الرحلة؟')){ls('sb_trip',null);render()}" title="حذف الرحلة">${ic('trash',14)}</button>
  </div>
  <div class="sec">خطة الأيام</div>
  ${Array.from({length:days},(_,d)=>`<div class="day-h">اليوم ${d+1}</div><div class="timeline">
    ${t.days[d].map((it,ix)=>`<div class="tl"><button class="del" onclick="delItem(${d},${ix})">${ic('trash',13)}</button><b>${esc(it.title)}</b><small>${esc(it.time)} • ${esc(it.type)}</small></div>`).join('')||'<small style="color:var(--text-muted);display:block;padding:.4rem 0">لا توجد أنشطة بعد</small>'}
  </div>`).join('')}
  <div class="card"><div class="sec" style="margin-top:0">إضافة نشاط</div>
   <div class="grid2"><label>اليوم<select class="inp" id="iDay">${Array.from({length:days},(_,d)=>`<option value="${d}">اليوم ${d+1}</option>`).join('')}</select></label>
   <label>الوقت<input class="inp" type="time" id="iTime" value="10:00"></label></div>
   <label>النشاط<input class="inp" id="iTitle" placeholder="مثال: زيارة المعالم التاريخية"></label>
   <label>النوع<select class="inp" id="iType"><option>معلم سياحي</option><option>تنقل</option><option>مطعم</option><option>فندق</option><option>تسوق</option></select></label>
   <button class="btn navy w" onclick="addItem()">${ic('plus',16)} إضافة النشاط</button></div>
  <div class="sec">قائمة الحاجيات والتجهيزات</div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem;color:var(--text-muted)"><span>نسبة الجاهزية</span><b>${t.check.length?Math.round(t.check.filter(c=>c.done).length/t.check.length*100):0}%</b></div>
    <div class="prog"><i style="width:${t.check.length?Math.round(t.check.filter(c=>c.done).length/t.check.length*100):0}%"></i></div>
   ${t.check.map((c,ix)=>`<div class="check"><input type="checkbox" ${c.done?'checked':''} onchange="togCheck(${ix})"><span class="${c.done?'done':''}">${c.t}</span></div>`).join('')}
   <div style="display:flex;gap:.45rem;margin-top:.85rem"><input class="inp" id="newCh" placeholder="إضافة حاجة جديدة..."><button class="btn sm navy" onclick="addCheck()">${ic('plus',14)} إضافة</button></div>
  </div>`;}
function mkTrip(){const from=$('tFrom').value,to=$('tTo').value;
 if(new Date(to)<new Date(from)){alert('تاريخ العودة قبل الذهاب!');return;}
 ls('sb_trip',{city:$('tCity').value,from,to,days:[],check:['جواز السفر','تذاكر السفر','حجز الفندق','تأمين السفر','شاحن الهاتف','أدوية شخصية'].map(t=>({t,done:false}))});render();}
function addItem(){const t=lg('sb_trip',null);const title=$('iTitle').value.trim();if(!title)return;
 t.days[+$('iDay').value].push({title,time:$('iTime').value,type:$('iType').value});ls('sb_trip',t);render();}
function delItem(d,ix){const t=lg('sb_trip',null);t.days[d].splice(ix,1);ls('sb_trip',t);render();}
function togCheck(ix){const t=lg('sb_trip',null);t.check[ix].done=!t.check[ix].done;ls('sb_trip',t);render();}
function addCheck(){const v=$('newCh').value.trim();if(!v)return;const t=lg('sb_trip',null);t.check.push({t:v,done:false});ls('sb_trip',t);render();}

function pgExplore(P){const C=CITIES[city];
 P.innerHTML=`
  <div class="sec">استكشف ${C?C.n:'الوجهات'}</div>
  ${cityChips()}
  <div class="row" style="margin-bottom:.85rem">
   <button class="chip ${tab==='hotels'?'on':''}" onclick="tab='hotels';render()">الفنادق</button>
   <button class="chip ${tab==='rest'?'on':''}" onclick="tab='rest';render()">المطاعم</button>
   <button class="chip ${tab==='spots'?'on':''}" onclick="tab='spots';render()">الأماكن السياحية</button>
  </div>
  <div class="empty-state">
   <div class="es-icon">${ic(tab==='hotels'?'hotel':tab==='rest'?'food':'pin',24)}</div>
   <h3>اكتشف وجهتك القادمة</h3>
   <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
    <button class="btn navy sm" onclick="go('map')">عرض على الخريطة</button>
    <button class="btn ghost sm" onclick="go('trip')">إضافة إلى خطة رحلتي</button>
   </div>
  </div>`;}

function pgMap(P){const C=CITIES[city]||CITIES.istanbul;
 P.innerHTML=`
  <div class="sec">الخريطة والأدوات — ${C.n}</div>
  ${cityChips()}
  <iframe class="map" src="https://www.openstreetmap.org/export/embed.html?bbox=${C.lon-.08}%2C${C.lat-.05}%2C${C.lon+.08}%2C${C.lat+.05}&layer=mapnik&marker=${C.lat}%2C${C.lon}"></iframe>
  <div style="margin:.65rem 0"><a class="btn sm ghost w" target="_blank" href="https://www.google.com/maps/@${C.lat},${C.lon},13z">${ic('map',15)} فتح في خرائط جوجل</a></div>
  <div class="tools">
   <div class="card" style="margin:0"><div class="sec" style="margin:0 0 .45rem">الطقس الآن</div><div id="wBox" style="font-size:.76rem;color:var(--text-muted)">جارِ التحميل...</div></div>
   <div class="card" style="margin:0"><div class="sec" style="margin:0 0 .45rem">تحويل العملات</div>
    <input class="inp" type="number" id="cvA" value="100" oninput="doCv()" style="margin-bottom:.45rem">
    <div class="grid2"><select class="inp" id="cvF" onchange="doCv()">${Object.keys(RATES).map(r=>`<option ${r==='MAD'?'selected':''}>${r}</option>`).join('')}</select>
    <select class="inp" id="cvT" onchange="doCv()">${Object.keys(RATES).map(r=>`<option ${r==='TRY'?'selected':''}>${r}</option>`).join('')}</select></div>
    <div id="cvR" style="font-weight:800;color:var(--navy-900);margin-top:.45rem;font-size:.88rem"></div>
    <small style="color:var(--text-light);font-size:.64rem">أسعار تقريبية</small></div>
  </div>`;
 doCv();
  fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${C.lat}&longitude=${C.lon}&current=temperature_2m,weather_code,wind_speed_10m`)
   .then(r=>{if(!r.ok)throw new Error('weather');return r.json();})
   .then(j=>{const box=$('wBox');if(!box||!j.current)return;const w=j.current;box.innerHTML=`<b>${Math.round(w.temperature_2m)}°</b> ${wtxt(w.weather_code)}<br><span style="font-size:.7rem">الرياح: ${Math.round(w.wind_speed_10m)} كم/س</span>`;})
   .catch(()=>{const box=$('wBox');if(box)box.textContent='تعذر الاتصال بخدمة الطقس';});}
function wtxt(c){return c===0?'صحو':c<3?'غائم جزئياً':c<45?'غائم':c<50?'ضباب':c<70?'أمطار':c<85?'ثلوج':'عاصفة';}
function doCv(){const a=+$('cvA').value||0,f=$('cvF').value,t=$('cvT').value;
 $('cvR').textContent=(a/RATES[f]*RATES[t]).toFixed(2)+' '+t;}

function pgCommunity(P){const posts=lg('sb_posts',[]);
 P.innerHTML=`
  <div class="sec">مجتمع المسافرين</div>
  <p style="font-size:.76rem;color:var(--text-muted);margin-bottom:.75rem">شارك لحظات وتجارب رحلاتك مع باقي المسافرين.</p>
  <div class="card">
   <label>صورة من الرحلة<input type="file" accept="image/*" id="pFile" style="font-size:.75rem;margin-top:.3rem"></label>
   <label>وصف الصورة<input class="inp" id="pCap" placeholder="مثال: ذكريات مميزة من رحلتي الأخيرة..."></label>
   <button class="btn navy w" onclick="addPost()">${ic('cam',16)} نشر المشاركة</button>
  </div>
  ${posts.length?[...posts].reverse().map((p,ri)=>{const ix=posts.length-1-ri;return `<div class="post">${p.img?`<img src="${p.img}">`:`<div class="noimg">${ic('cam',26)}</div>`}
    <div class="pb"><p>${esc(p.cap)}</p><div class="pm"><span>${ic('user',12)} ${esc(p.by)}</span>
   <button class="like" onclick="likePost(${ix})">${ic('heart',14)} ${p.likes||0}</button></div></div></div>`;}).join(''):`
  <div class="empty-state">
   <div class="es-icon">${ic('cam',22)}</div>
   <h3>كن أول من يشارك تجربته</h3>
   <button class="btn navy sm" onclick="$('pCap').focus()">مشاركة تجربة</button>
  </div>`}`;}
function addPost(){const f=$('pFile').files[0],cap=$('pCap').value.trim();
 if(!f&&!cap){alert('أضف صورة أو وصفا على الأقل.');return;}
 const save=img=>{const posts=lg('sb_posts',[]);posts.push({img,cap,by:session.name,likes:0});
  try{ls('sb_posts',posts);}catch(e){alert('مساحة التخزين ممتلئة — احذف بعض المشاركات القديمة.');return;}
  render();};
 if(f){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');const s=Math.min(1,600/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);save(c.toDataURL('image/jpeg',.7));};img.src=r.result;};r.readAsDataURL(f);}else save(null);}
function likePost(ix){const p=lg('sb_posts',[]);p[ix].likes=(p[ix].likes||0)+1;ls('sb_posts',p);render();}

function pgBot(P){P.innerHTML=`
  <div class="sec">Sindbad Concierge</div>
   <div class="chat" id="chatBox">${chat.map(m=>`<div class="msg ${m.who}">${esc(m.txt).replace(/\n/g,'<br>')}</div>`).join('')}</div>
  <div class="sugs">${['جهز حقيبتي','اكتشف وجهة','ساعدني أثناء السفر','خطط رحلتي'].map(s=>`<button class="chip" onclick="ask('${s}')">${s}</button>`).join('')}</div>
  <div style="display:flex;gap:.45rem"><input class="inp" id="bIn" placeholder="اكتب استفسارك هنا..." onkeydown="if(event.key==='Enter')ask()"><button class="btn navy" onclick="ask()">${ic('send',15)}</button></div>`;
 const cb=$('chatBox');cb.scrollTop=cb.scrollHeight;}
function ask(q){const txt=q||$('bIn').value.trim();if(!txt)return;
 chat.push({who:'me',txt});const C=CITIES[city]||CITIES.istanbul;let a='';
 if(txt.includes('حقيبة')||txt.includes('تجهيز')||txt.includes('شنطة'))a='نصائح لتجهيز حقيبة السفر:\n• احرص على وضع الوثائق المهمة والشواحن في الحقيبة اليدوية.\n• استخدم قائمة التجهيزات في صفحة "رحلتي" لتتبع المستلزمات خطوة بخطوة.\n• تأكد من وزن الحقائب المسموح به في تذكرتك.';
 else if(txt.includes('عمل')||txt.includes('درهم')||txt.includes('دولار')||txt.includes('صرف'))a='يمكنك تحويل وحساب أسعار صرف العملات فوراً من صفحة "الخريطة" عبر حاسبة العملات المدمجة.';
 else if(txt.includes('طقس')||txt.includes('جو'))a='يمكنك الاطلاع على حالة الطقس الحية لمدينتك المختارة مباشرة من صفحة "الخريطة والأدوات".';
 else if(txt.includes('رحل')||txt.includes('خطة')||txt.includes('تنظيم'))a='لإنشاء جدول رحلة مخصص، توجه إلى صفحة "رحلتي"، حدد الوجهة وتواريخ السفر وستحصل على جدول تفاعلي للأيام مع قائمة المهام.';
 else if(txt.includes('مرحبا')||txt.includes('سلام')||txt.includes('أهلا')||txt.includes('اهلا'))a='أهلاً وسهلاً بك في My Sindbad! أنا هنا لمساعدتك في كل ما يتعلق بإرشادات السفر وتخطيط رحلتك.';
 else a='يسعدني تقديم المساعدة في تخطيط رحلتك، مراجعة قائمة التجهيزات، أو معرفة أسعار الصرف. هل تود البدء بإنشاء خطة رحلة جديدة؟';
 chat.push({who:'bot',txt:a});render();}

 /* ===== التشغيل الحقيقي بدون بيانات ثابتة ===== */
 let destination = lg('sb_destination', null);
 let livePlaces = [];
 let liveRates = null;
 let liveError = '';
 const fetchWithTimeout = (input, init = {}, timeoutMs = 5000) => { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs); return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer)); };
 const apiGet = (path) => {
   const isPages = location.hostname.endsWith('github.io');
   if (!isPages) return fetchWithTimeout(path).then((res) => { if (!res.ok) throw new Error('api_error'); return res.json(); });
   const query = new URL(path, location.href);
   if (query.pathname === '/api/search') {
     return fetchWithTimeout(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=ar,en&q=${encodeURIComponent(query.searchParams.get('q') || '')}`)
       .then((res) => res.json()).then((items) => items.map((item) => ({ id:item.place_id, name:item.name || item.display_name.split(',')[0], displayName:item.display_name, lat:Number(item.lat), lon:Number(item.lon), country:item.address?.country || '', type:item.type })));
   }
   if (query.pathname === '/api/places') {
     const lat=Number(query.searchParams.get('lat')), lon=Number(query.searchParams.get('lon')), kind=query.searchParams.get('kind') || 'tourism';
     const filter=kind==='food'?'["amenity"~"restaurant|cafe|fast_food"]':kind==='hotels'?'["tourism"~"hotel|hostel|guest_house"]':'["tourism"~"attraction|museum|gallery|viewpoint|theme_park"]';
     const overpass=`[out:json][timeout:20];(nwr(around:6000,${lat},${lon})${filter};);out center tags 25;`;
     return fetchWithTimeout(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpass)}`).then((res)=>{if(!res.ok)throw new Error('places_error');return res.json();}).then((data)=>(data.elements||[]).map((item)=>({id:`${item.type}/${item.id}`,name:item.tags?.name||item.tags?.['name:en']||'',category:item.tags?.amenity||item.tags?.tourism||kind,address:item.tags?.['addr:street']||item.tags?.['addr:city']||'',lat:item.lat??item.center?.lat,lon:item.lon??item.center?.lon,website:item.tags?.website||item.tags?.['contact:website']||'',phone:item.tags?.phone||''})).filter((item)=>item.name&&Number.isFinite(item.lat)&&Number.isFinite(item.lon)));
   }
   if (query.pathname === '/api/weather') {
     return fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${query.searchParams.get('lat')}&longitude=${query.searchParams.get('lon')}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`).then((res)=>{if(!res.ok)throw new Error('weather_error');return res.json();});
   }
   if (query.pathname === '/api/rates') {
     return fetchWithTimeout(`https://open.er-api.com/v6/latest/${encodeURIComponent(query.searchParams.get('base') || 'MAD')}`).then((res)=>{if(!res.ok)throw new Error('rates_error');return res.json();});
   }
   return Promise.reject(new Error('api_error'));
 };
 const getCityImage=(cityName)=>window.MySindbadCity?.normalizeCityImage(cityName)||window.MySindbadCity?.placeholderForCategory('attraction'); const imageForCity=getCityImage; const tripDestinationText=(trip)=>window.MySindbadCity?.normalizeCityName(trip?.destinationDisplay||trip?.destinationName||trip?.city||trip?.destination||'وجهتك')?.display||trip?.destinationDisplay||trip?.destinationName||trip?.city||trip?.destination||'وجهتك';
 let heroCarouselTimer = null;
 function stopHeroCarousel() {
  if (heroCarouselTimer) {
   clearInterval(heroCarouselTimer);
   heroCarouselTimer = null;
  }
 }
 function startHeroCarousel() {
  const hero = document.querySelector('.home-hero');
  const dots = document.getElementById('hero-carousel-dots');
  if (!hero || !dots) {
   stopHeroCarousel();
   return;
  }
  const cities = [['مراكش','marrakech'],['شفشاون','chefchaouen'],['إسطنبول','istanbul']];
  let active = 0;
  const paint = () => {
   const [name] = cities[active];
   hero.style.backgroundImage = `linear-gradient(180deg,rgba(4,17,28,.18),rgba(4,17,28,.84)),url('${getCityImage(name)}')`;
   dots.innerHTML = cities.map((item,index) => `<button type="button" aria-label="صورة ${item[0]}" aria-pressed="${index===active}" class="hero-dot${index===active?' active':''}" data-hero-index="${index}"></button>`).join('');
   dots.querySelectorAll('[data-hero-index]').forEach((button) => button.addEventListener('click', () => {
    active = Number(button.dataset.heroIndex);
    paint();
   }));
  };
  stopHeroCarousel();
  paint();
  heroCarouselTimer = setInterval(() => {
   active = (active + 1) % cities.length;
   paint();
  }, 5000);
 }
 window.addEventListener('pagehide', stopHeroCarousel);
 const destinationLabel = () => destination ? `${esc(destination.name)}${destination.country ? ` — ${esc(destination.country)}` : ''}` : 'اختر وجهتك من البحث';
 const requireDestination = (P) => {
   if (destination) return true;
   P.innerHTML = `<div class="empty-state"><div class="es-icon">${ic('pin',22)}</div><h3>لا توجد وجهة مختارة</h3><button class="btn navy sm" onclick="go('home')">العودة للبحث</button></div>`;
   return false;
 };
 const chooseDestination = (item) => {
   destination = item;
   city = item.name;
   ls('sb_destination', item);
   livePlaces = [];
   liveError = '';
   go('explore');
 };
  function render() {
    if (!session) {
      $('shell').innerHTML = authHTML();
      return;
    }
    $('shell').innerHTML = appHTML();
    bind();
    applyDynamicTheme();
  }
 function bind() {
   const P = $('pg');
   if (!P) return;
   const pages = { home: pgHome, explore: pgExplore, trip: pgTrip, map: pgMap, bot: pgBot };
   (pages[page] || pgHome)(P);
 }
 function pgHome(P) {
   const t = lg('sb_trip', null) || lg('currentTrip', null) || lg('mysindbad_app_data_v1', {})?.currentTrip || null;
   P.innerHTML = `
    <div class="home-hero">
      <span class="greeting" id="greeting-text">MY SINDBAD · مرحباً بك</span>
      <h2>إلى أين تأخذك الرحلة؟</h2>
      <div class="home-search">
       <input class="inp" id="q" placeholder="اكتب اسم مدينة أو دولة..." autocomplete="off" onkeydown="if(event.key==='Enter')doSearch()">
       <button class="btn navy sm" onclick="doSearch()">${ic('nav',14)} بحث</button>
      </div>
      <div id="hero-carousel-dots" class="hero-carousel-dots" aria-label="صور الوجهات"></div>
    </div>
    <div id="searchResults"></div>
    <div class="card" style="margin:0 0 1rem;padding:.85rem 1rem;background:#fffaf0;border:1px solid #D4AF37"><b style="color:var(--navy-900)">كيف يعمل؟</b><div style="display:flex;justify-content:space-between;gap:.35rem;margin-top:.55rem;font-size:.72rem;color:var(--text-muted)"><span>١ خطط</span><span>٢ استكشف</span><span>٣ سافر برفقة</span></div></div>
    <div class="cats">
      <button class="cat" onclick="tab='hotels';go('explore')"><span class="ci">${ic('hotel',18)}</span>الفنادق</button>
      <button class="cat" onclick="tab='rest';go('explore')"><span class="ci">${ic('food',18)}</span>المطاعم</button>
      <button class="cat" onclick="tab='spots';go('explore')"><span class="ci">${ic('pin',18)}</span>الأماكن</button>
      <button class="cat" onclick="go('trip')"><span class="ci">${ic('cal',18)}</span>رحلتي</button>
    </div>
    <div class="sec">رحلتي الحالية</div>
      ${t ? `<div class="trip-summary" style="background-image:linear-gradient(180deg,rgba(4,17,28,.08),rgba(4,17,28,.82)),url('${imageForCity(tripDestinationText(t))}')"><img src="${imageForCity(tripDestinationText(t))}" alt="${esc(tripDestinationText(t) || 'وجهتك')}" style="display:none" onerror="this.parentElement.style.backgroundImage='linear-gradient(135deg,#0A192F,#D4AF37)';this.parentElement.dataset.city='${esc(tripDestinationText(t) || 'وجهتك')}'"><div><h2>${esc(tripDestinationText(t) || 'وجهتك')}</h2><p>${esc(t.from || t.dates?.start || '')} ← ${esc(t.to || t.dates?.end || '')}</p></div><button class="btn sm ghost" onclick="go('trip')">عرض الخطة</button></div>` : `<div class="empty-state"><div class="es-icon">${ic('plane',22)}</div><h3>لم تنشئ رحلة بعد</h3><a class="btn navy sm" href="./create-trip.html">إنشاء رحلة</a></div>`}
      <!-- QA14-SERVICES -->
      ${t ? `<a href="./today.html" class="card" style="display:block;margin:0 0 1rem;background:linear-gradient(135deg,#D4AF37,#b8941f);color:#0A192F;text-decoration:none"><b style="font-size:1rem">وضع اليوم — شنو ندير الآن؟</b><small style="display:block;margin-top:.25rem">افتح نشاطك الحالي وتقدم اليوم والطقس.</small></a>` : ''}
      <div class="card" style="margin-top:1rem"><b style="color:var(--navy-900)">خدمات مباشرة</b><div class="tools" style="margin-top:.7rem"><a class="btn ghost" href="./explore.html">الطقس</a><a class="btn ghost" href="./map.html">خريطتي</a><a class="btn ghost" href="./community.html">المجتمع</a></div></div>`;
    startHeroCarousel();
 }
 function doSearch() {
   const q = $('q')?.value.trim();
   if (!q) return;
   sessionStorage.setItem('sb_destination_query', q);
   ls('sb_destination_query', q);
   window.location.href = `./create-trip.html?dest=${encodeURIComponent(q)}`;
 }
 function pgExplore(P) {
   if (!requireDestination(P)) return;
   P.innerHTML = `<div class="sec">استكشف ${destinationLabel()}</div>
    <div class="row" style="margin-bottom:.85rem">
      <button class="chip ${tab==='hotels'?'on':''}" onclick="tab='hotels';loadPlaces()">الفنادق</button>
      <button class="chip ${tab==='rest'?'on':''}" onclick="tab='rest';loadPlaces()">المطاعم والمقاهي</button>
      <button class="chip ${tab==='spots'?'on':''}" onclick="tab='spots';loadPlaces()">الأماكن السياحية</button>
    </div><div id="placesBox"></div>`;
    loadPlaces();
 }
 function addLivePlaces() {
   const box = $('placesBox');
   if (!box || !destination) return;
   const kind = tab === 'rest' ? 'food' : tab === 'hotels' ? 'hotels' : 'tourism';
    box.innerHTML = `<div class="card" style="text-align:center;color:var(--text-muted)">جارِ التحميل...</div>`;
   apiGet(`/api/places?lat=${destination.lat}&lon=${destination.lon}&kind=${kind}`).then((items) => {
     livePlaces = items;
     box.innerHTML = items.length ? `<div class="live-list">${items.map((item) => `<article class="live-place"><div class="place-icon">${ic(kind==='food'?'food':kind==='hotels'?'hotel':'pin',20)}</div><div><h3>${esc(item.name)}</h3><p>${esc(item.address || 'بيانات العنوان غير متوفرة من المصدر')}</p>${item.website ? `<a href="${esc(item.website)}" target="_blank" rel="noreferrer">الموقع الرسمي</a>` : ''}</div><button class="btn sm ghost" onclick="addLivePlace(${JSON.stringify(item).replace(/'/g, '&#39;')})">إضافة</button></article>`).join('')}</div>` : `<div class="empty-state"><h3>لا توجد نتائج موثقة قريبة</h3><p>المصدر المفتوح لم يعثر على ${kind==='food'?'مطاعم':kind==='hotels'?'فنادق':'أماكن سياحية'} حول هذه الإحداثيات.</p></div>`;
   }).catch(() => { box.innerHTML = `<div class="empty-state"><h3>تعذر تحميل الأماكن</h3></div>`; });
 }
 function addLivePlace(item) {
   if (!destination) return;
   const t = lg('sb_trip', null) || { city: destination.name, destinationName: destination.name, from: '', to: '', days: [[]], check: [] };
   t.days = Array.isArray(t.days) && t.days.length ? t.days : [[]];
   t.days[0].push({ title: item.name, time: '10:00', type: tab === 'rest' ? 'مطعم' : tab === 'hotels' ? 'فندق' : 'معلم سياحي' });
   ls('sb_trip', t);
   alert('تمت إضافة المكان إلى اليوم الأول من الرحلة.');
 }
 function pgTrip(P) {
   const t = lg('sb_trip', null);
   if (!t) {
      P.innerHTML = `<div class="sec">تخطيط رحلة جديدة</div><div class="empty-state"><div class="es-icon">${ic('plane',22)}</div><h3>${destination ? `رحلة إلى ${destinationLabel()}` : 'لا توجد وجهة مختارة'}</h3>${destination ? `<div class="card"><label>تاريخ الذهاب<input class="inp" type="date" id="tFrom"></label><label>تاريخ العودة<input class="inp" type="date" id="tTo"></label><button class="btn navy w" onclick="mkTrip()">إنشاء خطة الرحلة</button></div>` : `<button class="btn navy sm" onclick="go('home')">البحث عن وجهة</button>`}</div>`;
     return;
   }
   const fromMs = Date.parse(t.from);
   const toMs = Date.parse(t.to);
   const rawDays = Number.isFinite(fromMs) && Number.isFinite(toMs) ? Math.round((toMs - fromMs) / 864e5) + 1 : 1;
   const days = Math.min(14, Math.max(1, rawDays));
   t.days = Array.isArray(t.days) ? t.days : [];
   while (t.days.length < days) t.days.push([]);
   t.days = t.days.slice(0, days).map((day) => Array.isArray(day) ? day : []);
   t.check = Array.isArray(t.check) ? t.check : [];
   P.innerHTML = `<div class="trip-summary"><div><h2>${esc(tripDestinationText(t))}</h2><p>${esc(t.from)} ← ${esc(t.to)} • ${days} أيام</p></div><button class="btn sm ghost" onclick="if(confirm('حذف الرحلة؟')){ls('sb_trip',null);render()}">${ic('trash',14)}</button></div><div class="sec">خطة الأيام</div>${Array.from({length:days},(_,d)=>`<div class="day-h">اليوم ${d+1}</div><div class="timeline">${t.days[d].map((it,ix)=>`<div class="tl"><button class="del" onclick="delItem(${d},${ix})">${ic('trash',13)}</button><b>${esc(it.title)}</b><small>${esc(it.time)} • ${esc(it.type)}</small></div>`).join('') || '<small style="color:var(--text-muted);display:block;padding:.4rem 0">لا توجد أنشطة بعد</small>'}</div>`).join('')}<div class="card"><div class="sec" style="margin-top:0">إضافة نشاط</div><div class="grid2"><label>اليوم<select class="inp" id="iDay">${Array.from({length:days},(_,d)=>`<option value="${d}">اليوم ${d+1}</option>`).join('')}</select></label><label>الوقت<input class="inp" type="time" id="iTime" value="10:00"></label></div><label>النشاط<input class="inp" id="iTitle" placeholder="مثال: زيارة المعالم التاريخية"></label><label>النوع<select class="inp" id="iType"><option>معلم سياحي</option><option>تنقل</option><option>مطعم</option><option>فندق</option><option>تسوق</option></select></label><button class="btn navy w" onclick="addItem()">إضافة النشاط</button></div><div class="sec">قائمة التجهيزات</div><div class="card">${t.check.map((c,ix)=>`<div class="check"><input type="checkbox" ${c.done?'checked':''} onchange="togCheck(${ix})"><span class="${c.done?'done':''}">${esc(c.t)}</span></div>`).join('')}<div style="display:flex;gap:.45rem;margin-top:.85rem"><input class="inp" id="newCh" placeholder="إضافة حاجة جديدة..."><button class="btn sm navy" onclick="addCheck()">إضافة</button></div></div>`;
 }
 function mkTrip() {
   const from = $('tFrom')?.value;
   const to = $('tTo')?.value;
   if (!destination || !from || !to || new Date(to) < new Date(from)) { alert('اختر وجهة وتواريخ صحيحة.'); return; }
   ls('sb_trip', { city: destination.name, destinationName: destination.name, from, to, days: [], check: ['جواز السفر','تذاكر السفر','حجز الفندق','تأمين السفر','شاحن الهاتف'].map((t) => ({t, done:false})) });
   render();
  }
  function addItem() { const t=lg('sb_trip',null); const title=$('iTitle')?.value.trim(); if(!t||!title)return; const day=+$('iDay').value; t.days[day].push({title,time:$('iTime').value,type:$('iType').value,day_number:day+1}); ls('sb_trip',t); render(); }
 function delItem(d,ix) { const t=lg('sb_trip',null); if(!t)return; t.days[d].splice(ix,1); ls('sb_trip',t); render(); }
 function togCheck(ix) { const t=lg('sb_trip',null); if(!t)return; t.check[ix].done=!t.check[ix].done; ls('sb_trip',t); render(); }
 function addCheck() { const value=$('newCh')?.value.trim(), t=lg('sb_trip',null); if(!value||!t)return; t.check.push({t:value,done:false}); ls('sb_trip',t); render(); }
 function pgMap(P) {
   if (!requireDestination(P)) return;
   P.innerHTML = `<div class="sec">الخريطة والأدوات — ${destinationLabel()}</div><iframe class="map" src="https://www.openstreetmap.org/export/embed.html?bbox=${destination.lon-.08}%2C${destination.lat-.05}%2C${destination.lon+.08}%2C${destination.lat+.05}&layer=mapnik&marker=${destination.lat}%2C${destination.lon}"></iframe><div style="margin:.65rem 0"><a class="btn sm ghost w" target="_blank" rel="noreferrer" href="https://www.google.com/maps/@${destination.lat},${destination.lon},13z">${ic('map',15)} فتح في خرائط جوجل</a></div><div class="tools"><div class="card" style="margin:0"><div class="sec" style="margin:0 0 .45rem">الطقس الآن</div><div id="wBox" style="font-size:.76rem;color:var(--text-muted)">جارِ التحميل...</div></div><div class="card" style="margin:0"><div class="sec" style="margin:0 0 .45rem">تحويل العملات</div><input class="inp" type="number" id="cvA" value="100" oninput="doCv()" style="margin-bottom:.45rem"><div class="grid2"><select class="inp" id="cvF" onchange="doCv()"><option>MAD</option><option>EUR</option><option>USD</option><option>GBP</option><option>TRY</option><option>AED</option></select><select class="inp" id="cvT" onchange="doCv()"><option>EUR</option><option>MAD</option><option>USD</option><option>GBP</option><option>TRY</option><option>AED</option></select></div><div id="cvR" style="font-weight:800;color:var(--navy-900);margin-top:.45rem;font-size:.88rem">جارِ التحميل...</div></div></div>`;
   apiGet(`/api/weather?lat=${destination.lat}&lon=${destination.lon}`).then((data) => { const w=data.current, box=$('wBox'); if(box&&w)box.innerHTML=`<b>${Math.round(w.temperature_2m)}°</b> ${wtxt(w.weather_code)}<br><span style="font-size:.7rem">الرطوبة: ${w.relative_humidity_2m}% • الرياح: ${Math.round(w.wind_speed_10m)} كم/س</span>`; }).catch(()=>{if($('wBox'))$('wBox').textContent='تعذر الاتصال بخدمة الطقس';});
    apiGet('/api/rates?base=MAD').then((data) => { liveRates=data; doCv(); }).catch(()=>{if($('cvR'))$('cvR').textContent='تعذر تحميل سعر الصرف';});
 }
 function doCv() { const box=$('cvR'); if(!box||!liveRates)return; const amount=Number($('cvA').value)||0, from=$('cvF').value, to=$('cvT').value; const rates={MAD:1,...liveRates.rates}; if(from==='MAD'&&rates[to])box.textContent=`${(amount*rates[to]).toFixed(2)} ${to}`; else if(rates[from]&&rates[to])box.textContent=`${(amount/rates[from]*rates[to]).toFixed(2)} ${to}`; }
 function pgBot(P) { P.innerHTML=`<div class="sec">مساعد السفر</div><div class="card"><div class="es-icon">${ic('chat',22)}</div><h3>مساعدك أثناء الرحلة</h3><p style="font-size:.8rem;line-height:1.7;color:var(--text-muted)">هذه الصفحة تجمع أدوات السفر الأساسية في مكان واحد. اختر إحدى الأدوات للوصول بسرعة إلى معلومات وجهتك وخطة رحلتك.</p><div class="tools"><button class="btn ghost" onclick="go('explore')">استكشاف الأماكن</button><button class="btn ghost" onclick="go('map')">الطقس والصرف</button><button class="btn ghost" onclick="go('trip')">إدارة الرحلة</button><button class="btn ghost" onclick="go('home')">البحث عن وجهة</button></div></div>`; }
  try {
    render();
    window.__hideMySindbadSplash?.();
  } catch (error) {
    console.error('[My Sindbad] startup failed', error);
    window.__mySindbadStartupFailed?.(error);
  }
  document.addEventListener('DOMContentLoaded', applyDynamicTheme);
