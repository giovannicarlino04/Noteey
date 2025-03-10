import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Button,
  Alert
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
const { ipcRenderer } = window.require('electron');

function Settings() {
  const { darkMode, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [autoSave, setAutoSave] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    // Carica le impostazioni salvate
    const settings = ipcRenderer.sendSync('get-settings');
    if (settings) {
      setFontSize(settings.fontSize || 16);
      setAutoSave(settings.autoSave !== false);
      setSyncInterval(settings.syncInterval || 5);
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      fontSize,
      autoSave,
      syncInterval,
      darkMode
    };

    ipcRenderer.send('save-settings', settings);
    setNotification({
      type: 'success',
      message: 'Impostazioni salvate con successo!'
    });
  };

  const handleResetSettings = () => {
    setFontSize(16);
    setAutoSave(true);
    setSyncInterval(5);
    setNotification({
      type: 'info',
      message: 'Impostazioni reimpostate ai valori predefiniti'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Impostazioni
        </Typography>

        {notification.message && (
          <Alert
            severity={notification.type}
            sx={{ mb: 2 }}
            onClose={() => setNotification({ type: '', message: '' })}
          >
            {notification.message}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label="Tema Scuro"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Aspetto
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Dimensione del Font
          </Typography>
          <Slider
            value={fontSize}
            onChange={(e, newValue) => setFontSize(newValue)}
            min={12}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Comportamento
        </Typography>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                color="primary"
              />
            }
            label="Salvataggio Automatico"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Intervallo di Sincronizzazione (minuti)
          </Typography>
          <Slider
            value={syncInterval}
            onChange={(e, newValue) => setSyncInterval(newValue)}
            min={1}
            max={30}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            Salva Impostazioni
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSettings}
          >
            Reimposta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Settings; 