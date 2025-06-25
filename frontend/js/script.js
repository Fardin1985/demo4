// Simulated users storage for demo purposes
const users = JSON.parse(localStorage.getItem('users') || '[]');

// Handle user registration
function handleRegistration(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    if (!username || !email || !password) {
        alert('Please fill all required fields.');
        return;
    }

    const exists = users.some(u => u.email === email);
    if (exists) {
        alert('Email already registered. Please login.');
        return;
    }

    users.push({ username, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    alert(`Registration successful as ${role}. You can now login.`);
    event.target.reset();
    window.location.href = 'login_register.html';
}

// Handle user login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    if (!email || !password) {
        alert('Please fill all required fields.');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password && u.role === role);

    if (!user) {
        alert('Invalid credentials or role. Please try again.');
        return;
    }

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('username', user.username);

    alert(`Welcome back, ${user.username}! Logged in as ${role}.`);

    if (role === 'doctor') {
        window.location.href = 'doctor_dashboard.html';
    } else {
        window.location.href = 'patient_dashboard.html';
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.clear();
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

// Handle appointment form submission
function handleAppointment(event) {
    event.preventDefault();

    const doctor = document.getElementById('doctor').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;

    if (!doctor || !appointmentDate || !appointmentTime) {
        alert('Please fill all the appointment details.');
        return;
    }

    if (sessionStorage.getItem('userRole') !== 'patient') {
        alert('Please log in as a patient to make an appointment.');
        window.location.href = 'login_register.html';
        return;
    }

    const username = sessionStorage.getItem('username');
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    const isBooked = appointments.some(app =>
        app.doctor === doctor && app.date === appointmentDate && app.time === appointmentTime
    );

    if (isBooked) {
        alert('This time slot is already booked for the selected doctor.');
        return;
    }

    const newAppointment = {
        patient: username,
        doctor,
        date: appointmentDate,
        time: appointmentTime
    };

    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    alert('Appointment booked successfully!');
    event.target.reset();
    window.location.href = 'payment.html'; // Redirect to payment
}

// Display appointments
function displayAppointments() {
    const role = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    const filtered = appointments.filter(app => {
        return role === 'patient' ? app.patient === username : app.doctor === username;
    });

    const container = document.getElementById('appointmentsList');
    if (!container) return;

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<p>No appointments found.</p>';
        return;
    }

    filtered.forEach((app, index) => {
        const item = document.createElement('div');
        item.className = 'appointment-item';
        item.innerHTML = `
            <p><strong>Doctor:</strong> ${app.doctor}</p>
            <p><strong>Patient:</strong> ${app.patient}</p>
            <p><strong>Date:</strong> ${app.date}</p>
            <p><strong>Time:</strong> ${app.time}</p>
            ${role === 'patient' ? `<button onclick="cancelAppointment(${index})">Cancel</button>` : ''}
            <hr>
        `;
        container.appendChild(item);
    });
}

// Cancel appointment
function cancelAppointment(index) {
    const role = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    const filtered = appointments.filter(app => role === 'patient' ? app.patient === username : app.doctor === username);
    const appointmentToCancel = filtered[index];

    const updatedAppointments = appointments.filter(app =>
        !(app.patient === appointmentToCancel.patient &&
            app.doctor === appointmentToCancel.doctor &&
            app.date === appointmentToCancel.date &&
            app.time === appointmentToCancel.time)
    );

    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    alert('Appointment cancelled.');
    displayAppointments();
}

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userRole = sessionStorage.getItem('userRole');

    const navLoginRegister = document.getElementById('navLoginRegister');
    const navLogout = document.getElementById('navLogout');
    const navAppointment = document.getElementById('navAppointment');
    const navSymptomChecker = document.getElementById('navSymptomChecker');
    const navNotifications = document.getElementById('navNotifications');

    // Logout logic
    if (navLogout) {
        navLogout.style.display = isLoggedIn ? 'inline-block' : 'none';
        navLogout.addEventListener('click', handleLogout);
    }

    if (navLoginRegister) {
        navLoginRegister.style.display = isLoggedIn ? 'none' : 'inline-block';
    }

    if (navAppointment) {
        navAppointment.style.display = (isLoggedIn && userRole === 'patient') ? 'inline-block' : 'none';
        navAppointment.addEventListener('click', e => {
            if (!isLoggedIn || userRole !== 'patient') {
                e.preventDefault();
                alert('You must be logged in as a patient to make an appointment.');
                window.location.href = 'login_register.html';
            }
        });
    }

    if (navSymptomChecker) {
        navSymptomChecker.style.display = (isLoggedIn && userRole === 'patient') ? 'inline-block' : 'none';
    }

    // Secure medical documents
    const medicalDocsLinks = document.querySelectorAll('a[href="medical_documents.html"]');
    medicalDocsLinks.forEach(link => {
        link.addEventListener('click', e => {
            if (!isLoggedIn || (userRole !== 'patient' && userRole !== 'doctor')) {
                e.preventDefault();
                alert('Please login first to access Medical Documents.');
                window.location.href = 'login_register.html';
            }
        });
    });

    // Load notifications
    if (navNotifications) {
        fetchNotifications(navNotifications);
    }
});

// Dummy notification loader
function fetchNotifications(container) {
    const notifications = [
        "Appointment confirmed for 10:00 AM.",
        "New health article available!",
        "Your last check-up results are ready."
    ];
    const ul = document.createElement('ul');
    notifications.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}
