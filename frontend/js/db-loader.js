/**
 * Odaville Website - Strict Database-Only Content Loader
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Database-ONLY content loader initialized");

  // API configuration with retry logic
  const API = {
    baseUrl: "http://localhost:5000/api",

    // Fetch with retry logic
    async fetch(endpoint, options = {}) {
      const url = this.baseUrl + endpoint;
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          console.log(`Fetching from API (attempt ${retryCount + 1}): ${url}`);

          const response = await fetch(url, {
            ...options,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(options.headers || {}),
            },
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
          }

          const data = await response.json();
          console.log(
            `Successfully loaded from database: ${endpoint} - ${
              Array.isArray(data) ? data.length : 1
            } items`
          );
          return data;
        } catch (error) {
          retryCount++;
          console.error(
            `API fetch attempt ${retryCount} failed:`,
            error.message
          );

          if (retryCount >= maxRetries) {
            console.error(
              `All ${maxRetries} attempts failed. Returning empty data.`
            );
            // Return empty data structure based on endpoint
            if (endpoint.includes("/blog")) {
              return endpoint.includes("?") ? [] : null;
            } else if (endpoint.includes("/gallery")) {
              return [];
            }
            return null;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * Math.pow(2, retryCount))
          );
        }
      }
    },

    // Convenience methods
    async getBlogs(published = false) {
      return this.fetch("/blog", { params: { published } });
    },

    async getBlogById(id) {
      return this.fetch(`/blog/${id}`);
    },

    async getGallery() {
      return this.fetch("/gallery");
    },
  };

  // Gallery Manager
  const galleryManager = {
    galleryContainer: document.querySelector(".gallery-grid"),

    async loadGalleryItems(category = null) {
      if (!this.galleryContainer) {
        console.warn("Gallery container not found on this page");
        return;
      }

      this.galleryContainer.innerHTML =
        '<div class="gallery-loading">Loading gallery items from database...</div>';

      try {
        // Get gallery items strictly from database
        const items = await API.getGallery();

        if (!items || items.length === 0) {
          this.galleryContainer.innerHTML =
            '<div class="no-items">No gallery items found in database</div>';
          return;
        }

        // Filter by category
        const filteredItems =
          category && category !== "all"
            ? items.filter((item) => item.category === category)
            : items;

        if (filteredItems.length === 0) {
          this.galleryContainer.innerHTML =
            '<div class="no-items">No items found in this category</div>';
          return;
        }

        // Clear container
        this.galleryContainer.innerHTML = "";

        // Render each gallery item
        filteredItems.forEach((item) => {
          const isLarge = item.isFeatured;
          const galleryItem = document.createElement("div");
          galleryItem.className = `gallery-grid-item${isLarge ? " large" : ""}`;

          // Set height based on featured status
          galleryItem.style.height = isLarge ? "450px" : "300px";

          galleryItem.innerHTML = `
                        <img src="${item.imageUrl}" alt="${item.title}" 
                             onerror="this.onerror=null; this.src='./images/fallback.jpg';">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">
                                <h3>${item.title}</h3>
                                <p>${item.description || ""}</p>
                            </div>
                        </div>
                    `;

          this.galleryContainer.appendChild(galleryItem);
        });

        // Initialize hover effects
        this.initGalleryEffects();

        console.log("Gallery items loaded successfully from database");
      } catch (error) {
        console.error("Error loading gallery items:", error);
        this.galleryContainer.innerHTML =
          '<div class="error">Failed to load gallery items from database</div>';
      }
    },

    initGalleryEffects() {
      document.querySelectorAll(".gallery-grid-item").forEach((item) => {
        item.addEventListener("mouseenter", function () {
          const overlay = this.querySelector(".gallery-overlay");
          const caption = this.querySelector(".gallery-caption");

          if (overlay) overlay.style.opacity = "1";
          if (caption) caption.style.transform = "translateY(0)";
        });

        item.addEventListener("mouseleave", function () {
          const overlay = this.querySelector(".gallery-overlay");
          const caption = this.querySelector(".gallery-caption");

          if (overlay) overlay.style.opacity = "0";
          if (caption) caption.style.transform = "translateY(20px)";
        });
      });
    },
  };

  // Blog Manager
  const blogManager = {
    blogContainer: document.querySelector(".blog-posts-container"),
    blogPagination: document.querySelector(".blog-pagination"),
    recentBlogContainer: document.querySelector(".recent-blog-posts"),
    blogDetailContainer: document.querySelector(".blog-detail-container"),
    postsPerPage: 6,
    currentPage: 1,

    async loadBlogPosts(page = 1, category = null) {
      const container = this.blogContainer || this.recentBlogContainer;

      if (!container) {
        console.warn("Blog container not found on this page");
        return;
      }

      container.innerHTML =
        '<div class="blog-loading">Loading blog posts from database...</div>';

      try {
        // Always get published posts only for public website
        const posts = await API.getBlogs(true);

        if (!posts || posts.length === 0) {
          container.innerHTML =
            '<div class="no-posts">No published blog posts found in database</div>';
          return;
        }

        // Filter by category
        let filteredPosts =
          category && category !== "all"
            ? posts.filter((post) => post.category === category)
            : posts;

        // Sort by date (newest first)
        filteredPosts.sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt) -
            new Date(a.publishedAt || a.createdAt)
        );

        // Pagination or limit for recent posts
        const postsToShow = this.recentBlogContainer
          ? filteredPosts.slice(0, 3)
          : filteredPosts.slice(
              (page - 1) * this.postsPerPage,
              page * this.postsPerPage
            );

        if (postsToShow.length === 0) {
          container.innerHTML =
            '<div class="no-posts">No posts found in this category</div>';
          return;
        }

        // Render posts
        this.renderBlogPosts(postsToShow, container);

        // Render pagination if on blog page
        if (this.blogPagination && this.blogContainer) {
          this.renderPagination(filteredPosts.length, page);
        }
      } catch (error) {
        console.error("Error loading blog posts:", error);
        container.innerHTML =
          '<div class="error">Failed to load blog posts from database</div>';
      }
    },

    renderBlogPosts(posts, container) {
      container.innerHTML = "";

      posts.forEach((post) => {
        const postDate = new Date(post.publishedAt || post.createdAt);
        const formattedDate = postDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const excerpt = post.content
          ? post.content.substring(0, 150) + "..."
          : "No content available";

        const blogPost = document.createElement("article");
        blogPost.className = "blog-post animate-on-scroll";

        blogPost.innerHTML = `
                    <div class="blog-post-image">
                        <img src="${post.imageUrl}" alt="${post.title}"
                             onerror="this.onerror=null; this.src='./images/fallback.jpg';">
                    </div>
                    <div class="blog-post-content">
                        <div class="blog-post-date">${formattedDate}</div>
                        <h3 class="blog-post-title">${post.title}</h3>
                        <div class="blog-post-excerpt">${excerpt}</div>
                        <a href="blog-detail.html?slug=${post._id}" class="blog-post-link">Read More</a>
                    </div>
                `;

        container.appendChild(blogPost);
      });

      // Initialize animations
      initScrollAnimations();
    },

    renderPagination(totalPosts, currentPage) {
      if (!this.blogPagination) return;

      const totalPages = Math.ceil(totalPosts / this.postsPerPage);

      if (totalPages <= 1) {
        this.blogPagination.style.display = "none";
        return;
      }

      this.blogPagination.style.display = "flex";
      this.blogPagination.innerHTML = "";

      // Previous button
      const prevButton = document.createElement("a");
      prevButton.href = "#";
      prevButton.className = `pagination-button prev ${
        currentPage === 1 ? "disabled" : ""
      }`;
      prevButton.innerHTML = "&laquo; Previous";
      if (currentPage > 1) {
        prevButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.loadBlogPosts(currentPage - 1);
        });
      }
      this.blogPagination.appendChild(prevButton);

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        if (
          totalPages > 5 &&
          i > 2 &&
          i < totalPages - 1 &&
          Math.abs(i - currentPage) > 1
        ) {
          if (i === 3 && currentPage > 4) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "...";
            this.blogPagination.appendChild(ellipsis);
          }
          continue;
        }

        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.className = `pagination-number ${
          i === currentPage ? "active" : ""
        }`;
        pageLink.textContent = i;

        if (i !== currentPage) {
          pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            this.loadBlogPosts(i);
          });
        }

        this.blogPagination.appendChild(pageLink);

        if (i === 2 && totalPages > 5 && currentPage < totalPages - 3) {
          const ellipsis = document.createElement("span");
          ellipsis.className = "pagination-ellipsis";
          ellipsis.textContent = "...";
          this.blogPagination.appendChild(ellipsis);
        }
      }

      // Next button
      const nextButton = document.createElement("a");
      nextButton.href = "#";
      nextButton.className = `pagination-button next ${
        currentPage === totalPages ? "disabled" : ""
      }`;
      nextButton.innerHTML = "Next &raquo;";
      if (currentPage < totalPages) {
        nextButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.loadBlogPosts(currentPage + 1);
        });
      }
      this.blogPagination.appendChild(nextButton);
    },

    async loadBlogPostDetail() {
      if (!this.blogDetailContainer) return;

      // Get post slug/id from URL
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get("slug");

      if (!slug) {
        this.blogDetailContainer.innerHTML =
          '<div class="error">Blog post ID not found in URL</div>';
        return;
      }

      this.blogDetailContainer.innerHTML =
        '<div class="blog-loading">Loading blog post from database...</div>';

      try {
        // Get blog post by ID strictly from database
        const post = await API.getBlogById(slug);

        if (!post) {
          this.blogDetailContainer.innerHTML =
            '<div class="error">Blog post not found in database</div>';
          return;
        }

        // Update page title
        document.title = `${post.title} - Odaville`;

        // Format date
        const postDate = new Date(post.publishedAt || post.createdAt);
        const formattedDate = postDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Render blog post
        this.blogDetailContainer.innerHTML = `
                    <div class="blog-detail-header">
                        <h1 class="blog-detail-title">${post.title}</h1>
                        <div class="blog-detail-meta">
                            <span class="blog-detail-date">${formattedDate}</span>
                            <span class="blog-detail-author">by ${
                              post.author
                            }</span>
                            <div class="blog-detail-categories">
                                <span class="category-tag">${
                                  post.category || "Uncategorized"
                                }</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="blog-detail-featured-image">
                        <img src="${post.imageUrl}" alt="${post.title}"
                             onerror="this.onerror=null; this.src='./images/fallback.jpg';">
                    </div>
                    
                    <div class="blog-detail-content">
                        ${post.content}
                    </div>
                    
                    <div class="blog-detail-footer">
                        <div class="share-buttons">
                            <span>Share this post:</span>
                            <a href="https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              window.location.href
                            )}" target="_blank" class="share-button facebook">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(
                              window.location.href
                            )}&text=${encodeURIComponent(
          post.title
        )}" target="_blank" class="share-button twitter">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                              window.location.href
                            )}&title=${encodeURIComponent(
          post.title
        )}" target="_blank" class="share-button linkedin">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                        </div>
                        
                        <a href="blog.html" class="back-to-blog">← Back to Blog</a>
                    </div>
                `;

        // Load related posts
        this.loadRelatedPosts(post);
      } catch (error) {
        console.error("Error loading blog post detail:", error);
        this.blogDetailContainer.innerHTML =
          '<div class="error">Failed to load blog post from database</div>';
      }
    },

    async loadRelatedPosts(currentPost) {
      const relatedContainer = document.querySelector(".related-posts");
      if (!relatedContainer) return;

      try {
        // Get all published blog posts to find related ones
        const posts = await API.getBlogs(true);

        if (!posts || posts.length === 0) {
          relatedContainer.innerHTML =
            '<div class="no-posts">No related posts found</div>';
          return;
        }

        // Find posts in the same category, excluding current post
        let relatedPosts = posts.filter(
          (post) =>
            post.category === currentPost.category &&
            post._id !== currentPost._id
        );

        // If not enough related posts, add recent posts
        if (relatedPosts.length < 3) {
          const recentPosts = posts.filter(
            (post) =>
              post._id !== currentPost._id &&
              !relatedPosts.some((rp) => rp._id === post._id)
          );

          // Sort by date (newest first)
          recentPosts.sort(
            (a, b) =>
              new Date(b.publishedAt || b.createdAt) -
              new Date(a.publishedAt || a.createdAt)
          );

          // Add recent posts until we have 3 related posts
          relatedPosts = [
            ...relatedPosts,
            ...recentPosts.slice(0, 3 - relatedPosts.length),
          ];
        }

        // Render up to 3 related posts
        relatedContainer.innerHTML = "";

        relatedPosts.slice(0, 3).forEach((post) => {
          const postDate = new Date(post.publishedAt || post.createdAt);
          const formattedDate = postDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const excerpt = post.content
            ? post.content.substring(0, 100) + "..."
            : "No content available";

          const postElement = document.createElement("article");
          postElement.className = "blog-post";

          postElement.innerHTML = `
                        <div class="blog-post-image">
                            <img src="${post.imageUrl}" alt="${post.title}"
                                 onerror="this.onerror=null; this.src='./images/fallback.jpg';">
                        </div>
                        <div class="blog-post-content">
                            <div class="blog-post-date">${formattedDate}</div>
                            <h3 class="blog-post-title">${post.title}</h3>
                            <div class="blog-post-excerpt">${excerpt}</div>
                            <a href="blog-detail.html?slug=${post._id}" class="blog-post-link">Read More</a>
                        </div>
                    `;

          relatedContainer.appendChild(postElement);
        });
      } catch (error) {
        console.error("Error loading related posts:", error);
        relatedContainer.innerHTML =
          '<div class="error">Failed to load related posts</div>';
      }
    },
  };

  // Helper function for animations
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <=
          (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    }

    function handleScroll() {
      animatedElements.forEach((element) => {
        if (isInViewport(element) && !element.classList.contains("visible")) {
          element.classList.add("visible");
        }
      });
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }

  // Category filter functionality for blog
  function initBlogFilter() {
    const filterButtons = document.querySelectorAll(".filter-button");
    if (!filterButtons.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const category = this.getAttribute("data-category");
        blogManager.loadBlogPosts(1, category);
      });
    });
  }

  // Category filter functionality for gallery
  function initGalleryFilter() {
    const filterButtons = document.querySelectorAll(".gallery-filter-button");
    if (!filterButtons.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const category = this.getAttribute("data-category");
        galleryManager.loadGalleryItems(category);
      });
    });
  }

  // Initialize based on current page
  function initializePage() {
    const path = window.location.pathname;
    console.log(`Initializing page with path: ${path}`);

    if (path.includes("blog-detail.html")) {
      console.log("Loading blog detail page");
      blogManager.loadBlogPostDetail();
    } else if (path.includes("blog.html")) {
      console.log("Loading blog listing page");
      blogManager.loadBlogPosts();
      initBlogFilter();
    } else {
      // Home page or other pages
      console.log("Initializing gallery and recent blog posts");

      // Initialize gallery if present
      if (document.querySelector(".gallery-grid")) {
        console.log("Gallery container found, initializing");
        galleryManager.loadGalleryItems();
        initGalleryFilter();
      }

      // If recent blog posts section exists on homepage
      const recentBlogContainer = document.querySelector(".recent-blog-posts");
      if (recentBlogContainer) {
        console.log("Recent blog container found, initializing");
        blogManager.recentBlogContainer = recentBlogContainer;
        blogManager.loadBlogPosts();
      }
    }

    initScrollAnimations();
  }

  // Start the application
  console.log("Starting application with STRICT Database-Only approach...");
  initializePage();
});
