/**
 * Odaville Website - Database-Only Content Loader
 * This script handles loading content from the database for the frontend
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Database-ONLY content loader initialized");

  // Use the global API config
  const API = {
    async getBlogs(published = true) {
      try {
        return await window.apiConfig.fetch(`/blog?published=${published}`);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        return [];
      }
    },

    async getBlogById(id) {
      try {
        return await window.apiConfig.fetch(`/blog/${id}`);
      } catch (error) {
        console.error("Error fetching blog:", error);
        return null;
      }
    },

    async getGallery() {
      try {
        return await window.apiConfig.fetch("/gallery");
      } catch (error) {
        console.error("Error fetching gallery:", error);
        return [];
      }
    },
    
    async getProducts(category = null) {
      try {
        const endpoint = category ? `/products?category=${category}` : "/products";
        return await window.apiConfig.fetch(endpoint);
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
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
          ? post.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..."
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
            ? post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + "..."
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

  // Product Manager
  const productManager = {
    productTrack: document.getElementById('productTrack'),
    
    async loadProducts(category = null) {
      if (!this.productTrack) return;
      
      this.productTrack.innerHTML = '<div class="loading-indicator">Loading products...</div>';
      
      try {
        // Get products from API
        const products = await API.getProducts(category);
        
        if (!products || products.length === 0) {
          this.productTrack.innerHTML = '<div class="no-products">No products found</div>';
          return;
        }
        
        // Render products
        this.renderProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
        this.productTrack.innerHTML = '<div class="error">Failed to load products</div>';
      }
    },
    
    renderProducts(products) {
      if (!this.productTrack) return;
      
      this.productTrack.innerHTML = '';
      
      products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = `product-card ${index === 0 ? 'active' : ''}`;
        productCard.setAttribute('data-index', index);
        productCard.setAttribute('data-category', product.category);
        
        productCard.innerHTML = `
          <span class="product-category">${this.getModelName(product.category)}</span>
          <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.title}" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${product.title}</h3>
            <p>${product.subtitle || this.getDescription(product.category, product.title)}</p>
          </div>
        `;
        
        this.productTrack.appendChild(productCard);
      });
      
      // Setup navigation
      this.setupNavigation();
    },
    
    setupNavigation() {
      const prevBtn = document.querySelector('.prev-product');
      const nextBtn = document.querySelector('.next-product');
      
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => this.navigateProducts('prev'));
        nextBtn.addEventListener('click', () => this.navigateProducts('next'));
      }
      
      // Make first card active
      this.setActiveCard(0);
    },
    
    navigateProducts(direction) {
      const cards = document.querySelectorAll('.product-card');
      if (!cards.length) return;
      
      // Find current active card
      let activeIndex = 0;
      cards.forEach((card, index) => {
        if (card.classList.contains('active')) {
          activeIndex = index;
        }
      });
      
      // Calculate new index
      let newIndex;
      if (direction === 'prev') {
        newIndex = activeIndex > 0 ? activeIndex - 1 : cards.length - 1;
      } else {
        newIndex = activeIndex < cards.length - 1 ? activeIndex + 1 : 0;
      }
      
      // Set new active card
      this.setActiveCard(newIndex);
    },
    
    setActiveCard(index) {
      const cards = document.querySelectorAll('.product-card');
      if (!cards.length) return;
      
      // Remove active class from all cards
      cards.forEach(card => card.classList.remove('active'));
      
      // Add active class to selected card
      if (cards[index]) {
        cards[index].classList.add('active');
        
        // Center the active card
        this.centerCard(index);
      }
    },
    
    centerCard(index) {
      const cards = document.querySelectorAll('.product-card');
      if (!cards.length || !this.productTrack) return;
      
      const activeCard = cards[index];
      if (!activeCard) return;
      
      // Calculate position to center the card
      const containerWidth = this.productTrack.parentElement.offsetWidth;
      const cardWidth = activeCard.offsetWidth;
      const cardLeft = activeCard.offsetLeft;
      
      // Calculate center position
      const centerPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      
      // Apply transform
      this.productTrack.style.transform = `translateX(-${centerPosition}px)`;
    },
    
    getModelName(category) {
      const models = {
        'windows': 'SKYLINE',
        'doors': 'CLASSIC',
        'signature': 'CELESTIAL',
        'architectural': 'ELEMENT'
      };
      
      return models[category] || 'PREMIUM';
    },
    
    getDescription(category, title) {
      // Fallback descriptions if subtitle is not provided
      const descriptions = {
        'windows': 'HIGH-QUALITY INSULATED GLASS',
        'doors': 'SUPERIOR DOOR SYSTEM',
        'signature': 'EXCLUSIVE DESIGN SERIES',
        'architectural': 'ARCHITECTURAL ELEMENT'
      };
      
      return descriptions[category] || 'PREMIUM QUALITY PRODUCT';
    }
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
  
  // Category filter functionality for products
  function initProductFilter() {
    const filterButtons = document.querySelectorAll(".filter-tab, .category-button");
    if (!filterButtons.length) return;
    
    filterButtons.forEach((button) => {
      button.addEventListener("click", function() {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        
        const category = this.getAttribute("data-category");
        productManager.loadProducts(category === 'all' ? null : category);
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

      // Initialize products if present
      if (document.getElementById('productTrack')) {
        console.log("Products section found, initializing");
        productManager.loadProducts();
        initProductFilter();
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
  console.log("Starting application with Database-Only approach...");
  initializePage();
});