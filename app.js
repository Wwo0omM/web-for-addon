// Переключение между разделами
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');

            // Убираем активный класс со всех пунктов меню
            menuItems.forEach(mi => mi.classList.remove('active'));

            // Добавляем активный класс к текущему пункту
            this.classList.add('active');

            // Скрываем все секции
            sections.forEach(section => section.classList.remove('active'));

            // Показываем нужную секцию
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
});
