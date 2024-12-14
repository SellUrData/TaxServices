import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const AssignClientDialog = ({ open, onClose, employee, clients, onAssign }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    try {
      const employeeRef = doc(db, 'employees', employee.id);
      await updateDoc(employeeRef, {
        assignedClients: arrayUnion(selectedClient),
        updatedAt: new Date().toISOString(),
      });

      onAssign(selectedClient);
      handleClose();
    } catch (error) {
      console.error('Error assigning client:', error);
      setError('Failed to assign client');
    }
  };

  const handleClose = () => {
    setSelectedClient('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Client to {employee?.firstName} {employee?.lastName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Client</InputLabel>
          <Select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            label="Select Client"
          >
            {clients.map((client) => (
              <MenuItem
                key={client.id}
                value={client.id}
                disabled={employee?.assignedClients?.includes(client.id)}
              >
                {client.firstName} {client.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained" color="primary">
          Assign Client
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignClientDialog;
