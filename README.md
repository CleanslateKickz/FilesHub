# File Management Hub

A GitHub Pages-hosted file management system that automatically indexes and displays PDFs and HTML files with search and navigation features.

## Features

- **Automatic File Indexing**: Uses GitHub API to automatically discover and list files
- **Multi-folder Organization**: Separate sections for articles and notes
- **Advanced Search**: Global search across all files with filtering options
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Type Detection**: Automatic file type recognition with appropriate icons
- **Date Parsing**: Intelligent date extraction from filenames for chronological sorting
- **Real-time Updates**: Files appear automatically when added to the repository

## Setup Instructions

### 1. Create a New Repository

1. Create a new GitHub repository for your file management system
2. Clone this repository or download the files
3. Upload all files to your new repository

### 2. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to the "Pages" section
3. Select "Deploy from a branch" as the source
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

Your site will be available at `https://yourusername.github.io/yourrepository`

### 3. Configure Your Repository

The system automatically detects your repository information from the GitHub Pages URL. For manual configuration:

1. Edit `js/github-api.js`
2. Replace `'your-username'` with your GitHub username
3. Replace `'your-repository-name'` with your repository name

### 4. Organize Your Files

The repository structure is already created with the following folders:

```
/
├── index.html              # Main homepage
├── articles/               # News articles and reports  
│   ├── index.html         # Articles listing page
│   └── README.md          # Instructions for articles
├── notes/                 # Personal notes and documentation
│   ├── index.html         # Notes listing page
│   └── README.md          # Instructions for notes
├── css/
│   └── styles.css         # Application styles
├── js/
│   ├── main.js           # Main application logic
│   ├── github-api.js     # GitHub API integration
│   └── file-manager.js   # File processing logic
└── README.md             # This file
```

### 5. Add Your Content

To add files to your system:

1. **Articles & News**: Upload HTML, PDF, or Word files to the `/articles/` folder
2. **Notes & Documentation**: Upload files to the `/notes/` folder
3. **Naming Convention**: Use descriptive filenames with dates for automatic sorting:
   - `2025-01-24-article-title.pdf`
   - `meeting-2025-01-24-project-kickoff.html`
   - `research-ai-trends-2025.txt`

### 6. File Types Supported

- **HTML files** (.html, .htm) - Web documents with full formatting
- **PDF documents** (.pdf) - Portable document format
- **Word documents** (.doc, .docx) - Microsoft Word files
- **Text files** (.txt) - Plain text documents

## Usage

### Navigation
- **Homepage**: Overview with search and category navigation
- **Articles Section**: Browse news articles and reports with statistics
- **Notes Section**: Access personal notes and documentation
- **Global Search**: Find files across all categories with filtering options

### Search Features
- **Real-time Search**: Type to search across all files instantly
- **Content Filters**: Filter by file type (HTML, PDF, etc.)
- **Smart Sorting**: Automatic chronological sorting when dates are detected
- **Highlighted Results**: Search terms are highlighted in results

### File Management
- **Automatic Indexing**: Files are discovered automatically via GitHub API
- **Date Detection**: Intelligent date parsing from filenames
- **File Statistics**: Real-time counts and file type breakdowns
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Configuration Options

### GitHub API Settings

For private repositories or higher rate limits, you can configure authentication:

1. Create a GitHub Personal Access Token
2. Add it to your repository as an environment variable or modify `js/github-api.js`
3. The system will automatically use authenticated requests

### Customization

- **Styling**: Edit `css/styles.css` to customize appearance
- **File Types**: Modify `js/file-manager.js` to support additional file types
- **Repository Settings**: Update repository information in `js/github-api.js`

## Troubleshooting

### Files Not Showing Up
1. Ensure your repository is public (or configure authentication for private repos)
2. Check that files are in the correct folders (`/articles/` or `/notes/`)
3. Verify GitHub Pages is enabled and deployed
4. Wait a few minutes for GitHub API cache to refresh

### GitHub API Rate Limits
- Unauthenticated requests: 60 per hour
- Authenticated requests: 5,000 per hour
- The system includes intelligent caching to minimize API calls

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Internet connection required for GitHub API access

## Advanced Features

### Search Keyboard Shortcuts
- **Ctrl/Cmd + K**: Focus search input
- **Escape**: Close search results

### URL-based Repository Detection
The system automatically detects your repository from the GitHub Pages URL:
- `https://username.github.io/repository-name/` → `username/repository-name`

### Caching Strategy
- API responses are cached for 5 minutes
- Reduces API rate limit usage
- Improves performance for repeat visits

## Contributing

To contribute to this project:
1. Fork the repository
2. Make your improvements
3. Test thoroughly
4. Submit a pull request

## License

This project is open source and available under the MIT License.
