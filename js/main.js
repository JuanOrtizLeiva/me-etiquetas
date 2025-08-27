// Estado global
let currentSection = 'nosotros';
let currentFilter = 'todos';
let carouselIntervals = {};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    showSection('nosotros');
});

// Navegación entre secciones
function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    document.getElementById(section).classList.add('active');
    
    // Actualizar tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target?.classList.add('active');
    
    currentSection = section;
    
    // Si es productos, renderizar
    if (section === 'productos') {
        renderProducts();
    }
}

// Cargar productos
function loadProducts() {
    if (typeof catalogoProductos === 'undefined') {
        console.error('No se encontraron productos');
        return;
    }
}

// Renderizar productos
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    // Limpiar intervalos existentes
    Object.values(carouselIntervals).forEach(interval => clearInterval(interval));
    carouselIntervals = {};
    
    let productos = catalogoProductos.productos;
    
    // Filtrar por categoría
    if (currentFilter !== 'todos') {
        productos = productos.filter(p => p.categoria === currentFilter);
    }
    
    // Filtrar por búsqueda
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        productos = productos.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm)
        );
    }
    
    if (productos.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem;">No se encontraron productos</p>';
        return;
    }
    
    grid.innerHTML = productos.map(producto => {
        const hasMultipleImages = producto.imagenes_web && producto.imagenes_web.length > 1;
        
        return `
        <div class="product-card" data-product-id="${producto.id}" onclick="showProductModal('${producto.id}')">
            <div class="product-carousel">
                ${producto.imagenes_web ? producto.imagenes_web.map((img, index) => `
                    <img src="${img}" 
                         alt="${producto.nombre}" 
                         class="carousel-image ${index === 0 ? 'active' : ''}"
                         loading="lazy"
                         onerror="this.src='img/placeholder.jpg'">
                `).join('') : `<img src="img/placeholder.jpg" alt="${producto.nombre}" class="carousel-image active">`}
                
                ${hasMultipleImages ? `
                    <div class="carousel-controls">
                        <button class="carousel-btn" onclick="event.stopPropagation(); prevImage('${producto.id}')">‹</button>
                        <button class="carousel-btn" onclick="event.stopPropagation(); nextImage('${producto.id}')">›</button>
                    </div>
                    <div class="carousel-indicators">
                        ${producto.imagenes_web.map((_, index) => `
                            <span class="indicator ${index === 0 ? 'active' : ''}" 
                                  onclick="event.stopPropagation(); goToImage('${producto.id}', ${index})"></span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion || 'Consulte por este producto'}</p>
                <button class="product-action" onclick="event.stopPropagation(); showProductModal('${producto.id}')">
                    Ver Descripción
                </button>
            </div>
        </div>
    `}).join('');
    
    // Iniciar carruseles
    productos.forEach(producto => {
        if (producto.imagenes_web && producto.imagenes_web.length > 1) {
            startCarousel(producto.id);
        }
    });
}

// Funciones del carrusel
function nextImage(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    const images = card.querySelectorAll('.carousel-image');
    const indicators = card.querySelectorAll('.indicator');
    
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    images[currentIndex].classList.remove('active');
    indicators[currentIndex]?.classList.remove('active');
    
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add('active');
    indicators[currentIndex]?.classList.add('active');
}

function prevImage(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    const images = card.querySelectorAll('.carousel-image');
    const indicators = card.querySelectorAll('.indicator');
    
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    images[currentIndex].classList.remove('active');
    indicators[currentIndex]?.classList.remove('active');
    
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    images[currentIndex].classList.add('active');
    indicators[currentIndex]?.classList.add('active');
}

function goToImage(productId, index) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    const images = card.querySelectorAll('.carousel-image');
    const indicators = card.querySelectorAll('.indicator');
    
    images.forEach(img => img.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    images[index]?.classList.add('active');
    indicators[index]?.classList.add('active');
}

function startCarousel(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    
    carouselIntervals[productId] = setInterval(() => {
        if (!card.matches(':hover')) {
            nextImage(productId);
        }
    }, 3000);
}

// Mostrar modal de producto
function showProductModal(productoId) {
    const producto = catalogoProductos.productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const modal = document.getElementById('descriptionModal');
    
    // Actualizar contenido
    document.getElementById('modalTitle').textContent = producto.nombre;
    document.getElementById('modalDescription').textContent = producto.descripcion || 'Consulte por más información sobre este producto.';
    
    // Actualizar link de WhatsApp
    const whatsappLink = document.getElementById('modalWhatsApp');
    const message = encodeURIComponent(`Hola, me interesa el producto: ${producto.nombre}`);
    whatsappLink.href = `https://wa.me/56997371743?text=${message}`;
    
    // Mostrar modal
    modal.classList.add('active');
}

// Cerrar modal
function closeModal() {
    document.getElementById('descriptionModal').classList.remove('active');
}

// Filtrar productos
function filterProducts(categoria) {
    currentFilter = categoria;
    
    // Actualizar botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderProducts();
}

// Buscar productos
function searchProducts() {
    renderProducts();
}

// Event listeners
function setupEventListeners() {
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('descriptionModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Prevenir scroll al top en enlaces #
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', e => e.preventDefault());
    });
}