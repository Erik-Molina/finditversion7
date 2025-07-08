//codigo funcional version 7
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
    import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
    import { renderProducts, updateCartDisplay, openProductImagesModal, renderCategories, renderPagination } from './structure.js';
    
    // Configuración de Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyBJi-ve8Z1v6IGaa-4F0135AIAabdISPx8",
      authDomain: "sajsajndhbshaihbaksjsdnsjahius.firebaseapp.com",
      projectId: "sajsajndhbshaihbaksjsdnsjahius",
      storageBucket: "sajsajndhbshaihbaksjsdnsjahius.firebasestorage.app",
      messagingSenderId: "923009709693",
      appId: "1:923009709693:web:abde872e5878909b556314",
      measurementId: "G-NG78JB2DLE"
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    // Seleccionar elementos del DOM
    const productsContainer = document.getElementById('productsContainer');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const rubroInputs = document.querySelectorAll('input[name="rubro"]');
    const cartModal = document.getElementById('cartModal');
    const modalBodyCarrito = cartModal ? cartModal.querySelector('.modal-body-carrito') : null;
    
    // Variables globales
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let currentCategoryPage = 1;
    const categoriesPerPage = 10;
    let loadedProductsPerCategory = {};
    
    // Función para sanitizar el nombre del producto para la URL
    function sanitizeProductName(name) {
      return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();
    }
    
    // Función para guardar el carrito en localStorage
    function saveCartToStorage() {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    // Función para mostrar notificación
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
    
    // Función para agregar producto al carrito
    function addToCart(productData) {
      const existingItem = cartItems.find(item => item.name === productData.name);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + productData.quantity;
        if (newQuantity <= productData.stock) {
          existingItem.quantity = newQuantity;
        } else {
          existingItem.quantity = productData.stock;
          showNotification('Cantidad limitada por stock disponible');
        }
      } else {
        cartItems.push({
          ...productData,
          id: Date.now() // ID único para cada producto en el carrito
        });
      }
      
      saveCartToStorage();
      updateCartDisplay(cartItems, modalBodyCarrito);
      showNotification('Producto añadido al carrito');
    }
    
    // Función para abrir el modal del carrito
    function openCartModal() {
      if (cartModal) {
        cartModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateCartDisplay(cartItems, modalBodyCarrito);
      }
    }
    
    // Función para cerrar el modal del carrito
    function closeCartModalHandler() {
      if (cartModal) {
        cartModal.classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    }
    
    // Función para configurar eventos del modal de producto
    function setupModalEventListeners(modal, images, product) {
      const mainImage = modal.querySelector('.main-product-img');
      const thumbnails = modal.querySelectorAll('.thumbnail-img');
      const quantityInput = modal.querySelector('.quantity-input');
      const decrementBtn = modal.querySelector('.btn-decrement');
      const incrementBtn = modal.querySelector('.btn-increment');
      const addToCartButton = modal.querySelector('.btn-add-cart');
      const buyNowButton = modal.querySelector('.btn-buy-now');
      const shareButton = modal.querySelector('.share-button');
      const closeButton = modal.querySelector('#closeProductImagesModal');
    
      let currentIndex = 0;
      const stock = product.stock || 0;
    
      function updateMainImage(index) {
        currentIndex = index;
        mainImage.src = images.slice(0, 3)[currentIndex];
      }
    
      function updateQuantity(newValue) {
        let quantity = Math.max(1, Math.min(stock, parseInt(newValue) || 1));
        quantityInput.value = quantity;
      }
    
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          updateMainImage(parseInt(thumb.dataset.index));
        });
      });
    
      quantityInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 1;
        if (value > stock) {
          value = stock;
          showNotification('Cantidad limitada por stock disponible');
        }
        updateQuantity(value);
      });
    
      decrementBtn.addEventListener('click', () => updateQuantity(parseInt(quantityInput.value) - 1));
      incrementBtn.addEventListener('click', () => updateQuantity(parseInt(quantityInput.value) + 1));
    
      if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
          const productData = {
            name: product.nombre,
            price: product.precio,
            image: images[0],
            details: product.descripcion,
            quantity: parseInt(quantityInput.value),
            stock: stock
          };
          addToCart(productData);
        });
      }
    
      if (buyNowButton) {
        buyNowButton.addEventListener('click', () => {
          const productData = {
            name: product.nombre,
            price: product.precio,
            image: images[0],
            details: product.descripcion,
            quantity: parseInt(quantityInput.value),
            stock: stock
          };
          addToCart(productData);
          modal.classList.remove('open');
          document.body.style.overflow = 'auto';
          openCartModal();
        });
      }
    
      if (shareButton) {
        shareButton.addEventListener('click', async () => {
          try {
            const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}-${encodeURIComponent(product.nombre)}`;
            await navigator.clipboard.writeText(productUrl);
            showNotification('¡Enlace copiado! Comparte este producto');
            const icon = shareButton.querySelector('.material-icons');
            icon.textContent = 'check';
            setTimeout(() => {
              icon.textContent = 'share';
            }, 2000);
          } catch (err) {
            console.error('Error al copiar:', err);
            showNotification('Error al copiar el enlace');
          }
        });
      }
    
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          modal.classList.remove('open');
          document.body.style.overflow = 'auto';
        });
      }
    
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          document.body.style.overflow = 'auto';
        }
      });
    }
    
    // Función para configurar los event listeners de los productos
    function setupProductEventListeners(products, selectedCategories, categoryCounts) {
      productsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.view-button');
        const moreButton = e.target.closest('.more-products-btn');
    
        if (button) {
          const images = JSON.parse(button.dataset.images);
          const product = JSON.parse(button.dataset.product);
          const modal = openProductImagesModal(images, product);
          setupModalEventListeners(modal, images, product);
        } else if (moreButton) {
          const category = moreButton.dataset.category;
          loadedProductsPerCategory[category] = (loadedProductsPerCategory[category] || 10) + 10;
          renderProducts(products, selectedCategories, productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
          setupProductEventListeners(products, selectedCategories, categoryCounts);
        }
      });
    }
    
    // Función para obtener categorías únicas según el rubro
    function getCategoriesByRubro(data, rubro) {
      const categories = new Set();
      Object.values(data).forEach(departamento => {
        Object.values(departamento).forEach(ciudad => {
          Object.values(ciudad).forEach(producto => {
            if (producto.rubro === rubro && producto.categoria) {
              categories.add(producto.categoria);
            }
          });
        });
      });
      return Array.from(categories).sort();
    }
    
    // Función para filtrar productos según rubro y categorías seleccionadas
    function filterProducts(data, rubro, selectedCategories) {
      const products = [];
      Object.values(data).forEach(departamento => {
        Object.values(departamento).forEach(ciudad => {
          Object.values(ciudad).forEach(producto => {
            products.push(producto);
          });
        });
      });
      if (!rubro) return products;
      if (selectedCategories.length === 0) return products.filter(producto => producto.rubro === rubro);
      return products.filter(producto => producto.rubro === rubro && selectedCategories.includes(producto.categoria));
    }
    
    // Función para calcular el conteo de productos por categoría
    function getCategoryCounts(data) {
      const categoryCounts = {};
      Object.values(data).forEach(departamento => {
        Object.values(departamento).forEach(ciudad => {
          Object.values(ciudad).forEach(producto => {
            const category = producto.categoria || 'Sin categoría';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        });
      });
      return categoryCounts;
    }
    
    // Función para manejar URLs con hash de producto
    function handleProductHash() {
      const hash = window.location.hash;
      const productMatch = hash.match(/#product-([^#]+)-(.+)/);
      
      if (productMatch) {
        const productId = productMatch[1];
        const productName = decodeURIComponent(productMatch[2]);
        
        const productosRef = ref(db, 'productsbylocation');
        onValue(productosRef, (snapshot) => {
          const data = snapshot.val() || {};
          const allProducts = [];
          Object.values(data).forEach(departamento => {
            Object.values(departamento).forEach(ciudad => {
              Object.values(ciudad).forEach(producto => {
                allProducts.push(producto);
              });
            });
          });
          const product = allProducts.find(p => p.id === productId);
          
          if (product && product.nombre.toLowerCase() === productName.toLowerCase()) {
            const modal = openProductImagesModal(product.imagenes, product);
            setupModalEventListeners(modal, product.imagenes, product);
            history.replaceState(null, null, ' ');
          } else {
            console.warn('El producto no coincide');
            showNotification('El producto no se encuentra disponible');
          }
        }, { onlyOnce: true });
      }
    }
    
    // Función para configurar eventos de paginación
    function setupPaginationEvents(totalCategories, products, selectedCategories, categoryCounts) {
      productsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.pagination-btn');
        if (!target) return;
        
        if (target.textContent.includes('chevron_left')) {
          currentCategoryPage = Math.max(1, currentCategoryPage - 1);
        } else if (target.textContent.includes('chevron_right')) {
          currentCategoryPage = Math.min(Math.ceil(totalCategories / categoriesPerPage), currentCategoryPage + 1);
        } else {
          currentCategoryPage = parseInt(target.textContent);
        }
        
        // Scroll hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        renderProducts(products, selectedCategories, productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
        renderPagination(totalCategories, categoriesPerPage, currentCategoryPage, productsContainer);
        setupProductEventListeners(products, selectedCategories, categoryCounts);
      });
    }
    
    // Inicialización de la aplicación
    document.addEventListener('DOMContentLoaded', () => {
      // Configurar eventos del carrito
      if (cartModal) {
        cartModal.querySelector('.close-cart')?.addEventListener('click', closeCartModalHandler);
        cartModal.addEventListener('click', (e) => {
          if (e.target === cartModal) closeCartModalHandler();
        });
      }
    
      document.querySelector('.cart-icon')?.addEventListener('click', openCartModal);
    
      // Configurar eventos del carrito en el modal
      modalBodyCarrito?.addEventListener('click', (e) => {
        const target = e.target;
        const itemElement = target.closest('.cart-item');
        if (!itemElement) return;
    
        const id = parseInt(itemElement.querySelector('.cart-quantity').dataset.id);
        const stock = parseInt(itemElement.querySelector('.cart-quantity').dataset.stock);
    
        if (target.closest('.btn-decrement')) {
          const quantityInput = itemElement.querySelector('.cart-quantity');
          let quantity = Math.max(1, parseInt(quantityInput.value) - 1);
          quantityInput.value = quantity;
          const itemToUpdate = cartItems.find(i => i.id === id);
          if (itemToUpdate) {
            itemToUpdate.quantity = quantity;
            saveCartToStorage();
            updateCartDisplay(cartItems, modalBodyCarrito);
          }
        } else if (target.closest('.btn-increment')) {
          const quantityInput = itemElement.querySelector('.cart-quantity');
          let quantity = Math.min(stock, parseInt(quantityInput.value) + 1);
          quantityInput.value = quantity;
          const itemToUpdate = cartItems.find(i => i.id === id);
          if (itemToUpdate) {
            itemToUpdate.quantity = quantity;
            saveCartToStorage();
            updateCartDisplay(cartItems, modalBodyCarrito);
          }
        } else if (target.closest('.remove-item')) {
          cartItems = cartItems.filter(i => i.id !== id);
          saveCartToStorage();
          updateCartDisplay(cartItems, modalBodyCarrito);
          showNotification('Producto eliminado');
        }
      });
    
      modalBodyCarrito?.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-quantity')) {
          const id = parseInt(e.target.dataset.id);
          const stock = parseInt(e.target.dataset.stock);
          let quantity = Math.max(1, Math.min(stock, parseInt(e.target.value) || 1));
          e.target.value = quantity;
          const itemToUpdate = cartItems.find(i => i.id === id);
          if (itemToUpdate) {
            itemToUpdate.quantity = quantity;
            saveCartToStorage();
            updateCartDisplay(cartItems, modalBodyCarrito);
          }
        }
      });
    
      modalBodyCarrito?.addEventListener('click', (e) => {
        if (e.target.closest('#onlinePaymentBtn')) {
          alert('Redirigiendo a pago online...');
        } else if (e.target.closest('#cashPaymentBtn')) {
          alert('Seleccionaste pago en efectivo');
        }
      });
    
      // Cargar datos de Firebase
      const productosRef = ref(db, 'productsbylocation');
      onValue(productosRef, (snapshot) => {
        const data = snapshot.val() || {};
        const allProducts = [];
        const categoryCounts = getCategoryCounts(data);
        
        Object.values(data).forEach(departamento => {
          Object.values(departamento).forEach(ciudad => {
            Object.values(ciudad).forEach(producto => {
              allProducts.push(producto);
            });
          });
        });
    
        // Obtener categorías únicas para la paginación
        const allCategories = [...new Set(allProducts.map(p => p.categoria || 'Sin categoría'))].sort();
    
        // Configurar eventos de filtrado
        rubroInputs.forEach(input => {
          input.addEventListener('change', () => {
            currentCategoryPage = 1; // Reiniciar a la primera página
            loadedProductsPerCategory = {}; // Reiniciar productos cargados
            const currentRubro = input.value;
            const categories = getCategoriesByRubro(data, currentRubro);
            renderCategories(categories, categoriesContainer);
            const products = filterProducts(data, currentRubro, []);
            renderProducts(products, [], productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
            renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
            setupProductEventListeners(products, [], categoryCounts);
            setupPaginationEvents(allCategories.length, products, [], categoryCounts);
          });
        });
    
        categoriesContainer.addEventListener('change', (event) => {
          if (event.target.name === 'category') {
            currentCategoryPage = 1; // Reiniciar a la primera página
            loadedProductsPerCategory = {}; // Reiniciar productos cargados
            const currentRubro = document.querySelector('input[name="rubro"]:checked')?.value;
            if (!currentRubro) return;
            const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
            const filteredProducts = filterProducts(data, currentRubro, selectedCategories);
            renderProducts(filteredProducts, selectedCategories, productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
            renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
            setupProductEventListeners(filteredProducts, selectedCategories, categoryCounts);
            setupPaginationEvents(allCategories.length, filteredProducts, selectedCategories, categoryCounts);
          }
        });
    
        // Renderizar productos iniciales
        renderProducts(allProducts, [], productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
        renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
        setupProductEventListeners(allProducts, [], categoryCounts);
        setupPaginationEvents(allCategories.length, allProducts, [], categoryCounts);
      }, { onlyOnce: false });
    
      // Cargar carrito inicial
      updateCartDisplay(cartItems, modalBodyCarrito);
    
      // Manejar URLs con hash de producto
      handleProductHash();
    
      // Escuchar cambios en el hash
      window.addEventListener('hashchange', handleProductHash);
    });