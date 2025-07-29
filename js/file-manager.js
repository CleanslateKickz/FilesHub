
class FileManager {
    constructor() {
        this.githubAPI = new GitHubAPI();
        this.supportedExtensions = ['html', 'htm', 'pdf', 'doc', 'docx', 'txt'];
        this.fileTypePatterns = {
            pdf: /\.pdf$/i,
            html: /\.html?$/i,
            doc: /\.docx?$/i,
            txt: /\.txt$/i
        };
    }

    async getFilesFromFolder(folderName) {
        try {
            const contents = await this.githubAPI.getRepoContents(folderName);

            if (!Array.isArray(contents)) {
                return [];
            }

            let allFiles = [];

            // Process files in current folder
            const files = contents.filter(item => {
                return item.type === 'file' && 
                       this.supportedExtensions.some(ext => 
                           item.name.toLowerCase().endsWith(`.${ext}`)
                       );
            });

            allFiles.push(...files.map(file => this.processFileInfo(file, folderName)));

            // Process subfolders recursively
            const subfolders = contents.filter(item => item.type === 'dir');
            for (const subfolder of subfolders) {
                const subfolderPath = `${folderName}/${subfolder.name}`;
                const subfolderFiles = await this.getFilesFromFolder(subfolderPath);
                allFiles.push(...subfolderFiles);
            }

            return allFiles;

        } catch (error) {
            console.error(`Error fetching files from ${folderName}:`, error);
            return [];
        }
    }

    processFileInfo(file, folderName) {
        const extension = file.name.split('.').pop().toLowerCase();
        const fileType = this.getFileType(extension);
        const dateInfo = this.extractDateFromFilename(file.name);

        // Generate local URL instead of GitHub Pages URL
        const localUrl = `${window.location.origin}/${folderName}/${file.name}`;

        return {
            name: file.name,
            displayName: this.createDisplayName(file.name),
            size: file.size,
            type: fileType,
            extension: extension,
            url: localUrl,
            htmlUrl: file.html_url,
            date: dateInfo.date,
            parsedDate: dateInfo.parsedDate,
            folder: folderName,
            subfolder: folderName.includes('/') ? folderName.split('/').slice(1).join('/') : null,
            sha: file.sha,
            lastModified: file.updated_at || file.created_at,
            rawFile: file
        };
    }

    getFileType(extension) {
        for (const [type, pattern] of Object.entries(this.fileTypePatterns)) {
            if (pattern.test(`.${extension}`)) {
                return type;
            }
        }
        return extension;
    }

    createDisplayName(filename) {
        // Remove extension
        let name = filename.replace(/\.[^/.]+$/, '');

        // Replace common separators with spaces
        name = name.replace(/[-_]/g, ' ');

        // Capitalize first letter of each word
        name = name.replace(/\b\w/g, l => l.toUpperCase());

        return name;
    }

    extractDateFromFilename(filename) {
        const patterns = [
            // YYYY-MM-DD format
            /(\d{4})-(\d{1,2})-(\d{1,2})/,
            // MM-DD-YYYY format
            /(\d{1,2})-(\d{1,2})-(\d{4})/,
            // Month-DD-YYYY format (e.g., June-17-2025)
            /([A-Za-z]+)-(\d{1,2})-(\d{4})/,
            // YYYY_MM_DD format
            /(\d{4})_(\d{1,2})_(\d{1,2})/,
            // YYYYMMDD format
            /(\d{4})(\d{2})(\d{2})/
        ];

        for (const pattern of patterns) {
            const match = filename.match(pattern);
            if (match) {
                try {
                    let year, month, day;

                    if (pattern.source.includes('[A-Za-z]')) {
                        // Month name format
                        const monthName = match[1];
                        day = parseInt(match[2]);
                        year = parseInt(match[3]);
                        month = this.parseMonthName(monthName);
                    } else if (match[3] && match[3].length === 4) {
                        // MM-DD-YYYY format
                        month = parseInt(match[1]);
                        day = parseInt(match[2]);
                        year = parseInt(match[3]);
                    } else {
                        // YYYY-MM-DD format
                        year = parseInt(match[1]);
                        month = parseInt(match[2]);
                        day = parseInt(match[3]) || 1;
                    }

                    if (month && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                        const date = new Date(year, month - 1, day);
                        return {
                            date: date.toISOString().split('T')[0],
                            parsedDate: date
                        };
                    }
                } catch (error) {
                    console.warn('Error parsing date from filename:', filename, error);
                }
            }
        }

        return { date: null, parsedDate: null };
    }

    parseMonthName(monthName) {
        const months = {
            'jan': 1, 'january': 1,
            'feb': 2, 'february': 2,
            'mar': 3, 'march': 3,
            'apr': 4, 'april': 4,
            'may': 5,
            'jun': 6, 'june': 6,
            'jul': 7, 'july': 7,
            'aug': 8, 'august': 8,
            'sep': 9, 'september': 9,
            'oct': 10, 'october': 10,
            'nov': 11, 'november': 11,
            'dec': 12, 'december': 12
        };

        return months[monthName.toLowerCase()] || null;
    }

    generateLocalUrl(folderName, fileName) {
        return `${window.location.origin}/${folderName}/${fileName}`;
    }

    async getFileCount(folderName) {
        try {
            const files = await this.getFilesFromFolder(folderName);
            return files.length;
        } catch (error) {
            console.error(`Error getting file count for ${folderName}:`, error);
            return 0;
        }
    }

    async getRecentFiles(limit = 10) {
        try {
            const [articlesFiles, notesFiles] = await Promise.all([
                this.getFilesFromFolder('articles'),
                this.getFilesFromFolder('notes')
            ]);

            const allFiles = [...articlesFiles, ...notesFiles];

            // Sort by parsed date if available, otherwise by filename
            allFiles.sort((a, b) => {
                if (a.parsedDate && b.parsedDate) {
                    return b.parsedDate - a.parsedDate;
                }
                if (a.parsedDate && !b.parsedDate) return -1;
                if (!a.parsedDate && b.parsedDate) return 1;
                return b.name.localeCompare(a.name);
            });

            return allFiles.slice(0, limit);

        } catch (error) {
            console.error('Error getting recent files:', error);
            return [];
        }
    }

    async searchAllFiles(query, contentType = 'all') {
        try {
            const [articlesFiles, notesFiles] = await Promise.all([
                this.getFilesFromFolder('articles'),
                this.getFilesFromFolder('notes')
            ]);

            let allFiles = [...articlesFiles, ...notesFiles];

            // Filter by content type if specified
            if (contentType !== 'all') {
                allFiles = allFiles.filter(file => file.type === contentType);
            }

            // Filter by search query
            const searchResults = allFiles.filter(file => {
                const searchText = `${file.name} ${file.displayName}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            // Sort results by relevance (exact matches first, then partial matches)
            searchResults.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const queryLower = query.toLowerCase();

                const aExact = aName.includes(queryLower);
                const bExact = bName.includes(queryLower);

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // If both or neither are exact matches, sort by date
                if (a.parsedDate && b.parsedDate) {
                    return b.parsedDate - a.parsedDate;
                }

                return aName.localeCompare(bName);
            });

            return searchResults;

        } catch (error) {
            console.error('Error searching files:', error);
            return [];
        }
    }

    sortFiles(files, sortOrder) {
        const sortedFiles = [...files];

        switch (sortOrder) {
            case 'date-desc':
                return sortedFiles.sort((a, b) => {
                    if (a.parsedDate && b.parsedDate) {
                        return b.parsedDate - a.parsedDate;
                    }
                    if (a.parsedDate && !b.parsedDate) return -1;
                    if (!a.parsedDate && b.parsedDate) return 1;
                    return b.name.localeCompare(a.name);
                });

            case 'date-asc':
                return sortedFiles.sort((a, b) => {
                    if (a.parsedDate && b.parsedDate) {
                        return a.parsedDate - b.parsedDate;
                    }
                    if (a.parsedDate && !b.parsedDate) return -1;
                    if (!a.parsedDate && b.parsedDate) return 1;
                    return a.name.localeCompare(b.name);
                });

            case 'name-asc':
                return sortedFiles.sort((a, b) => a.name.localeCompare(b.name));

            case 'name-desc':
                return sortedFiles.sort((a, b) => b.name.localeCompare(a.name));

            case 'size-desc':
                return sortedFiles.sort((a, b) => (b.size || 0) - (a.size || 0));

            case 'size-asc':
                return sortedFiles.sort((a, b) => (a.size || 0) - (b.size || 0));

            default:
                return sortedFiles;
        }
    }

    filterFiles(files, fileType) {
        if (fileType === 'all') {
            return files;
        }
        return files.filter(file => file.type === fileType);
    }

    // Initialize page-specific functionality
    async initializeArticlesPage() {
        await this.initializePage('articles', 'articleSearch', 'articlesList');
    }

    async initializeNotesPage() {
        await this.initializePage('notes', 'notesSearch', 'notesList');
    }

    async initializePage(folderName, searchInputId, listElementId) {
        const searchInput = document.getElementById(searchInputId);
        const listElement = document.getElementById(listElementId);
        const sortOrderSelect = document.getElementById('sortOrder');
        const fileTypeFilter = document.getElementById('fileTypeFilter');

        let allFiles = [];
        let filteredFiles = [];

        // Load files
        try {
            allFiles = await this.getFilesFromFolder(folderName);
            filteredFiles = [...allFiles];

            this.updateFileStats(allFiles);
            this.displayFiles(filteredFiles, listElement);
        } catch (error) {
            console.error(`Error initializing ${folderName} page:`, error);
            if (listElement) {
                listElement.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load files. Please try again later.</div>';
            }
        }

        // Setup search functionality
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.handleSearch(allFiles, searchInput, sortOrderSelect, fileTypeFilter, listElement);
            });
        }

        // Setup sorting
        if (sortOrderSelect) {
            sortOrderSelect.addEventListener('change', () => {
                this.handleSearch(allFiles, searchInput, sortOrderSelect, fileTypeFilter, listElement);
            });
        }

        // Setup filtering
        if (fileTypeFilter) {
            fileTypeFilter.addEventListener('change', () => {
                this.handleSearch(allFiles, searchInput, sortOrderSelect, fileTypeFilter, listElement);
            });
        }
    }

    handleSearch(allFiles, searchInput, sortOrderSelect, fileTypeFilter, listElement) {
        let filteredFiles = [...allFiles];

        // Apply search filter
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            filteredFiles = filteredFiles.filter(file => {
                const searchText = `${file.name} ${file.displayName}`.toLowerCase();
                return searchText.includes(query);
            });
        }

        // Apply file type filter
        if (fileTypeFilter && fileTypeFilter.value !== 'all') {
            filteredFiles = this.filterFiles(filteredFiles, fileTypeFilter.value);
        }

        // Apply sorting
        if (sortOrderSelect) {
            filteredFiles = this.sortFiles(filteredFiles, sortOrderSelect.value);
        }

        this.displayFiles(filteredFiles, listElement);
    }

    updateFileStats(files) {
        const totalFilesEl = document.getElementById('totalFiles');
        const pdfFilesEl = document.getElementById('pdfFiles');
        const htmlFilesEl = document.getElementById('htmlFiles');

        if (totalFilesEl) totalFilesEl.textContent = files.length;
        if (pdfFilesEl) pdfFilesEl.textContent = files.filter(f => f.type === 'pdf').length;
        if (htmlFilesEl) htmlFilesEl.textContent = files.filter(f => f.type === 'html').length;
    }

    displayFiles(files, listElement) {
        if (!listElement) return;

        if (files.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No files found</h3>
                    <p>No files match your current search or filter criteria.</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = files.map(file => `
            <a href="${file.url}" target="_blank" class="file-item ${file.type}">
                <i class="fas ${this.getFileIcon(file.name)} file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.displayName}</div>
                    <div class="file-meta">
                        <span class="file-type"><i class="fas fa-tag"></i> ${file.type.toUpperCase()}</span>
                        ${file.subfolder ? `<span class="file-location"><i class="fas fa-folder"></i> ${file.subfolder}</span>` : ''}
                        ${file.date ? `<span class="file-date"><i class="fas fa-calendar"></i> ${this.formatDate(file.date)}</span>` : ''}
                        ${file.size ? `<span class="file-size"><i class="fas fa-hdd"></i> ${this.formatFileSize(file.size)}</span>` : ''}
                    </div>
                </div>
                <i class="fas fa-external-link-alt external-link-icon"></i>
            </a>
        `).join('');
    }

    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'html':
            case 'htm':
                return 'fa-file-code';
            case 'doc':
                return 'fa-file-word';
            case 'docx':
                return 'fa-file-word';
            case 'txt':
                return 'fa-file-alt';
            default:
                return 'fa-file';
        }
    }

    formatDate(dateString) {
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

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return 'Unknown size';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}
