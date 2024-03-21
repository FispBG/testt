var modal = document.getElementById("modal");
        var btn = document.getElementById("confirmLogout");

        document.querySelector('.button').addEventListener('click', function(event) {
            event.preventDefault();
            modal.style.display = "block";
        });

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        btn.onclick = function() {
            window.location.href = "/logout";
        }

        function closeModal() {
            modal.style.display = "none";
        }