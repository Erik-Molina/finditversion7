//codigo funcional version 7
export function renderProducts(products, selectedCategories, productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts = {}, loadedProductsPerCategory = {}) {
      // Limpiar el contenedor, incluyendo cualquier paginación previa
      productsContainer.innerHTML = '';
    
      if (!products || products.length === 0) {
        productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
        // Renderizar paginación incluso si no hay productos
        renderPagination(0, categoriesPerPage, currentCategoryPage, productsContainer);
        return;
      }
    
      // Agrupar productos por categoría
      const groupedProducts = {};
      products.forEach(producto => {
        const category = producto.categoria || 'Sin categoría';
        if (!groupedProducts[category]) {
          groupedProducts[category] = [];
        }
        groupedProducts[category].push(producto);
      });
    
      // Obtener categorías únicas y ordenarlas
      const allCategories = Object.keys(groupedProducts).sort();
    
      // Calcular categorías para la página actual
      const startCategory = (currentCategoryPage - 1) * categoriesPerPage;
      const endCategory = startCategory + categoriesPerPage;
      const paginatedCategories = allCategories.slice(startCategory, endCategory);
    
      paginatedCategories.forEach(category => {
        if (selectedCategories.length === 0 || selectedCategories.includes(category)) {
          const label = document.createElement('div');
          label.className = 'category-label-row';
          const count = categoryCounts[category] || 0;
          label.innerHTML = `<span class="category-label">${category} (${count})</span>`;
          productsContainer.appendChild(label);
    
          // Mostrar hasta 10 productos (o más si se han cargado con "Ver más")
          const productsToShow = groupedProducts[category].slice(0, loadedProductsPerCategory[category] || 10);
    
          productsToShow.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card';
    
            const briefDetail = producto.descripcion.length > 50 ? producto.descripcion.substring(0, 50) + '...' : producto.descripcion || 'Sin detalles';
            const isAvailable = producto.stock > 0;
    
            card.innerHTML = `
              <div class="product-badge ${isAvailable ? 'available' : 'sold-out'}">
                ${isAvailable ? 'Disponible' : 'Agotado'}
              </div>
              <div class="product-image-container">
                <img src="${producto.imagenes[0]}" alt="${producto.nombre}" class="product-img" />
                <div class="overlay"></div>
                <button class="view-button" title="Ver producto" data-images='${JSON.stringify(producto.imagenes)}' data-product='${JSON.stringify(producto)}'>
                  <span class="material-icons">visibility</span> Ver detalles
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name-card">${producto.nombre}</h3>
                <p class="product-price-card">L ${producto.precio.toFixed(2)}</p>
                <p class="product-brief">${briefDetail}</p>
                <p class="product-manufacturer"><strong>Marca:</strong> ${producto.fabricante}</p>
              </div>
            `;
    
            productsContainer.appendChild(card);
          });
    
          // Añadir botón "Ver X productos más" si hay más productos
          const totalProductsInCategory = groupedProducts[category].length;
          const loadedCount = loadedProductsPerCategory[category] || 10;
          const remainingProducts = totalProductsInCategory - loadedCount;
          if (remainingProducts > 0) {
            const moreButton = document.createElement('button');
            moreButton.className = 'more-products-btn';
            moreButton.dataset.category = category;
            const buttonText = remainingProducts <= 10 ? `Ver ${remainingProducts} productos más` : 'Ver 10 productos más';
            moreButton.innerHTML = `<span class="material-icons">expand_more</span> ${buttonText}`;
            productsContainer.appendChild(moreButton);
          }
        }
      });
    
      // Renderizar paginación después de los productos
      renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
    }
    
    export function updateCartDisplay(cartItems, modalBodyCarrito) {
      if (!modalBodyCarrito) return;
    
      modalBodyCarrito.innerHTML = '';
    
      if (cartItems.length === 0) {
        modalBodyCarrito.innerHTML = `
          <div class="empty-cart">
            <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Carrito vacío" class="empty-cart-image">
            <p>Tu carrito está vacío</p>
          </div>
        `;
        return;
      }
    
      const total = cartItems.reduce((sum, item) => {
        const priceNum = parseFloat(item.price) || 0;
        return sum + (priceNum * item.quantity);
      }, 0);
    
      cartItems.forEach(item => {
        const priceNum = parseFloat(item.price) || 0;
        const subtotal = priceNum * item.quantity;
    
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>${item.details}</p>
          </div>
          <div class="cart-item-price">Precio: L ${priceNum.toFixed(2)}</div>
          <div class="quantity-control">
            <p style="color:black;">Cantidad</p>
            <button class="btn-decrement">-</button>
            <input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}" data-stock="${item.stock}">
            <button class="btn-increment">+</button>
          </div>
          <div class="cart-item-subtotal">Subtotal: L ${subtotal.toFixed(2)}</div>
          <button class="remove-item" data-id="${item.id}">
            <span class="material-icons">delete</span>
          </button>
        `;
        modalBodyCarrito.appendChild(itemElement);
      });
    
      const footer = document.createElement('div');
      footer.className = 'cart-footer';
      footer.innerHTML = `
        <div class="cart-total">
          <span class="cart-total-label">Total:</span>
          <span class="cart-total-amount">L ${total.toFixed(2)}</span>
        </div>
        <div class="payment-methods">
          <button class="payment-btn online" id="onlinePaymentBtn">
            <span class="material-icons">credit_card</span>
            Pago Online (Transferencia)
          </button>
          <button class="payment-btn cash" id="cashPaymentBtn">
            <span class="material-icons">payments</span>
            Pago en Efectivo
          </button>
        </div>
      `;
      
      modalBodyCarrito.appendChild(footer);
    }
    
    export function openProductImagesModal(images, product) {
      let modal = document.getElementById('productImagesModal');
    
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productImagesModal';
        modal.className = 'modalproduct';
        document.body.appendChild(modal);
      }
    
      const stock = product.stock || 0;
      let quantity = 1;
      const displayImages = images.slice(0, 3);
    
      modal.innerHTML = `
        <div class="modal-content-product">
          <div class="modal-header-product">
            <h2>${product.nombre}</h2>
            <button class="close-modal" id="closeProductImagesModal">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body-product">
            <div class="parent">
              <div class="div1">
                <div class="main-image-container">
                  <img src="${displayImages[0]}" alt="${product.nombre}" class="main-product-img" />
                </div>
                <div class="thumbnail-row">
                  ${displayImages.map((img, idx) => `
                    <img src="${img}" alt="${product.nombre} - Thumbnail ${idx + 1}" class="thumbnail-img" data-index="${idx}" />
                  `).join('')}
                </div>
              </div>
              <div class="div2">
                <h3 class="modal-product-name">${product.nombre}</h3>
                <div class="product-details">
                  <p>${product.descripcion}</p>
                  <p><strong>ID:</strong> ${product.id}</p>
                  <p><strong>Fabricante:</strong> ${product.fabricante}</p>
                </div>
                <div class="price-quantity-row">
                  <p class="product-price">L ${product.precio.toFixed(2)}</p>
                  <div class="quantity-control">
                    <button class="btn-decrement">-</button>
                    <input type="number" class="quantity-input" value="${quantity}" min="1" max="${stock}">
                    <button class="btn-increment">+</button>
                  </div>
                </div>
                <div class="product-actions">
                  <button class="btn-buy-now">Comprar ahora</button>
                  <button class="btn-add-cart">Añadir al carrito</button>
                </div>
                <button class="share-button" title="Compartir" data-productid="${product.id}">
                  <span class="material-icons">share</span> Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    
      return modal;
    }
    
    export function renderCategories(categories, categoriesContainer) {
      categoriesContainer.innerHTML = '';
    
      if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="no-categories">No hay categorías disponibles</p>';
        return;
      }
    
      categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        label.innerHTML = `
          <input type="checkbox" name="category" value="${category}">
          <span>${category}</span>
        `;
        categoriesContainer.appendChild(label);
      });
    }
    
    export function renderPagination(totalCategories, categoriesPerPage, currentCategoryPage, productsContainer) {
      // Eliminar cualquier paginación previa
      const existingPagination = productsContainer.querySelector('.pagination-row');
      if (existingPagination) {
        existingPagination.remove();
      }
    
      const paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination-row';
      const totalPages = Math.ceil(totalCategories / categoriesPerPage);
    
      // Botón Anterior
      const prevButton = document.createElement('button');
      prevButton.className = 'pagination-btn';
      prevButton.innerHTML = '<span class="material-icons">chevron_left</span>';
      prevButton.disabled = currentCategoryPage === 1;
      paginationContainer.appendChild(prevButton);
    
      // Botones de número de página
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentCategoryPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    
      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentCategoryPage ? 'active' : ''}`;
        pageButton.textContent = i;
        paginationContainer.appendChild(pageButton);
      }
    
      // Botón Siguiente
      const nextButton = document.createElement('button');
      nextButton.className = 'pagination-btn';
      nextButton.innerHTML = '<span class="material-icons">chevron_right</span>';
      nextButton.disabled = currentCategoryPage === totalPages;
      paginationContainer.appendChild(nextButton);
    
      productsContainer.appendChild(paginationContainer);
    }