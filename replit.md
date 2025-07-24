# File Management Hub

## Overview

A GitHub Pages-hosted file management system that automatically indexes and displays PDFs and HTML files with search and navigation features. The system leverages the GitHub API to dynamically discover and list files from a repository, providing a user-friendly interface for organizing and accessing documents across different categories.

### Current Status (January 24, 2025)
- ✅ Complete file management system implemented
- ✅ Homepage with global search and category navigation  
- ✅ Articles and Notes sections with dedicated pages
- ✅ GitHub API integration with automatic repository detection
- ✅ Sample content created for demonstration
- ✅ Comprehensive README with setup instructions
- 🔧 Ready for deployment to any GitHub repository with GitHub Pages

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static Site**: Pure HTML/CSS/JavaScript application hosted on GitHub Pages
- **Single Page Application**: Multiple HTML pages with shared CSS and JavaScript modules
- **Responsive Design**: Mobile-first approach using CSS Grid and Flexbox
- **Component-based Structure**: Modular JavaScript classes for different functionalities

### Backend Architecture
- **Serverless**: No traditional backend - relies entirely on GitHub API
- **API Integration**: GitHub REST API v3 for repository content access
- **Client-side Processing**: All file processing and indexing happens in the browser
- **Caching Strategy**: In-memory caching to reduce API rate limiting

## Key Components

### File Management System (`js/file-manager.js`)
- **Purpose**: Core file discovery and processing logic
- **Responsibilities**: 
  - Fetches files from GitHub repository folders
  - Filters supported file types (HTML, PDF, DOC, TXT)
  - Extracts metadata like dates from filenames
  - Processes file information for display

### GitHub API Integration (`js/github-api.js`)
- **Purpose**: Handles all GitHub API interactions
- **Features**:
  - Automatic repository detection from GitHub Pages URL
  - Rate limiting protection with caching
  - Support for authenticated and unauthenticated requests
  - Repository information and commit history access

### Search and Navigation (`js/main.js`)
- **Purpose**: Provides global search functionality and navigation
- **Features**:
  - Debounced search to prevent excessive API calls
  - Multi-category file search across articles and notes
  - Filter by file type and sorting options
  - Real-time search results display

### User Interface
- **Category Organization**: Separate sections for "Articles & News" and "Notes & Documentation"
- **Search Interface**: Global search with filtering and sorting capabilities
- **File Statistics**: Real-time counts of files by type and category
- **Responsive Cards**: Grid-based layout adapting to different screen sizes

## Data Flow

1. **Page Load**: JavaScript detects repository information from GitHub Pages URL
2. **API Calls**: System fetches repository contents using GitHub API
3. **File Processing**: Client-side filtering and metadata extraction
4. **UI Updates**: Dynamic rendering of file lists and statistics
5. **Search Operations**: Real-time filtering and sorting of displayed files
6. **Caching**: API responses cached to minimize rate limit impact

## External Dependencies

### Third-party Services
- **GitHub API**: Primary data source for file listings and repository information
- **GitHub Pages**: Static site hosting platform
- **Font Awesome**: Icon library for UI elements

### Client-side Libraries
- **No Framework Dependencies**: Pure vanilla JavaScript implementation
- **Font Awesome CDN**: For consistent iconography
- **Modern Browser APIs**: Fetch API, localStorage for caching

### File Type Support
- **HTML/HTM**: Web documents with inline preview capability
- **PDF**: Portable document format files
- **DOC/DOCX**: Microsoft Word documents
- **TXT**: Plain text files

## Deployment Strategy

### GitHub Pages Deployment
- **Hosting**: Automatic deployment via GitHub Pages
- **Domain**: `username.github.io/repository-name` format
- **Build Process**: No build step required - direct static file serving
- **SSL**: Automatic HTTPS provided by GitHub Pages

### Repository Structure
```
/
├── index.html (main landing page)
├── articles/index.html (articles section)
├── notes/index.html (notes section)
├── css/styles.css (global styles)
├── js/
│   ├── main.js (main application logic)
│   ├── file-manager.js (file processing)
│   └── github-api.js (API integration)
└── README.md (setup instructions)
```

### Configuration Requirements
- **Repository Setup**: Must be public repository for unauthenticated API access
- **GitHub Pages**: Enabled from repository settings
- **File Organization**: Files stored in `articles/` and `notes/` folders
- **Optional Authentication**: GitHub token can be provided for higher rate limits

### Scalability Considerations
- **Rate Limiting**: GitHub API allows 60 requests/hour for unauthenticated users
- **Caching Strategy**: 5-minute cache timeout to balance freshness and performance
- **File Limits**: No hard limits, but performance may degrade with very large file counts
- **Search Performance**: Client-side search suitable for moderate file collections