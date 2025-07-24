class GitHubAPI {
    constructor() {
        // Get repository info from current URL or environment
        this.owner = this.getRepoOwner();
        this.repo = this.getRepoName();
        this.baseUrl = 'https://api.github.com';
        this.token = this.getAuthToken();
        
        // Cache for API responses to reduce rate limiting
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    getRepoOwner() {
        // Try to get from URL (for GitHub Pages)
        const hostname = window.location.hostname;
        if (hostname.includes('.github.io')) {
            return hostname.split('.')[0];
        }
        
        // For local development, use environment variable or default
        return window.GITHUB_OWNER || 'your-username';
    }
    
    getRepoName() {
        // Try to get from URL path (for GitHub Pages)
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/').filter(part => part);
        
        if (pathParts.length > 0 && !pathParts[0].includes('.')) {
            return pathParts[0];
        }
        
        // Fallback to environment or default
        return window.GITHUB_REPO || 'your-repository-name';
    }
    
    getAuthToken() {
        // Get token from environment variables if available
        return window.GITHUB_TOKEN || null;
    }
    
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'File-Management-Hub/1.0'
        };
        
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        return headers;
    }
    
    getCacheKey(url) {
        return `${this.owner}/${this.repo}:${url}`;
    }
    
    isValidCache(cacheData) {
        return cacheData && (Date.now() - cacheData.timestamp) < this.cacheTimeout;
    }
    
    async makeRequest(url, options = {}) {
        const cacheKey = this.getCacheKey(url);
        const cachedData = this.cache.get(cacheKey);
        
        if (this.isValidCache(cachedData)) {
            return cachedData.data;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
            
        } catch (error) {
            console.error('GitHub API request failed:', error);
            
            // Return cached data if available, even if expired
            if (cachedData) {
                console.warn('Using expired cache data due to API error');
                return cachedData.data;
            }
            
            throw error;
        }
    }
    
    async getRepoContents(path = '') {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
        return await this.makeRequest(url);
    }
    
    async getRepoInfo() {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
        return await this.makeRequest(url);
    }
    
    async getRecentCommits(perPage = 10) {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?per_page=${perPage}`;
        return await this.makeRequest(url);
    }
    
    async getGitHubPagesInfo() {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/pages`;
        try {
            return await this.makeRequest(url);
        } catch (error) {
            // GitHub Pages endpoint might not be accessible
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }
    
    async getFileContent(path) {
        try {
            const contents = await this.getRepoContents(path);
            if (contents.content) {
                // Decode base64 content
                return atob(contents.content.replace(/\s/g, ''));
            }
            return null;
        } catch (error) {
            console.error(`Error getting file content for ${path}:`, error);
            return null;
        }
    }
    
    async searchFiles(query, path = '') {
        try {
            const url = `${this.baseUrl}/search/code?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}${path ? `+path:${path}` : ''}`;
            return await this.makeRequest(url);
        } catch (error) {
            console.error('Search failed:', error);
            return { items: [] };
        }
    }
    
    async getRateLimitStatus() {
        const url = `${this.baseUrl}/rate_limit`;
        try {
            return await this.makeRequest(url);
        } catch (error) {
            console.warn('Could not get rate limit status:', error);
            return null;
        }
    }
    
    // Utility method to clear cache
    clearCache() {
        this.cache.clear();
    }
    
    // Utility method to get cache statistics
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        this.cache.forEach(entry => {
            if ((now - entry.timestamp) < this.cacheTimeout) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        });
        
        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries
        };
    }
}

// Create global instance
window.githubAPI = new GitHubAPI();
