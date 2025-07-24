class GitHubAPI {
    constructor() {
        this.owner = 'CleanslateKickz';
        this.repo = 'geojson';
        this.baseUrl = 'https://api.github.com';
    }

    async getRepoContents(path = '') {
        try {
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching repo contents:', error);
            return [];
        }
    }

    async getRepoInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching repo info:', error);
            return null;
        }
    }

    async getRecentCommits() {
        try {
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?per_page=5`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching recent commits:', error);
            return [];
        }
    }

    async getGitHubPagesInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/pages`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching GitHub Pages info:', error);
            return null;
        }
    }
}
