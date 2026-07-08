// Global Booking Modal Popup Controller
// Intercepts any click on links pointing to appointment.html?doctor=... and renders a premium pop-up modal.

(function() {
    // 1. Inject Styles dynamically into head
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        /* Booking Modal Styles */
        .bk-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(29, 42, 77, 0.5);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .bk-overlay.show {
            opacity: 1;
        }
        .bk-modal {
            background: #ffffff;
            border-radius: 16px;
            width: 90%;
            max-width: 550px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        }
        .bk-overlay.show .bk-modal {
            transform: scale(1);
        }
        .bk-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #edf2f7;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: #fff;
            z-index: 10;
        }
        .bk-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1d2a4d;
            margin: 0;
        }
        .bk-close {
            font-size: 1.75rem;
            border: none;
            background: none;
            color: #a0aec0;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            transition: color 0.2s;
        }
        .bk-close:hover {
            color: #e53e3e;
        }
        .bk-body {
            padding: 1.5rem;
        }
        .bk-form-group {
            margin-bottom: 1.25rem;
            text-align: left;
        }
        .bk-form-group label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 0.5rem;
        }
        .bk-input, .bk-select, .bk-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
            background: #f8fafc;
            font-family: inherit;
        }
        .bk-input:focus, .bk-select:focus, .bk-textarea:focus {
            border-color: #13C5DD;
            background: #fff;
        }
        .bk-btn-primary {
            width: 100%;
            padding: 0.85rem;
            background: #13C5DD;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .bk-btn-primary:hover {
            background: #0fb2c8;
        }
        .bk-btn-primary:disabled {
            background: #a0aec0;
            cursor: not-allowed;
        }
        .bk-fee-box {
            background: #e6fcf5;
            border: 1px solid #c3fae8;
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        /* Payment Styles inside Modal */
        .bk-methods {
            display: flex;
            gap: 8px;
            margin-bottom: 1.25rem;
        }
        .bk-method-btn {
            flex: 1;
            padding: 8px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            background: #fff;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }
        .bk-method-btn.active {
            border-color: #13C5DD;
            color: #13C5DD;
            background: rgba(19, 197, 221, 0.05);
        }
        .bk-method-btn i {
            font-size: 1.25rem;
        }
        .bk-summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1.25rem;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(styleTag);

    // Global overlay elements
    let overlay = null;
    let selectedDoctor = null;
    let activePaymentMethod = 'Card';
    let appointmentFormValues = {};

    // Check auth helper
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('medicoz_current_user')) || JSON.parse(localStorage.getItem('currentUser'));
    }

    // Intercept clicks on links pointing to appointment.html?doctor=
    document.addEventListener('click', async function(e) {
        const bookBtn = e.target.closest('a[href*="appointment.html?doctor="]');
        if (bookBtn) {
            e.preventDefault();
            
            const href = bookBtn.getAttribute('href');
            const urlParams = new URLSearchParams(href.split('?')[1]);
            const doctorId = urlParams.get('doctor');
            
            if (doctorId) {
                openBookingModal(doctorId);
            }
        }
    });

    // Make it available globally
    window.openBookingModal = async function(doctorId) {
        const currentUser = getCurrentUser();
        
        // Remove existing overlay if any
        if (overlay) {
            overlay.remove();
        }

        // Create overlay container
        overlay = document.createElement('div');
        overlay.className = 'bk-overlay';
        document.body.appendChild(overlay);

        // Fetch Doctor Details
        try {
            if (window.getDoctorById) {
                selectedDoctor = await window.getDoctorById(doctorId);
            }
        } catch (err) {
            console.error('Error fetching doctor details:', err);
        }

        if (!selectedDoctor) {
            alert('Failed to load doctor information.');
            overlay.remove();
            return;
        }

        // Render Auth check modal or Form modal
        if (!currentUser) {
            renderAuthCheckModal();
        } else {
            renderBookingFormModal();
        }

        // Trigger CSS transition animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 50);

        // Close on clicking overlay bg
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeBookingModal();
            }
        });
    };

    window.closeBookingModal = function() {
        if (!overlay) return;
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
            overlay = null;
            selectedDoctor = null;
            appointmentFormValues = {};
            activePaymentMethod = 'Card';
        }, 300);
    };

    // Render 1: Please login modal
    function renderAuthCheckModal() {
        overlay.innerHTML = `
            <div class="bk-modal" style="max-width: 450px;">
                <div class="bk-body" style="text-align: center; padding: 2.5rem 1.5rem;">
                    <i class="fas fa-lock" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 1.25rem; display: block;"></i>
                    <h3 style="margin-bottom: 10px; color: #1d2a4d; font-weight: 700; font-size: 1.4rem;">Login Required</h3>
                    <p style="color: #64748b; margin-bottom: 25px; font-size: 0.95rem; line-height: 1.5;">Please login to your account to book an appointment with <strong>${selectedDoctor.name}</strong>.</p>
                    <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                        <button onclick="closeBookingModal()" class="bk-input" style="flex: 1; padding: 10px 16px; font-weight: 600; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px;">Cancel</button>
                        <a href="login.html" style="flex: 1; padding: 10px 16px; font-weight: 600; background: #13C5DD; color: #fff; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.95rem;">Login Now</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Render 2: Main booking form steps
    function renderBookingFormModal() {
        const currentUser = getCurrentUser();
        const today = new Date().toISOString().split('T')[0];
        const fee = selectedDoctor.fee || '1000';

        overlay.innerHTML = `
            <div class="bk-modal">
                <div class="bk-header">
                    <h3 class="bk-title">Book Appointment</h3>
                    <button class="bk-close" onclick="closeBookingModal()">&times;</button>
                </div>
                <div class="bk-body">
                    <div id="booking-modal-step1">
                        <div class="bk-fee-box">
                            <div>
                                <strong style="display: block; color: #0ca678; font-size: 1.05rem;">${selectedDoctor.name}</strong>
                                <span style="font-size: 0.8rem; color: #0ca678; font-weight: 500;">${selectedDoctor.department} / ${selectedDoctor.role || 'Specialist'}</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="display: block; color: #0ca678; font-size: 1.15rem;">${fee} BDT</strong>
                                <span style="font-size: 0.75rem; color: #0ca678;">Consultation Fee</span>
                            </div>
                        </div>

                        <form id="bk-modal-form" onsubmit="event.preventDefault(); proceedToPayment();">
                            <div class="bk-form-group">
                                <label>Patient Full Name</label>
                                <input type="text" id="bk-name" class="bk-input" required value="${currentUser.name || ''}">
                            </div>

                            <div style="display: flex; gap: 15px;">
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>Email Address</label>
                                    <input type="email" id="bk-email" class="bk-input" required value="${currentUser.email || ''}">
                                </div>
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>Phone Number</label>
                                    <input type="tel" id="bk-phone" class="bk-input" required value="${currentUser.phone || ''}">
                                </div>
                            </div>

                            <div style="display: flex; gap: 15px;">
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>Gender</label>
                                    <select id="bk-gender" class="bk-select" required>
                                        <option value="Male" ${currentUser.gender === 'Male' ? 'selected' : ''}>Male</option>
                                        <option value="Female" ${currentUser.gender === 'Female' ? 'selected' : ''}>Female</option>
                                        <option value="Other" ${currentUser.gender === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>Appointment Date</label>
                                    <input type="date" id="bk-date" class="bk-input" required min="${today}">
                                </div>
                            </div>

                            <div class="bk-form-group">
                                <label>Symptoms / Comments (Optional)</label>
                                <textarea id="bk-comments" rows="3" class="bk-textarea" placeholder="Write any specific medical comments..."></textarea>
                            </div>

                            <button type="submit" class="bk-btn-primary">
                                Proceed to Payment <i class="fas fa-arrow-right"></i>
                            </button>
                        </form>
                    </div>

                    <div id="booking-modal-step2" style="display: none;">
                        <h4 style="color: #1d2a4d; margin-top: 0; margin-bottom: 12px; font-weight: 700; font-size: 1.1rem; text-align: left;">Simulated Secure Checkout</h4>
                        
                        <div class="bk-summary-card">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>Doctor:</span>
                                <strong>${selectedDoctor.name}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>Date:</span>
                                <strong id="bk-sum-date"></strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px; color: #13C5DD;">
                                <span>Total Fee:</span>
                                <strong>${fee} BDT</strong>
                            </div>
                        </div>

                        <div class="bk-form-group">
                            <label>Payment Method</label>
                            <div class="bk-methods">
                                <button type="button" class="bk-method-btn active" onclick="changeModalPaymentMethod('Card')">
                                    <i class="far fa-credit-card"></i> Card
                                </button>
                                <button type="button" class="bk-method-btn" onclick="changeModalPaymentMethod('bKash')">
                                    <i class="fas fa-mobile-alt"></i> bKash
                                </button>
                                <button type="button" class="bk-method-btn" onclick="changeModalPaymentMethod('Rocket')">
                                    <i class="fas fa-mobile-alt"></i> Rocket
                                </button>
                                <button type="button" class="bk-method-btn" onclick="changeModalPaymentMethod('Nagad')">
                                    <i class="fas fa-mobile-alt"></i> Nagad
                                </button>
                            </div>
                        </div>

                        <!-- Card Fields -->
                        <div id="bk-card-form">
                            <div class="bk-form-group">
                                <label>Cardholder Name</label>
                                <input type="text" id="bk-card-name" class="bk-input" placeholder="Name on card" value="${currentUser.name || ''}">
                            </div>
                            <div class="bk-form-group">
                                <label>Card Number</label>
                                <input type="text" id="bk-card-number" class="bk-input" placeholder="0000 0000 0000 0000" maxlength="19">
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>Expiry Date</label>
                                    <input type="text" id="bk-card-expiry" class="bk-input" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="bk-form-group" style="flex: 1;">
                                    <label>CVV / CVC</label>
                                    <input type="password" id="bk-card-cvv" class="bk-input" placeholder="***" maxlength="3">
                                </div>
                            </div>
                        </div>

                        <!-- Mobile Banking Fields -->
                        <div id="bk-mobile-form" style="display: none;">
                            <div class="bk-form-group">
                                <label id="bk-mobile-label">bKash Account Number</label>
                                <input type="tel" id="bk-mobile-number" class="bk-input" placeholder="e.g. 017XXXXXXXX" maxlength="11">
                            </div>
                            <div class="bk-form-group">
                                <label>Transaction PIN (OTP Simulation)</label>
                                <input type="password" id="bk-mobile-pin" class="bk-input" placeholder="****" maxlength="4">
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
                            <button type="button" onclick="backToFormStep()" class="bk-input" style="flex: 0.4; padding: 10px 16px; font-weight: 600; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px;">Back</button>
                            <button type="button" id="bk-pay-btn" onclick="submitModalPaymentAndBooking()" class="bk-btn-primary" style="flex: 0.6;">
                                <i class="fas fa-lock"></i> Pay & Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Step Transition 1 -> 2
    window.proceedToPayment = function() {
        const appDate = document.getElementById('bk-date').value;
        if (!appDate) {
            alert('Please select appointment date');
            return;
        }

        // Save form values
        appointmentFormValues = {
            patientName: document.getElementById('bk-name').value.trim(),
            patientEmail: document.getElementById('bk-email').value.trim(),
            patientPhone: document.getElementById('bk-phone').value.trim(),
            patientGender: document.getElementById('bk-gender').value,
            date: appDate,
            comments: document.getElementById('bk-comments').value.trim()
        };

        // Format summary date
        const dateFormatted = new Date(appDate).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('bk-sum-date').textContent = dateFormatted;

        // Toggle Step panels
        document.getElementById('booking-modal-step1').style.display = 'none';
        document.getElementById('booking-modal-step2').style.display = 'block';
    };

    window.backToFormStep = function() {
        document.getElementById('booking-modal-step1').style.display = 'block';
        document.getElementById('booking-modal-step2').style.display = 'none';
    };

    // Toggle Payment Forms inside modal
    window.changeModalPaymentMethod = function(method) {
        activePaymentMethod = method;
        
        // Remove active class from buttons
        const buttons = document.querySelectorAll('.bk-method-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Highlight clicked button
        event.currentTarget.classList.add('active');

        // Toggle form fields
        const cardForm = document.getElementById('bk-card-form');
        const mobileForm = document.getElementById('bk-mobile-form');

        if (method === 'Card') {
            cardForm.style.display = 'block';
            mobileForm.style.display = 'none';
        } else {
            cardForm.style.display = 'none';
            mobileForm.style.display = 'block';
            document.getElementById('bk-mobile-label').textContent = `${method} Mobile Number`;
            document.getElementById('bk-mobile-number').placeholder = `e.g. 017XXXXXXXX (${method})`;
            document.getElementById('bk-mobile-number').value = '';
            document.getElementById('bk-mobile-pin').value = '';
        }
    };

    // Confirm Checkout
    window.submitModalPaymentAndBooking = async function() {
        const currentUser = getCurrentUser();
        
        // Validate Payment inputs
        if (activePaymentMethod === 'Card') {
            const name = document.getElementById('bk-card-name').value.trim();
            const number = document.getElementById('bk-card-number').value.trim();
            const expiry = document.getElementById('bk-card-expiry').value.trim();
            const cvv = document.getElementById('bk-card-cvv').value.trim();
            if (!name || !number || !expiry || !cvv) {
                alert('Please fill in card details');
                return;
            }
        } else {
            const phone = document.getElementById('bk-mobile-number').value.trim();
            const pin = document.getElementById('bk-mobile-pin').value.trim();
            if (!phone || !pin) {
                alert('Please fill in mobile banking details');
                return;
            }
        }

        const payBtn = document.getElementById('bk-pay-btn');
        try {
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const bookingData = {
                patientId: currentUser.id || currentUser._id,
                doctorId: selectedDoctor.id,
                patientName: appointmentFormValues.patientName,
                patientEmail: appointmentFormValues.patientEmail,
                patientPhone: appointmentFormValues.patientPhone,
                patientGender: appointmentFormValues.patientGender,
                date: appointmentFormValues.date,
                comments: appointmentFormValues.comments,
                fee: Number(selectedDoctor.fee || 1000),
                paymentStatus: 'Paid',
                paymentDetails: {
                    method: activePaymentMethod,
                    accountNumber: activePaymentMethod === 'Card' 
                        ? document.getElementById('bk-card-number').value.replace(/\s?/g, '').slice(-4).padStart(16, '*')
                        : document.getElementById('bk-mobile-number').value,
                    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
                }
            };

            const response = await fetch('http://127.0.0.1:5000/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Booking failed');
            }

            alert('Simulated Payment Successful & Appointment Booked!');
            closeBookingModal();
            
            // Redirect to profile to see the booking history
            window.location.href = 'profile.html';

        } catch (err) {
            alert(err.message);
        } finally {
            payBtn.disabled = false;
            payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay & Confirm';
        }
    };

})();
