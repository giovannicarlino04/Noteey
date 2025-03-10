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
  Typography
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Tag as TagIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { noteService } from '../services/noteService';
import { v4 as uuidv4 } from 'uuid';

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        updatedAt: new Date()
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

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag && !note.tags.includes(newTag)) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
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

        <Box sx={{ mb: 2 }}>
          <form onSubmit={handleAddTag}>
            <TextField
              size="small"
              placeholder="Aggiungi tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon />
                  </InputAdornment>
                )
              }}
            />
          </form>
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
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
    </Box>
  );
}

export default NoteEditor; 