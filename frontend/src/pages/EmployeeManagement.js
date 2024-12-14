import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const roles = ['employee', 'admin', 'ceo'];

const EmployeeManagement = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
  });

  // Fetch employees and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesQuery = query(collection(db, 'employees'));
        const employeeSnapshot = await getDocs(employeesQuery);
        const employeeList = employeeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeeList);

        // Fetch clients
        const clientsQuery = query(collection(db, 'clients'));
        const clientSnapshot = await getDocs(clientsQuery);
        const clientList = clientSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientList);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load employees and clients');
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        password: '', // Don't show existing password
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedEmployee) {
        // Update existing employee
        await updateDoc(doc(db, 'employees', selectedEmployee.id), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new employee with authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Add employee to Firestore
        await setDoc(doc(db, 'employees', userCredential.user.uid), {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Refresh employee list
      const employeesQuery = query(collection(db, 'employees'));
      const employeeSnapshot = await getDocs(employeesQuery);
      const employeeList = employeeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeList);

      handleCloseDialog();
    } catch (error) {
      console.error('Error managing employee:', error);
      setError(error.message);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
        setEmployees(employees.filter(emp => emp.id !== employeeId));
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee');
      }
    }
  };

  const handleAssignClient = async (employeeId, clientId) => {
    try {
      const employeeRef = doc(db, 'employees', employeeId);
      await updateDoc(employeeRef, {
        assignedClients: arrayUnion(clientId),
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setEmployees(employees.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            assignedClients: [...(emp.assignedClients || []), clientId],
          };
        }
        return emp;
      }));
    } catch (error) {
      console.error('Error assigning client:', error);
      setError('Failed to assign client');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          startIcon={<PersonIcon />}
        >
          Add Employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Assigned Clients</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.role}
                    color={employee.role === 'ceo' ? 'error' : employee.role === 'admin' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {employee.assignedClients?.map(clientId => {
                    const client = clients.find(c => c.id === clientId);
                    return client ? (
                      <Chip
                        key={clientId}
                        label={`${client.firstName} ${client.lastName}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(employee)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="dense"
              label="First Name"
              type="text"
              fullWidth
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Last Name"
              type="text"
              fullWidth
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              required
              disabled={selectedEmployee}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {!selectedEmployee && (
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <TextField
              margin="dense"
              label="Role"
              select
              fullWidth
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedEmployee ? 'Update' : 'Add'} Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;
