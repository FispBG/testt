const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
var admin = require("firebase-admin");

var serviceAccount = require("./test-cfce8-firebase-adminsdk-fkihm-2848571da9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-cfce8-default-rtdb.europe-west1.firebasedatabase.app/"
});


const db = admin.firestore();


app.use(bodyParser.urlencoded({ extended: false }));// Настройка сессий
app.use(session({
    secret: 'your_secret_key', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Установка флага Secure в false для локального тестирования
}));


async function checkUser(userType, usernameOrToken, password) {
    return new Promise((resolve, reject) => {
        if (userType === 'admin') {
            // Для администратора проверяем логин и пароль
            const adminRef = db.collection('admin').doc(usernameOrToken);
            adminRef.get().then(doc => {
                console.log(doc.data(),usernameOrToken,doc.exists);
                if (doc.exists && doc.data().password === password) {
                    resolve({ username: usernameOrToken, userType: 'admin' });
                } else {
                    resolve(null); // Пользователь не найден или пароль неверный
                }
            }).catch(error => {
                console.error('Error getting document:', error);
                reject(error);
            });
        } else if (userType === 'user') {
            // Для обычного пользователя проверяем токен
            const tokenRef = db.collection('tokenUsers').doc(usernameOrToken);
            tokenRef.get().then(doc => {
                if (doc.exists) {
                    resolve({ username: usernameOrToken, userType: 'user' });
                } else {
                    resolve(null); // Пользователь не найден или токен неверный
                }
            }).catch(error => {
                console.error('Error getting document:', error);
                reject(error);
            });
        } else {
            reject(new Error('Неверный тип пользователя'));
        }
    });
}




function checkAdmin(req, res, next) {
    // console.log(req.session.user,req.session.user.userType);
    if (req.session.user && req.session.user.userType === 'admin') {
        req.isAdmin = true; // Устанавливаем флаг isAdmin в true, если пользователь является администратором
    }
    next(); // Продолжаем обработку запроса
}

app.get('/admin', checkAdmin, (req, res) => {
    if (req.isAdmin){
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.redirect('/login');
    }
});

// Настройка парсера тела запроса

// Маршрут для отображения формы логина
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Маршрут для обработки формы логина
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await checkUser('admin', username, password);
    if (user) {
        // Создание сессии после успешной аутентификации
        req.session.user = user;
        res.redirect('/admin');
    } else {
        console.log("Unauthorized");
    }
})


app.get('/token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'token.html'));
});

app.post('/token', async (req, res) => {
    const { token } = req.body;
    const user = await checkUser('user', token, null);
    console.log(user);
    if (user) {
        // Создание сессии после успешной аутентификации
        req.session.user = user;
        res.redirect('/laba');
    } else {
        console.log("Unauthorized");
    }
})

app.get('/laba', checkAdmin, (req, res) => {
    console.log(req.session.user);
    if (req.session.user){
        res.sendFile(path.join(__dirname, 'public', 'laba.html'));
    } else {
        res.redirect('/token');
    }
});

// Маршрут для выхода из аккаунта
app.get('/logout', (req, res) => { // Изменено на GET, так как форма отправляет GET запрос
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Удаление cookie сессии
        res.redirect('/'); // Перенаправление на страницу входа после выхода
    });
});

// Маршрут для главной страницы
app.get('/', (req, res) => {
    console.log(req.session.user);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));
// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
