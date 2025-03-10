import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  InputAdornment,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Tag as TagIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { noteService } from '../services/noteService';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState({
    id: id === 'new' ? uuidv4() : '',
    title: '',
    content: '',
    tags: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    try {
      const noteData = await noteService.getNoteById(id);
      if (noteData) {
        setNote(noteData);
      }
    } catch (error) {
      console.error('Errore nel caricamento della nota:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const noteData = {
        ...note,
        userId: user.id,
        updatedAt: new Date().toISOString()
      };

      await noteService.saveNote(noteData);
      if (id === 'new') {
        navigate(`/note/${note.id}`);
      }
    } catch (error) {
      console.error('Errore nel salvataggio della nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    try {
      await noteService.deleteNote(id);
      navigate('/');
    } catch (error) {
      console.error('Errore nell\'eliminazione della nota:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag && !note.tags.includes(newTag)) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
    setIsTagDialogOpen(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNote(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            name: file.name,
            data: e.target.result,
            type: file.type
          }]
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Titolo"
            value={note.title}
            onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mr: 2 }}
          />
          <Tooltip title="Salva">
            <IconButton onClick={handleSave} disabled={isSaving}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {id !== 'new' && (
            <Tooltip title="Elimina">
              <IconButton onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          variant="outlined"
          placeholder="Inizia a scrivere..."
          value={note.content}
          onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            Tag:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
            <IconButton
              size="small"
              onClick={() => setIsTagDialogOpen(true)}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box>
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <IconButton component="span">
              <AttachFileIcon />
            </IconButton>
          </label>
          {note.attachments.map((attachment, index) => (
            <Chip
              key={index}
              label={attachment.name}
              onClick={() => {
                const link = document.createElement('a');
                link.href = attachment.data;
                link.download = attachment.name;
                link.click();
              }}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      </Paper>

      <Dialog open={isTagDialogOpen} onClose={() => setIsTagDialogOpen(false)}>
        <DialogTitle>Aggiungi Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nuovo Tag"
            fullWidth
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTagDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleAddTag} color="primary">
            Aggiungi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NoteEditor; 