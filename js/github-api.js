class GitHubAPI {
    constructor() {
        // For local development in Replit, we'll use a mock API
        this.owner = 'local';
        this.repo = 'FilesHub';
        this.baseUrl = window.location.origin;

        // Cache for responses
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getRepoContents(path = '') {
        // For local development, return mock data based on actual file structure
        const mockStructure = {
            '': [
                { name: 'articles', type: 'dir', path: 'articles' },
                { name: 'notes', type: 'dir', path: 'notes' },
                { name: 'index.html', type: 'file', path: 'index.html' }
            ],
            'articles': [
                {
                    name: '2025-01-24-sample-article.html',
                    type: 'file',
                    path: 'articles/2025-01-24-sample-article.html',
                    size: 2048,
                    html_url: `${this.baseUrl}/articles/2025-01-24-sample-article.html`,
                    sha: 'abc123',
                    updated_at: '2025-01-24T00:00:00Z'
                },
                {
                    name: 'index.html',
                    type: 'file',
                    path: 'articles/index.html',
                    size: 1024,
                    html_url: `${this.baseUrl}/articles/index.html`,
                    sha: 'def456',
                    updated_at: '2025-01-24T00:00:00Z'
                }
            ],
            'notes': [
                {
                    name: '2025-01-24-setup-guide.html',
                    type: 'file',
                    path: 'notes/2025-01-24-setup-guide.html',
                    size: 3072,
                    html_url: `${this.baseUrl}/notes/2025-01-24-setup-guide.html`,
                    sha: 'ghi789',
                    updated_at: '2025-01-24T00:00:00Z'
                },
                {
                    name: 'index.html',
                    type: 'file',
                    path: 'notes/index.html',
                    size: 1024,
                    html_url: `${this.baseUrl}/notes/index.html`,
                    sha: 'jkl012',
                    updated_at: '2025-01-24T00:00:00Z'
                }
            ]
        };

        return mockStructure[path] || [];
    }

    async getRepoInfo() {
        return {
            name: 'FilesHub',
            full_name: 'local/FilesHub',
            description: 'File Management Hub - Local Development',
            html_url: this.baseUrl,
            created_at: '2025-01-24T00:00:00Z',
            updated_at: '2025-01-24T00:00:00Z'
        };
    }

    async getRecentCommits(perPage = 10) {
        return [
            {
                sha: 'abc123',
                commit: {
                    message: 'Initial setup',
                    author: {
                        name: 'Local User',
                        date: '2025-01-24T00:00:00Z'
                    }
                }
            }
        ];
    }

    async getGitHubPagesInfo() {
        return null; // Not applicable for local development
    }

    async getFileContent(path) {
        try {
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (response.ok) {
                return await response.text();
            }
            return null;
        } catch (error) {
            console.error(`Error getting file content for ${path}:`, error);
            return null;
        }
    }

    async searchFiles(query, path = '') {
        // Simple mock search - in a real implementation this would search file contents
        return { items: [] };
    }

    async getRateLimitStatus() {
        return {
            rate: {
                limit: 5000,
                remaining: 5000,
                reset: Date.now() / 1000 + 3600
            }
        };
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        return {
            totalEntries: this.cache.size,
            validEntries: this.cache.size,
            expiredEntries: 0
        };
    }
}

// Create global instance
window.githubAPI = new GitHubAPI();
