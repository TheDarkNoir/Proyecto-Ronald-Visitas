/* =====================================================
   ADMIN PANEL SPA SYSTEM
   Navegación sin recarga
=====================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const navLinks = document.querySelectorAll(".nav-link");
    const views = document.querySelectorAll(".admin-view");

    /* ===============================
       CAMBIO DE VISTAS
    ===============================*/
    navLinks.forEach(link => {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const targetID = this
                .getAttribute("href")
                .replace("#", "");

            const targetView = document.getElementById(targetID);

            if (!targetView) return;

            /* ocultar todas las vistas */
            views.forEach(view =>
                view.classList.remove("active")
            );

            /* mostrar vista seleccionada */
            targetView.classList.add("active");

            /* sidebar activo */
            document.querySelectorAll(".nav-item")
                .forEach(item =>
                    item.classList.remove("active")
                );

            this.parentElement.classList.add("active");

        });

    });


    /* ===============================
       VISTA INICIAL
    ===============================*/
    const firstView = document.querySelector(".admin-view");

    if (firstView) {
        firstView.classList.add("active");
    }

});


/* =====================================================
   EFECTO HOVER METRIC CARDS
=====================================================*/
document.querySelectorAll(".metric-card")
.forEach(card => {

    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-4px)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
    });

});


/* =====================================================
   BOTÓN LOGOUT (SIMULACIÓN)
=====================================================*/
const logoutBtn = document.querySelector(".logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "¿Deseas cerrar sesión?"
        );

        if (confirmLogout) {

           
            window.location.href = "login.html";

        }
    });
}


/* =====================================================
   NOTIFICACIÓN DEMO
=====================================================*/
const notificationBtn =
    document.querySelector(".btn-notification");

if (notificationBtn) {

    notificationBtn.addEventListener("click", () => {

        alert("No tienes nuevas notificaciones 🔔");

    });

}