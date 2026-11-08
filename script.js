
/* ==========================================
   BOOKMARKET
   Complete JavaScript System
   ========================================== */


/* 1. إدارة البيانات */

function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem("bookmarket_current_user")
        );
    } catch (error) {
        return null;
    }
}


/* 2. التحقق من البريد الإلكتروني */

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ==========================================
   3. إنشاء حساب جديد
   register.html
   ========================================== */

const registerForm =
    document.querySelector('#fullname')?.closest('form');

if (registerForm) {

    registerForm.addEventListener('submit', function(event) {

        event.preventDefault();

        const fullname = document.querySelector('#fullname').value.trim();
        const email = document.querySelector('#email').value.trim().toLowerCase();
        const phone = document.querySelector('#phone').value.trim();
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirm-password').value;
        const accountType = document.querySelector('#account-type').value;
        const terms = document.querySelector('#terms').checked;

        if (!fullname || !email || !phone || !password) {
            alert('يرجى ملء جميع البيانات');
            return;
        }

        if (!validEmail(email)) {
            alert('البريد الإلكتروني غير صحيح');
            return;
        }

        if (password.length < 6) {
            alert('كلمة المرور يجب ألا تقل عن 6 أحرف');
            return;
        }

        if (password !== confirmPassword) {
            alert('كلمتا المرور غير متطابقتين');
            return;
        }

        if (!accountType) {
            alert('يرجى اختيار نوع الحساب');
            return;
        }

        if (!terms) {
            alert('يجب الموافقة على الشروط والأحكام');
            return;
        }

        const users = getData('bookmarket_users');

        const exists = users.some(user => user.email === email);

        if (exists) {
            alert('هذا البريد الإلكتروني مسجل بالفعل');
            return;
        }

        const newUser = {
            id: Date.now(),
            fullname,
            email,
            phone,
            password,
            accountType
        };

        users.push(newUser);

        saveData('bookmarket_users', users);

        alert('تم إنشاء الحساب بنجاح');

        window.location.href = 'index.html';

    });
}


/* ==========================================
   4. تسجيل الدخول
   index.html
   ========================================== */

const loginForm =
    document.querySelector('#password')?.closest('form');

if (loginForm && !document.querySelector('#fullname')) {

    loginForm.addEventListener('submit', function(event) {

        event.preventDefault();

        const email = document.querySelector('#email').value.trim().toLowerCase();
        const password = document.querySelector('#password').value;

        if (!email || !password) {
            alert('أدخل البريد الإلكتروني وكلمة المرور');
            return;
        }

        const users = getData('bookmarket_users');

        const user = users.find(item =>
            item.email === email &&
            item.password === password
        );

        if (!user) {
            alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            return;
        }

        const session = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            accountType: user.accountType
        };

        localStorage.setItem(
            'bookmarket_current_user',
            JSON.stringify(session)
        );

        alert('مرحباً بك ' + user.fullname);

        window.location.href = 'home.html';

    });
}


/* ==========================================
   5. حماية الصفحات الداخلية
   ========================================== */

const protectedPages = [
    'home.html',
    'search.html',
    'market.html'
];

const currentPage = window.location.pathname
    .split('/')
    .pop()
    .toLowerCase();

if (protectedPages.includes(currentPage)) {

    if (!getCurrentUser()) {

        alert('يرجى تسجيل الدخول أولاً');

        window.location.replace('index.html');

    }
}


/* ==========================================
   6. عرض اسم المستخدم
   ========================================== */

const welcomeElement =
    document.querySelector('#welcome-user');

if (welcomeElement && getCurrentUser()) {

    welcomeElement.textContent =
        'مرحباً بك ' + getCurrentUser().fullname;

}


/* ==========================================
   7. عرض الكتب في الصفحة الرئيسية
   home.html
   ========================================== */

function displayBooks() {

    const bookSection = document.querySelector('#books-list');

    if (!bookSection) return;

    bookSection.replaceChildren();

    const books = getData('bookmarket_books');

    if (books.length === 0) {

        const message = document.createElement('p');

        message.textContent = 'لا توجد كتب مضافة حالياً';

        bookSection.appendChild(message);

        return;
    }

    books.forEach(book => {

        const article = document.createElement('article');

        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = 'المؤلف: ' + book.author;

        const price = document.createElement('p');
        price.textContent = 'السعر: ' + book.price + ' جنيه';

        article.append(title, author, price);

        if (book.image) {

            const image = document.createElement('img');

            image.src = book.image;
            image.alt = book.title;
            image.style.maxWidth = '150px';

            article.prepend(image);

        }

        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = 'شراء الكتاب';

        button.addEventListener('click', function() {
            buyBook(book);
        });

        article.appendChild(button);

        bookSection.appendChild(article);

    });

}

displayBooks();


/* ==========================================
   8. إضافة كتاب للبيع
   market.html
   ========================================== */

const addBookForm =
    document.querySelector('#title')?.closest('form');

if (addBookForm) {

    addBookForm.addEventListener('submit', function(event) {

        event.preventDefault();

        const user = getCurrentUser();

        if (!user) {
            alert('يجب تسجيل الدخول أولاً');
            window.location.href = 'index.html';
            return;
        }

        const title = document.querySelector('#title').value.trim();
        const author = document.querySelector('#author').value.trim();
        const category = document.querySelector('#category').value;
        const price = Number(document.querySelector('#price').value);
        const condition = document.querySelector('#condition').value;
        const description = document.querySelector('#description').value.trim();

        const imageFile = document.querySelector('#book-image').files[0];

        if (!title || !author || !category || !condition || price <= 0) {
            alert('يرجى إدخال بيانات الكتاب بشكل صحيح');
            return;
        }

        function finishAdding(imageData = '') {

            const books = getData('bookmarket_books');

            books.push({
                id: Date.now(),
                title,
                author,
                category,
                price,
                condition,
                description,
                image: imageData,
                seller: user.fullname,
                sellerEmail: user.email,
                sellerPhone: user.phone
            });

            saveData('bookmarket_books', books);

            alert('تمت إضافة الكتاب بنجاح');

            addBookForm.reset();

        }

        if (imageFile) {

            if (!imageFile.type.startsWith('image/')) {
                alert('الملف المختار ليس صورة');
                return;
            }

            if (imageFile.size > 1024 * 1024) {
                alert('حجم الصورة يجب ألا يتجاوز 1 ميجابايت');
                return;
            }

            const reader = new FileReader();

            reader.onload = function() {
                finishAdding(reader.result);
            };

            reader.onerror = function() {
                alert('تعذر قراءة الصورة');
            };

            reader.readAsDataURL(imageFile);

        } else {

            finishAdding();

        }

    });

}


/* ==========================================
   9. البحث عن كتاب
   search.html
   ========================================== */

const searchForm =
    document.querySelector('#book-name')?.closest('form');

if (searchForm) {

    searchForm.addEventListener('submit', function(event) {

        event.preventDefault();

        const keyword = document.querySelector('#book-name')
            .value.trim().toLowerCase();

        const books = getData('bookmarket_books');

        const results = books.filter(book =>
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword)
        );

        const resultsSection =
            document.querySelector('#search-results');

        if (!resultsSection) {
            alert('أضف id="search-results" لقسم نتائج البحث');
            return;
        }

        resultsSection.replaceChildren();

        if (results.length === 0) {

            const message = document.createElement('p');

            message.textContent = 'لم نجد كتاباً بهذا الاسم';

            resultsSection.appendChild(message);

            return;
        }

        results.forEach(book => {

            const article = document.createElement('article');

            const title = document.createElement('h3');
            title.textContent = book.title;

            const author = document.createElement('p');
            author.textContent = 'المؤلف: ' + book.author;

            const price = document.createElement('p');
            price.textContent = 'السعر: ' + book.price + ' جنيه';

            const button = document.createElement('button');
            button.textContent = 'شراء الكتاب';

            button.addEventListener('click', function() {
                buyBook(book);
            });

            article.append(title, author, price, button);

            resultsSection.appendChild(article);

        });

    });

}


/* ==========================================
   10. شراء كتاب
   ========================================== */

function buyBook(book) {

    const user = getCurrentUser();

    if (!user) {
        alert('سجل الدخول أولاً');
        window.location.href = 'index.html';
        return;
    }

    if (user.email === book.sellerEmail) {
        alert('لا يمكنك شراء كتابك الخاص');
        return;
    }

    const confirmed = confirm(
        'هل تريد طلب شراء: ' + book.title + '؟'
    );

    if (!confirmed) return;

    const orders = getData('bookmarket_orders');

    orders.push({
        id: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        buyer: user.fullname,
        buyerEmail: user.email,
        seller: book.seller,
        sellerEmail: book.sellerEmail,
        date: new Date().toISOString(),
        status: 'طلب جديد'
    });

    saveData('bookmarket_orders', orders);

    alert(
        'تم تسجيل طلب الشراء التجريبي بنجاح. ' +
        'يمكنك التواصل مع البائع لإتمام الاتفاق.'
    );

}


/* ==========================================
   11. تواصل معنا
   contact.html
   ========================================== */

const contactForm =
    document.querySelector('#subject')?.closest('form');

if (contactForm) {

    contactForm.addEventListener('submit', function(event) {

        event.preventDefault();

        const name = document.querySelector('#name').value.trim();
        const email = document.querySelector('#email').value.trim();
        const subject = document.querySelector('#subject').value.trim();
        const message = document.querySelector('#message').value.trim();

        if (!name || !validEmail(email) || !subject || !message) {
            alert('يرجى التأكد من إدخال جميع البيانات بشكل صحيح');
            return;
        }

        const messages = getData('bookmarket_messages');

        messages.push({
            id: Date.now(),
            name,
            email,
            subject,
            message,
            date: new Date().toISOString()
        });

        saveData('bookmarket_messages', messages);

        alert('تم حفظ رسالتك بنجاح');

        contactForm.reset();

    });

}


/* ==========================================
   12. تسجيل الخروج
   ========================================== */

const logoutButton = document.querySelector('#logout');

if (logoutButton) {

    logoutButton.addEventListener('click', function() {

        const confirmed = confirm('هل تريد تسجيل الخروج؟');

        if (!confirmed) return;

        localStorage.removeItem('bookmarket_current_user');

        window.location.href = 'index.html';

    });

}


/* ==========================================
   END BOOKMARKET
   ========================================== */

console.log('BookMarket is running successfully!');
