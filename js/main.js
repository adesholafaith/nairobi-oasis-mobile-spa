// NAVIGATION
const nav = document.getElementById('mainNav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu?.classList.toggle('open');
});

// TESTIMONIALS
(function () {
  const track = document.getElementById('testimonialsTrack');
  const viewport = document.getElementById('testimonialsViewport');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!track || !viewport || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let currentIndex = 0;
  let intervalId = null;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  // Build dots — one per "page" (i.e. per possible stopping index)
  function buildDots() {
    dotsContainer.innerHTML = '';
    const pageCount = maxIndex() + 1;
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('span');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('span');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex()));
    const card = cards[0];
    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    updateDots();
  }

  function slideNext() {
    const next = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
    goTo(next);
  }

  function startAutoSlide() {
    stopAutoSlide();
    intervalId = setInterval(slideNext, 5000);
  }

  function stopAutoSlide() {
    clearInterval(intervalId);
  }

  viewport.addEventListener('mouseenter', stopAutoSlide);
  viewport.addEventListener('mouseleave', startAutoSlide);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      buildDots();
      goTo(Math.min(currentIndex, maxIndex())); // clamp + re-snap position
    }, 150);
  });

  buildDots();
  goTo(0);
  startAutoSlide();
})();

// MULTI-PAGE SPA
function navigateTo(pageId, pushState = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushState) history.pushState({ page: pageId }, '', '#' + pageId);
    initReveal();
    updateNavActive(pageId);
    // Close mobile menu
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
  }
}

function updateNavActive(pageId) {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.page === pageId) el.classList.add('active');
  });
}

// Handle nav links
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (link) {
    e.preventDefault();
    navigateTo(link.dataset.page);
    return;
  }
  // Handle therapist cards
  const therapistCard = e.target.closest('[data-therapist]');
  if (therapistCard) {
    e.preventDefault();
    const profileLoaded = loadTherapistProfile(therapistCard.dataset.therapist);
    if (profileLoaded) {
      navigateTo('page-therapist-profile');
    } else {
      console.warn(`Therapist profile not found: ${therapistCard.dataset.therapist}`);
    }
  }
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const pageId = e.state?.page || 'page-home';
  navigateTo(pageId, false);
});

// Initial load
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '') || 'page-home';
  navigateTo(hash, false);
});

// SCROLL REVEAL
function initReveal() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

// SERVICE SLIDER
  (function () {
    const grid = document.querySelector('.services-grid');
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');
    const dotsContainer = document.querySelector('.slider-dots');
    const cards = grid.querySelectorAll('.service-card');
    let currentIndex = 0;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('span');

    function updateDots() {
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function goTo(index) {
      if (!isMobile()) return;
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      const cardWidth = grid.clientWidth + 16; // width + gap
      grid.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Keep index in sync if user swipes manually
    let scrollTimeout;
    grid.addEventListener('scroll', () => {
      if (!isMobile()) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardWidth = grid.clientWidth + 16;
        currentIndex = Math.round(grid.scrollLeft / cardWidth);
        updateDots();
      }, 100);
    });

    window.addEventListener('resize', () => {
      if (isMobile()) goTo(currentIndex);
    });
  })();

// THERAPIST TABS
(function () {
  function isMobile() {
    return window.innerWidth <= 768;
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const carousels = {};

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Stop whichever carousel was active before switching
      Object.values(carousels).forEach((c) => c.stop());

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');

      const name = btn.dataset.tab.replace('-tab', '');
      carousels[name]?.refresh();
    });
  });

  function initCarousel(name) {
    const grid = document.querySelector(
      `[data-carousel="${name}"].therapist-grid, [data-carousel="${name}"].mystery-therapist-grid`
    );
    const prevBtn = document.querySelector(`.carousel-prev[data-carousel="${name}"]`);
    const nextBtn = document.querySelector(`.carousel-next[data-carousel="${name}"]`);
    const dotsContainer = document.querySelector(`.carousel-dots[data-carousel="${name}"]`);
    if (!grid || !prevBtn || !nextBtn || !dotsContainer) return;

    const cards = grid.querySelectorAll('.therapist-card');
    let currentIndex = 0;

    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('span');

    function updateDots() {
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function goTo(index) {
      if (!isMobile()) return;
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      const cardWidth = grid.clientWidth + 16;
      grid.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
      updateDots();
    }

    // ---- Auto-slide ----
    let autoSlideInterval = null;

    function startAutoSlide() {
      if (!isMobile()) return;
      stopAutoSlide(); // avoid stacking multiple intervals
      autoSlideInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % cards.length;
        goTo(nextIndex);
      }, 3000);
    }

    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    }

    grid.addEventListener('mouseenter', stopAutoSlide);
    grid.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    let scrollTimeout;
    grid.addEventListener('scroll', () => {
      if (!isMobile()) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardWidth = grid.clientWidth + 16;
        currentIndex = Math.round(grid.scrollLeft / cardWidth);
        updateDots();
      }, 100);
    });

    window.addEventListener('resize', () => {
      if (isMobile()) goTo(currentIndex);
    });

    carousels[name] = {
      refresh() {
        if (isMobile()) {
          const cardWidth = grid.clientWidth + 16;
          grid.scrollTo({ left: currentIndex * cardWidth, behavior: 'auto' });
          startAutoSlide();
        }
      },
      stop: stopAutoSlide
    };
  }

  initCarousel('female');
  initCarousel('male');
  initCarousel('mystery');
})();

// CAROUSEL FUNCTIONALITY
const carouselState = {};

function initCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(carousel => {
    const id = carousel.dataset.carousel;
    if (!carouselState[id]) {
      carouselState[id] = { currentIndex: 0, autoScrollInterval: null };
    }
    const state = carouselState[id];
    const cards = carousel.querySelectorAll('.therapist-card');
    const cardCount = cards.length;
    
    if (cardCount === 0) return;
    
    // Stop existing auto-scroll
    if (state.autoScrollInterval) {
      clearInterval(state.autoScrollInterval);
    }
    
    // Reset to first card
    state.currentIndex = 0;
    updateCarouselPosition(carousel, state.currentIndex);
    
    // Start auto-scroll only on mobile
    if (window.innerWidth <= 480) {
      state.autoScrollInterval = setInterval(() => {
        state.currentIndex = (state.currentIndex + 1) % cardCount;
        updateCarouselPosition(carousel, state.currentIndex);
      }, 2000);
    }
  });
}

function updateCarouselPosition(carousel, index) {
  const translateValue = -index * 100;
  carousel.style.transform = `translateX(${translateValue}%)`;
}

// Carousel button click handlers
document.addEventListener('click', (e) => {
  const prevBtn = e.target.closest('.carousel-prev');
  const nextBtn = e.target.closest('.carousel-next');
  
  if (prevBtn) {
    const carouselId = prevBtn.dataset.carousel;
    const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
    if (carousel && carouselState[carouselId]) {
      const state = carouselState[carouselId];
      const cardCount = carousel.querySelectorAll('.therapist-card').length;
      state.currentIndex = (state.currentIndex - 1 + cardCount) % cardCount;
      updateCarouselPosition(carousel, state.currentIndex);
      // Reset auto-scroll
      if (state.autoScrollInterval) clearInterval(state.autoScrollInterval);
      if (window.innerWidth <= 480) {
        state.autoScrollInterval = setInterval(() => {
          state.currentIndex = (state.currentIndex + 1) % cardCount;
          updateCarouselPosition(carousel, state.currentIndex);
        }, 2000);
      }
    }
  }
  
  if (nextBtn) {
    const carouselId = nextBtn.dataset.carousel;
    const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
    if (carousel && carouselState[carouselId]) {
      const state = carouselState[carouselId];
      const cardCount = carousel.querySelectorAll('.therapist-card').length;
      state.currentIndex = (state.currentIndex + 1) % cardCount;
      updateCarouselPosition(carousel, state.currentIndex);
      // Reset auto-scroll
      if (state.autoScrollInterval) clearInterval(state.autoScrollInterval);
      if (window.innerWidth <= 480) {
        state.autoScrollInterval = setInterval(() => {
          state.currentIndex = (state.currentIndex + 1) % cardCount;
          updateCarouselPosition(carousel, state.currentIndex);
        }, 2000);
      }
    }
  }
});

// FAQ ACCORDION
document.addEventListener('click', (e) => {
  const faqQ = e.target.closest('.faq-q');
  if (faqQ) {
    const item = faqQ.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  }
});

// THERAPIST PROFILES DATA
const therapists = {
  lola: {
    img: 'img/Lola-5.png',
    name: 'Lola', gender: 'Female',
    specialty: 'Wellness Therapist', 
    tagline: 'Where tension meets its match',
    experience: '2 years', rating: '★ 4.9', height: "5'4\"",
    languages: 'English, Swahili',
    bio: [
      'Sometimes the best thing you can do for yourself is slow down, breathe and allow yourself to be cared for.',
      "Lola is known for her warm personality, gentle approach and ability to create a calming atmosphere that helps clients truly relax. Whether you're looking to unwind after a long day, ease muscle tension or simply enjoy a moment of self-care, Lola is dedicated to making every session feel comfortable, personalized and refreshing."
    ],
    services: [
      { name: 'Deep Tissue Massage' },
      { name: 'Full Body Swedish Massage'},
      { name: 'Aromatherapy Massage'},
      { name: 'Nuru Massage'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  maya: {
    img: 'img/Maya-4.png',
    name: 'Maya', gender: 'Female',
    specialty: 'Wellness Therapist',
    tagline: 'Gentle touch, profound healing',
    experience: '2 years', rating: '★ 5.0', height: "5'4\"",
    languages: 'English, Swahili',
    bio: [
      'Experience the perfect balance of relaxation, care and professionalism with Maya.',
      'Maya is passionate about helping clients unwind, recharge and feel their absolute best. With a calming presence and attention to detail, she creates personalized wellness experiences designed to ease tension, promote relaxation and leave you feeling refreshed.'
    ],
    services: [
      { name: 'Full Body Swedish Massage'},
      { name: 'Deep Tissue Massage'},
      { name: 'Aromatherapy Massage'},
      { name: 'Nuru Massage'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  dan: {
    img: 'img/Dan-2.png',
    name: 'Dan', gender: 'Male',
    specialty: 'Wellness Therapist',
    tagline: 'Precision recovery for peak performance',
    experience: '8 years', rating: '★ 4.8', height: "6'3\"",
    languages: 'English, Swahili',
    bio: [
      'Sometimes your body just needs the right hands to help it recover, relax and feel good again.',
      'Dan is known for his calm approach, professionalism and ability to work through muscle tension while ensuring clients remain comfortable throughout their session.',
      "Whether you're looking to unwind after a long week, recover from physical activity or simply take time for yourself, Dan is dedicated to helping you feel refreshed, relaxed and restored."
    ],
    services: [
      { name: 'Full Body Swedish Massage'},
      { name: 'Deep Tissue Massage'},
      { name: 'Sports Massage'},
      { name: 'Assisted Stretching'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  nora: {
    img: 'img/Nora-2.png',
    name: 'Nora', gender: 'Female',
    specialty: 'Wellness Therapist',
    tagline: 'Ancient warmth, modern wellness',
    experience: '2 years', rating: '★ 4.9', height: "5'3\"",
    languages: 'English, Swahili',
    bio: [
      'Nora specializes in creating deeply relaxing and rejuvenating wellness experiences tailored to your needs. ',
      "Whether you're seeking stress relief, muscle recovery, or pure relaxation, she delivers every treatment with care, professionalism, and attention to detail."
    ],
    services: [
      { name: 'Full Body Swedish Massage'},
      { name: 'Deep Tissue Massage'},
      { name: 'Aromatherapy Massage'},
      { name: 'Nuru Massage'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  alison: {
    img: 'img/Maya-4.png',
    name: 'Alison', gender: 'Male',
    specialty: 'Wellness Therapist',
    tagline: 'Unlock your body\'s full potential',
    experience: '7 years', rating: '★ 4.7', height: "6'3\"",
    languages: 'English, Swahili',
    bio: [
      "A great massage isn't just about relaxation—it's about feeling better, moving better, and taking time to care for yourself.",
      'Alison is known for his friendly personality, professional approach and ability to help clients feel comfortable from the moment they arrive.',
      "Whether you're dealing with muscle tension, recovering from a busy week or simply looking to unwind, Alison is dedicated to providing a relaxing and rejuvenating experience tailored to your needs." 
    ],
    services: [
      { name: 'Full Body Swedish Massage'},
      { name: 'Deep Tissue Massage'},
      { name: 'Sports  Massage'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  sally: {
    img: 'img/Sally3.png',
    name: 'Sally', gender: 'Female',
    specialty: 'Wellness Therapist',
    tagline: 'Helping you relax, recharge, and feel your best.',
    experience: '2 years', rating: '★ 4.0', height: "5'2\"",
    languages: 'English, Swahili',
    bio: [
      'Sally is a professional wellness therapist dedicated to helping clients relax, recharge, and restore balance through personalized massage experiences. She is available for home, hotel, and private bookings within Nairobi.'
    ],
    services: [
      { name: 'Deep Tissue Massage'},
      { name: 'Aromatherapy Massage'},
      { name: 'Nuru Massage'},
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  "mystery-male": {
    img: 'img/default-m.jpg',
    name: 'Mystery Male Therapist',
    gender: 'Male',
    specialty: 'Wellness Therapist',
    tagline: 'Book now to discover your expert therapist',
    experience: 'Varies',
    rating: '★ 5.0',
    height: 'TBA',
    languages: 'English, Swahili',
    bio: [
      'Our mystery male therapist arrives fully prepared with premium tools and a tailored treatment designed to exceed your expectations.',
      'Enjoy a professional session with a trusted therapist chosen to match your needs, whether you seek deep muscle release, relaxation, or recovery support.'
    ],
    services: [
      { name: 'Tailored to your needs'}
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  },
  "mystery-female": {
    img: 'img/default-f.jpg',
    name: 'Mystery Female Therapist',
    gender: 'Female',
    specialty: 'Wellness Therapist',
    tagline: 'Book now to discover your expert therapist',
    experience: 'Varies',
    rating: '★ 5.0',
    height: 'TBA',
    languages: 'English, Swahili',
    bio: [
      'Our mystery female therapist arrives fully prepared with premium tools and a tailored treatment designed to exceed your expectations.',
      'Enjoy a professional session with a trusted therapist chosen to match your needs, whether you seek deep muscle release, relaxation, or recovery support.'
    ],
    services: [
      { name: 'Tailored to your needs'}
    ],
    specialties: ['Verified', 'Certified Therapist', 'Background Checked']
  }
};

const therapistGalleries = {
  lola: ['img/Lola-5.png', 'img/Lola-4.jpeg', 'img/Lola-3.jpeg', 'img/Lola-2.jpeg', 'img/Lola-1.jpeg'],
  maya: ['img/Maya-4.png', 'img/Maya-2.jpeg', 'img/Maya-3.jpeg', 'img/Maya-1.jpeg'],
  dan: ['img/Dan-2.png', 'img/Dan-1.jpeg'],
  nora: ['img/Nora-2.png', 'img/Nora-1.png', 'img/Nora-3.png'],
  alison: ['img/Alison-2.png', 'img/Alison-1.jpeg'],
  sally: ['img/Sally3.png', 'img/Sally-2.png', 'img/Sally-1.png']
};

function loadTherapistProfile(id) {
  const t = therapists[id];
  if (!t) return false;
  const el = document.getElementById('therapist-profile-content');
  if (!el) return false;
  const gallery = therapistGalleries[id] || [t.img];
  el.innerHTML = `
    <div class="page-hero">
      <div class="container">
        <nav class="breadcrumb">
          <a href="#" data-page="page-therapists">Our Therapists</a>
          <span>/</span>
          <span>${t.name}</span>
        </nav>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="therapist-profile-grid">
          <div class="therapist-profile-img">
            <div class="profile-gallery">
              ${gallery.map((src, idx) => `<img src="${src}" alt="${t.name} photo ${idx + 1}" class="${idx === 0 ? 'active' : ''}">`).join('')}
            </div>
            <div class="profile-badge">
              <div class="profile-badge-row"><span>Experience</span><span>${t.experience}</span></div>
              <div class="profile-badge-row"><span>Rating</span><span class="rating"> ${t.rating}</span></div>
              <div class="profile-badge-row"><span>Height</span><span>${t.height}</span></div>
              <div class="profile-badge-row"><span>Languages</span><span>${t.languages}</span></div>
            </div>
          </div>
          <div class="therapist-profile-info">
            <p class="eyebrow">${t.gender} Therapist · ${t.specialty}</p>
            <h1>${t.name}</h1>
            <p class="tagline">"${t.tagline}"</p>
            <div class="profile-bio">
              ${t.bio.map(p => `<p>${p}</p>`).join('')}
            </div>
            <h3 style="margin-bottom:0.5rem;">Specialties</h3>
            <div class="profile-services-list">
              ${t.services.map(s => `
                <div class="profile-service-item">
                  <span class="profile-service-name">${s.name}</span>
                </div>
              `).join('')}
            </div>
            <div class="profile-specialties">
              ${t.specialties.map(s => `<span class="specialty-tag"><img src="icons/check.png" alt="" class="specialty-icon">${s}</span>`).join('')}
            </div>
            <div class="profile-book-btns">
              <a href="https://wa.me/254700000000?text=Hi! I'd like to book a session with ${t.name}" target="_blank" class="btn btn-wa"> <img src="icons/whatsapp.png" alt="WhatsApp icon"> WhatsApp Booking</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  if (typeof initTherapistProfileGallery === 'function') {
    initTherapistProfileGallery();
  }
  return true;
}

function initTherapistProfileGallery() {
  const gallery = document.querySelector('.profile-gallery');
  if (!gallery) return;

  const images = Array.from(gallery.querySelectorAll('img'));

  let current = 0;

  setInterval(() => {
    images[current].classList.remove('active');

    current = (current + 1) % images.length;

    images[current].classList.add('active');
  }, 3000);

  images.forEach((img, index) => {
    img.addEventListener('click', () => {
      images.forEach(i => i.classList.remove('active'));
      img.classList.add('active');
      current = index;
    });
  });
}

// CONTACT FORM
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name');
  const service = data.get('service');
  const msg = data.get('message') || 'I would like to book a session.';
  const text = encodeURIComponent(`Hi Nairobi Oasis!\n\nName: ${name}\nService: ${service}\n\n${msg}`);
  window.open(`https://wa.me/254700000000?text=${text}`, '_blank');
});

// BOOKING FORM
const bookingForm = document.getElementById('bookingForm');
bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(bookingForm);
  const name = data.get('name');
  const service = data.get('service');
  const date = data.get('date');
  const time = data.get('time');
  const location = data.get('location');
  const channel = data.get('channel');
  const text = encodeURIComponent(`🌿 *Nairobi Oasis Booking Request*\n\nName: ${name}\nService: ${service}\nDate: ${date}\nTime: ${time}\nLocation: ${location}`);
  if (channel === 'telegram') {
    window.open(`https://t.me/NairobiOasis?text=${text}`, '_blank');
  } else {
    window.open(`https://wa.me/254700000000?text=${text}`, '_blank');
  }
});

