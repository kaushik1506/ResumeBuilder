// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzCaNd1oOPVXozhU-9Z9tAnaZK5Se77Ws",
  authDomain: "resumebuilder-e0acb.firebaseapp.com",
  projectId: "resumebuilder-e0acb",
  storageBucket: "resumebuilder-e0acb.firebasestorage.app",
  messagingSenderId: "836527512975",
  appId: "1:836527512975:web:b2ce8cf5e0d7567a0afffa",
  measurementId: "G-4KVWVL13R7"
};

    // =============================================
    // =========== STATE MANAGEMENT ================
    // =============================================

    // Single source of truth for all resume data
    let resumeData = {
        personal: {
            name: '',
            title: '',
            phone: '',
            email: '',
            linkedin: '',
            github: '',
            summary: '',
            profileImage: ''
        },
        education: [],
        skills: [],
        experience: [],
        projects: [],
        certifications: []
    };

    // =============================================
    // =========== DOM ELEMENT SELECTORS ===========
    // =============================================
    const formColumn = document.getElementById('form-column');
    const previewContent = document.getElementById('resume-preview');
    const allSteps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const profileImageInput = document.getElementById('profile-image');

    // Dynamic list containers
    const eduList = document.getElementById('education-list');
    const skillsList = document.getElementById('skills-list');
    const expList = document.getElementById('experience-list');
    const projectsList = document.getElementById('projects-list');
    const certList = document.getElementById('certifications-list');

    // Add buttons
    const addEduBtn = document.getElementById('add-education');
    const addSkillBtn = document.getElementById('add-skill');
    const addExpBtn = document.getElementById('add-experience');
    const addProjectBtn = document.getElementById('add-project');
    const addCertBtn = document.getElementById('add-certification');

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');

    // Export buttons
    const exportPdfBtn = document.getElementById('export-pdf');
    const uploadS3Btn = document.getElementById('upload-s3');
    const templateBtns = document.querySelectorAll('.template-btn');

    // Feather icons
    feather.replace();

    // =============================================
    // =========== LOCAL STORAGE ===================
    // =============================================

    function saveToLocal() {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }

    function loadFromLocal() {
        const data = localStorage.getItem('resumeData');
        if (data) {
            resumeData = JSON.parse(data);
            // After loading, we need to re-populate the form AND render the preview
            populateForm();
            renderAllFormLists();
            updatePreview();
        }
    }

    // Populate static form fields from resumeData
    function populateForm() {
        document.getElementById('name').value = resumeData.personal.name;
        document.getElementById('title').value = resumeData.personal.title;
        document.getElementById('phone').value = resumeData.personal.phone;
        document.getElementById('email').value = resumeData.personal.email;
        document.getElementById('linkedin').value = resumeData.personal.linkedin;
        document.getElementById('github').value = resumeData.personal.github;
        document.getElementById('summary').value = resumeData.personal.summary;
        // Note: Profile image is not re-populated in the file input for security reasons
    }

    // =============================================
    // =========== FORM STEP NAVIGATION ============
    // =============================================
    let currentStep = 1;

    function showStep(step) {
        allSteps.forEach(s => s.classList.remove('active-step'));
        document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active-step');
        
        // Update button states
        prevBtn.disabled = (step === 1);
        nextBtn.disabled = (step === allSteps.length);
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < allSteps.length) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // =============================================
    // =========== LIVE PREVIEW UPDATE =============
    // =============================================

    // This is the core function that renders the preview
    function updatePreview() {
        const p = resumeData.personal;

        // Helper to generate skill HTML (with progress bar)
        const skillsHTML = resumeData.skills.map(skill => `
            <div class="resume-skill-item">
                <span class="skill-name">${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-bar-inner" style="width: ${skill.rating * 10}%; background-color: var(--primary-color);"></div>
                </div>
            </div>
        `).join('');

        // Helper to generate dynamic list HTML (Edu, Exp, Proj, Cert)
        const listToHTML = (item) => `
            <div class="resume-item">
                <div class="resume-item-header">
                    <div>
                        <h4 class="resume-item-title">${item.title1 || item.degree || item.name}</h4>
                        <h5 class="resume-item-subtitle">${item.title2 || item.school || ''}</h5>
                    </div>
                    <span class="resume-item-date">${item.date || ''}</span>
                </div>
                <div class="resume-item-content">
                    ${item.description ? `<ul>${item.description.split('\n').map(li => `<li>${li}</li>`).join('')}</ul>` : ''}
                </div>
            </div>
        `;
        
        const eduHTML = resumeData.education.map(listToHTML).join('');
        const expHTML = resumeData.experience.map(listToHTML).join('');
        const projHTML = resumeData.projects.map(listToHTML).join('');
        const certHTML = resumeData.certifications.map(listToHTML).join('');
        
        // Profile Picture
        const profilePicHTML = p.profileImage 
            ? `<img src="${p.profileImage}" alt="Profile" class="resume-profile-pic">` 
            : '';

        // Template 2 requires a different structure (sidebar + main)
        // We check the classList of the preview element itself
        if (previewContent.classList.contains('template-2')) {
            previewContent.innerHTML = `
                <aside class="resume-sidebar">
                    ${profilePicHTML}
                    <header class="resume-header">
                        <h1 class="resume-name">${p.name || 'Your Name'}</h1>
                        <h2 class="resume-title">${p.title || 'Your Title'}</h2>
                    </header>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Contact</h3>
                        <div class="resume-contact">
                            ${p.phone ? `<div class="resume-contact-item"><i data-feather="phone"></i> ${p.phone}</div>` : ''}
                            ${p.email ? `<div class="resume-contact-item"><i data-feather="mail"></i> ${p.email}</div>` : ''}
                            ${p.linkedin ? `<div class="resume-contact-item"><i data-feather="linkedin"></i> ${p.linkedin}</div>` : ''}
                            ${p.github ? `<div class="resume-contact-item"><i data-feather="github"></i> ${p.github}</div>` : ''}
                        </div>
                    </section>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Skills</h3>
                        <div class="resume-skills">${skillsHTML}</div>
                    </section>
                </aside>
                <main class="resume-main-content">
                    <section class="resume-section">
                        <h3 class="resume-section-title">Summary</h3>
                        <p>${p.summary.replace(/\n/g, '<br>') || 'Your summary...'}</p>
                    </section>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Experience</h3>
                        ${expHTML}
                    </section>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Projects</h3>
                        ${projHTML}
                    </section>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Education</h3>
                        ${eduHTML}
                    </section>
                    <section class="resume-section">
                        <h3 class="resume-section-title">Certifications</h3>
                        ${certHTML}
                    </section>
                </main>
            `;
        } 
        // Template 3
        else if (previewContent.classList.contains('template-3')) {
            previewContent.innerHTML = `
                <header class="resume-header">
                    <div class="header-left">
                        <h1 class="resume-name">${p.name || 'Your Name'}</h1>
                        <h2 class="resume-title">${p.title || 'Your Title'}</h2>
                    </div>
                    <div class="header-right">
                        ${profilePicHTML}
                        <div class="resume-contact">
                            ${p.phone ? `<div class="resume-contact-item">${p.phone}</div>` : ''}
                            ${p.email ? `<div class="resume-contact-item">${p.email}</div>` : ''}
                            ${p.linkedin ? `<div class="resume-contact-item">${p.linkedin}</div>` : ''}
                            ${p.github ? `<div class="resume-contact-item">${p.github}</div>` : ''}
                        </div>
                    </div>
                </header>
                <section class="resume-section">
                    <h3 class="resume-section-title">Summary</h3>
                    <p>${p.summary.replace(/\n/g, '<br>') || 'Your summary...'}</p>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Skills</h3>
                    <div class="resume-skills">${skillsHTML}</div>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Experience</h3>
                    <div>${expHTML}</div>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Projects</h3>
                    <div>${projHTML}</div>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Education</h3>
                    <div>${eduHTML}</div>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Certifications</h3>
                    <div>${certHTML}</div>
                </section>
            `;
        }
        // Template 1 (Default)
        else {
            previewContent.innerHTML = `
                <header class="resume-header">
                    ${profilePicHTML}
                    <h1 class="resume-name">${p.name || 'Your Name'}</h1>
                    <h2 class="resume-title">${p.title || 'Your Title'}</h2>
                    <div class="resume-contact">
                        ${p.phone ? `<div class="resume-contact-item"><i data-feather="phone"></i> ${p.phone}</div>` : ''}
                        ${p.email ? `<div class="resume-contact-item"><i data-feather="mail"></i> ${p.email}</div>` : ''}
                        ${p.linkedin ? `<div class="resume-contact-item"><i data-feather="linkedin"></i> ${p.linkedin}</div>` : ''}
                        ${p.github ? `<div class="resume-contact-item"><i data-feather="github"></i> ${p.github}</div>` : ''}
                    </div>
                </header>
                <section class="resume-section">
                    <h3 class="resume-section-title">Summary</h3>
                    <p>${p.summary.replace(/\n/g, '<br>') || 'Your summary...'}</p>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Skills</h3>
                    <div class="resume-skills">${skillsHTML}</div>
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Experience</h3>
                    ${expHTML}
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Projects</h3>
                    ${projHTML}
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Education</h3>
                    ${eduHTML}
                </section>
                <section class="resume-section">
                    <h3 class="resume-section-title">Certifications</h3>
                    ${certHTML}
                </section>
            `;
        }
        
        // Re-apply Feather icons after preview update
        feather.replace();
    }


    // =============================================
    // =========== EVENT LISTENERS (Form) ==========
    // =============================================

    // Use event delegation for all form inputs
    formColumn.addEventListener('input', (e) => {
        const target = e.target;
        
        // Handle personal info
        if (target.id in resumeData.personal) {
            resumeData.personal[target.id] = target.value;
        }

        // Handle dynamic fields
        const dynamicEntry = target.closest('.dynamic-entry');
        if (dynamicEntry) {
            const list = dynamicEntry.dataset.list; // e.g., "education"
            const index = dynamicEntry.dataset.index;
            const key = target.dataset.key; // e.g., "degree", "school"
            
            if (list && index && key) {
                resumeData[list][index][key] = target.value;
            }
        }
        
        // Autosave and update preview on every input
        saveToLocal();
        updatePreview();
    });

    // Profile image handler
    profileImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                resumeData.personal.profileImage = event.target.result;
                saveToLocal();
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // =============================================
    // =========== DYNAMIC FORM RENDERING ==========
    // =============================================

    // Re-render all dynamic form lists (used on load)
    function renderAllFormLists() {
        renderEducationList();
        renderSkillList();
        renderExperienceList();
        renderProjectList();
        renderCertificationList();
    }

    // --- Education ---
    function renderEducationList() {
        eduList.innerHTML = '';
        resumeData.education.forEach((edu, index) => {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.dataset.list = 'education';
            entry.dataset.index = index;
            entry.innerHTML = `
                <button type="button" class="btn-remove"><i data-feather="trash-2"></i></button>
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" data-key="degree" value="${edu.degree}" placeholder="e.g., B.S. in Computer Science">
                </div>
                <div class="form-group">
                    <label>School</label>
                    <input type="text" data-key="school" value="${edu.school}" placeholder="e.g., University of Technology">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-key="date" value="${edu.date}" placeholder="e.g., May 2020 - May 2024">
                </div>
            `;
            eduList.appendChild(entry);
        });
        feather.replace();
    }

    addEduBtn.addEventListener('click', () => {
        resumeData.education.push({ degree: '', school: '', date: '' });
        saveToLocal();
        renderEducationList();
    });

    // --- Skills ---
    function renderSkillList() {
        skillsList.innerHTML = '';
        resumeData.skills.forEach((skill, index) => {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.dataset.list = 'skills';
            entry.dataset.index = index;
            entry.innerHTML = `
                <button type="button" class="btn-remove"><i data-feather="trash-2"></i></button>
                <div class="form-group">
                    <label>Skill</label>
                    <input type="text" data-key="name" value="${skill.name}" placeholder="e.g., JavaScript">
                </div>
                <div class="form-group skill-rating">
                    <label>Proficiency</label>
                    <input type="range" data-key="rating" value="${skill.rating}" min="0" max="10" step="1">
                    <span>${skill.rating * 10}%</span>
                </div>
            `;
            skillsList.appendChild(entry);
        });
        feather.replace();
    }

    addSkillBtn.addEventListener('click', () => {
        resumeData.skills.push({ name: '', rating: 5 });
        saveToLocal();
        renderSkillList();
    });

    // --- Experience ---
    function renderExperienceList() {
        expList.innerHTML = '';
        resumeData.experience.forEach((exp, index) => {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.dataset.list = 'experience';
            entry.dataset.index = index;
            entry.innerHTML = `
                <button type="button" class="btn-remove"><i data-feather="trash-2"></i></button>
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" data-key="title1" value="${exp.title1}" placeholder="e.g., Software Engineer Intern">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" data-key="title2" value="${exp.title2}" placeholder="e.g., Tech Corp">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-key="date" value="${exp.date}" placeholder="e.g., June 2023 - Aug 2023">
                </div>
                <div class="form-group">
                    <label>Description (one point per line)</label>
                    <textarea data-key="description" rows="4" placeholder="e.g., Developed a new feature...">${exp.description}</textarea>
                </div>
            `;
            expList.appendChild(entry);
        });
        feather.replace();
    }

    addExpBtn.addEventListener('click', () => {
        resumeData.experience.push({ title1: '', title2: '', date: '', description: '' });
        saveToLocal();
        renderExperienceList();
    });

    // --- Projects ---
    function renderProjectList() {
        projectsList.innerHTML = '';
        resumeData.projects.forEach((proj, index) => {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.dataset.list = 'projects';
            entry.dataset.index = index;
            entry.innerHTML = `
                <button type="button" class="btn-remove"><i data-feather="trash-2"></i></button>
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" data-key="name" value="${proj.name}" placeholder="e.g., Cloud Resume Challenge">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-key="date" value="${proj.date}" placeholder="e.g., Fall 2023">
                </div>
                <div class="form-group">
                    <label>Description (one point per line)</label>
                    <textarea data-key="description" rows="3" placeholder="e.g., Built a serverless app...">${proj.description}</textarea>
                </div>
            `;
            projectsList.appendChild(entry);
        });
        feather.replace();
    }

    addProjectBtn.addEventListener('click', () => {
        resumeData.projects.push({ name: '', date: '', description: '' });
        saveToLocal();
        renderProjectList();
    });

    // --- Certifications ---
    function renderCertificationList() {
        certList.innerHTML = '';
        resumeData.certifications.forEach((cert, index) => {
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.dataset.list = 'certifications';
            entry.dataset.index = index;
            entry.innerHTML = `
                <button type="button" class="btn-remove"><i data-feather="trash-2"></i></button>
                <div class="form-group">
                    <label>Certification Name</label>
                    <input type="text" data-key="name" value="${cert.name}" placeholder="e.g., AWS Certified Cloud Practitioner">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" data-key="date" value="${cert.date}" placeholder="e.g., Oct 2023">
                </div>
            `;
            certList.appendChild(entry);
        });
        feather.replace();
    }

    addCertBtn.addEventListener('click', () => {
        resumeData.certifications.push({ name: '', date: '' });
        saveToLocal();
        renderCertificationList();
    });


    // --- Event delegation for Remove buttons ---
    formColumn.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn) {
            const entry = removeBtn.closest('.dynamic-entry');
            const list = entry.dataset.list;
            const index = parseInt(entry.dataset.index);
            
            // Remove from state
            resumeData[list].splice(index, 1);
            
            // Re-save and re-render
            saveToLocal();
            renderAllFormLists(); // Easiest way to re-render all lists and re-index
            updatePreview();
        }
    });


    // =============================================
    // =========== PREVIEW CONTROLS ================
    // =============================================

    // --- Template Switching ---
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            previewContent.classList.remove('template-1', 'template-2', 'template-3');
            previewContent.classList.add(template);
            
            // Re-render the preview with the new structure
            updatePreview(); 
        });
    });

    // --- Theme Toggling ---
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
    }

    // --- PDF Export ---
    exportPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('resume-preview');
        const opt = {
            margin:       0,
            filename:     `${resumeData.personal.name || 'resume'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Temporarily remove shadow for cleaner PDF
        element.style.boxShadow = 'none';
        
        html2pdf().from(element).set(opt).save().then(() => {
            // Restore shadow after PDF is generated
            element.style.boxShadow = '';
        });
    });

    // --- Firebase Storage Upload ---
const uploadFirebaseBtn = document.getElementById('upload-firebase'); // Use new ID

uploadFirebaseBtn.addEventListener('click', uploadToFirebaseStorage);

async function uploadToFirebaseStorage() {
    const uploadButtonText = uploadFirebaseBtn.innerHTML;
    uploadFirebaseBtn.disabled = true;
    uploadFirebaseBtn.innerHTML = '<i data-feather="loader"></i> Uploading...';
    feather.replace(); // Redraw loading icon

    try {
        // 1. Generate PDF as a blob
        const element = document.getElementById('resume-preview');
        const opt = {
            margin: 0,
            filename: 'resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
        const fileName = `resumes/${resumeData.personal.name.replace(/ /g, '_') || 'user'}_${Date.now()}.pdf`;

        // 2. Create a storage reference
        const storageRef = storage.ref(fileName);

        // 3. Upload the blob
        const uploadTask = await storageRef.put(pdfBlob);

        // 4. Get the public download URL
        const fileUrl = await uploadTask.ref.getDownloadURL();

        alert(`✅ Successfully uploaded!\nShareable Link: ${fileUrl}`);
        console.log('Shareable Link:', fileUrl);
        prompt("Copy your shareable link:", fileUrl); // Show link in a prompt

    } catch (err) {
        console.error('Firebase Upload Error:', err);
        alert('❌ Error uploading to Firebase. Check console and storage rules.');
    } finally {
        // Restore button
        uploadFirebaseBtn.disabled = false;
        uploadFirebaseBtn.innerHTML = uploadButtonText;
        feather.replace();
    }
}
    /*
    async function uploadToS3() {
        try {
            // 1. Load config
            const configResp = await fetch('config.json');
            const config = await configResp.json();
            
            const BUCKET_NAME = config.aws.bucketName;
            const REGION = config.aws.region;

            // 2. Configure AWS SDK (NOT FOR PRODUCTION)
            AWS.config.update({
                region: REGION,
                credentials: new AWS.Credentials({
                    accessKeyId: config.aws.accessKeyId,
                    secretAccessKey: config.aws.secretAccessKey
                })
            });

            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: { Bucket: BUCKET_NAME }
            });

            // 3. Generate PDF as a blob
            const element = document.getElementById('resume-preview');
            const opt = {
                margin: 0,
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
            const fileName = `resumes/${resumeData.personal.name.replace(/ /g, '_') || 'user'}_${Date.now()}.pdf`;

            // 4. Create Upload parameters
            const params = {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: pdfBlob,
                ContentType: 'application/pdf',
                ACL: 'public-read' // Makes the file publicly accessible
            };

            // 5. Upload
            await s3.putObject(params).promise();

            // 6. Show success
            const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileName}`;
            alert(`Successfully uploaded to S3!\nShareable Link: ${fileUrl}`);
            console.log('Shareable Link:', fileUrl);

        } catch (err) {
            console.error('S3 Upload Error:', err);
            alert('Error uploading to S3. Check console for details.\nDid you configure CORS on your S3 bucket?');
        }
    }
    */


    // =============================================
    // =========== INITIALIZE APP ==================
    // =============================================
    
    loadTheme();
    loadFromLocal(); // Load existing data
    showStep(currentStep); // Show the first step
    updatePreview(); // Initial render of preview

});