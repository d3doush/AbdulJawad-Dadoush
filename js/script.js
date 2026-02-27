
// Preloader

window.addEventListener('load', function(){
    console.log('window.load fired');
    document.querySelector('.preloader').classList.add('opacity-0');
    setTimeout(function(){
        document.querySelector('.preloader').style.display = 'none';
    }, 1000);
});

// fallback in case load event never fires (e.g. blocked resource)
setTimeout(function(){
    var pre = document.querySelector('.preloader');
    if(pre && !pre.classList.contains('opacity-0')){
        console.warn('load event not fired within 5s, hiding preloader');
        pre.classList.add('opacity-0');
        setTimeout(function(){ pre.style.display='none'; }, 1000);
    }
}, 5000);

// iTyped - only initialize if element exists (some pages don't include .iTyped)
(function(){
    try{
        var itEl = document.querySelector('.iTyped');
        if (itEl && window.ityped && typeof window.ityped.init === 'function'){
            window.ityped.init(itEl, {
                strings: ['I Love My Team', "I'm a Designer", 'I Love Photoshop', 'I Love SketchUp','I Love xlsx'],
                loop: true
            });
        } else {
            console.log('ityped: .iTyped not present or library missing — skipping init');
        }
    }catch(e){
        console.warn('ityped init error', e);
    }
})();

// Portfolio Item Filter

let portfolioItems = document.querySelectorAll('.portfolio-item');
let totalPortfolioItem = portfolioItems.length;

// listeners will be attached after necessary DOM refs are defined

const filterContainer = document.querySelector('.portfolio-filter'),
    filterBtns = filterContainer.children,
    totalFilterBtn = filterBtns.length;
    
function setupPortfolioListeners() {
    portfolioItems = document.querySelectorAll('.portfolio-item');
    totalPortfolioItem = portfolioItems.length;
    
    for (let i = 0; i < totalFilterBtn; i++) {
        filterBtns[i].addEventListener("click", function(){
            portfolioItems = document.querySelectorAll('.portfolio-item');
            totalPortfolioItem = portfolioItems.length;
            
            filterContainer.querySelector('.active').classList.remove('active');
            this.classList.add("active");

            const filterValue = this.getAttribute('data-filter');
            for (let k = 0; k < totalPortfolioItem; k++) {
                if (filterValue === portfolioItems[k].getAttribute('data-category')) {
                    portfolioItems[k].classList.remove('hide');
                    portfolioItems[k].classList.add('show');
                } else{
                    portfolioItems[k].classList.remove('show');
                    portfolioItems[k].classList.add('hide');
                }
                if (filterValue === 'all') {
                    portfolioItems[k].classList.remove('hide');
                    portfolioItems[k].classList.add('show');
                }
            }
        });
    }}

setupPortfolioListeners();
// Portfolio Lighbox

const lightbox = document.querySelector('.lightbox'),
    lightboxImg = lightbox.querySelector('.lightbox-img'),
    lightboxVideo = lightbox.querySelector('.lightbox-video'),
    lightboxText = lightbox.querySelector('.caption-text'),
    lightboxClose = lightbox.querySelector('.lightbox-close'),
    lightboxCounter = lightbox.querySelector('.caption-counter');

let itemIndex = 0;

function setupLightboxListeners() {
    portfolioItems = document.querySelectorAll('.portfolio-item');
    totalPortfolioItem = portfolioItems.length;
    console.log('setting up lightbox on', totalPortfolioItem, 'items');
    
    for (let i = 0; i < totalPortfolioItem; i++) {
        // attach to inner as well
        const el = portfolioItems[i];
        el.addEventListener('click', function(){
            console.log('item clicked (outer) index', i);
            itemIndex = i;
            changeItem();
            openLightbox();
        });
        const inner = el.querySelector('.portfolio-item-inner');
        if(inner) {
            inner.addEventListener('click', function(e){
                console.log('item clicked (inner) index', i);
                e.stopPropagation();
                itemIndex = i;
                changeItem();
                openLightbox();
            });
        }
        // click on icon (the magnifier / play icon)
        const icon = el.querySelector('.portfolio-info .icon');
        if(icon){
            icon.addEventListener('click', function(e){
                e.stopPropagation();
                console.log('icon clicked index', i);
                itemIndex = i;
                changeItem();
                openLightbox();
            });
        }
        // click on image itself
        const img = el.querySelector('.portfolio-img img');
        if(img){
            img.addEventListener('click', function(e){
                e.stopPropagation();
                console.log('image clicked index', i);
                itemIndex = i;
                changeItem();
                openLightbox();
            });
        }
    }
}

// event delegation fallback
const portfolioRow = document.querySelector('.portfolio .row');
if(portfolioRow) {
    portfolioRow.addEventListener('click', function(e){
        const clicked = e.target.closest('.portfolio-item');
        if(clicked) {
            const items = Array.from(document.querySelectorAll('.portfolio-item'));
            const idx = items.indexOf(clicked);
            if(idx !== -1) {
                console.log('delegate click index', idx);
                itemIndex = idx;
                changeItem();
                toggleLightbox();
            }
        }
    });
}

setupLightboxListeners();

function openLightbox() {
    lightbox.classList.add('open');
}

function closeLightbox() {
    lightbox.classList.remove('open');
    // stop and reset video
    try{
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;
        lightboxVideo.removeAttribute('src');
        lightboxVideo.load();
    }catch(e){console.warn('video reset failed', e);}
}

function toggleLightbox() {
    if (lightbox.classList.contains('open')) closeLightbox(); else openLightbox();
}

function changeItem() {
    const currentItem = portfolioItems[itemIndex];
    const imgElement = currentItem.querySelector('.portfolio-img img');
    const mediaType = currentItem.getAttribute('data-media-type') || 'image';
    
    lightboxText.innerHTML = currentItem.querySelector('h4').innerHTML;
    lightboxCounter.innerHTML = (itemIndex + 1) + " من " + totalPortfolioItem;
    
    // Hide both media elements first
    lightboxImg.style.display = 'none';
    lightboxVideo.style.display = 'none';
    lightboxImg.classList.remove('portrait', 'landscape');
    
    if (mediaType === 'video') {
        const videoSrc = currentItem.getAttribute('data-video-src');
        // use the portfolio thumbnail as poster when available
        const thumb = imgElement ? imgElement.getAttribute('src') : null;
        if (thumb) {
            lightboxVideo.setAttribute('poster', thumb);
        } else {
            lightboxVideo.removeAttribute('poster');
        }
        // clear image src to avoid showing wrong media
        lightboxImg.removeAttribute('src');
        lightboxImg.style.display = 'none';

        lightboxVideo.src = videoSrc;
        lightboxVideo.style.display = 'block';
        lightboxVideo.load();
        lightboxVideo.play().catch(function(err){
            console.warn('video play prevented:', err);
        });
    } else {
        let imgSrc = imgElement ? imgElement.getAttribute('src') : '';
        // clear video src if any
        try{
            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');
            lightboxVideo.load();
            lightboxVideo.style.display = 'none';
            lightboxVideo.removeAttribute('poster');
        }catch(e){/* ignore */}

        // reset previous image classes and handlers
        lightboxImg.classList.remove('portrait', 'landscape');
        lightboxImg.onload = null;

        lightboxImg.src = imgSrc;
        lightboxImg.style.display = 'block';
        
        // Check image orientation after loading
        lightboxImg.onload = function() {
            if (this.naturalHeight > this.naturalWidth) {
                this.classList.add('portrait');
            } else {
                this.classList.add('landscape');
            }
        };
    }
}

function prevItem() {
    if (itemIndex === 0) {
        itemIndex = totalPortfolioItem - 1;
    } else {
        itemIndex--;
    }
    changeItem();
}

function nextItem() {
    if (itemIndex === totalPortfolioItem - 1) {
        itemIndex = 0;
    } else {
        itemIndex++;
    }
    changeItem();
}

// close lightbox
lightboxClose.addEventListener('click', function(){ closeLightbox(); });

lightbox.addEventListener('click', function(event){
    if(event.target === lightbox){
        closeLightbox();
    }
});

// Close lightbox with ESC key
document.addEventListener('keydown', function(event){
    if(event.key === 'Escape' && lightbox.classList.contains('open')){
        toggleLightbox();
    }
});

// Aside Navbar

const nav = document.querySelector('.nav'),
    navList = nav.querySelectorAll('li'),
    totalNavList = navList.length,
    allSection = document.querySelectorAll('.section'),
    totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
    const a = navList[i].querySelector('a');
    a.addEventListener('click', function(){
        // remove back section class
        removeBackSectionClass();

        for (let j = 0; j < totalNavList; j++) {
            if (navList[j].querySelector('a').classList.contains('active')) {
                // add back section class
                addBackSectionClass(j);
            }
            navList[j].querySelector('a').classList.remove('active');
        }

        this.classList.add('active');

        showSection(this);

        if (window.innerWidth < 1200) {
            asideSectionTogglerBtn();
        }

    });
}

function addBackSectionClass(num) 
{
    allSection[num].classList.add('back-section');
}

function removeBackSectionClass() 
{
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('back-section');
    }
}

function updateNav(element) 
{
    for (let i = 0; i < totalNavList; i++) {
        navList[i].querySelector('a').classList.remove('active');
        const target = element.getAttribute('href').split('#')[1];
        if (target === navList[i].querySelector('a').getAttribute('href').split('#')[1]) {
            navList[i].querySelector('a').classList.add('active');
        }
    }
}

document.querySelector('.hire-me').addEventListener('click', function(){
    const sectionIndex = this.getAttribute('data-section-index');
    addBackSectionClass(sectionIndex);
    showSection(this);
    updateNav(this);
    removeBackSectionClass();
});

function showSection(element) 
{
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('active');
    }

    const target = element.getAttribute('href').split('#')[1];

    document.querySelector('#'+target).classList.add('active');
}

const navTogglerBtn = document.querySelector('.nav-toggler'),
    aside = document.querySelector('.aside');

navTogglerBtn.addEventListener('click', asideSectionTogglerBtn);

function asideSectionTogglerBtn() 
{
    aside.classList.toggle('open');
    navTogglerBtn.classList.toggle('open');
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.toggle('open');
    }
}
