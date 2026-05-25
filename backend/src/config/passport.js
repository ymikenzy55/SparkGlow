const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        // Check if user already exists with Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists (user might have registered with email/password)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value || user.avatar;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random secure password
          isVerified: true, // Google accounts are pre-verified
          role: 'user', // Default role
        });

        done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
