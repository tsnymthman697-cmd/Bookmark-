document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        searchBar: document.getElementById('search'),
        bookContainer: document.getElementById('bookContainer'),
        bookNameInput: document.getElementById('bookName'),
        bookPriceInput: document.getElementById('bookPrice')
    };

    // قائمة الكتب الابتدائية
    let booksData = [
        { title: 'فن اللامبالاة', price: 5000, image: 'https://placehold.co/200x250?text=Book+1' },
        { title: 'الأب الغني والأب الفقير', price: 7000, image: 'https://placehold.co/200x250?text=Book+2' },
        { title: 'قواعد العشق الأربعون', price: 6000, image: 'https://placehold.co/200x250?text=Book+3' }
    ];

    // دالة عرض الكتب في الصفحة
    function renderBooks(books) {
        if (!DOM.bookContainer) return;
        DOM.bookContainer.innerHTML = '';

        if (books.length === 0) {
            DOM.bookContainer.innerHTML = `
                <p style="grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 1.1rem; padding: 2rem;">
                    عذراً، لم يتم العثور على كتب تطابق بحثك.
                </p>`;
            return;
        }

        books.forEach((book) => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book';

            bookCard.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <h3>${escapeHTML(book.title)}</h3>
                <p>السعر: ${escapeHTML(book.price.toString())} جنيه</p>
                <button type="button" class="buy-btn" data-title="${escapeHTML(book.title)}">
                    شراء الآن
                </button>
            `;

            DOM.bookContainer.appendChild(bookCard);
        });

        attachBuyEventListeners();
    }

    // تفعيل أزرار الشراء
    function attachBuyEventListeners() {
        const buyButtons = DOM.bookContainer.querySelectorAll('.buy-btn');
        buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookTitle = e.target.getAttribute('data-title');
                alert(`🎉 شكراً لك! لقد قمت بطلب شراء كتاب "${bookTitle}" بنجاح.`);
            });
        });
    }

    // إضافة كتاب جديد (مرتبطة بالـ HTML onclick="addBook()")
    window.addBook = function() {
        const name = DOM.bookNameInput.value.trim();
        const price = DOM.bookPriceInput.value.trim();

        if (!name || !price || isNaN(price) || Number(price) <= 0) {
            alert('⚠️ الرجاء إدخال اسم كتاب صحيح وسعر صالح.');
            return;
        }

        const newBook = {
            title: name,
            price: Number(price),
            image: 'https://placehold.co/200x250?text=New+Book'
        };

        booksData.push(newBook);
        renderBooks(booksData);

        DOM.bookNameInput.value = '';
        DOM.bookPriceInput.value = '';

        alert('✅ تم إضافة كتابك بنجاح إلى قائمة الكتب المتاحة!');
    };

    // البحث الفوري
    if (DOM.searchBar) {
        DOM.searchBar.addEventListener('input', () => {
            const query = DOM.searchBar.value.toLowerCase().trim();
            const filteredBooks = booksData.filter(book => 
                book.title.toLowerCase().includes(query)
            );
            renderBooks(filteredBooks);
        });
    }

    // حماية النصوص الأمنية
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // التشغيل الأولي
    renderBooks(booksData);
});