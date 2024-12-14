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
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const ClientManagement = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch clients and their documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsQuery = query(collection(db, 'users'));
        const clientSnapshot = await getDocs(clientsQuery);
        const clientList = clientSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.role === 'client'); // Only get clients

        // Get documents for each client
        const clientsWithDocs = await Promise.all(
          clientList.map(async (client) => {
            const docsQuery = query(collection(db, 'documents'));
            const docsSnapshot = await getDocs(docsQuery);
            const clientDocs = docsSnapshot.docs
              .filter(doc => doc.data().userId === client.id)
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
            return {
              ...client,
              documents: clientDocs
            };
          })
        );

        setClients(clientsWithDocs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDocuments = async (client) => {
    setSelectedClient(client);
    setDocuments(client.documents || []);
    setOpenDialog(true);
  };

  const handleDownload = async (document) => {
    try {
      const fileRef = ref(storage, `documents/${document.fileName}`);
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    setDocuments([]);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Client Management
        </Typography>
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
              <TableCell>Documents</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={<FolderIcon />}
                    label={`${client.documents?.length || 0} documents`}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDocuments(client)}
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Documents for {selectedClient?.firstName} {selectedClient?.lastName}
        </DialogTitle>
        <DialogContent>
          {documents.length === 0 ? (
            <Typography color="textSecondary">No documents uploaded yet.</Typography>
          ) : (
            <List>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => handleDownload(doc)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <DocumentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.fileName}
                    secondary={new Date(doc.uploadDate).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ClientManagement;
