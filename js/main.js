document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main page functionality
    const fileManager = new FileManager();
    
    // Initialize global search
    initializeGlobalSearch();
    
    // Load category counts and recent files
    loadCategoryCounts();
    loadRecentFiles();
    
    // Initialize project discovery
    loadProjects();
    
    // Initialize navigation enhancements
    initializeNavigation();
    
    // Initialize project modal
    initializeProjectModal();
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

async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    try {
        // Get all HTML files from the repository root and subdirectories
        const projects = await discoverProjects();
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No projects found</h3>
                    <p>Upload HTML files to automatically display them as projects.</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-image">
                    ${project.screenshot ? 
                        `<img src="${project.screenshot}" alt="${project.name}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-code\\"></i>'">` :
                        '<i class="fas fa-code"></i>'
                    }
                </div>
                <div class="project-content">
                    <div class="project-title">${project.name}</div>
                    <div class="project-description">${project.description}</div>
                    <a href="${project.url}" target="_blank" class="project-link">
                        Open Project <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <div class="project-type-badge">Project</div>
            </div>
        `).join('');
        
        // Load custom projects from localStorage
        loadCustomProjects();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load projects.</div>';
    }
}

async function discoverProjects() {
    const githubAPI = window.githubAPI;
    const projects = [];
    
    try {
        // Get repository contents
        const contents = await githubAPI.getRepoContents();
        
        // Find all HTML files (excluding specific directories)
        for (const item of contents) {
            if (item.type === 'file' && 
                item.name.endsWith('.html') && 
                item.name !== 'index.html' &&
                !item.path.includes('/index.html')) {
                
                const projectName = item.name.replace('.html', '').replace(/[-_]/g, ' ');
                const screenshotPath = await findScreenshot(item.name);
                
                projects.push({
                    name: projectName.charAt(0).toUpperCase() + projectName.slice(1),
                    description: `Interactive ${projectName} application`,
                    url: `https://${githubAPI.owner}.github.io/${githubAPI.repo}/${item.name}`,
                    screenshot: screenshotPath,
                    path: item.path
                });
            }
        }
        
        // Also check subdirectories for HTML files
        for (const item of contents) {
            if (item.type === 'dir' && !['articles', 'notes', 'js', 'css', '.git'].includes(item.name)) {
                const subProjects = await discoverProjectsInDirectory(item.path);
                projects.push(...subProjects);
            }
        }
        
    } catch (error) {
        console.error('Error discovering projects:', error);
    }
    
    return projects;
}

async function discoverProjectsInDirectory(dirPath) {
    const githubAPI = window.githubAPI;
    const projects = [];
    
    try {
        const contents = await githubAPI.getRepoContents(dirPath);
        
        for (const item of contents) {
            if (item.type === 'file' && 
                item.name.endsWith('.html') && 
                item.name !== 'index.html') {
                
                const projectName = item.name.replace('.html', '').replace(/[-_]/g, ' ');
                const screenshotPath = await findScreenshot(item.name, dirPath);
                
                projects.push({
                    name: `${dirPath}/${projectName}`.replace(/[-_]/g, ' '),
                    description: `${projectName} application in ${dirPath}`,
                    url: `https://${githubAPI.owner}.github.io/${githubAPI.repo}/${item.path}`,
                    screenshot: screenshotPath,
                    path: item.path
                });
            }
        }
    } catch (error) {
        console.error(`Error discovering projects in ${dirPath}:`, error);
    }
    
    return projects;
}

async function findScreenshot(htmlFileName, directory = '') {
    const githubAPI = window.githubAPI;
    const baseName = htmlFileName.replace('.html', '');
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    try {
        // Check in images folder first
        const imageDir = directory ? `${directory}/images` : 'images';
        try {
            const imageContents = await githubAPI.getRepoContents(imageDir);
            
            for (const ext of imageExtensions) {
                const imageName = `${baseName}.${ext}`;
                const imageFile = imageContents.find(file => file.name === imageName);
                if (imageFile) {
                    return `https://${githubAPI.owner}.github.io/${githubAPI.repo}/${imageFile.path}`;
                }
            }
        } catch (e) {
            // Images folder doesn't exist, continue
        }
        
        // Check in same directory as HTML file
        const dirContents = await githubAPI.getRepoContents(directory);
        for (const ext of imageExtensions) {
            const imageName = `${baseName}.${ext}`;
            const imageFile = dirContents.find(file => file.name === imageName);
            if (imageFile) {
                return `https://${githubAPI.owner}.github.io/${githubAPI.repo}/${imageFile.path}`;
            }
        }
        
    } catch (error) {
        console.error('Error finding screenshot:', error);
    }
    
    return null;
}

function loadCustomProjects() {
    const customProjects = JSON.parse(localStorage.getItem('customProjects') || '[]');
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (customProjects.length > 0 && projectsGrid) {
        const customProjectsHTML = customProjects.map(project => `
            <div class="project-card">
                <div class="project-image">
                    ${project.image ? 
                        `<img src="${project.image}" alt="${project.title}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-plus\\"></i>'">` :
                        '<i class="fas fa-plus"></i>'
                    }
                </div>
                <div class="project-content">
                    <div class="project-title">${project.title}</div>
                    <div class="project-description">${project.description}</div>
                    <a href="${project.url}" target="_blank" class="project-link">
                        Open Project <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
                <div class="project-type-badge">Custom</div>
            </div>
        `).join('');
        
        projectsGrid.insertAdjacentHTML('beforeend', customProjectsHTML);
    }
}

function initializeProjectModal() {
    const addBtn = document.getElementById('addProjectBtn');
    const modal = document.getElementById('addProjectModal');
    const cancelBtns = document.querySelectorAll('#cancelModal, #cancelModal2');
    const projectForm = document.getElementById('projectForm');
    
    if (!addBtn || !modal) return;
    
    // Open modal
    addBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // Close modal
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(projectForm);
            const projectData = Object.fromEntries(formData.entries());
            
            // Save to localStorage
            const customProjects = JSON.parse(localStorage.getItem('customProjects') || '[]');
            customProjects.unshift(projectData);
            localStorage.setItem('customProjects', JSON.stringify(customProjects));
            
            // Add to grid
            const projectsGrid = document.getElementById('projectsGrid');
            const newProjectHTML = `
                <div class="project-card">
                    <div class="project-image">
                        ${projectData.image ? 
                            `<img src="${projectData.image}" alt="${projectData.title}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-plus\\"></i>'">` :
                            '<i class="fas fa-plus"></i>'
                        }
                    </div>
                    <div class="project-content">
                        <div class="project-title">${projectData.title}</div>
                        <div class="project-description">${projectData.description}</div>
                        <a href="${projectData.url}" target="_blank" class="project-link">
                            Open Project <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                    <div class="project-type-badge">Custom</div>
                </div>
            `;
            
            if (projectsGrid.innerHTML.includes('empty-state')) {
                projectsGrid.innerHTML = newProjectHTML;
            } else {
                projectsGrid.insertAdjacentHTML('afterbegin', newProjectHTML);
            }
            
            // Reset form and close modal
            projectForm.reset();
            modal.style.display = 'none';
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimations);
