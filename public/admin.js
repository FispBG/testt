document.addEventListener('DOMContentLoaded', function() {
    const authInput = document.getElementById('auth-input');
    const authButton = document.getElementById('auth-button');
    const tokenList = document.getElementById('token-list');
    const addTokenButton = document.getElementById('add-token-button');
    const removeTokenButton = document.getElementById('remove-token-button');

    authButton.addEventListener('click', function() {
        const token = authInput.value.trim();
        if (token) {
            addTokenToList(token);
            authInput.value = '';
        }
    });

    addTokenButton.addEventListener('click', function() {
        const token = prompt('Введите токен для добавления:');
        if (token) {
            addTokenToList(token);
        }
    });

    removeTokenButton.addEventListener('click', function() {
        const selectedToken = document.querySelector('.token-list-item.selected');
        if (selectedToken) {
            selectedToken.remove();
        }
    });

    function addTokenToList(token) {
        const listItem = document.createElement('li');
        listItem.textContent = token;
        listItem.classList.add('token-list-item');
        listItem.addEventListener('click', function() {
            document.querySelectorAll('.token-list-item').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
        });
        tokenList.appendChild(listItem);
    }
});
