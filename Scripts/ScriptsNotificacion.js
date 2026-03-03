// Notificaciones interactivas (global para páginas cliente)
document.addEventListener('DOMContentLoaded', () => {
    function showToast(msg, timeout = 2500){
        let wrap = document.getElementById('clientToastWrap');
        if(!wrap){ wrap = document.createElement('div'); wrap.id = 'clientToastWrap'; wrap.style.position='fixed'; wrap.style.right='16px'; wrap.style.bottom='16px'; wrap.style.zIndex='9999'; document.body.appendChild(wrap); }
        const t = document.createElement('div'); t.textContent = msg; t.style.background='#111'; t.style.color='#fff'; t.style.padding='8px 12px'; t.style.borderRadius='8px'; t.style.marginTop='8px'; t.style.boxShadow='0 6px 18px rgba(0,0,0,0.15)'; wrap.appendChild(t);
        setTimeout(()=>{ t.style.transition='opacity .25s'; t.style.opacity='0'; setTimeout(()=>t.remove(),250); }, timeout);
    }

    // Para cada botón .notification-btn en la página, intentar encontrar su popup asociado
    const notifBtns = Array.from(document.querySelectorAll('.notification-btn'));
    notifBtns.forEach(btn => {
        // buscar popup dentro del mismo header/container
        const scope = btn.closest('.header-container') || document;
        let popup = scope.querySelector('.notification-popup') || document.getElementById('notificationPopup');

        // toggle del popup
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(popup) popup.classList.toggle('active');
        });
    });

    // Cierres dentro de popups (si existen varios)
    document.querySelectorAll('.notification-popup').forEach(pop => {
        const closeBtn = pop.querySelector('.close-popup');
        if(closeBtn) closeBtn.addEventListener('click', (e)=>{ e.stopPropagation(); pop.classList.remove('active'); });

        const markBtn = pop.querySelector('.btn-mark-read');
        if(markBtn) markBtn.addEventListener('click', (e)=>{
            e.stopPropagation();
            pop.querySelectorAll('.notification-item.unread').forEach(item=>item.classList.remove('unread'));
            // intentar ocultar badge cercano
            const header = pop.closest('body') ? document : pop.closest('.header-container') || document;
            const badge = (pop.closest('.header-container')||document).querySelector('.notification-badge') || document.getElementById('notificationBadge');
            if(badge) badge.style.display = 'none';
            showToast('Todas las notificaciones marcadas como leídas');
        });

        // evitar que clicks dentro cierren por el listener global
        pop.addEventListener('click', (e)=> e.stopPropagation());
    });

    // click fuera cierra cualquier popup abierto
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.notification-popup') && !e.target.closest('.notification-btn')){
            document.querySelectorAll('.notification-popup.active').forEach(p=>p.classList.remove('active'));
        }
    });
});