/**
 * CareSync Hospital Management System (HMS)
 * Multi-Screen State Navigator & LocalStorage Controller
 */

// ================= 1. DATABASE & INITIAL SEEDER =================
const SEED_DATA = {
  users: [
    { id: 'u1', name: 'Dr. Rafiqul Islam', email: 'admin@caresync.com', role: 'admin', phone: '+8801711000001' },
    { id: 'u2', name: 'Dr. Farhana Yasmin', email: 'doctor@caresync.com', role: 'doctor', phone: '+8801711000002' },
    { id: 'u3', name: 'Dr. Mahbubur Rahman', email: 'mahbub@caresync.com', role: 'doctor', phone: '+8801711000003' },
    { id: 'u4', name: 'Tanvir Ahmed', email: 'patient@caresync.com', role: 'patient', phone: '+8801711223344', age: 32, gender: 'Male', bloodGroup: 'A+' }
  ],
  doctors: [
    { 
      id: 'doc1', 
      userId: 'u2', 
      name: 'Dr. Farhana Yasmin', 
      department: 'Cardiology', 
      degree: 'MBBS, FCPS (Cardiology), FACC', 
      fee: 1200, 
      chamberRoom: 'Chamber 302, Level 3', 
      active: true,
      timeSlots: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'] 
    },
    { 
      id: 'doc2', 
      userId: 'u3', 
      name: 'Dr. Mahbubur Rahman', 
      department: 'Medicine', 
      degree: 'MBBS, FCPS (Medicine), MACP (USA)', 
      fee: 1000, 
      chamberRoom: 'Chamber 205, Level 2', 
      active: true,
      timeSlots: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'] 
    }
  ],
  appointments: [
    {
      id: 'apt-101',
      patientId: 'u4',
      patientName: 'Tanvir Ahmed',
      doctorId: 'doc1',
      doctorName: 'Dr. Farhana Yasmin',
      department: 'Cardiology',
      date: '2026-11-10',
      timeSlot: '05:30 PM',
      reason: 'Frequent palpitation & mild chest tightness',
      status: 'Upcoming',
      paymentStatus: 'Paid',
      fee: 1200
    }
  ],
  prescriptions: [],
  transactions: [
    {
      id: 'trx-901',
      appointmentId: 'apt-101',
      patientId: 'u4',
      patientName: 'Tanvir Ahmed',
      amount: 1200,
      method: 'bKash',
      trxId: 'BKASH88392019',
      timestamp: '2026-11-08 10:15 AM',
      status: 'Success'
    }
  ]
};

function initDatabase() {
  if (!localStorage.getItem('hms_users')) localStorage.setItem('hms_users', JSON.stringify(SEED_DATA.users));
  if (!localStorage.getItem('hms_doctors')) localStorage.setItem('hms_doctors', JSON.stringify(SEED_DATA.doctors));
  if (!localStorage.getItem('hms_appointments')) localStorage.setItem('hms_appointments', JSON.stringify(SEED_DATA.appointments));
  if (!localStorage.getItem('hms_prescriptions')) localStorage.setItem('hms_prescriptions', JSON.stringify(SEED_DATA.prescriptions));
  if (!localStorage.getItem('hms_transactions')) localStorage.setItem('hms_transactions', JSON.stringify(SEED_DATA.transactions));
}

const DB = {
  get: (key) => JSON.parse(localStorage.getItem(`hms_${key}`) || '[]'),
  set: (key, data) => localStorage.setItem(`hms_${key}`, JSON.stringify(data))
};

// ================= 2. PAGE NAVIGATION STATE =================
let currentUser = null;

// Screen Switcher: welcomeScreen | loginScreen | doctorScreen | patientScreen | adminScreen
function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');
  window.scrollTo(0, 0);

  // Update Navigation Bar
  const navGuest = document.getElementById('navGuestArea');
  const navUser = document.getElementById('navUserArea');

  if (currentUser) {
    navGuest.classList.add('hidden');
    navUser.classList.remove('hidden');
    document.getElementById('navUserName').innerText = currentUser.name;
    document.getElementById('navUserRole').innerText = currentUser.role.toUpperCase();
  } else {
    navGuest.classList.remove('hidden');
    navUser.classList.add('hidden');
  }
}

// 1-Click Fast Login
function directLogin(role) {
  const users = DB.get('users');
  currentUser = users.find(u => u.role === role) || users[0];
  routeUserToPortal();
}

// Form Login
function handleFormLogin(e) {
  e.preventDefault();
  const role = document.getElementById('loginRole').value;
  directLogin(role);
}

// Logout back to Welcome Screen
function handleLogout() {
  currentUser = null;
  showScreen('welcomeScreen');
}

// Route to correct portal based on role
function routeUserToPortal() {
  if (!currentUser) {
    showScreen('loginScreen');
    return;
  }

  if (currentUser.role === 'doctor') {
    showScreen('doctorScreen');
    renderDoctorDashboard();
  } else if (currentUser.role === 'patient') {
    showScreen('patientScreen');
    renderPatientDashboard();
  } else if (currentUser.role === 'admin') {
    showScreen('adminScreen');
    renderAdminDashboard();
  }
}

// ================= 3. DOCTOR PORTAL =================
function renderDoctorDashboard() {
  const doctors = DB.get('doctors');
  const doc = doctors.find(d => d.userId === currentUser.id) || doctors[0];

  document.getElementById('docProfileName').innerText = doc.name;
  document.getElementById('docProfileSpecialty').innerText = `${doc.degree} • ${doc.chamberRoom}`;

  const appointments = DB.get('appointments').filter(a => a.doctorId === doc.id);
  document.getElementById('docQueueCount').innerText = appointments.length;

  const tbody = document.getElementById('doctorQueueTableBody');
  tbody.innerHTML = '';

  appointments.forEach((apt, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';

    let statusBadge = '';
    if (apt.status === 'Upcoming') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Upcoming</span>';
    else if (apt.status === 'In-Chamber') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 animate-pulse">In Chamber</span>';
    else statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Completed</span>';

    tr.innerHTML = `
      <td class="p-4 font-mono">#${index + 1} (${apt.timeSlot})</td>
      <td class="p-4 font-semibold text-slate-800">${apt.patientName}<span class="block text-[11px] text-slate-400 font-normal">Reason: ${apt.reason}</span></td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${apt.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
          ${apt.paymentStatus}
        </span>
      </td>
      <td class="p-4">${statusBadge}</td>
      <td class="p-4 text-right space-x-1 sm:space-x-2">
        <button onclick="viewPatientHistory('${apt.patientId}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition">
          <i class="fa-solid fa-notes-medical mr-1 text-cyan-600"></i> History
        </button>
        ${apt.status === 'Upcoming' ? `<button onclick="updateAppointmentStatus('${apt.id}', 'In-Chamber')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-medium">Call In</button>` : ''}
        ${apt.status === 'In-Chamber' ? `<button onclick="openPrescriptionModal('${apt.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium">Prescribe</button>` : ''}
        ${apt.status === 'Completed' ? `<button onclick="viewPrescriptionByAppointment('${apt.id}')" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[11px] font-medium">View Rx</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateAppointmentStatus(aptId, newStatus) {
  const appointments = DB.get('appointments');
  const apt = appointments.find(a => a.id === aptId);
  if (apt) {
    apt.status = newStatus;
    DB.set('appointments', appointments);
    renderDoctorDashboard();
  }
}

function viewPatientHistory(patientId) {
  const users = DB.get('users');
  const patient = users.find(u => u.id === patientId) || { name: 'Patient Record', age: '32', bloodGroup: 'A+', phone: '+8801700000000' };

  document.getElementById('historyPatientName').innerText = `Record for: ${patient.name}`;
  document.getElementById('historyPatientCard').innerHTML = `
    <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Age</span><span class="font-semibold text-slate-800">${patient.age || '32'} Yrs</span></div>
    <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span><span class="font-bold text-rose-600">${patient.bloodGroup || 'A+'}</span></div>
    <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Contact</span><span class="font-semibold text-slate-800">${patient.phone}</span></div>
    <div><span class="text-slate-400 block text-[10px] uppercase font-bold">Record ID</span><span class="font-mono text-slate-600">${patient.id}</span></div>
  `;

  const prescriptions = DB.get('prescriptions').filter(p => p.patientId === patientId);
  const timeline = document.getElementById('historyTimeline');
  timeline.innerHTML = '';

  if (prescriptions.length === 0) {
    timeline.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No previous prescriptions recorded.</p>`;
  } else {
    prescriptions.forEach((rx, index) => {
      const rxCard = document.createElement('div');
      rxCard.className = 'border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2';
      const medicinesList = rx.medicines.map(m => `<span class="inline-block bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] mr-1 mb-1 font-medium">${m.name} (${m.dose})</span>`).join('');

      rxCard.innerHTML = `
        <div class="flex justify-between items-start border-b border-slate-200/60 pb-2">
          <div>
            <span class="text-xs font-bold text-slate-800">Visit #${prescriptions.length - index} • ${rx.date}</span>
            <p class="text-[11px] text-slate-500">Doctor: ${rx.doctorName}</p>
          </div>
          <div class="text-right text-[11px] text-slate-500 font-mono">BP: ${rx.vitals.bp} | Pulse: ${rx.vitals.pulse} bpm</div>
        </div>
        <div><p class="text-xs font-semibold text-slate-700"><span class="text-slate-400 font-normal">Diagnosis:</span> ${rx.diagnosis}</p></div>
        <div>${medicinesList}</div>
      `;
      timeline.appendChild(rxCard);
    });
  }

  document.getElementById('historyModal').classList.remove('hidden');
}

function openPrescriptionModal(aptId) {
  const apt = DB.get('appointments').find(a => a.id === aptId);
  if (!apt) return;

  document.getElementById('prescAppointmentId').value = apt.id;
  document.getElementById('prescPatientId').value = apt.patientId;
  document.getElementById('prescPatientHeader').innerText = `Patient: ${apt.patientName} • Reason: ${apt.reason}`;

  document.getElementById('prescriptionForm').reset();
  const container = document.getElementById('medicineRowsContainer');
  container.innerHTML = '';
  addMedicineRow();

  document.getElementById('prescriptionModal').classList.remove('hidden');
}

function addMedicineRow() {
  const container = document.getElementById('medicineRowsContainer');
  const div = document.createElement('div');
  div.className = 'grid grid-cols-12 gap-2 items-center';
  div.innerHTML = `
    <input type="text" placeholder="Medicine Name" class="col-span-5 text-xs p-2 rounded-lg border border-slate-200 med-name" required>
    <input type="text" placeholder="Dose (1+0+1)" class="col-span-3 text-xs p-2 rounded-lg border border-slate-200 med-dose" required>
    <input type="text" placeholder="Duration (7 days)" class="col-span-3 text-xs p-2 rounded-lg border border-slate-200 med-duration" required>
    <button type="button" onclick="this.parentElement.remove()" class="col-span-1 text-rose-500 hover:text-rose-700 text-center text-sm"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(div);
}

function handleSavePrescription(e) {
  e.preventDefault();
  const aptId = document.getElementById('prescAppointmentId').value;
  const apt = DB.get('appointments').find(a => a.id === aptId);

  const medRows = document.querySelectorAll('#medicineRowsContainer > div');
  const medicines = [];
  medRows.forEach(row => {
    medicines.push({
      name: row.querySelector('.med-name').value,
      dose: row.querySelector('.med-dose').value,
      duration: row.querySelector('.med-duration').value
    });
  });

  const prescriptions = DB.get('prescriptions');
  prescriptions.push({
    id: 'rx_' + Date.now(),
    appointmentId: aptId,
    patientId: apt.patientId,
    patientName: apt.patientName,
    doctorId: apt.doctorId,
    doctorName: apt.doctorName,
    date: new Date().toISOString().split('T')[0],
    vitals: {
      bp: document.getElementById('vitalsBp').value,
      pulse: document.getElementById('vitalsPulse').value,
      weight: document.getElementById('vitalsWeight').value
    },
    diagnosis: document.getElementById('prescDiagnosis').value,
    medicines: medicines,
    advice: document.getElementById('prescAdvice').value
  });
  DB.set('prescriptions', prescriptions);

  const appointments = DB.get('appointments');
  const targetApt = appointments.find(a => a.id === aptId);
  if (targetApt) targetApt.status = 'Completed';
  DB.set('appointments', appointments);

  closeModal('prescriptionModal');
  renderDoctorDashboard();
}

// ================= 4. PATIENT PORTAL =================
function renderPatientDashboard() {
  document.getElementById('patProfileName').innerText = currentUser.name;
  document.getElementById('patProfileDetails').innerText = `Age: ${currentUser.age || 32} • Gender: ${currentUser.gender || 'Male'} • Blood Group: ${currentUser.bloodGroup || 'A+'} • Phone: ${currentUser.phone}`;

  renderPatientAppointments();
  renderPatientDoctorList();
}

function renderPatientAppointments() {
  const appointments = DB.get('appointments').filter(a => a.patientId === currentUser.id);
  const tbody = document.getElementById('patientAppointmentsTableBody');
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">No appointments scheduled yet.</td></tr>`;
    return;
  }

  appointments.forEach(apt => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';

    let actionBtn = '';
    if (apt.paymentStatus === 'Unpaid') {
      actionBtn = `<button onclick="openMfsPayment('${apt.id}')" class="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-[11px] font-medium transition">Pay Now</button>`;
    } else if (apt.status === 'Completed') {
      actionBtn = `<button onclick="viewPrescriptionByAppointment('${apt.id}')" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[11px] font-medium transition">View Rx</button>`;
    } else {
      actionBtn = `<span class="text-xs text-slate-400 font-medium">Chamber Confirmed</span>`;
    }

    tr.innerHTML = `
      <td class="p-4 font-medium text-slate-800">${apt.date} <span class="block text-[11px] text-slate-400">${apt.timeSlot}</span></td>
      <td class="p-4 font-semibold text-slate-800">${apt.doctorName} <span class="block text-[11px] text-slate-400 font-normal">${apt.department}</span></td>
      <td class="p-4 font-semibold text-slate-800">৳ ${apt.fee}</td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${apt.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
          ${apt.paymentStatus}
        </span>
      </td>
      <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">${apt.status}</span></td>
      <td class="p-4 text-right">${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPatientDoctorList() {
  const specialty = document.getElementById('filterSpecialty').value;
  const search = document.getElementById('searchDoctorInput').value.toLowerCase();
  let doctors = DB.get('doctors').filter(d => d.active);

  if (specialty !== 'ALL') doctors = doctors.filter(d => d.department === specialty);
  if (search) doctors = doctors.filter(d => d.name.toLowerCase().includes(search));

  const grid = document.getElementById('patientDoctorsGrid');
  grid.innerHTML = '';

  doctors.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'border border-slate-200 rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">${doc.department}</span>
          <span class="text-xs font-bold text-slate-800">৳ ${doc.fee}</span>
        </div>
        <h4 class="font-bold text-slate-800 text-base">${doc.name}</h4>
        <p class="text-xs text-slate-500 mt-1">${doc.degree}</p>
        <p class="text-xs text-slate-600 mt-2 font-medium"><i class="fa-solid fa-location-dot text-cyan-600 mr-1"></i> ${doc.chamberRoom}</p>
      </div>
      <button onclick="openBookingModal('${doc.id}')" class="mt-4 w-full py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold transition">
        Book Chamber Visit
      </button>
    `;
    grid.appendChild(card);
  });
}

function scrollToDoctorList() {
  document.getElementById('doctorDirectorySection').scrollIntoView({ behavior: 'smooth' });
}

// ================= 5. BOOKING & PAYMENT =================
function openBookingModal(doctorId) {
  const doc = DB.get('doctors').find(d => d.id === doctorId);
  if (!doc) return;

  document.getElementById('bookDoctorId').value = doc.id;
  document.getElementById('bookDoctorName').value = `${doc.name} (${doc.department}) - Fee: ৳${doc.fee}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('bookDate').value = tomorrow.toISOString().split('T')[0];

  const slotSelect = document.getElementById('bookTimeSlot');
  slotSelect.innerHTML = '';
  doc.timeSlots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.innerText = slot;
    slotSelect.appendChild(opt);
  });

  document.getElementById('bookingModal').classList.remove('hidden');
}

function handleBookAppointment(e) {
  e.preventDefault();
  const docId = document.getElementById('bookDoctorId').value;
  const doc = DB.get('doctors').find(d => d.id === docId);

  const appointments = DB.get('appointments');
  const newAppointment = {
    id: 'apt-' + Date.now(),
    patientId: currentUser.id,
    patientName: currentUser.name,
    doctorId: doc.id,
    doctorName: doc.name,
    department: doc.department,
    date: document.getElementById('bookDate').value,
    timeSlot: document.getElementById('bookTimeSlot').value,
    reason: document.getElementById('bookReason').value,
    status: 'Upcoming',
    paymentStatus: 'Unpaid',
    fee: doc.fee
  };

  appointments.push(newAppointment);
  DB.set('appointments', appointments);
  closeModal('bookingModal');
  renderPatientAppointments();
  openMfsPayment(newAppointment.id);
}

let currentPaymentAppointment = null;
let selectedMfsMethod = 'bKash';

function openMfsPayment(appointmentId) {
  const apt = DB.get('appointments').find(a => a.id === appointmentId);
  if (!apt) return;
  currentPaymentAppointment = apt;
  showMfsStep1();
  document.getElementById('mfsModal').classList.remove('hidden');
}

function showMfsStep1() {
  const container = document.getElementById('mfsModalContainer');
  const isBkash = selectedMfsMethod === 'bKash';
  const headerBg = isBkash ? 'bg-pink-600' : 'bg-orange-600';

  container.innerHTML = `
    <div class="${headerBg} text-white p-5 text-center relative">
      <button onclick="closeModal('mfsModal')" class="absolute top-4 right-4 text-white/80 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      <h3 class="font-bold text-lg tracking-wide uppercase">${selectedMfsMethod} Checkout</h3>
      <p class="text-xs text-white/80 mt-1">Amount: ৳ ${currentPaymentAppointment.fee}</p>
    </div>
    <div class="p-6 space-y-4">
      <div class="flex gap-2">
        <button type="button" onclick="selectedMfsMethod='bKash'; showMfsStep1();" class="flex-1 py-1.5 text-xs font-bold rounded-lg border ${selectedMfsMethod==='bKash'?'border-pink-600 bg-pink-50 text-pink-600':'border-slate-200 text-slate-500'}">bKash</button>
        <button type="button" onclick="selectedMfsMethod='Nagad'; showMfsStep1();" class="flex-1 py-1.5 text-xs font-bold rounded-lg border ${selectedMfsMethod==='Nagad'?'border-orange-600 bg-orange-50 text-orange-600':'border-slate-200 text-slate-500'}">Nagad</button>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Mobile Account Number</label>
        <input type="tel" id="mfsPhone" placeholder="017XXXXXXXX" value="${currentUser.phone || ''}" class="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono">
      </div>
      <button onclick="showMfsStep2()" class="w-full py-2.5 ${headerBg} text-white font-semibold text-xs rounded-xl shadow-md transition">Next: Enter OTP</button>
    </div>
  `;
}

function showMfsStep2() {
  const container = document.getElementById('mfsModalContainer');
  const isBkash = selectedMfsMethod === 'bKash';
  const headerBg = isBkash ? 'bg-pink-600' : 'bg-orange-600';

  container.innerHTML = `
    <div class="${headerBg} text-white p-5 text-center relative">
      <button onclick="closeModal('mfsModal')" class="absolute top-4 right-4 text-white/80 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      <h3 class="font-bold text-lg uppercase">Verify OTP</h3>
      <p class="text-xs text-white/80 mt-1">Enter code sent to mobile</p>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <input type="text" id="mfsOtp" value="123456" class="w-full text-center tracking-widest text-base font-bold p-2.5 rounded-lg border border-slate-200">
        <span class="block text-[11px] text-slate-400 text-center mt-1">Default demo OTP: 123456</span>
      </div>
      <button onclick="showMfsStep3()" class="w-full py-2.5 ${headerBg} text-white font-semibold text-xs rounded-xl shadow-md transition">Confirm OTP</button>
    </div>
  `;
}

function showMfsStep3() {
  const container = document.getElementById('mfsModalContainer');
  const isBkash = selectedMfsMethod === 'bKash';
  const headerBg = isBkash ? 'bg-pink-600' : 'bg-orange-600';

  container.innerHTML = `
    <div class="${headerBg} text-white p-5 text-center relative">
      <button onclick="closeModal('mfsModal')" class="absolute top-4 right-4 text-white/80 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
      <h3 class="font-bold text-lg uppercase">Enter PIN</h3>
      <p class="text-xs text-white/80 mt-1">Confirm payment of ৳ ${currentPaymentAppointment.fee}</p>
    </div>
    <div class="p-6 space-y-4">
      <input type="password" maxlength="5" value="12345" class="w-full text-center tracking-widest text-lg font-bold p-2.5 rounded-lg border border-slate-200">
      <button onclick="finalizeMfsPayment()" class="w-full py-2.5 ${headerBg} text-white font-semibold text-xs rounded-xl shadow-md transition">Pay ৳ ${currentPaymentAppointment.fee}</button>
    </div>
  `;
}

function finalizeMfsPayment() {
  const appointments = DB.get('appointments');
  const apt = appointments.find(a => a.id === currentPaymentAppointment.id);
  if (apt) apt.paymentStatus = 'Paid';
  DB.set('appointments', appointments);

  const transactions = DB.get('transactions');
  const randomTrx = `${selectedMfsMethod.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;
  transactions.unshift({
    id: 'trx-' + Date.now(),
    appointmentId: apt.id,
    patientId: apt.patientId,
    patientName: apt.patientName,
    amount: apt.fee,
    method: selectedMfsMethod,
    trxId: randomTrx,
    timestamp: new Date().toLocaleString(),
    status: 'Success'
  });
  DB.set('transactions', transactions);

  closeModal('mfsModal');
  renderPatientAppointments();
}

// ================= 6. ADMIN PORTAL =================
function renderAdminDashboard() {
  const patients = DB.get('users').filter(u => u.role === 'patient');
  const doctors = DB.get('doctors');
  const appointments = DB.get('appointments');
  const transactions = DB.get('transactions');

  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  document.getElementById('statTotalPatients').innerText = patients.length;
  document.getElementById('statTotalDoctors').innerText = doctors.filter(d => d.active).length;
  document.getElementById('statTodayAppointments').innerText = appointments.length;
  document.getElementById('statTotalRevenue').innerText = `৳ ${totalRevenue.toLocaleString()}`;

  renderAdminDoctorsList();
  renderAdminLedger();
}

function renderAdminDoctorsList() {
  const doctors = DB.get('doctors');
  const tbody = document.getElementById('adminDoctorsTableBody');
  tbody.innerHTML = '';

  doctors.forEach(doc => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="p-4 font-semibold text-slate-800">${doc.name}</td>
      <td class="p-4">${doc.department} <span class="text-slate-400 block text-[11px]">${doc.degree}</span></td>
      <td class="p-4">${doc.chamberRoom}</td>
      <td class="p-4 font-medium text-slate-800">৳ ${doc.fee}</td>
      <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${doc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${doc.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
      <td class="p-4 text-right">
        <button onclick="toggleDoctorStatus('${doc.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium">${doc.active ? 'Deactivate' : 'Activate'}</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleDoctorStatus(docId) {
  const doctors = DB.get('doctors');
  const doc = doctors.find(d => d.id === docId);
  if (doc) {
    doc.active = !doc.active;
    DB.set('doctors', doctors);
    renderAdminDoctorsList();
  }
}

function openDoctorModal() {
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorModal').classList.remove('hidden');
}

function handleSaveDoctor(e) {
  e.preventDefault();
  const doctors = DB.get('doctors');
  doctors.push({
    id: 'doc_' + Date.now(),
    name: document.getElementById('docFormName').value,
    department: document.getElementById('docFormDept').value,
    fee: Number(document.getElementById('docFormFee').value),
    degree: document.getElementById('docFormDegree').value,
    chamberRoom: document.getElementById('docFormRoom').value,
    active: true,
    timeSlots: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM']
  });
  DB.set('doctors', doctors);
  closeModal('doctorModal');
  renderAdminDoctorsList();
}

function renderAdminLedger() {
  const methodFilter = document.getElementById('filterPaymentMethod').value;
  let transactions = DB.get('transactions');
  if (methodFilter !== 'ALL') transactions = transactions.filter(t => t.method === methodFilter);

  const tbody = document.getElementById('adminLedgerTableBody');
  tbody.innerHTML = '';

  transactions.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="p-4 font-mono font-bold text-cyan-600">${t.trxId}</td>
      <td class="p-4 font-medium text-slate-700">${t.patientName}</td>
      <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}">${t.method}</span></td>
      <td class="p-4 font-bold text-slate-800">৳ ${t.amount}</td>
      <td class="p-4 text-slate-500">${t.timestamp}</td>
      <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Success</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ================= 7. PRESCRIPTION PAD VIEWER =================
function viewPrescriptionByAppointment(aptId) {
  const rx = DB.get('prescriptions').find(p => p.appointmentId === aptId);
  if (!rx) {
    alert('No prescription prepared yet.');
    return;
  }

  const container = document.getElementById('printablePrescriptionContent');
  let medRows = rx.medicines.map((m, i) => `
    <tr class="border-b border-slate-100">
      <td class="py-2 font-bold text-slate-800 text-xs">${i + 1}. ${m.name}</td>
      <td class="py-2 text-xs text-slate-600 font-mono">${m.dose}</td>
      <td class="py-2 text-xs text-slate-600">${m.duration}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
      <div>
        <h2 class="text-xl font-black text-slate-900">CareSync Hospital</h2>
        <p class="text-xs text-slate-500">Clinical & Chamber Services • Sylhet, Bangladesh</p>
      </div>
      <div class="text-right">
        <h3 class="text-sm font-bold text-cyan-800">${rx.doctorName}</h3>
        <p class="text-xs text-slate-500">Date: ${rx.date}</p>
      </div>
    </div>
    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 flex justify-between text-xs">
      <div><strong>Patient:</strong> ${rx.patientName}</div>
      <div><strong>BP:</strong> ${rx.vitals.bp}</div>
      <div><strong>Pulse:</strong> ${rx.vitals.pulse} bpm</div>
      <div><strong>Weight:</strong> ${rx.vitals.weight} kg</div>
    </div>
    <div class="space-y-3">
      <p class="text-xs"><strong>Diagnosis:</strong> ${rx.diagnosis}</p>
      <table class="w-full text-left text-xs">
        <thead><tr class="border-b border-slate-200 text-slate-400 uppercase text-[10px]"><th class="pb-1">Medicine</th><th class="pb-1">Dosage</th><th class="pb-1">Duration</th></tr></thead>
        <tbody>${medRows}</tbody>
      </table>
      <p class="text-xs pt-2"><strong>Advice:</strong> ${rx.advice || 'Follow medication schedule carefully.'}</p>
    </div>
  `;

  document.getElementById('viewPrescriptionModal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// ================= 8. STARTUP =================
window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  // Always starts on the Welcome Screen!
  showScreen('welcomeScreen');
});