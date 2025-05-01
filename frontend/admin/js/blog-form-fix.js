document.addEventListener("DOMContentLoaded", function() {
    // Use the same API base URL from admin.js
    const API_BASE_URL = window.API_BASE_URL || "http://localhost:5000/api";

    // Initialize TinyMCE
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '#blog-content',
            height: 400,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
            setup: function(editor) {
                editor.on('change', function() {
                    editor.save();
                });
            }
        });
    }

    const blogForm = document.getElementById("blog-post-form");
    const contentTextarea = document.getElementById("blog-content");
    
    if (blogForm && contentTextarea) {
        let isSubmitting = false;
        
        blogForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            if (isSubmitting) return;
            isSubmitting = true;
            
            // Ensure TinyMCE content is synced
            if (typeof tinymce !== 'undefined' && tinymce.get('blog-content')) {
                tinymce.get('blog-content').save();
            }
            
            const formData = new FormData(blogForm);
            const blogId = document.getElementById("blog-id").value;
            const status = document.getElementById("blog-status").value;
            
            // Update the isPublished value based on the status dropdown
            formData.set("isPublished", status === "published");
            
            // Show saving indicator
            const saveBtn = blogForm.querySelector(".save-btn");
            const originalBtnText = saveBtn.textContent;
            saveBtn.textContent = "Saving...";
            saveBtn.disabled = true;
            
            try {
                // Send the API request
                const response = await fetch(
                    blogId ? `${API_BASE_URL}/blog/${blogId}` : `${API_BASE_URL}/blog`,
                    {
                        method: blogId ? "PUT" : "POST",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ message: "Failed to save blog post" }));
                    throw new Error(error.message || `Server error: ${response.status}`);
                }

                const data = await response.json();
                console.log("Blog saved successfully:", data);
                
                saveBtn.textContent = "Saved!";
                setTimeout(() => {
                    saveBtn.textContent = originalBtnText;
                    saveBtn.disabled = false;
                    
                    // Reset form and TinyMCE
                    if (typeof tinymce !== 'undefined' && tinymce.get('blog-content')) {
                        tinymce.get('blog-content').setContent('');
                    }
                    blogForm.reset();
                    
                    // Reload blog posts if functions exist
                    if (typeof loadBlogPosts === 'function') loadBlogPosts();
                    if (typeof initDashboard === 'function') initDashboard();
                    
                    alert(blogId ? "Blog post updated successfully!" : "Blog post created successfully!");
                }, 1500);
            } catch (error) {
                console.error("Error saving blog post:", error);
                saveBtn.textContent = originalBtnText;
                saveBtn.disabled = false;
                alert("Error saving blog post: " + error.message);
            } finally {
                isSubmitting = false;
            }
        });
    }
});