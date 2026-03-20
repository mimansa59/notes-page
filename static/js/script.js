// Notes App - JavaScript Functionality

class NotesApp {
    constructor() {
        this.notes = [];
        this.filteredNotes = [];
        this.searchTerm = '';
        this.currentNoteId = null;
        
        this.initElements();
        this.attachEventListeners();
        this.loadNotes();
    }

    initElements() {
        // Forms
        this.createNoteForm = document.getElementById('create-note-form');
        this.editNoteForm = document.getElementById('edit-note-form');
        
        // Create Note Button
        this.createBtn = document.getElementById('create-btn');
        
        // Inputs for create
        this.titleInput = document.getElementById('note-title');
        this.contentInput = document.getElementById('note-content');
        
        // Inputs for edit
        this.editTitleInput = document.getElementById('edit-note-title');
        this.editContentInput = document.getElementById('edit-note-content');
        this.editNoteIdInput = document.getElementById('edit-note-id');
        
        // Search
        this.searchInput = document.getElementById('search-input');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.notesCount = document.getElementById('notes-count');
        
        // Display
        this.notesList = document.getElementById('notes-list');
        this.noteViewer = document.getElementById('note-viewer');
        
        // Modal
        this.editModal = document.getElementById('edit-modal');
        this.modalClose = document.getElementById('modal-close');
        this.modalCancel = document.getElementById('modal-cancel');
    }

    attachEventListeners() {
        // Create note button
        this.createBtn.addEventListener('click', () => this.openCreateModal());
        
        // Create note form
        this.createNoteForm.addEventListener('submit', (e) => this.handleCreateNote(e));
        
        // Edit note form
        this.editNoteForm.addEventListener('submit', (e) => this.handleEditNote(e));
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        
        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalCancel.addEventListener('click', () => this.closeModal());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });
        
        // Keyboard shortcut for modal (Escape key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    async loadNotes() {
        try {
            const response = await fetch(`/api/notes?search=${encodeURIComponent(this.searchTerm)}`);
            if (!response.ok) throw new Error('Failed to load notes');
            
            this.filteredNotes = await response.json();
            this.notes = this.filteredNotes;
            this.renderNotesList();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Failed to load notes');
        }
    }

    async handleSearch(e) {
        this.searchTerm = e.target.value.trim();
        
        try {
            const response = await fetch(`/api/notes?search=${encodeURIComponent(this.searchTerm)}`);
            if (!response.ok) throw new Error('Failed to search notes');
            
            this.filteredNotes = await response.json();
            this.renderNotesList();
        } catch (error) {
            console.error('Error searching notes:', error);
            this.showError('Failed to search notes');
        }
    }

    clearSearch() {
        this.searchTerm = '';
        this.searchInput.value = '';
        this.loadNotes();
    }

    openCreateModal() {
        this.titleInput.value = '';
        this.contentInput.value = '';
        this.editModal.classList.add('active');
        this.createNoteForm.style.display = 'block';
        this.editNoteForm.style.display = 'none';
        this.editModal.querySelector('.modal-header h2').textContent = 'Create New Note';
        this.titleInput.focus();
    }

    openEditModal(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.editNoteIdInput.value = note.id;
        this.editTitleInput.value = note.title;
        this.editContentInput.value = note.content;
        this.editModal.classList.add('active');
        this.createNoteForm.style.display = 'none';
        this.editNoteForm.style.display = 'block';
        this.editModal.querySelector('.modal-header h2').textContent = 'Edit Note';
        this.editTitleInput.focus();
    }

    closeModal() {
        this.editModal.classList.remove('active');
        this.createNoteForm.reset();
        this.editNoteForm.reset();
    }

    async handleCreateNote(e) {
        e.preventDefault();
        
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        
        if (!title || !content) {
            this.showError('Please fill in both title and content');
            return;
        }
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create note');
            }
            
            const newNote = await response.json();
            this.showSuccess('Note created successfully! ✓');
            this.closeModal();
            this.loadNotes();
        } catch (error) {
            console.error('Error creating note:', error);
            this.showError(error.message || 'Failed to create note');
        }
    }

    async handleEditNote(e) {
        e.preventDefault();
        
        const noteId = parseInt(this.editNoteIdInput.value);
        const title = this.editTitleInput.value.trim();
        const content = this.editContentInput.value.trim();
        
        if (!title || !content) {
            this.showError('Please fill in both title and content');
            return;
        }
        
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update note');
            }
            
            const updatedNote = await response.json();
            
            // Update in local array
            const index = this.notes.findIndex(n => n.id === noteId);
            if (index !== -1) {
                this.notes[index] = updatedNote;
            }
            
            this.showSuccess('Note updated successfully! ✓');
            this.closeModal();
            this.loadNotes();
            this.displayNote(noteId);
        } catch (error) {
            console.error('Error updating note:', error);
            this.showError(error.message || 'Failed to update note');
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete note');
            }
            
            this.notes = this.notes.filter(n => n.id !== noteId);
            if (this.currentNoteId === noteId) {
                this.currentNoteId = null;
                this.displayEmptyState();
            }
            this.showSuccess('Note deleted successfully! ✓');
            this.loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError(error.message || 'Failed to delete note');
        }
    }

    displayNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNoteId = noteId;
        
        // Update active state in list
        document.querySelectorAll('.note-list-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.id) === noteId) {
                item.classList.add('active');
            }
        });
        
        const noteViewHTML = `
            <div class="note-detail">
                <div class="note-detail-header">
                    <h2 class="note-detail-title">${this.escapeHtml(note.title)}</h2>
                    <div class="note-detail-meta">
                        <span>Created: ${this.formatDate(note.created_at)}</span>
                        ${note.updated_at !== note.created_at ? `
                            <span>Updated: ${this.formatDate(note.updated_at)}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="note-detail-content-area">
                    <div class="note-detail-content">${this.escapeHtml(note.content)}</div>
                </div>
                <div class="note-detail-actions">
                    <button class="btn btn-primary" data-action="edit" data-id="${note.id}">✏️ Edit</button>
                    <button class="btn btn-danger" data-action="delete" data-id="${note.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
        
        this.noteViewer.innerHTML = noteViewHTML;
        
        // Attach action buttons
        this.noteViewer.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            this.openEditModal(id);
        });
        
        this.noteViewer.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            this.deleteNote(id);
        });
    }

    displayEmptyState() {
        this.currentNoteId = null;
        this.noteViewer.innerHTML = `
            <div class="note-empty-state">
                <p>📖 Your note will open here</p>
            </div>
        `;
    }

    renderNotesList() {
        if (this.filteredNotes.length === 0) {
            this.notesList.innerHTML = `
                <div class="empty-state-list">
                    <p>${this.searchTerm ? '🔍 No notes found' : '📭 No notes yet'}</p>
                </div>
            `;
            this.notesCount.textContent = '0 notes';
            return;
        }
        
        this.notesList.innerHTML = this.filteredNotes.map(note => `
            <div class="note-list-item ${this.currentNoteId === note.id ? 'active' : ''}" data-id="${note.id}">
                <div class="note-list-title">${this.escapeHtml(note.title)}</div>
                <div class="note-list-preview">${this.escapeHtml(note.content.substring(0, 50))}${note.content.length > 50 ? '...' : ''}</div>
                <div class="note-list-date">${this.formatDateShort(note.updated_at)}</div>
            </div>
        `).join('');
        
        // Attach click handlers
        document.querySelectorAll('.note-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = parseInt(item.dataset.id);
                this.displayNote(noteId);
            });
        });
        
        // Update notes count
        const noteWord = this.filteredNotes.length === 1 ? 'note' : 'notes';
        this.notesCount.textContent = `${this.filteredNotes.length} ${noteWord}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    formatDateShort(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.success-message');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `success-message`;
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        }
        
        document.body.insertBefore(notification, document.body.firstChild);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new NotesApp();
    
    // Make it globally available for debugging
    window.notesApp = app;
});
