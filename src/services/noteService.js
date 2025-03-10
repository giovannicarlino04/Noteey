const { ipcRenderer } = window.require('electron');

class NoteService {
  constructor() {
    // Use ipcRenderer to communicate with main process for storage operations
  }

  async getAllNotes() {
    return ipcRenderer.invoke('get-notes', []);
  }

  async getNoteById(id) {
    const notes = await this.getAllNotes();
    return notes.find(note => note.id === id);
  }

  async saveNote(note) {
    const notes = await this.getAllNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    await ipcRenderer.invoke('save-notes', notes);
    return note;
  }

  async deleteNote(id) {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    await ipcRenderer.invoke('save-notes', filteredNotes);
  }

  async searchNotes(query) {
    const notes = await this.getAllNotes();
    const searchQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery) ||
      note.content.toLowerCase().includes(searchQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  async getNotesByTag(tag) {
    const notes = await this.getAllNotes();
    return notes.filter(note => note.tags.includes(tag));
  }

  async getAllTags() {
    const notes = await this.getAllNotes();
    const tags = new Set();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }
}

export const noteService = new NoteService(); 