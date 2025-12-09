// Initialize Swiper
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1200,
        offset: 120,
        once: true,
        easing: 'ease-in-out',
        anchorPlacement: 'top-bottom'
    });
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        navbar.style.boxShadow = 'none';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }
    });
});

// --- Dynamic Events System ---
const eventsContainer = document.getElementById('events-container');

// Example Events Data (Empty by default to show empty state)
const events = [
    // { title: "Afro-Fusion Night", date: "Dec 24, 2024", description: "Live DJ and special holiday menu." },
];

function renderEvents() {
    if (!eventsContainer) return;

    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events-msg">
                <i class="far fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem; display:block;"></i>
                No upcoming events at this time. <br> Follow us on social media for updates!
            </div>
        `;
    } else {
        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card" data-aos="fade-up">
                <span class="event-date">${event.date}</span>
                <h3 style="color: var(--color-white); margin-bottom: 0.5rem;">${event.title}</h3>
                <p style="color: #aaa;">${event.description}</p>
            </div>
        `).join('');
    }
}

renderEvents();

// --- WhatsApp Booking Logic ---
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('booking-name').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const guests = document.getElementById('booking-guests').value;

        // Format the message
        const message = `Hello Pot of Jollof! I would like to book a table.%0A%0AName: ${name}%0ADate: ${date}%0ATime: ${time}%0AGuests: ${guests}%0A%0APlease confirm availability.`;

        // Open WhatsApp
        const whatsappUrl = `https://wa.me/254795384140?text=${message}`;
        window.open(whatsappUrl, '_blank');
    });
}
