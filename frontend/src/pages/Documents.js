import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Documents = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadData, setUploadData] = useState({
    filename: '',
    document_type: '',
    tax_year: new Date().getFullYear(),
    notes: ''
  });

  const documentTypes = [
    'W-2',
    '1099-MISC',
    '1099-NEC',
    '1098-T',
    '1095-A',
    'Other'
  ];

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const fetchDocuments = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadData(prev => ({
        ...prev,
        filename: file.name
      }));
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!uploadData.document_type) {
      setError('Please select a document type');
      return;
    }

    setLoading(true);
    setError('');
    let uniqueFilename = '';

    try {
      // Create metadata including content type
      const metadata = {
        contentType: selectedFile.type,
        customMetadata: {
          'document_type': uploadData.document_type,
          'tax_year': uploadData.tax_year.toString(),
          'notes': uploadData.notes
        }
      };

      // Create a unique filename
      const timestamp = new Date().getTime();
      uniqueFilename = `${currentUser.uid}/${timestamp}_${selectedFile.name}`;
      
      // Initialize storage
      const storage = getStorage();
      
      // Create storage reference with proper path
      const storageRef = ref(storage, uniqueFilename);
      
      // Upload file to Firebase Storage
      console.log('Starting upload...');
      try {
        const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
        console.log('Upload completed:', snapshot);
      } catch (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get the download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Got download URL:', downloadURL);

      // Save document metadata to Firestore
      console.log('Saving to Firestore...');
      await addDoc(collection(db, 'documents'), {
        userId: currentUser.uid,
        filename: selectedFile.name,
        document_type: uploadData.document_type,
        tax_year: uploadData.tax_year,
        notes: uploadData.notes,
        upload_date: new Date().toISOString(),
        status: 'Pending Review',
        storageRef: uniqueFilename,
        downloadURL: downloadURL
      });
      console.log('Saved to Firestore');

      setOpenUpload(false);
      setSelectedFile(null);
      setUploadData({
        filename: '',
        document_type: '',
        tax_year: new Date().getFullYear(),
        notes: ''
      });
      
      // Refresh the documents list
      await fetchDocuments();
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document. Please try again.');
      
      // If we failed after uploading the file but before saving to Firestore,
      // try to clean up the uploaded file
      if (uniqueFilename && error.message.includes('download URL')) {
        try {
          const storage = getStorage();
          await deleteObject(ref(storage, uniqueFilename));
        } catch (deleteError) {
          console.error('Error cleaning up file:', deleteError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDelete = async (document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete from Firebase Storage
      const storage = getStorage();
      await deleteObject(ref(storage, document.storageRef));

      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', document.id));

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center" mb={3}>
            <Grid item>
              <Typography variant="h5">Documents</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setOpenUpload(true)}
              >
                Upload Document
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Tax Year</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{doc.filename}</TableCell>
                    <TableCell>{doc.tax_year}</TableCell>
                    <TableCell>
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell>
                      <Tooltip title="Download">
                        <IconButton
                          onClick={() => window.open(doc.downloadURL, '_blank')}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDocumentDelete(doc)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      </Grid>

      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Document Type"
                value={uploadData.document_type}
                onChange={(e) => setUploadData(prev => ({
                  ...prev,
                  document_type: e.target.value
                }))}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tax Year"
                type="number"
                value={uploadData.tax_year}
                onChange={(e) => setUploadData(prev => ({
                  ...prev,
                  tax_year: e.target.value
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={uploadData.notes}
                onChange={(e) => setUploadData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={loading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Documents;
