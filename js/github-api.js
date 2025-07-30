class GitHubAPI {
    constructor() {
        // GitHub repository configuration
        this.owner = 'cleanslatekickz';
        this.repo = 'FilesHub';
        this.baseUrl = 'https://api.github.com';

        // Cache for responses
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getRepoContents(path = '') {
        const cacheKey = `contents_${path}`;
        const cached = this.getCachedResponse(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            const result = Array.isArray(data) ? data : [data];
            
            // Transform the data to include proper URLs for GitHub Pages
            const transformedResult = result.map(item => ({
                ...item,
                html_url: item.type === 'file' ? 
                    `https://${this.owner}.github.io/${this.repo}/${item.path}` : 
                    item.html_url
            }));
            
            this.setCachedResponse(cacheKey, transformedResult);
            return transformedResult;
        } catch (error) {
            console.error('Error fetching repository contents:', error);
            return [];
        }
    }

    async getRepoInfo() {
        const cacheKey = 'repo_info';
        const cached = this.getCachedResponse(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.setCachedResponse(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching repository info:', error);
            return {
                name: this.repo,
                full_name: `${this.owner}/${this.repo}`,
                description: 'File Management Hub',
                html_url: `https://github.com/${this.owner}/${this.repo}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
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

    getCachedResponse(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedResponse(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp < this.cacheTimeout) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }
        
        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries
        };
    }
}

// Create global instance
window.githubAPI = new GitHubAPI();
