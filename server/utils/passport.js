import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import db from '../database.js';

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/callback`,
        scope: ['profile', 'email']
    }, (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const google_id = profile.id;
            const name = profile.displayName;

            // Check if user exists by google_id
            let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(google_id);

            if (!user) {
                // Check if user exists by email but doesn't have google_id linked
                user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
                if (user) {
                    db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(google_id, user.id);
                    user.google_id = google_id;
                } else {
                    // Create new user
                    const result = db.prepare(
                        'INSERT INTO users (name, email, google_id, role) VALUES (?, ?, ?, ?)'
                    ).run(name, email, google_id, 'customer');
                    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails']
    }, (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
            const facebook_id = profile.id;
            const name = profile.displayName;

            let user = db.prepare('SELECT * FROM users WHERE facebook_id = ?').get(facebook_id);

            if (!user) {
                user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
                if (user) {
                    db.prepare('UPDATE users SET facebook_id = ? WHERE id = ?').run(facebook_id, user.id);
                    user.facebook_id = facebook_id;
                } else {
                    const result = db.prepare(
                        'INSERT INTO users (name, email, facebook_id, role) VALUES (?, ?, ?, ?)'
                    ).run(name, email, facebook_id, 'customer');
                    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}

export default passport;
