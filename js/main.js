// ===== NAVIGATION =====
const nav = document.getElementById('mainNav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// ===== MULTI-PAGE SPA =====
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
  }
  // Handle therapist cards
  const therapistCard = e.target.closest('[data-therapist]');
  if (therapistCard) {
    e.preventDefault();
    loadTherapistProfile(therapistCard.dataset.therapist);
    navigateTo('page-therapist-profile');
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

// ===== SCROLL REVEAL =====
function initReveal() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

// ===== THERAPIST TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target)?.classList.add('active');
  });
});

// ===== FAQ ACCORDION =====
document.addEventListener('click', (e) => {
  const faqQ = e.target.closest('.faq-q');
  if (faqQ) {
    const item = faqQ.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  }
});

// ===== THERAPIST PROFILES DATA =====
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
};

function loadTherapistProfile(id) {
  const t = therapists[id];
  if (!t) return;
  const el = document.getElementById('therapist-profile-content');
  if (!el) return;
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
            <div class="therapist-profile-img-placeholder"><img src="${t.img}" alt="Therapist profile"></div>
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
            <h3 style="margin-bottom:0.5rem;">Services</h3>
            <div class="profile-services-list">
              ${t.services.map(s => `
                <div class="profile-service-item">
                  <span class="profile-service-name">${s.name}</span>
                </div>
              `).join('')}
            </div>
            <div class="profile-book-btns">
              <a href="https://wa.me/254700000000?text=Hi! I'd like to book a session with ${t.name}" target="_blank" class="btn btn-wa"> <img src="img/icons8-whatsapp-32.png" alt="WhatsApp icon"> WhatsApp Booking</a>
              <a href="https://t.me/NairobiOasis?text=Hi! I'd like to book ${t.name}" target="_blank" class="btn btn-tg"> <img src="img/icons8-telegram-32.png" alt="Telegram icon"> Telegram Booking</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ===== CONTACT FORM =====
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

// ===== BOOKING FORM =====
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
});
