document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main page functionality
    const fileManager = new FileManager();
    
    // Initialize global search
    initializeGlobalSearch();
    
    // Load category counts and recent files
    loadCategoryCounts();
    loadRecentFiles();
    
    // Initialize navigation enhancements
    initializeNavigation();
});

function initializeGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const contentTypeFilter = document.getElementById('contentTypeFilter');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const searchResultsList = document.getElementById('searchResultsList');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResultsSection.style.display = 'none';
            return;
        }
        
        // Debounce search to avoid too many API calls
        searchTimeout = setTimeout(() => {
            performGlobalSearch(query);
        }, 300);
    });
    
    if (contentTypeFilter) {
        contentTypeFilter.addEventListener('change', function() {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                performGlobalSearch(query);
            }
        });
    }
    
    async function performGlobalSearch(query) {
        const fileManager = new FileManager();
        const contentType = contentTypeFilter ? contentTypeFilter.value : 'all';
        
        searchResultsList.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        searchResultsSection.style.display = 'block';
        
        try {
            const results = await fileManager.searchAllFiles(query, contentType);
            displaySearchResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            searchResultsList.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Search failed. Please try again.</div>';
        }
    }
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResultsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>No files matching "${query}" were found.</p>
                </div>
            `;
            return;
        }
        
        searchResultsList.innerHTML = results.map(file => {
            const highlightedName = highlightSearchTerm(file.name, query);
            return `
                <a href="${file.url}" target="_blank" class="file-item">
                    <i class="fas ${getFileIcon(file.name)} file-icon ${file.type}"></i>
                    <div class="file-details">
                        <div class="file-name">${highlightedName}</div>
                        <div class="file-meta">
                            <span class="file-type"><i class="fas fa-tag"></i> ${file.type.toUpperCase()}</span>
                            <span class="file-date"><i class="fas fa-calendar"></i> ${formatDate(file.date)}</span>
                            <span class="file-size"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</span>
                            <span class="file-location"><i class="fas fa-folder"></i> ${file.folder}</span>
                        </div>
                    </div>
                    <i class="fas fa-external-link-alt external-link-icon"></i>
                </a>
            `;
        }).join('');
    }
    
    function highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

async function loadCategoryCounts() {
    const fileManager = new FileManager();
    
    try {
        const [articlesCount, notesCount] = await Promise.all([
            fileManager.getFileCount('articles'),
            fileManager.getFileCount('notes')
        ]);
        
        const articlesCountEl = document.getElementById('articlesCount');
        const notesCountEl = document.getElementById('notesCount');
        
        if (articlesCountEl) {
            articlesCountEl.textContent = `${articlesCount} files`;
        }
        
        if (notesCountEl) {
            notesCountEl.textContent = `${notesCount} files`;
        }
        
    } catch (error) {
        console.error('Error loading category counts:', error);
        // Show fallback text
        document.querySelectorAll('.file-count').forEach(el => {
            el.textContent = 'View files';
        });
    }
}

async function loadRecentFiles() {
    const recentFilesList = document.getElementById('recentFilesList');
    if (!recentFilesList) return;
    
    const fileManager = new FileManager();
    
    try {
        const recentFiles = await fileManager.getRecentFiles(10);
        
        if (recentFiles.length === 0) {
            recentFilesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file"></i>
                    <h3>No files found</h3>
                    <p>Upload some files to the articles or notes folders to get started.</p>
                </div>
            `;
            return;
        }
        
        recentFilesList.innerHTML = recentFiles.map(file => `
            <a href="${file.url}" target="_blank" class="file-item">
                <i class="fas ${getFileIcon(file.name)} file-icon ${file.type}"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-type"><i class="fas fa-tag"></i> ${file.type.toUpperCase()}</span>
                        <span class="file-date"><i class="fas fa-calendar"></i> ${formatDate(file.date)}</span>
                        <span class="file-location"><i class="fas fa-folder"></i> ${file.folder}</span>
                    </div>
                </div>
                <i class="fas fa-external-link-alt external-link-icon"></i>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent files:', error);
        recentFilesList.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load recent files. Please check your connection and try again.</div>';
    }
}

function initializeNavigation() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Escape key to close search results
        if (e.key === 'Escape') {
            const searchResultsSection = document.getElementById('searchResultsSection');
            if (searchResultsSection && searchResultsSection.style.display !== 'none') {
                searchResultsSection.style.display = 'none';
                document.getElementById('globalSearch').blur();
            }
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// Utility functions
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'fa-file-pdf';
        case 'html':
        case 'htm':
            return 'fa-file-code';
        case 'doc':
        case 'docx':
            return 'fa-file-word';
        case 'txt':
            return 'fa-file-alt';
        default:
            return 'fa-file';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Add animation classes to elements as they come into view
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.category-card, .file-item').forEach(el => {
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimations);
