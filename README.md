# 📝 Notes App - Full Stack Application

A modern, responsive notes-taking application with powerful search functionality. Built with Python Flask backend and vanilla JavaScript frontend.

## Features

✨ **Key Features:**
- ✍️ Create, read, update, and delete notes (CRUD operations)
- 🔍 Search notes by keywords (searches both title and content)
- 💾 Persistent storage using SQLite database
- 📱 Fully responsive design (works on desktop, tablet, mobile)
- ⚡ Real-time search with instant results
- 🎨 Modern, clean UI with smooth animations
- 🌙 Light theme with professional color scheme
- ⏰ Automatic timestamps (created & updated dates)

## Project Structure

```
Notes_app_search/
├── app.py                      # Flask backend (REST API)
├── requirements.txt            # Python dependencies
├── notes.db                    # SQLite database (auto-created)
├── README.md                   # This file
├── templates/
│   └── index.html             # HTML template
└── static/
    ├── css/
    │   └── style.css          # Stylesheet
    └── js/
        └── script.js          # Frontend JavaScript
```

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Run the Application

```bash
python app.py
```

The application will start on: **http://localhost:5000**

### Step 3: Open in Browser

Navigate to `http://localhost:5000` in your web browser.

## Deployment on Render 🚀

### Prerequisites
- A GitHub repository with your code
- A Render account (free tier available at https://render.com)

### Quick Deployment Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**
   - **Name**: `notes-app` (or any name)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - Click "Create Web Service"

4. **Access Your App**
   - Your app will be live at: `https://your-service-name.onrender.com`
   - Render will auto-deploy on every push to GitHub

### Important Notes
- SQLite database resets on redeploy (for persistency, migrate to PostgreSQL)
- Free tier has 15-minute inactivity timeout
- Render provides 750 free hours/month on free tier

## Usage

### Creating a Note
1. Fill in the **Title** field in the left sidebar
2. Write your content in the **Content** field
3. Click **"✓ Create Note"** button
4. Your note will appear in the main area

### Searching Notes
1. Use the search bar at the top of the main area
2. Type any keyword to search
3. Results will filter instantly from both title and content
4. Click **"✕"** to clear the search

### Editing a Note
1. Click the **✏️ (edit)** icon on any note card
2. Modify the title and content in the modal dialog
3. Click **"✓ Save Changes"** to save
4. The updated timestamp will be shown

### Deleting a Note
1. Click the **🗑️ (delete)** icon on any note card
2. Confirm the deletion when prompted
3. The note will be permanently removed

## API Endpoints

### Get All Notes / Search Notes
```
GET /api/notes?search=<keyword>
```
- Returns all notes if no search parameter
- Returns filtered notes matching the keyword

### Create a Note
```
POST /api/notes
Content-Type: application/json

{
  "title": "Note Title",
  "content": "Note Content"
}
```

### Get a Specific Note
```
GET /api/notes/<note_id>
```

### Update a Note
```
PUT /api/notes/<note_id>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated Content"
}
```

### Delete a Note
```
DELETE /api/notes/<note_id>
```

## Database Schema

### Notes Table
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Technologies Used

### Backend
- **Flask** - Web framework for Python
- **SQLite** - Lightweight database
- **Python** - Server-side language

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern features (Grid, Flexbox)
- **Vanilla JavaScript** - Frontend logic (no dependencies)

## Features in Detail

### 🔍 Advanced Search
- Searches both title and content
- Case-insensitive matching
- Real-time filtering
- Shows count of matching notes

### 📅 Date Management
- Automatic timestamps when creating notes
- Updates timestamp when modifying notes
- Smart date formatting:
  - "Today at HH:MM" for today's notes
  - "Yesterday at HH:MM" for yesterday's notes
  - "Month Day, Year" for older notes

### 🎨 Responsive Design
- Mobile-first approach
- Breakpoints for all screen sizes:
  - **Desktop**: 1200px+ (full layout)
  - **Tablet**: 768-1199px (adjusted layout)
  - **Mobile**: < 768px (single column)

### ⚠️ User Experience
- Confirmation dialog before deletion
- Success/error notifications
- Form validation
- Keyboard shortcuts (Esc to close modal)
- Visual feedback on all interactions

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify `app.py`:
```python
app.run(debug=True, host='localhost', port=8000)  # Change to port 8000
```

### Database Issues
To reset the database, delete `notes.db` file and restart the app.

### Notes Not Appearing
- Clear browser cache (Ctrl+Shift+Delete)
- Reload the page (Ctrl+R or F5)
- Check browser console for errors (F12)

## Future Enhancements

Potential features for future versions:
- [ ] User authentication and login
- [ ] Categories/tags for notes
- [ ] Note sharing functionality
- [ ] Export notes (PDF, TXT)
- [ ] Dark mode toggle
- [ ] Rich text editor
- [ ] Cloud backup
- [ ] Mobile app version

## License

This project is open source and available for personal and educational use.

## Support

For issues or suggestions, please check the README or review the code comments.

---

**Enjoy organizing your thoughts! 📝✨**
