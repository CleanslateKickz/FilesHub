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
            notesCountel.textContent = `${notesCount} files`;
        }

        // Load category images
        await loadCategoryImages();

    } catch (error) {
        console.error('Error loading category counts:', error);
        // Show fallback text
        document.querySelectorAll('.file-count').forEach(el => {
            el.textContent = 'View files';
        });
    }
}

async function loadCategoryImages() {
    try {
        // Get images from the images folder
        const imagesContents = await window.githubAPI.getRepoContents('images');
        if (!Array.isArray(imagesContents)) return;

        // Find representative images for articles and notes
        const articleImages = imagesContents.filter(file => 
            file.name.toLowerCase().includes('retail') || 
            file.name.toLowerCase().includes('news') ||
            file.name.toLowerCase().includes('article')
        );

        const noteImages = imagesContents.filter(file => 
            file.name.toLowerCase().includes('washington') || 
            file.name.toLowerCase().includes('oregon') ||
            file.name.toLowerCase().includes('contractor') ||
            file.name.toLowerCase().includes('bill')
        );

        // Add images to article card
        if (articleImages.length > 0) {
            const articlesCard = document.getElementById('articlesCard');
            if (articlesCard) {
                const imageUrl = `https://cleanslatekickz.github.io/FilesHub/images/${articleImages[0].name}`;
                addImageToCard(articlesCard, imageUrl, 'Articles Preview');
            }
        }

        // Add images to notes card
        if (noteImages.length > 0) {
            const notesCard = document.getElementById('notesCard');
            if (notesCard) {
                const imageUrl = `https://cleanslatekickz.github.io/FilesHub/images/${noteImages[0].name}`;
                addImageToCard(notesCard, imageUrl, 'Notes Preview');
            }
        }

    } catch (error) {
        console.error('Error loading category images:', error);
    }
}

function addImageToCard(cardElement, imageUrl, altText) {
    const icon = cardElement.querySelector('.category-icon');
    if (icon) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'category-image';
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="${altText}" loading="lazy" onerror="this.style.display='none'">`;
        
        // Insert image container after the icon
        icon.parentNode.insertBefore(imageContainer, icon.nextSibling);
        
        // Hide the icon since we now have an image
        icon.style.display = 'none';
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

    // Clear loading placeholder
    projectsGrid.innerHTML = '';

    try {
        // Get discovered projects
        const projects = await discoverProjects();

        // Load custom projects from localStorage first
        loadCustomProjects();

        // Add discovered projects
        if (projects.length > 0) {
            const projectsHTML = projects.map(project => `
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
                    <div class="project-type-badge">Auto</div>
                </div>
            `).join('');

            projectsGrid.insertAdjacentHTML('beforeend', projectsHTML);
        }

        // Show empty state if no projects at all
        if (projectsGrid.children.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus"></i>
                    <h3>No projects found</h3>
                    <p>Click the + button to add your first project!</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                Failed to load projects. You can still add custom projects using the + button.
            </div>
        `;
        
        // Still try to load custom projects even if discovery failed
        loadCustomProjects();
    }
}

async function discoverProjects() {
    const projects = [];

    try {
        // Use GitHub API to find projects in the Projects folder
        const fileManager = new FileManager();
        const projectsContents = await window.githubAPI.getRepoContents('Projects');
        
        if (Array.isArray(projectsContents)) {
            for (const file of projectsContents) {
                if (file.type === 'file' && file.name.toLowerCase().endsWith('.html')) {
                    const projectName = file.name.replace('.html', '');
                    const screenshot = await findScreenshot(projectName, 'Projects');
                    
                    projects.push({
                        name: projectName.replace(/-/g, ' '),
                        description: `Project application in Projects folder`,
                        url: `https://cleanslatekickz.github.io/FilesHub/Projects/${file.name}`,
                        screenshot: screenshot,
                        path: file.path
                    });
                }
            }
        }

        // Add the main hub as a project
        projects.unshift({
            name: 'File Management Hub',
            description: 'Organized collection of articles, notes, and documents with search functionality',
            url: 'https://cleanslatekickz.github.io/FilesHub/',
            screenshot: null,
            path: 'index.html'
        });

    } catch (error) {
        console.error('Error discovering projects:', error);
        // Fallback to main hub only
        projects.push({
            name: 'File Management Hub',
            description: 'Organized collection of articles, notes, and documents with search functionality',
            url: 'https://cleanslatekickz.github.io/FilesHub/',
            screenshot: null,
            path: 'index.html'
        });
    }

    return projects;
}

async function findScreenshot(projectName, directory = '') {
    try {
        // Check for screenshot in Projects folder first
        const projectsContents = await window.githubAPI.getRepoContents('Projects');
        if (Array.isArray(projectsContents)) {
            const imageFile = projectsContents.find(file => 
                file.name.toLowerCase() === `${projectName.toLowerCase()}.png` ||
                file.name.toLowerCase() === `${projectName.toLowerCase()}.jpg`
            );
            if (imageFile) {
                return `https://cleanslatekickz.github.io/FilesHub/Projects/${imageFile.name}`;
            }
        }

        // Check for screenshot in images folder
        const imagesContents = await window.githubAPI.getRepoContents('images');
        if (Array.isArray(imagesContents)) {
            const imageFile = imagesContents.find(file => 
                file.name.toLowerCase() === `${projectName.toLowerCase()}.png` ||
                file.name.toLowerCase() === `${projectName.toLowerCase()}.jpg`
            );
            if (imageFile) {
                return `https://cleanslatekickz.github.io/FilesHub/images/${imageFile.name}`;
            }
        }
    } catch (error) {
        console.log('Could not find screenshot for', projectName);
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
