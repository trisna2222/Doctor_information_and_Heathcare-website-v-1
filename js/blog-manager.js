/* Relies on window.initialBlogs from blog-data.js */

const BLOG_STORAGE_KEY = 'medicoz_blogs';

// Initialize data if not present
if (!localStorage.getItem(BLOG_STORAGE_KEY)) {
    if (window.initialBlogs) {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(window.initialBlogs));
    }
}

window.getBlogs = () => {
    const blogs = localStorage.getItem(BLOG_STORAGE_KEY);
    return blogs ? JSON.parse(blogs) : (window.initialBlogs || []);
};

window.getBlogById = (id) => {
    const blogs = window.getBlogs();
    return blogs.find(blog => blog.id === id);
};

window.saveBlog = (blog) => {
    const blogs = window.getBlogs();
    const existingIndex = blogs.findIndex(b => b.id === blog.id);

    // If date is missing, add today's date
    if (!blog.date) {
        const date = new Date();
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        blog.date = date.toLocaleDateString('en-GB', options); // e.g., 01 Jan 2026
    }

    // Default comments
    if (!blog.comments) blog.comments = 0;

    if (existingIndex >= 0) {
        blogs[existingIndex] = blog;
    } else {
        blogs.push(blog);
    }

    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogs));
};

window.deleteBlog = (id) => {
    let blogs = window.getBlogs();
    blogs = blogs.filter(b => b.id !== id);
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogs));
};
