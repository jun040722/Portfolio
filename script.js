// 전역 변수
let projects = [];
let skills = [];
let editingProjectId = null;
let isEditMode = false;
let skillColors = {};
let uploadedFiles = [];

// DOM 요소들
const darkModeToggle = document.getElementById('darkModeToggle');
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const addProjectBtn = document.getElementById('addProjectBtn');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');
const projectsGrid = document.getElementById('projectsGrid');
const projectFilter = document.getElementById('projectFilter');
const projectSort = document.getElementById('projectSort');
const addSkillBtn = document.getElementById('addSkillBtn');
const newSkillInput = document.getElementById('newSkillInput');
const skillsGrid = document.getElementById('skillsGrid');
const toggleEditMode = document.getElementById('toggleEditMode');
const profileEditMode = document.getElementById('profileEditMode');
const profileViewMode = document.getElementById('profileViewMode');
const skillColorBtn = document.getElementById('skillColorBtn');
const skillColorModal = document.getElementById('skillColorModal');
const projectDetailModal = document.getElementById('projectDetailModal');
const projectFileUpload = document.getElementById('projectFileUpload');
const uploadBtn = document.getElementById('uploadBtn');
const uploadedFilesContainer = document.getElementById('uploadedFiles');
const dropZone = document.getElementById('dropZone');

// 프로필 입력 필드들
const profileInputs = {
    name: document.getElementById('profileName'),
    school: document.getElementById('profileSchool'),
    major: document.getElementById('profileMajor'),
    age: document.getElementById('profileAge'),
    phone: document.getElementById('profilePhone'),
    email: document.getElementById('profileEmail'),
    github: document.getElementById('profileGithub')
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadData();
    setupEventListeners();
});

// 앱 초기화
function initializeApp() {
    // 다크모드 설정
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // 기존 잘못된 데이터 정리
    cleanupInvalidSkills();
    
    // 프로필 이니셜 업데이트
    updateProfileInitials();
}

// 데이터 로드
function loadData() {
    // 로컬 스토리지에서 데이터 로드
    const savedProjects = localStorage.getItem('portfolio_projects');
    const savedSkills = localStorage.getItem('portfolio_skills');
    
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    } else {
        // 기본 프로젝트 데이터
        projects = [
            {
                id: 1,
                name: '포트폴리오 웹사이트',
                startDate: '2025-07-01',
                endDate: '2025-07-31',
                type: 'web',
                image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Portfolio',
                description: '반응형 포트폴리오 웹사이트를 React와 Tailwind CSS로 개발했습니다.'
            },
            {
                id: 2,
                name: 'RAG 구조 기반 CS 응답 자동화 시스템 구축',
                startDate: '2025-04-01',
                endDate: '2025-06-30',
                type: 'ai',
                image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=RAG+System',
                description: 'RAG(Retrieval-Augmented Generation) 구조를 활용한 고객 서비스 응답 자동화 시스템을 구축했습니다.'
            },
            {
                id: 3,
                name: 'Inhance (인하대학교 학생 전용 어플리케이션)',
                startDate: '2024-04-01',
                endDate: '2024-06-30',
                type: 'mobile',
                image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Inhance',
                description: '인하대학교 학생들을 위한 전용 모바일 애플리케이션을 개발했습니다.'
            }
        ];
    }
    
    if (savedSkills) {
        skills = JSON.parse(savedSkills);
        // "object Object" 같은 잘못된 데이터 필터링
        skills = skills.filter(skill => 
            typeof skill === 'string' && 
            skill.trim() !== '' && 
            skill !== 'object Object' &&
            skill !== '[object Object]'
        );
    } else {
        // 기본 스킬 데이터
        skills = ['Python', 'Git', 'Figma', 'PyTorch', 'Android Studio'];
    }
    
    // 스킬 색상 로드
    const savedSkillColors = localStorage.getItem('portfolio_skill_colors');
    if (savedSkillColors) {
        skillColors = JSON.parse(savedSkillColors);
    } else {
        // 기본 색상 설정
        skillColors = {
            'Python': 'green',
            'Git': 'purple',
            'Figma': 'pink',
            'PyTorch': 'orange',
            'Android Studio': 'blue'
        };
    }
    
    renderProjects();
    renderSkills();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 이벤트 디리게이션 사용
    document.addEventListener('click', (e) => {
        if (e.target.closest('#darkModeToggle')) {
            toggleDarkMode();
        } else if (e.target.closest('#addProjectBtn')) {
            openProjectModal();
        } else if (e.target.closest('#cancelProjectBtn')) {
            closeProjectModal();
        } else if (e.target.closest('#addSkillBtn')) {
            addSkill();
        } else if (e.target.closest('#toggleEditMode')) {
            toggleProfileEditMode();
        }
    });

    // 폼 제출 이벤트
    projectForm.addEventListener('submit', handleProjectSubmit);
    
    // 드래그 앤 드롭 이벤트
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // 필터 및 정렬 이벤트
    projectFilter.addEventListener('change', filterProjects);
    projectSort.addEventListener('change', sortProjects);
    
    // 프로필 입력 필드들에 이벤트 리스너 추가
    Object.values(profileInputs).forEach(input => {
        input.addEventListener('input', debounce(saveProfileData, 300));
    });

    // 프로젝트 그리드 이벤트 디리게이션
    projectsGrid.addEventListener('click', (e) => {
        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
            const projectId = projectCard.dataset.id;
            if (e.target.closest('.edit-project')) {
                editProject(projectId);
            } else if (e.target.closest('.delete-project')) {
                deleteProject(projectId);
            } else {
                openProjectDetail(projectId);
            }
        }
    });
}

// 다크모드 토글
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// 프로필 편집 모드 토글
function toggleProfileEditMode() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        profileEditMode.classList.remove('hidden');
        profileViewMode.classList.add('hidden');
        document.getElementById('editModeText').textContent = '저장';
        toggleEditMode.classList.remove('bg-primary-600', 'hover:bg-primary-700');
        toggleEditMode.classList.add('bg-green-600', 'hover:bg-green-700');
    } else {
        // 저장 모드
        saveProfileData();
        profileEditMode.classList.add('hidden');
        profileViewMode.classList.remove('hidden');
        document.getElementById('editModeText').textContent = '편집';
        toggleEditMode.classList.remove('bg-green-600', 'hover:bg-green-700');
        toggleEditMode.classList.add('bg-primary-600', 'hover:bg-primary-700');
    }
}

// 프로필 데이터 저장
function saveProfileData() {
    // 보기 모드 업데이트
    document.getElementById('viewName').textContent = profileInputs.name.value;
    document.getElementById('viewSchool').textContent = profileInputs.school.value;
    document.getElementById('viewMajor').textContent = profileInputs.major.value;
    document.getElementById('viewAge').textContent = profileInputs.age.value + '세';
    document.getElementById('viewPhone').textContent = profileInputs.phone.value;
    document.getElementById('viewEmail').textContent = profileInputs.email.value;
    document.getElementById('viewGithub').href = profileInputs.github.value;
    
    // 로컬 스토리지에 저장
    const profileData = {
        name: profileInputs.name.value,
        school: profileInputs.school.value,
        major: profileInputs.major.value,
        age: profileInputs.age.value,
        phone: profileInputs.phone.value,
        email: profileInputs.email.value,
        github: profileInputs.github.value
    };
    localStorage.setItem('portfolio_profile', JSON.stringify(profileData));
}

// 프로필 이니셜 업데이트
function updateProfileInitials() {
    const name = profileInputs.name.value;
    const initials = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    document.getElementById('profileInitials').textContent = initials || '박';
}

// 프로젝트 모달 열기
function openProjectModal(projectId = null) {
    editingProjectId = projectId;
    const modalTitle = projectModal.querySelector('h3');
    
    if (projectId) {
        // 편집 모드
        const project = projects.find(p => p.id === projectId);
        if (project) {
            modalTitle.textContent = '프로젝트 편집';
            fillProjectForm(project);
        }
    } else {
        // 추가 모드
        modalTitle.textContent = '프로젝트 추가';
        projectForm.reset();
        document.getElementById('projectStartDate').value = new Date().toISOString().split('T')[0];
    }
    
    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex', 'modal-enter');
}

// 파일 업로드 처리
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

// 업로드된 파일들 표시
function displayUploadedFiles() {
    uploadedFilesContainer.innerHTML = uploadedFiles.map((file, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
                ${file.type.startsWith('image/') ? 
                    `<img src="${file.data}" alt="${file.name}" class="w-12 h-12 object-cover rounded">` :
                    `<video src="${file.data}" class="w-12 h-12 object-cover rounded"></video>`
                }
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">${file.name}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${formatFileSize(file.size)}</p>
                </div>
            </div>
            <button onclick="removeUploadedFile(${index})" class="text-red-500 hover:text-red-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

// 업로드된 파일 제거
function removeUploadedFile(index) {
    uploadedFiles.splice(index, 1);
    displayUploadedFiles();
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 드래그 앤 드롭 이벤트 핸들러
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// 파일 처리 함수 (공통)
function processFiles(files) {
    files.forEach(file => {
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`);
            return;
        }
        
        // 파일 타입 확인
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert(`${file.name} 파일은 지원되지 않는 형식입니다. 이미지 또는 동영상 파일만 업로드 가능합니다.`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            
            uploadedFiles.push(fileData);
            displayUploadedFiles();
        };
        reader.readAsDataURL(file);
    });
}

// 프로젝트 모달 닫기
function closeProjectModal() {
    projectModal.classList.add('hidden');
    projectModal.classList.remove('flex');
    editingProjectId = null;
    projectForm.reset();
    uploadedFiles = [];
    displayUploadedFiles();
}

// 프로젝트 폼 채우기
function fillProjectForm(project) {
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectStartDate').value = project.startDate;
    document.getElementById('projectEndDate').value = project.endDate || '';
    document.getElementById('projectType').value = project.type;
    document.getElementById('projectImage').value = project.image || '';
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectDetail').value = project.detail || '';
    document.getElementById('projectMedia').value = project.media ? project.media.join(', ') : '';
    
    // 기존 미디어 파일들을 업로드된 파일 목록에 추가
    uploadedFiles = [];
    if (project.media && project.media.length > 0) {
        project.media.forEach((mediaUrl, index) => {
            // URL이 아닌 base64 데이터인 경우에만 추가
            if (mediaUrl.startsWith('data:')) {
                const fileData = {
                    name: `업로드된 파일 ${index + 1}`,
                    type: mediaUrl.startsWith('data:image/') ? 'image/jpeg' : 'video/mp4',
                    size: 0,
                    data: mediaUrl
                };
                uploadedFiles.push(fileData);
            }
        });
    }
    displayUploadedFiles();
}

// 프로젝트 제출 처리
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(projectForm);
    const projectData = {
        name: formData.get('projectName') || document.getElementById('projectName').value,
        startDate: formData.get('projectStartDate') || document.getElementById('projectStartDate').value,
        endDate: formData.get('projectEndDate') || document.getElementById('projectEndDate').value,
        type: formData.get('projectType') || document.getElementById('projectType').value,
        image: formData.get('projectImage') || document.getElementById('projectImage').value,
        description: formData.get('projectDescription') || document.getElementById('projectDescription').value,
        detail: formData.get('projectDetail') || document.getElementById('projectDetail').value,
        media: formData.get('projectMedia') || document.getElementById('projectMedia').value
    };
    
    // 미디어 URL을 배열로 변환
    if (projectData.media) {
        projectData.media = projectData.media.split(',').map(url => url.trim()).filter(url => url);
    }
    
    // 업로드된 파일들을 미디어에 추가
    if (uploadedFiles.length > 0) {
        if (!projectData.media) projectData.media = [];
        uploadedFiles.forEach(file => {
            projectData.media.push(file.data);
        });
    }
    
    if (editingProjectId) {
        // 편집
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData };
        }
    } else {
        // 추가
        const newProject = {
            id: Date.now(),
            ...projectData
        };
        projects.unshift(newProject);
    }
    
    saveProjects();
    renderProjects();
    closeProjectModal();
}

// 프로젝트 삭제
function deleteProject(projectId) {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjects();
        renderProjects();
    }
}

// 프로젝트 편집
function editProject(projectId) {
    openProjectModal(projectId);
}

// 프로젝트 필터링
function filterProjects() {
    renderProjects();
}

// 프로젝트 정렬
function sortProjects() {
    renderProjects();
}

// 프로젝트 렌더링
function renderProjects() {
    const filterValue = projectFilter.value;
    const sortValue = projectSort.value;
    
    let filteredProjects = projects;
    
    // 필터링
    if (filterValue !== 'all') {
        filteredProjects = projects.filter(p => p.type === filterValue);
    }
    
    // 정렬
    filteredProjects.sort((a, b) => {
        switch (sortValue) {
            case 'recent':
                return new Date(b.startDate) - new Date(a.startDate);
            case 'oldest':
                return new Date(a.startDate) - new Date(b.startDate);
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    projectsGrid.innerHTML = filteredProjects.map(project => `
        <div class="project-card bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-slide-up">
            <div class="relative group">
                <img src="${project.image || 'https://via.placeholder.com/300x200/6b7280/ffffff?text=No+Image'}" 
                     alt="${project.name}" 
                     class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                     onerror="this.src='https://via.placeholder.com/300x200/6b7280/ffffff?text=Error'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute top-3 right-3 flex gap-2">
                    <button onclick="editProject(${project.id})" 
                            class="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-200">
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteProject(${project.id})" 
                            class="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200">
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
                <div class="absolute bottom-3 right-3">
                    <button onclick="openProjectDetail(${project.id})" class="px-3 py-1 text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-200">
                        상세보기 →
                    </button>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${project.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    ${formatDate(project.startDate)} - ${project.endDate ? formatDate(project.endDate) : '진행중'}
                </p>
                <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">${project.description}</p>
                <div class="flex justify-between items-center">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(project.type)} backdrop-blur-sm">
                        ${getTypeLabel(project.type)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// 스킬 추가
function addSkill() {
    const skill = newSkillInput.value.trim();
    
    // 유효성 검사
    if (skill && 
        typeof skill === 'string' && 
        skill !== 'object Object' && 
        skill !== '[object Object]' && 
        !skills.includes(skill)) {
        
        skills.push(skill);
        saveSkills();
        renderSkills();
        newSkillInput.value = '';
        console.log('Skill added:', skill);
    } else {
        console.log('Invalid skill or already exists:', skill);
    }
}

// 스킬 삭제
function deleteSkill(skill) {
    console.log('Deleting skill:', skill); // 디버깅용
    console.log('Current skills:', skills); // 디버깅용
    
    const initialLength = skills.length;
    skills = skills.filter(s => s !== skill);
    
    console.log('Skills after filter:', skills); // 디버깅용
    
    if (skills.length < initialLength) {
        saveSkills();
        renderSkills();
        console.log('Skill deleted successfully'); // 디버깅용
    } else {
        console.log('Skill not found or already deleted'); // 디버깅용
    }
}

// 스킬 렌더링
function renderSkills() {
    skillsGrid.innerHTML = skills.map(skill => `
        <div class="skill-tag ${getSkillTagColor(skill)} px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 backdrop-blur-sm animate-scale-in" data-skill="${skill}">
            <span class="font-semibold">${skill}</span>
            <button class="delete-skill-btn transition-all duration-200 hover:scale-110" data-skill="${skill}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
    
    // 삭제 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.delete-skill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const skillToDelete = this.getAttribute('data-skill');
            deleteSkill(skillToDelete);
        });
    });
}

// 유틸리티 함수들
function getTypeBadgeColor(type) {
    const colors = {
        web: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50',
        mobile: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50',
        ai: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50',
        other: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
    };
    return colors[type] || colors.other;
}

function getTypeLabel(type) {
    const labels = {
        web: '웹 개발',
        mobile: '모바일 앱',
        ai: 'AI/ML',
        other: '기타'
    };
    return labels[type] || '기타';
}

function getSkillTagColor(skill) {
    const colorMap = {
        'green': 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50',
        'purple': 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/50 dark:to-violet-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50',
        'pink': 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/50 dark:to-rose-900/50 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-pink-700/50',
        'orange': 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-700/50',
        'blue': 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50',
        'red': 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50',
        'yellow': 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50',
        'indigo': 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50'
    };
    
    const skillColor = skillColors[skill] || 'blue';
    return colorMap[skillColor] || colorMap['blue'];
}

// 프로젝트 상세 페이지 열기
function openProjectDetail(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    document.getElementById('detailProjectTitle').textContent = project.name;
    
    const content = document.getElementById('projectDetailContent');
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">프로젝트 정보</h4>
                <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">기간:</span>
                        <span class="text-gray-900 dark:text-white">${formatDate(project.startDate)} - ${project.endDate ? formatDate(project.endDate) : '진행중'}</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">유형:</span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(project.type)}">${getTypeLabel(project.type)}</span>
                    </div>
                </div>
                
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">프로젝트 설명</h4>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${project.description}</p>
                
                ${project.detail ? `
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">상세 내용</h4>
                <div class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${project.detail}</div>
                ` : ''}
            </div>
            
            <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">미디어</h4>
                <div class="space-y-4">
                    ${project.image ? `
                    <div>
                        <h5 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">썸네일</h5>
                        <img src="${project.image}" alt="${project.name}" class="w-full rounded-lg shadow-md">
                    </div>
                    ` : ''}
                    
                    ${project.media && project.media.length > 0 ? `
                    <div>
                        <h5 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">추가 미디어</h5>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${project.media.map(media => {
                                const isVideo = media.match(/\.(mp4|webm|ogg)$/i);
                                if (isVideo) {
                                    return `<video controls class="w-full rounded-lg shadow-md"><source src="${media}" type="video/mp4">브라우저가 비디오를 지원하지 않습니다.</video>`;
                                } else {
                                    return `<img src="${media}" alt="프로젝트 미디어" class="w-full rounded-lg shadow-md">`;
                                }
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    projectDetailModal.classList.remove('hidden');
    projectDetailModal.classList.add('flex', 'modal-enter');
}

// 프로젝트 상세 페이지 닫기
function closeProjectDetailModal() {
    projectDetailModal.classList.add('hidden');
    projectDetailModal.classList.remove('flex');
}

// 기술 스택 색상 설정 모달 열기
function openSkillColorModal() {
    const settingsContainer = document.getElementById('skillColorSettings');
    settingsContainer.innerHTML = skills.map(skill => `
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span class="font-medium text-gray-900 dark:text-white">${skill}</span>
            <select class="skill-color-select px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" data-skill="${skill}">
                <option value="green" ${skillColors[skill] === 'green' ? 'selected' : ''}>초록색</option>
                <option value="blue" ${skillColors[skill] === 'blue' ? 'selected' : ''}>파란색</option>
                <option value="purple" ${skillColors[skill] === 'purple' ? 'selected' : ''}>보라색</option>
                <option value="pink" ${skillColors[skill] === 'pink' ? 'selected' : ''}>분홍색</option>
                <option value="orange" ${skillColors[skill] === 'orange' ? 'selected' : ''}>주황색</option>
                <option value="red" ${skillColors[skill] === 'red' ? 'selected' : ''}>빨간색</option>
                <option value="yellow" ${skillColors[skill] === 'yellow' ? 'selected' : ''}>노란색</option>
                <option value="indigo" ${skillColors[skill] === 'indigo' ? 'selected' : ''}>남색</option>
            </select>
        </div>
    `).join('');
    
    skillColorModal.classList.remove('hidden');
    skillColorModal.classList.add('flex', 'modal-enter');
    
    // 색상 변경 이벤트 리스너 추가
    document.querySelectorAll('.skill-color-select').forEach(select => {
        select.addEventListener('change', function() {
            const skill = this.getAttribute('data-skill');
            skillColors[skill] = this.value;
        });
    });
}

// 기술 스택 색상 설정 모달 닫기
function closeSkillColorModal() {
    skillColorModal.classList.add('hidden');
    skillColorModal.classList.remove('flex');
}

// 기술 스택 색상 저장
function saveSkillColors() {
    localStorage.setItem('portfolio_skill_colors', JSON.stringify(skillColors));
    renderSkills();
    closeSkillColorModal();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
}

// 데이터 저장
function saveProjects() {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
}

function saveSkills() {
    // 저장 전에 잘못된 데이터 필터링
    const cleanSkills = skills.filter(skill => 
        typeof skill === 'string' && 
        skill.trim() !== '' && 
        skill !== 'object Object' &&
        skill !== '[object Object]'
    );
    localStorage.setItem('portfolio_skills', JSON.stringify(cleanSkills));
}

// 기존 잘못된 데이터 정리
function cleanupInvalidSkills() {
    const savedSkills = localStorage.getItem('portfolio_skills');
    if (savedSkills) {
        try {
            const parsedSkills = JSON.parse(savedSkills);
            const cleanSkills = parsedSkills.filter(skill => 
                typeof skill === 'string' && 
                skill.trim() !== '' && 
                skill !== 'object Object' &&
                skill !== '[object Object]'
            );
            localStorage.setItem('portfolio_skills', JSON.stringify(cleanSkills));
            console.log('Cleaned up invalid skills');
        } catch (error) {
            console.error('Error cleaning up skills:', error);
            localStorage.removeItem('portfolio_skills');
        }
    }
}

// 폼 필드에 name 속성 추가 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const projectNameInput = document.getElementById('projectName');
    const projectStartDateInput = document.getElementById('projectStartDate');
    const projectEndDateInput = document.getElementById('projectEndDate');
    const projectTypeInput = document.getElementById('projectType');
    const projectImageInput = document.getElementById('projectImage');
    const projectDescriptionInput = document.getElementById('projectDescription');
    const projectDetailInput = document.getElementById('projectDetail');
    const projectMediaInput = document.getElementById('projectMedia');
    
    projectNameInput.name = 'projectName';
    projectStartDateInput.name = 'projectStartDate';
    projectEndDateInput.name = 'projectEndDate';
    projectTypeInput.name = 'projectType';
    projectImageInput.name = 'projectImage';
    projectDescriptionInput.name = 'projectDescription';
    projectDetailInput.name = 'projectDetail';
    projectMediaInput.name = 'projectMedia';
    
    // 모달 닫기 버튼 이벤트 리스너
    document.getElementById('closeDetailModal').addEventListener('click', closeProjectDetailModal);
    document.getElementById('closeSkillColorModal').addEventListener('click', closeSkillColorModal);
    document.getElementById('cancelSkillColorBtn').addEventListener('click', closeSkillColorModal);
    document.getElementById('saveSkillColorBtn').addEventListener('click', saveSkillColors);
    
    // 프로필 데이터 로드
    loadProfileData();
});

// 프로필 데이터 로드
function loadProfileData() {
    const savedProfile = localStorage.getItem('portfolio_profile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        Object.keys(profileData).forEach(key => {
            if (profileInputs[key]) {
                profileInputs[key].value = profileData[key];
            }
        });
        saveProfileData(); // 보기 모드 업데이트
    }
} 