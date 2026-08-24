/* ============================================================
   PRIME HUB — برايم هب
   ملاحظة: كلُّ بياناتِ التواصلِ في الكائنِ CONTACT بالأسفل.
   عدِّلْها هنا فقط، وستتحدّثُ في الصفحةِ والفوتر وزرِّ الواتساب.
   ============================================================ */

const CONTACT = {
  /* رقمُ الهاتفِ كما يُعرَض */
  phoneDisplay : "+966 5X XXX XXXX",
  /* رقمُ الهاتفِ للاتصال (بصيغةٍ دوليّةٍ بلا مسافات) */
  phoneDial    : "+9665XXXXXXXX",
  /* رقمُ الواتساب (أرقامٌ فقط، بلا + وبلا أصفارٍ في البداية) */
  whatsapp     : "9665XXXXXXXX",
  email        : "info@primehub.sa",
  address      : "جدة — الفيصليّة، طريق المدينة المنوّرة الفرعي، برج الأندلس",
  city         : "جدة",
  hours        : "الأحد – الخميس · 9:00ص – 6:00م",
  maps         : "",                       /* رابطُ الموقعِ على خرائطِ قوقل (اختياري) */
  social: {
    x  : "",                               /* رابطُ الحسابِ على X */
    ig : "",                               /* إنستقرام */
    li : "",                               /* لينكدإن */
    sc : ""                                /* سناب شات */
  }
};

/* ---------- حقنُ بياناتِ التواصلِ في الصفحة ---------- */
(function fillContact(){
  const q = id => document.getElementById(id);
  const dial = CONTACT.phoneDial.replace(/[^\d+]/g,"");

  [["phoneLink","tel:"+dial],["footPhone","tel:"+dial]].forEach(([id,href])=>{
    const el=q(id); if(!el) return; el.href=href; el.textContent=CONTACT.phoneDisplay;
  });

  const waHref = "https://wa.me/"+CONTACT.whatsapp.replace(/\D/g,"");
  const wa = q("waLink");
  if(wa){ wa.href=waHref; wa.textContent=CONTACT.phoneDisplay; }
  const waF = q("waFloat");
  if(waF) waF.href = waHref + "?text=" + encodeURIComponent("السلام عليكم، أرغبُ بالاستفسارِ عن خدماتِ برايم هب.");

  [["mailLink","footMail"]].flat().forEach(id=>{
    const el=q(id); if(!el) return; el.href="mailto:"+CONTACT.email; el.textContent=CONTACT.email;
  });

  ["addrText","footAddr"].forEach(id=>{
    const el=q(id); if(!el) return;
    el.textContent = CONTACT.address;
    if(CONTACT.maps && el.tagName!=="A"){
      const a=document.createElement("a");
      a.href=CONTACT.maps; a.target="_blank"; a.rel="noopener";
      a.className=el.className; a.id=el.id; a.textContent=CONTACT.address;
      el.replaceWith(a);
    }
  });

  const hrs=q("hoursText"); if(hrs) hrs.textContent=CONTACT.hours;

  document.querySelectorAll("#socials a[data-s]").forEach(a=>{
    const url = CONTACT.social[a.dataset.s];
    if(url){ a.href=url; a.target="_blank"; a.rel="noopener"; }
    else a.style.display="none";
  });

  const y=q("year"); if(y) y.textContent=new Date().getFullYear();
})();

/* ---------- بياناتٌ منظَّمةٌ لمحرّكاتِ البحث (تُبنى من CONTACT) ---------- */
(function schema(){
  const data = {
    "@context":"https://schema.org",
    "@type":"RealEstateAgent",
    "name":"برايم هب",
    "alternateName":"Prime Hub",
    "description":"شركةٌ متخصّصةٌ في العقاراتِ التجارية — بيعاً وتأجيراً وإدارةً وتسويقاً.",
    "image":new URL("assets/img/logo.png",location.href).href,
    "url":location.href.split(/[?#]/)[0],
    "telephone":CONTACT.phoneDial,
    "email":CONTACT.email,
    "address":{"@type":"PostalAddress","addressCountry":"SA","addressLocality":CONTACT.city||CONTACT.address,"streetAddress":CONTACT.address},
    "areaServed":"SA",
    "sameAs":Object.values(CONTACT.social).filter(Boolean)
  };
  if(CONTACT.maps) data.hasMap = CONTACT.maps;
  const el=document.createElement("script");
  el.type="application/ld+json";
  el.textContent=JSON.stringify(data);
  document.head.appendChild(el);
})();

/* ---------- الهيدر + شريطُ التقدّم + زرُّ الواتساب ---------- */
(function chrome(){
  const header = document.getElementById("siteHeader");
  const bar    = document.getElementById("scrollProgress");
  const float  = document.getElementById("waFloat");
  let ticking=false;

  function onScroll(){
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("solid", y > 40);
    bar.style.width = (max>0 ? (y/max)*100 : 0) + "%";
    float.classList.toggle("show", y > window.innerHeight * .65);
    ticking=false;
  }
  addEventListener("scroll",()=>{ if(!ticking){ requestAnimationFrame(onScroll); ticking=true; } },{passive:true});
  onScroll();
  addEventListener("load",onScroll);
  addEventListener("hashchange",()=>setTimeout(onScroll,50));
})();

/* ---------- القائمةُ في الجوّال ---------- */
(function menu(){
  const burger=document.getElementById("burger");
  const nav=document.getElementById("nav");
  const close=()=>{ nav.classList.remove("open"); burger.setAttribute("aria-expanded","false"); document.body.style.overflow=""; };

  burger.addEventListener("click",()=>{
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
})();

/* ---------- الظهورُ التدريجيُّ عند التمرير ---------- */
(function reveals(){
  const els=[...document.querySelectorAll(".reveal")];
  if(!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  },{threshold:.14,rootMargin:"0px 0px -8% 0px"});
  els.forEach(e=>io.observe(e));
  // الهيرو يظهر فوراً
  requestAnimationFrame(()=>document.querySelectorAll(".hero .reveal").forEach(e=>e.classList.add("in")));
})();

/* ---------- نموذجُ الطلب ---------- */
(function form(){
  const f=document.getElementById("contactForm");
  const note=document.getElementById("cfNote");
  if(!f) return;

  const build = () => {
    const d=new FormData(f);
    const name=(d.get("name")||"").toString().trim();
    const phone=(d.get("phone")||"").toString().trim();
    if(!name||!phone){
      note.textContent="من فضلك أكمِلْ الاسمَ ورقمَ الجوال.";
      note.style.color="#E0A088";
      (!name?f.querySelector("#f-name"):f.querySelector("#f-phone")).focus();
      return null;
    }
    note.textContent=""; note.style.color="";
    return [
      "طلبٌ جديدٌ من موقعِ برايم هب",
      "————————————",
      "الاسم: "+name,
      "الجوال: "+phone,
      "نوعُ الطلب: "+d.get("type"),
      "التفاصيل: "+((d.get("message")||"").toString().trim()||"—")
    ].join("\n");
  };

  f.addEventListener("submit",e=>{
    e.preventDefault();
    const body=build(); if(!body) return;
    window.open("https://wa.me/"+CONTACT.whatsapp.replace(/\D/g,"")+"?text="+encodeURIComponent(body),"_blank","noopener");
    note.textContent="تمّ فتحُ واتساب — أرسِلِ الرسالةَ لإتمامِ الطلب.";
  });

  document.getElementById("mailBtn").addEventListener("click",()=>{
    const body=build(); if(!body) return;
    location.href="mailto:"+CONTACT.email+"?subject="+encodeURIComponent("طلبٌ من الموقع — برايم هب")+"&body="+encodeURIComponent(body);
    note.textContent="تمّ فتحُ برنامجِ البريد — أرسِلِ الرسالةَ لإتمامِ الطلب.";
  });
})();
