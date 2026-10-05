import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5001/api";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("patient"))
  );

  const [doctor, setDoctor] = useState(
    JSON.parse(localStorage.getItem("doctor"))
  );

  const [view, setView] = useState(
    localStorage.getItem("view") || "home"
  );

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------
  // Fetch doctors
  // --------------------------------

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/doctors`
      );

      setDoctors(response.data);
    } catch (error) {
      console.log("Failed to fetch doctors");
    }
  };

  // --------------------------------
  // Fetch patient's appointments
  // --------------------------------

  const fetchAppointments = async () => {
    const token = localStorage.getItem("patientToken");

    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppointments(response.data.appointments);
    } catch (error) {
      console.log("Failed to fetch appointments");
    }
  };

  // --------------------------------
  // Fetch doctor's appointments
  // --------------------------------

  const fetchDoctorAppointments = async () => {
    const token = localStorage.getItem("doctorToken");

    if (!token) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/appointments/doctor/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDoctorAppointments(
        response.data.appointments
      );
    } catch (error) {
      console.log(
        "Failed to fetch doctor appointments"
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Initial load
  // --------------------------------

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }

    if (doctor) {
      fetchDoctorAppointments();
    }
  }, [user, doctor]);

  // --------------------------------
  // Patient Login
  // --------------------------------

  const patientLogin = async (email, password) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password
        }
      );

      const token = response.data.token;

      localStorage.setItem(
        "patientToken",
        token
      );

      const loggedInPatient = {
        email
      };

      localStorage.setItem(
        "patient",
        JSON.stringify(loggedInPatient)
      );

      localStorage.setItem("view", "patient");

      setUser(loggedInPatient);
      setDoctor(null);
      setView("patient");

      setMessage("Login successful");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Patient Registration
  // --------------------------------

  const patientRegister = async (
    name,
    email,
    password
  ) => {
    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password
        }
      );

      setMessage(
        "Registration successful. Please login."
      );

      setView("patient-login");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Doctor Login
  // --------------------------------

  const doctorLogin = async (
    email,
    password
  ) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/doctor-auth/login`,
        {
          email,
          password
        }
      );

      const token = response.data.token;
      const loggedInDoctor =
        response.data.doctor;

      localStorage.setItem(
        "doctorToken",
        token
      );

      localStorage.setItem(
        "doctor",
        JSON.stringify(loggedInDoctor)
      );

      localStorage.setItem(
        "view",
        "doctor"
      );

      setDoctor(loggedInDoctor);
      setUser(null);
      setView("doctor");

      setMessage("Doctor login successful");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Doctor login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Book Appointment
  // --------------------------------

  const bookAppointment = async (
    doctorId,
    date,
    time
  ) => {
    const token =
      localStorage.getItem("patientToken");

    if (!token) {
      setMessage(
        "Please login as a patient first."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${API_URL}/appointments`,
        {
          doctor: doctorId,
          date,
          time
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        "✓ Appointment booked successfully!"
      );

      await fetchAppointments();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Appointment booking failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Logout
  // --------------------------------

  const logout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patient");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    localStorage.removeItem("view");

    setUser(null);
    setDoctor(null);
    setAppointments([]);
    setDoctorAppointments([]);
    setView("home");
    setMessage("");
  };

  // --------------------------------
  // Doctor Dashboard
  // --------------------------------

  if (doctor && view === "doctor") {
    return (
      <DoctorDashboard
        doctor={doctor}
        appointments={doctorAppointments}
        loading={loading}
        message={message}
        logout={logout}
      />
    );
  }

  // --------------------------------
  // Patient Dashboard
  // --------------------------------

  if (user && view === "patient") {
    return (
      <PatientDashboard
        user={user}
        doctors={doctors}
        appointments={appointments}
        bookAppointment={bookAppointment}
        logout={logout}
        message={message}
        loading={loading}
      />
    );
  }

  // --------------------------------
  // Authentication Pages
  // --------------------------------

  if (view === "patient-login") {
    return (
      <AuthPage
        title="Patient Login"
        subtitle="Access your MediCare appointments"
        onSubmit={patientLogin}
        buttonText="Login as Patient"
        switchText="Don't have an account?"
        switchAction={() =>
          setView("register")
        }
        switchLabel="Register"
        loading={loading}
        message={message}
      />
    );
  }

  if (view === "doctor-login") {
    return (
      <AuthPage
        title="Doctor Login"
        subtitle="Access your appointment schedule"
        onSubmit={doctorLogin}
        buttonText="Login as Doctor"
        switchText="Are you a patient?"
        switchAction={() =>
          setView("patient-login")
        }
        switchLabel="Patient Login"
        loading={loading}
        message={message}
        doctorMode
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterPage
        onSubmit={patientRegister}
        switchAction={() =>
          setView("patient-login")
        }
        loading={loading}
        message={message}
      />
    );
  }

  // --------------------------------
  // Home
  // --------------------------------

  return (
    <HomePage
      setView={setView}
    />
  );
}


// ==================================================
// HOME PAGE
// ==================================================

function HomePage({ setView }) {
  return (
    <div className="app">

      <nav className="navbar">

        <div
          className="logo"
          onClick={() => setView("home")}
        >
          Medi<span>Care</span>
        </div>

        <div className="nav-links">
          <button
            onClick={() =>
              setView("patient-login")
            }
          >
            Patient Login
          </button>

          <button
            className="doctor-nav-btn"
            onClick={() =>
              setView("doctor-login")
            }
          >
            Doctor Login
          </button>
        </div>

      </nav>

      <section className="hero">

        <div className="hero-content">

          <div className="hero-label">
            <span>✦</span>
            Healthcare made simple
          </div>

          <h1>
            Your health,
            <br />
            <span>our priority.</span>
          </h1>

          <p>
            Book appointments with trusted doctors,
            manage your visits, and keep your
            healthcare journey organized in one place.
          </p>

          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={() =>
                setView("patient-login")
              }
            >
              Book an Appointment →
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                setView("doctor-login")
              }
            >
              Doctor Portal
            </button>

          </div>

        </div>

        <div className="hero-card">

          <div className="medical-symbol">
            +
          </div>

          <h3>
            Better care starts
            <br />
            with a simple appointment.
          </h3>

          <p>
            Connect with doctors and find
            convenient appointment slots.
          </p>

          <div className="hero-stat">

            <strong>24/7</strong>

            <span>
              Healthcare access
            </span>

          </div>

        </div>

      </section>

      <section className="features">

        <div className="feature-card">
          <div className="feature-icon">
            ♡
          </div>

          <h3>Trusted Doctors</h3>

          <p>
            Choose from available doctors
            and their specializations.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            ◷
          </div>

          <h3>Easy Scheduling</h3>

          <p>
            Select an available date and
            time slot for your visit.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            ✓
          </div>

          <h3>Secure Access</h3>

          <p>
            JWT authentication keeps your
            account and appointments protected.
          </p>
        </div>

      </section>

    </div>
  );
}


// ==================================================
// AUTH PAGE
// ==================================================

function AuthPage({
  title,
  subtitle,
  onSubmit,
  buttonText,
  switchText,
  switchAction,
  switchLabel,
  loading,
  message,
  doctorMode
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(email, password);
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">

        <div
          className="logo"
          onClick={() =>
            window.location.reload()
          }
        >
          Medi<span>Care</span>
        </div>

        <div className="auth-brand-content">

          <div className="medical-symbol">
            +
          </div>

          <h1>
            {doctorMode
              ? "Care for patients."
              : "Your health matters."}
          </h1>

          <p>
            {doctorMode
              ? "Manage your schedule and stay connected with your patients."
              : "Book appointments with trusted healthcare professionals."}
          </p>

        </div>

      </div>

      <div className="auth-form-side">

        <div className="auth-form">

          <div className="mobile-logo">
            <div className="logo">
              Medi<span>Care</span>
            </div>
          </div>

          <div className="auth-heading">

            <span className="section-label">
              {doctorMode
                ? "DOCTOR PORTAL"
                : "PATIENT PORTAL"}
            </span>

            <h2>{title}</h2>

            <p>{subtitle}</p>

          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="primary-btn full-width"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : buttonText}
            </button>

          </form>

          <div className="auth-switch">

            <span>{switchText}</span>

            <button
              onClick={switchAction}
            >
              {switchLabel}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


// ==================================================
// REGISTER PAGE
// ==================================================

function RegisterPage({
  onSubmit,
  switchAction,
  loading,
  message
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(
      name,
      email,
      password
    );
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">

        <div className="logo">
          Medi<span>Care</span>
        </div>

        <div className="auth-brand-content">

          <div className="medical-symbol">
            +
          </div>

          <h1>
            Start your
            <br />
            health journey.
          </h1>

          <p>
            Create your patient account
            and book appointments easily.
          </p>

        </div>

      </div>

      <div className="auth-form-side">

        <div className="auth-form">

          <div className="auth-heading">

            <span className="section-label">
              GET STARTED
            </span>

            <h2>Create account</h2>

            <p>
              Register as a patient to
              book appointments.
            </p>

          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();

              onSubmit(
                name,
                email,
                password
              );
            }}
          >

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="primary-btn full-width"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>

          </form>

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <button
              onClick={switchAction}
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


// ==================================================
// PATIENT DASHBOARD
// ==================================================

function PatientDashboard({
  user,
  doctors,
  appointments,
  bookAppointment,
  logout,
  message,
  loading
}) {
  const [selectedDoctor, setSelectedDoctor] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  return (
    <div className="dashboard-page">

      <nav className="navbar dashboard-nav">

        <div className="logo">
          Medi<span>Care</span>
        </div>

        <div className="dashboard-user">

          <span>
            {user.email}
          </span>

          <button
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-container">

        <div className="dashboard-header">

          <div>
            <span className="section-label">
              PATIENT DASHBOARD
            </span>

            <h1>
              Find the right care for you.
            </h1>

            <p>
              Choose a doctor and book your
              appointment.
            </p>
          </div>

        </div>

        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        <section className="doctors-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                OUR DOCTORS
              </span>

              <h2>
                Choose your doctor
              </h2>
            </div>

            <span className="doctor-count">
              {doctors.length} doctors
            </span>

          </div>

          <div className="doctors-grid">

            {doctors.map((doctor) => (

              <div
                className="doctor-card"
                key={doctor._id}
              >

                <div className="doctor-card-top">

                  <div className="doctor-avatar">
                    {doctor.name
                      .replace("Dr. ", "")
                      .charAt(0)}
                  </div>

                  <span className="available-badge">
                    Available
                  </span>

                </div>

                <h3>
                  {doctor.name}
                </h3>

                <p className="specialization">
                  {doctor.specialization}
                </p>

                <div className="doctor-slots">

                  <span>
                    {doctor.availableSlots?.length || 0}
                    {" "}available slots
                  </span>

                </div>

                <button
                  className="primary-btn full-width"
                  onClick={() =>
                    setSelectedDoctor(doctor)
                  }
                >
                  Book Appointment
                </button>

              </div>

            ))}

          </div>

        </section>

        <section className="appointments-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                MY APPOINTMENTS
              </span>

              <h2>
                Upcoming appointments
              </h2>
            </div>

            <span className="appointment-count">
              {appointments.length} booked
            </span>

          </div>

          {appointments.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                ◷
              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Choose a doctor above to
                book your first appointment.
              </p>

            </div>

          ) : (

            <div className="appointments-grid">

              {appointments.map(
                (appointment) => (

                  <div
                    className="appointment-card"
                    key={appointment._id}
                  >

                    <div className="appointment-top">

                      <div className="doctor-avatar small">
                        {appointment.doctor?.name
                          ?.replace("Dr. ", "")
                          .charAt(0)}
                      </div>

                      <span className="confirmed-badge">
                        Confirmed
                      </span>

                    </div>

                    <h3>
                      {appointment.doctor?.name}
                    </h3>

                    <p className="specialization">
                      {appointment.doctor?.specialization}
                    </p>

                    <div className="appointment-details">

                      <div>
                        <span>Date</span>
                        <strong>
                          {appointment.date}
                        </strong>
                      </div>

                      <div>
                        <span>Time</span>
                        <strong>
                          {appointment.time}
                        </strong>
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      {selectedDoctor && (

        <div className="modal-overlay">

          <div className="booking-modal">

            <button
              className="modal-close"
              onClick={() =>
                setSelectedDoctor(null)
              }
            >
              ×
            </button>

            <span className="section-label">
              BOOK APPOINTMENT
            </span>

            <h2>
              {selectedDoctor.name}
            </h2>

            <p className="specialization">
              {selectedDoctor.specialization}
            </p>

            <label>
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
            />

            <label>
              Select Time
            </label>

            <div className="slot-grid">

              {selectedDoctor.availableSlots?.map(
                (slot) => (

                  <button
                    key={slot}
                    className={
                      selectedTime === slot
                        ? "slot-btn selected"
                        : "slot-btn"
                    }
                    onClick={() =>
                      setSelectedTime(slot)
                    }
                  >
                    {slot}
                  </button>

                )
              )}

            </div>

            <button
              className="primary-btn full-width"
              disabled={
                !selectedDate ||
                !selectedTime ||
                loading
              }
              onClick={async () => {

                await bookAppointment(
                  selectedDoctor._id,
                  selectedDate,
                  selectedTime
                );

                setSelectedDoctor(null);
                setSelectedDate("");
                setSelectedTime("");

              }}
            >
              {loading
                ? "Booking..."
                : "Confirm Appointment"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


// ==================================================
// DOCTOR DASHBOARD
// ==================================================

function DoctorDashboard({
  doctor,
  appointments,
  loading,
  message,
  logout
}) {
  return (
    <div className="dashboard-page">

      <nav className="navbar dashboard-nav">

        <div className="logo">
          Medi<span>Care</span>
        </div>

        <div className="dashboard-user">

          <span>
            {doctor.name}
          </span>

          <button
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-container">

        <div className="dashboard-header doctor-dashboard-header">

          <div>

            <span className="section-label">
              DOCTOR DASHBOARD
            </span>

            <h1>
              Welcome, {doctor.name}
            </h1>

            <p>
              View your scheduled patient
              appointments.
            </p>

          </div>

          <div className="doctor-profile-card">

            <div className="doctor-avatar">
              {doctor.name
                .replace("Dr. ", "")
                .charAt(0)}
            </div>

            <div>

              <strong>
                {doctor.name}
              </strong>

              <span>
                {doctor.specialization}
              </span>

            </div>

          </div>

        </div>

        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        <section className="appointments-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                SCHEDULE
              </span>

              <h2>
                Your appointments
              </h2>

            </div>

            <span className="appointment-count">
              {appointments.length} scheduled
            </span>

          </div>

          {loading ? (

            <div className="no-appointments">
              <h3>
                Loading appointments...
              </h3>
            </div>

          ) : appointments.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                ◷
              </div>

              <h3>
                No scheduled appointments
              </h3>

              <p>
                Your upcoming patient
                appointments will appear here.
              </p>

            </div>

          ) : (

            <div className="doctor-schedule-list">

              {appointments.map(
                (appointment) => (

                  <div
                    className="doctor-schedule-card"
                    key={appointment._id}
                  >

                    <div className="schedule-patient">

                      <div className="doctor-avatar small">
                        {appointment.patient?.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {appointment.patient?.name}
                        </strong>

                        <span>
                          {appointment.patient?.email}
                        </span>

                      </div>

                    </div>

                    <div className="schedule-date">

                      <span>
                        DATE
                      </span>

                      <strong>
                        {appointment.date}
                      </strong>

                    </div>

                    <div className="schedule-time">

                      <span>
                        TIME
                      </span>

                      <strong>
                        {appointment.time}
                      </strong>

                    </div>

                    <div className="confirmed-badge">
                      Confirmed
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;