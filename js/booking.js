// Booking System JavaScript
// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPisjGVYCZ4MWmQA3ZH1MsbwPFUf1TpyO4zOmt9I1hpYUHyJGQsseAFe8Gg3Yzp1_kCQ/exec';
const TOTAL_STEPS = 5;

let currentStepNum = 1;
let formData = {
    date: '',
    guests: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initializeDatePicker();
    generateTimeSlots();
    setupFormSubmission();
    updateProgress();
});

// Date Picker Initialization
function initializeDatePicker() {
    const dateInput = document.getElementById('reservationDate');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // Allow booking up to 2 months ahead

    // Set min date to tomorrow
    today.setDate(today.getDate() + 1);
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    dateInput.addEventListener('change', function () {
        if (this.value) {
            formData.date = this.value;
        }
    });
}

// Generate Time Slots
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    const times = [
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
        '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
    ];

    times.forEach(time => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'time-btn';
        button.textContent = time;
        button.onclick = () => selectTime(time, button);
        timeSlotsContainer.appendChild(button);
    });
}

// Select Guests
function selectGuests(count) {
    const buttons = document.querySelectorAll('.guest-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');

    formData.guests = count;
    document.getElementById('guestCount').value = count;

    // Auto-advance after selection
    setTimeout(() => nextStep(), 500);
}

// Select Time
function selectTime(time, button) {
    const buttons = document.querySelectorAll('.time-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    formData.time = time;
    document.getElementById('arrivalTime').value = time;

    // Auto-advance after selection
    setTimeout(() => nextStep(), 500);
}

// Navigation Functions
function nextStep() {
    const currentStep = document.querySelector(`.form-step[data-step="${currentStepNum}"]`);

    // Validate current step
    if (!validateStep(currentStepNum)) {
        return;
    }

    // Update form data from contact fields
    if (currentStepNum === 4) {
        formData.name = document.getElementById('fullName').value;
        formData.phone = document.getElementById('phone').value;
        formData.email = document.getElementById('email').value;
        formData.notes = document.getElementById('specialRequests').value;
        updateReviewSummary();
    }

    // Move to next step
    currentStep.classList.remove('active');
    currentStepNum++;

    const nextStep = document.querySelector(`.form-step[data-step="${currentStepNum}"]`);
    nextStep.classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
    const currentStep = document.querySelector(`.form-step[data-step="${currentStepNum}"]`);
    currentStep.classList.remove('active');

    currentStepNum--;

    const prevStep = document.querySelector(`.form-step[data-step="${currentStepNum}"]`);
    prevStep.classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation
function validateStep(step) {
    switch (step) {
        case 1:
            const date = document.getElementById('reservationDate').value;
            if (!date) {
                alert('Please select a date');
                return false;
            }
            return true;
        case 2:
            if (!formData.guests) {
                alert('Please select number of guests');
                return false;
            }
            return true;
        case 3:
            if (!formData.time) {
                alert('Please select a time');
                return false;
            }
            return true;
        case 4:
            const name = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;

            if (!name || !phone || !email) {
                alert('Please fill in all required fields');
                return false;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return false;
            }

            return true;
        default:
            return true;
    }
}

// Update Progress Bar
function updateProgress() {
    const progress = (currentStepNum / TOTAL_STEPS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentStep').textContent = currentStepNum;
    document.getElementById('totalSteps').textContent = TOTAL_STEPS;
}

// Update Review Summary
function updateReviewSummary() {
    // Format date
    const dateObj = new Date(formData.date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    document.getElementById('reviewDate').textContent = formattedDate;
    document.getElementById('reviewGuests').textContent = formData.guests + (formData.guests == 1 ? ' Guest' : ' Guests');
    document.getElementById('reviewTime').textContent = formData.time;
    document.getElementById('reviewName').textContent = formData.name;
    document.getElementById('reviewPhone').textContent = formData.phone;
    document.getElementById('reviewEmail').textContent = formData.email;
}

// Form Submission
function setupFormSubmission() {
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const submitText = submitBtn.querySelector('.submit-text');
        const submitLoader = submitBtn.querySelector('.submit-loader');

        // Show loading state
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoader.style.display = 'inline-block';

        try {
            // Submit to Google Apps Script
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Since we're using no-cors, we can't read the response
            // Assume success if no error was thrown
            setTimeout(() => {
                showSuccessStep();
            }, 1000);

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your reservation. Please try again or contact us directly.');

            // Reset button state
            submitBtn.disabled = false;
            submitText.style.display = 'inline-block';
            submitLoader.style.display = 'none';
        }
    });
}

function showSuccessStep() {
    const currentStep = document.querySelector(`.form-step[data-step="${currentStepNum}"]`);
    currentStep.classList.remove('active');

    currentStepNum = 6;
    const successStep = document.querySelector(`.form-step[data-step="6"]`);
    successStep.classList.add('active');

    // Update progress to 100%
    document.getElementById('progressFill').style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Keyboard Navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && currentStepNum < 5) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'TEXTAREA') {
            nextStep();
        }
    }
});
