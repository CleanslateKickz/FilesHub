document.addEventListener('DOMContentLoaded', function () {
    // Search functionality
    const searchBar = document.getElementById('projectSearch');
    if (searchBar) {
        searchBar.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.dir-card').forEach(card => {
                const title = card.querySelector('.title')?.textContent?.toLowerCase() || '';
                const description = card.querySelector('.description')?.textContent?.toLowerCase() || '';
                card.style.display = (title.includes(searchTerm) || description.includes(searchTerm)) ? '' : 'none';
            });
        });
    }

    // Modal open/close logic
    const addBtn = document.getElementById('addProjectBtn');
    const modal = document.getElementById('addProjectModal');
    const cancelModal = document.getElementById('cancelModal');
    if (addBtn && modal && cancelModal) {
        addBtn.onclick = () => { modal.style.display = 'flex'; };
        cancelModal.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }

    // Add project logic
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.onsubmit = function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(projectForm).entries());
            const image = data.image || 'https://via.placeholder.com/320x220?text=New+Project';
            const grid = document.querySelector('.dir-grid');
            if (grid) {
                const card = document.createElement('div');
                card.className = 'dir-card';
                card.innerHTML = `
                    <img src="${image}" alt="${data.title}" loading="lazy"/>
                    <div class="dir-card-content">
                        <div class="title">${data.title}</div>
                        <div class="description">${data.description}</div>
                        <a href="${data.url}" target="_blank">Open</a>
                    </div>
                `;
                grid.prepend(card);
                saveProjectToLocal(data);
            }
            modal.style.display = 'none';
            projectForm.reset();
        };
    }

    // localStorage helpers
    function saveProjectToLocal(project) {
        let projects = JSON.parse(localStorage.getItem('customProjects') || '[]');
        projects.unshift(project);
        localStorage.setItem('customProjects', JSON.stringify(projects));
    }
    function loadProjectsFromLocal() {
        let projects = JSON.parse(localStorage.getItem('customProjects') || '[]');
        const grid = document.querySelector('.dir-grid');
        if (grid && projects.length) {
            for (const data of projects) {
                const image = data.image || 'https://via.placeholder.com/320x220?text=New+Project';
                const card = document.createElement('div');
                card.className = 'dir-card';
                card.innerHTML = `
                    <img src="${image}" alt="${data.title}" loading="lazy"/>
                    <div class="dir-card-content">
                        <div class="title">${data.title}</div>
                        <div class="description">${data.description}</div>
                        <a href="${data.url}" target="_blank">Open</a>
                    </div>
                `;
                grid.appendChild(card);
            }
        }
    }
    loadProjectsFromLocal();

    // (Optional) "Recent Files" placeholder
    const loadingPlaceholder = document.querySelector('.loading-placeholder');
    if (loadingPlaceholder) {
        loadingPlaceholder.textContent = "Recent file listing is static on this demo. Edit index.html to add files.";
    }
});
