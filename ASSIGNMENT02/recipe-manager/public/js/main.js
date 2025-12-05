/**
 * Recipe Manager - Main JavaScript File
 * Contains all interactive functionality for the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Recipe Search Enhancement
    const searchForm = document.querySelector('form[action*="/recipes/public"]');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="search"]');
        const categorySelect = searchForm.querySelector('select[name="category"]');
        const difficultySelect = searchForm.querySelector('select[name="difficulty"]');
        
        // Store original form action
        const originalAction = searchForm.action;
        
        // Real-time search suggestions (simplified version)
        searchInput.addEventListener('input', function() {
            if (this.value.length > 2) {
                // In a real app, this would make an API call for suggestions
                showSearchSuggestions(this.value);
            }
        });
        
        // Auto-submit form when filters change
        [categorySelect, difficultySelect].forEach(select => {
            select.addEventListener('change', function() {
                searchForm.submit();
            });
        });
    }
    
    // Recipe Form Enhancements
    const recipeForm = document.querySelector('form[action*="/recipes/add"]') || 
                      document.querySelector('form[action*="/recipes/edit"]');
    
    if (recipeForm) {
        enhanceRecipeForm(recipeForm);
    }
    
    // Dashboard Recipe Filtering
    const filterButtons = document.querySelectorAll('[data-filter]');
    if (filterButtons.length > 0) {
        setupRecipeFiltering();
    }
    
    // Delete Confirmation Enhancement
    const deleteButtons = document.querySelectorAll('[data-bs-target^="#deleteModal"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeTitle = this.closest('tr').querySelector('strong')?.textContent || 
                              this.closest('.card').querySelector('strong')?.textContent;
            
            const modal = document.querySelector(this.dataset.bsTarget);
            if (modal && recipeTitle) {
                modal.querySelector('.modal-body strong').textContent = recipeTitle;
            }
        });
    });
    
    // Save Recipe Functionality
    const saveRecipeButtons = document.querySelectorAll('.save-recipe-btn');
    saveRecipeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeId = this.dataset.recipeId;
            saveRecipeToFavorites(recipeId, this);
        });
    });
    
    // Print Recipe Functionality
    const printButtons = document.querySelectorAll('.print-recipe-btn');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.print();
        });
    });
    
    // Share Recipe Functionality
    const shareButtons = document.querySelectorAll('.share-recipe-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeUrl = window.location.href;
            const recipeTitle = document.querySelector('h1')?.textContent || 'Check out this recipe!';
            
            if (navigator.share) {
                navigator.share({
                    title: recipeTitle,
                    text: 'Found this amazing recipe on Recipe Manager!',
                    url: recipeUrl
                });
            } else {
                // Fallback: Copy to clipboard
                copyToClipboard(recipeUrl);
                showToast('Link copied to clipboard!');
            }
        });
    });
    
    // Image Upload Preview (if file input exists)
    const imageUploadInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.querySelector('.image-preview') || 
                                   createImagePreview();
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Character Counters for Textareas
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        const counter = document.createElement('small');
        counter.className = 'char-counter text-muted float-end';
        counter.textContent = `0/${maxLength}`;
        
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        
        textarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.remove('text-warning');
            }
            
            if (currentLength > maxLength) {
                counter.classList.add('text-danger');
                this.classList.add('is-invalid');
            } else {
                counter.classList.remove('text-danger');
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Form Validation Enhancement
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Scroll to first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    firstInvalid.focus();
                }
            }
            
            form.classList.add('was-validated');
        });
    });
    
    // Auto-save Draft for Recipe Form
    let autoSaveTimer;
    const recipeTitleInput = document.querySelector('#title');
    const recipeDescInput = document.querySelector('#description');
    
    if (recipeTitleInput && recipeDescInput) {
        [recipeTitleInput, recipeDescInput].forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(saveDraft, 2000);
            });
        });
        
        // Load draft on page load
        loadDraft();
    }
    
    // Tab Persistence
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function() {
            localStorage.setItem('activeTab', this.getAttribute('href'));
        });
    });
    
    // Restore active tab
    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        const tabElement = document.querySelector(`[href="${activeTab}"]`);
        if (tabElement) {
            new bootstrap.Tab(tabElement).show();
        }
    }
});

// Helper Functions

function enhanceRecipeForm(form) {
    // Add ingredient/instruction dynamically
    const ingredientsTextarea = form.querySelector('#ingredients');
    const instructionsTextarea = form.querySelector('#instructions');
    
    if (ingredientsTextarea) {
        const addIngredientBtn = createAddButton('Add Ingredient', ingredientsTextarea);
        addIngredientBtn.addEventListener('click', function() {
            addLineToTextarea(ingredientsTextarea, '');
        });
    }
    
    if (instructionsTextarea) {
        const addInstructionBtn = createAddButton('Add Instruction Step', instructionsTextarea);
        addInstructionBtn.addEventListener('click', function() {
            addLineToTextarea(instructionsTextarea, '');
        });
    }
    
    // Cooking time calculator
    const cookingTimeInput = form.querySelector('#cookingTime');
    if (cookingTimeInput) {
        const timeCalculator = document.createElement('div');
        timeCalculator.className = 'time-calculator mt-2';
        timeCalculator.innerHTML = `
            <small class="text-muted">Quick set: </small>
            <button type="button" class="btn btn-sm btn-outline-success" data-time="15">15m</button>
            <button type="button" class="btn btn-sm btn-outline-success" data-time="30">30m</button>
            <button type="button" class="btn btn-sm btn-outline-success" data-time="45">45m</button>
            <button type="button" class="btn btn-sm btn-outline-success" data-time="60">1h</button>
        `;
        
        cookingTimeInput.parentNode.appendChild(timeCalculator);
        
        timeCalculator.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                cookingTimeInput.value = this.dataset.time;
                cookingTimeInput.dispatchEvent(new Event('change'));
            });
        });
    }
}

function createAddButton(text, afterElement) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-success mt-2';
    button.innerHTML = `<i class="fas fa-plus me-1"></i>${text}`;
    afterElement.parentNode.insertBefore(button, afterElement.nextSibling);
    return button;
}

function addLineToTextarea(textarea, defaultValue = '') {
    const currentValue = textarea.value;
    const newValue = currentValue + (currentValue ? '\n' : '') + defaultValue;
    textarea.value = newValue;
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
    textarea.scrollTop = textarea.scrollHeight;
}

function setupRecipeFiltering() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const recipeRows = document.querySelectorAll('tbody tr[data-visibility]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Show/hide rows with animation
            recipeRows.forEach((row, index) => {
                setTimeout(() => {
                    if (filter === 'all' || row.dataset.visibility === filter) {
                        row.style.display = '';
                        row.classList.add('fade-in');
                    } else {
                        row.style.display = 'none';
                    }
                }, index * 50); // Staggered animation
            });
            
            // Update count display
            const visibleCount = filter === 'all' ? 
                recipeRows.length : 
                Array.from(recipeRows).filter(row => row.dataset.visibility === filter).length;
            
            updateRecipeCount(visibleCount);
        });
    });
}

function updateRecipeCount(count) {
    let countDisplay = document.querySelector('.recipe-count');
    if (!countDisplay) {
        countDisplay = document.createElement('span');
        countDisplay.className = 'recipe-count badge bg-success ms-2';
        document.querySelector('h2')?.appendChild(countDisplay);
    }
    countDisplay.textContent = `${count} recipes`;
}

function showSearchSuggestions(query) {
    // In a real implementation, this would make an API call
    console.log('Search suggestions for:', query);
    // For now, we'll just show a placeholder
}

function saveRecipeToFavorites(recipeId, button) {
    // Toggle save state
    const isSaved = button.classList.contains('btn-success');
    
    if (isSaved) {
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-success');
        button.innerHTML = '<i class="far fa-heart me-1"></i>Save';
        showToast('Removed from favorites');
    } else {
        button.classList.remove('btn-outline-success');
        button.classList.add('btn-success');
        button.innerHTML = '<i class="fas fa-heart me-1"></i>Saved';
        showToast('Added to favorites!');
    }
    
    // In a real app, make API call to save/unsave
    // fetch(`/api/recipes/${recipeId}/favorite`, { method: 'POST' })
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function createImagePreview() {
    const preview = document.createElement('img');
    preview.className = 'image-preview img-fluid rounded mt-2';
    preview.style.maxHeight = '200px';
    preview.style.display = 'none';
    
    const uploadContainer = document.querySelector('.image-upload-container');
    if (uploadContainer) {
        uploadContainer.appendChild(preview);
    }
    
    return preview;
}

function saveDraft() {
    const draft = {
        title: document.querySelector('#title')?.value || '',
        description: document.querySelector('#description')?.value || '',
        ingredients: document.querySelector('#ingredients')?.value || '',
        instructions: document.querySelector('#instructions')?.value || '',
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('recipeDraft', JSON.stringify(draft));
    showToast('Draft saved locally', 'info');
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem('recipeDraft'));
    if (draft) {
        // Ask user if they want to load draft
        if (confirm('You have a saved draft. Would you like to load it?')) {
            document.querySelector('#title').value = draft.title || '';
            document.querySelector('#description').value = draft.description || '';
            document.querySelector('#ingredients').value = draft.ingredients || '';
            document.querySelector('#instructions').value = draft.instructions || '';
            showToast('Draft loaded', 'info');
        }
    }
}

// Form submission handler to clear draft
window.addEventListener('beforeunload', function() {
    const form = document.querySelector('form[action*="/recipes/add"]') || 
                 document.querySelector('form[action*="/recipes/edit"]');
    if (form) {
        const formData = new FormData(form);
        const hasData = Array.from(formData.values()).some(value => value.trim() !== '');
        
        if (!hasData) {
            localStorage.removeItem('recipeDraft');
        }
    }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enhanceRecipeForm,
        setupRecipeFiltering,
        saveRecipeToFavorites,
        copyToClipboard,
        showToast
    };
}