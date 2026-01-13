require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const consultationRoutes = require('./routes/consultation.routes');
const medecinRoutes = require('./routes/medecin.routes');
const paiementRoutes = require('./routes/paiement.routes');
const patientRoutes = require('./routes/patient.routes');
const rendezVousRoutes = require('./routes/rendezVous.routes');
const secretaireRoutes = require('./routes/secretaire.routes');

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/pdfs', express.static('pdfs'));


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Medical Cabinet API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Session pour Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/secretaires', secretaireRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/medecins', medecinRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/paiements', paiementRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// Gestion arrêt gracieux
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});