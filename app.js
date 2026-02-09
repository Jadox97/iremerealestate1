
const state={listings:[],filter:"all",q:""};
const $=id=>document.getElementById(id);

function toggleNav(){ $("nav").classList.toggle("open"); }
function toggleDrop(e,id){ if(window.innerWidth<=960){ e.preventDefault(); document.getElementById(id).classList.toggle("open"); } }
function scrollToSection(id){ document.getElementById(id).scrollIntoView({behavior:"smooth"}); }

function matches(item){
  const catOk = (state.filter==="all") || (item.type===state.filter);
  const q = state.q.trim().toLowerCase();
  if(!q) return catOk;
  const hay=[item.title,item.location,item.type,item.status,item.price,item.description||""].join(" ").toLowerCase();
  return catOk && hay.includes(q);
}
function iconRow(item){
  const bits=[];
  if(item.beds) bits.push(`🛏️ ${item.beds} beds`);
  if(item.baths) bits.push(`🛁 ${item.baths} baths`);
  if(item.area && item.area!=="—") bits.push(`📐 ${item.area}`);
  return bits.length?`<div class="iconrow">${bits.join(" • ")}</div>`:"";
}
function safeImages(item){
  const arr = Array.isArray(item.images) ? item.images : [];
  return arr.length ? arr : ["assets/images/placeholder.jpg"];
}
function dotsHtml(n){
  return `<div class="cdots">${Array.from({length:n}).map((_,i)=>`<div class="cdot ${i===0?'active':''}"></div>`).join("")}</div>`;
}
function cardHtml(item){
  const imgs = safeImages(item).slice(0,10);
  const first = imgs[0];
  const data = encodeURIComponent(JSON.stringify(imgs));
  return `
  <div class="card" data-images="${data}">
    <div class="carousel">
      <img class="thumb" src="${first}" alt="${item.title}" onerror="this.src='assets/images/placeholder.jpg'">
      ${dotsHtml(imgs.length)}
    </div>
    <div class="body">
      <h3>${item.title}</h3>
      <div class="small">📍 ${item.location||"Rwanda"}</div>
      ${iconRow(item)}
      <div class="meta">
        <span class="tag">${item.status}</span>
        <span class="tag">${item.type}</span>
        <span class="tag price">${item.price||"Contact"}</span>
      </div>
      <div class="small" style="margin-top:10px">${item.description||""}</div>
    </div>
  </div>`;
}

function render(){
  const grid=$("listingGrid"), feat=$("featuredGrid");
  const items=state.listings.filter(matches);
  grid.innerHTML = items.map(cardHtml).join("") || `<div class="small">No results found. Try another search.</div>`;
  feat.innerHTML = state.listings.filter(x=>x.featured).slice(0,6).map(cardHtml).join("");
  initCarousels();
}

function initCarousels(){
  document.querySelectorAll(".card[data-images]").forEach(card=>{
    const imgEl = card.querySelector(".thumb");
    const dots = card.querySelectorAll(".cdot");
    let imgs=[];
    try{ imgs = JSON.parse(decodeURIComponent(card.getAttribute("data-images"))); }catch(e){ imgs=["assets/images/placeholder.jpg"]; }
    if(imgs.length<=1) return;
    let idx=0;
    if(card._timer) clearInterval(card._timer);
    card._timer = setInterval(()=>{
      idx = (idx+1)%imgs.length;
      imgEl.src = imgs[idx];
      dots.forEach((d,i)=>d.classList.toggle("active", i===idx));
    }, 2500);
  });
}

async function load(){
  const res=await fetch("data/listings.json");
  state.listings=await res.json();
  render();
}
function setFilter(cat){
  state.filter=cat;
  document.querySelectorAll(".pill").forEach(b=>b.classList.remove("active"));
  const map={all:"pillAll",House:"pillHouses",Land:"pillLand",Rental:"pillRentals",Service:"pillServices"};
  $(map[cat]||map.all).classList.add("active");
  render();
}

function init(){
  $("pillAll").onclick=()=>setFilter("all");
  $("pillHouses").onclick=()=>setFilter("House");
  $("pillLand").onclick=()=>setFilter("Land");
  $("pillRentals").onclick=()=>setFilter("Rental");
  $("pillServices").onclick=()=>setFilter("Service");

  const q=$("q");
  q.addEventListener("input",()=>{ state.q=q.value; render(); });
  $("searchBtn").onclick=()=>{ state.q=q.value; render(); scrollToSection("marketplace"); };

  // Quick categories menu items
  document.querySelectorAll(".quickitem").forEach(it=>{
    it.addEventListener("click",()=>{
      setFilter(it.getAttribute("data-filter"));
      scrollToSection("marketplace");
    });
  });

  initSlider();
  load();
}

function initSlider(){
  const slidesEl=$("slides"), dotsEl=$("dots");
  if(!slidesEl) return;
  let idx=0; const total=slidesEl.children.length;
  function renderDots(){
    dotsEl.innerHTML="";
    for(let i=0;i<total;i++){
      const d=document.createElement("div");
      d.className="dot"+(i===idx?" active":"");
      d.onclick=()=>goTo(i);
      dotsEl.appendChild(d);
    }
  }
  function goTo(i){
    idx=i;
    slidesEl.style.transform=`translateX(${-100*idx}%)`;
    renderDots();
  }
  function next(){ idx=(idx+1)%total; goTo(idx); }
  renderDots();
  setInterval(next,5000);
}

window.toggleNav=toggleNav;
window.toggleDrop=toggleDrop;
window.scrollToSection=scrollToSection;
document.addEventListener("DOMContentLoaded",init);
