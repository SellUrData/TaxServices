import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Box
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { db } from '../firebase';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;

    try {
      // Get user profile from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          email: currentUser.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || ''
        });
      } else {
        // Create a new profile if it doesn't exist
        const newProfile = {
          email: currentUser.email,
          first_name: '',
          last_name: '',
          created_at: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // Update profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Update email if changed
      if (profile.email !== currentUser.email) {
        await updateEmail(currentUser, profile.email);
      }

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password.new !== password.confirm) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentUser, password.new);
      setPassword({ current: '', new: '', confirm: '' });
      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Profile Settings
          </Typography>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          <form onSubmit={handleProfileUpdate}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>
            Change Password
          </Typography>
          <form onSubmit={handlePasswordChange}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="current"
                  type="password"
                  value={password.current}
                  onChange={handlePasswordInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="new"
                  type="password"
                  value={password.new}
                  onChange={handlePasswordInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirm"
                  type="password"
                  value={password.confirm}
                  onChange={handlePasswordInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Profile;
