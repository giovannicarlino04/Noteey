import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  TextField,
  Box,
  Chip,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { noteService } from '../services/noteService';

function NoteList() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
    loadTags();
  }, []);

  const loadNotes = async () => {
    try {
      const notesData = await noteService.getAllNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Errore nel caricamento delle note:', error);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await noteService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Errore nel caricamento dei tag:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query && !selectedTag) {
      loadNotes();
      return;
    }

    try {
      const searchResults = await noteService.searchNotes(query);
      setNotes(searchResults);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
    }
  };

  const handleTagClick = async (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    if (selectedTag === tag) {
      loadNotes();
      return;
    }

    try {
      const notesByTag = await noteService.getNotesByTag(tag);
      setNotes(notesByTag);
    } catch (error) {
      console.error('Errore nel filtraggio per tag:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Cerca note..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tag:
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color={selectedTag === tag ? 'primary' : 'default'}
              onClick={() => handleTagClick(tag)}
            />
          ))}
        </Box>
      </Box>

      <List sx={{ overflow: 'auto', height: 'calc(100vh - 180px)' }}>
        {notes.map((note) => (
          <ListItem key={note.id} disablePadding>
            <ListItemButton
              onClick={() => navigate(`/note/${note.id}`)}
              selected={window.location.pathname === `/note/${note.id}`}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" noWrap>
                    {note.title || 'Senza titolo'}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {note.content.substring(0, 100)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(note.updatedAt)}
                    </Typography>
                    {note.tags && note.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {note.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default NoteList; 