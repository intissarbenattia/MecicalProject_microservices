const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Utilisateur = require('../models/Utilisateur');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà
      let utilisateur = await Utilisateur.findOne({ googleId: profile.id });

      if (utilisateur) {
        return done(null, utilisateur);
      }

      // Créer un nouveau compte patient par défaut
      utilisateur = new Utilisateur({
        googleId: profile.id,
        nom: profile.name.familyName || 'Nom',
        prenom: profile.name.givenName || 'Prénom',
        email: profile.emails[0].value,
        role: 'PATIENT',
        actif: true
      });

      await utilisateur.save();
      done(null, utilisateur);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Utilisateur.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;