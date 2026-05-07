export function openModal(
  title,
  body
) {

  const modal =
    document.getElementById('modal');

  document.getElementById(
    'modal-title'
  ).textContent = title;

  document.getElementById(
    'modal-body'
  ).innerHTML = body;

  modal.classList.add('open');
}

export function closeModal() {

  document
    .getElementById('modal')
    .classList.remove('open');
}

export function initModal() {

  const modal =
    document.getElementById('modal');

  const close =
    document.getElementById('modal-close');

  close?.addEventListener(
    'click',
    closeModal
  );

  modal?.addEventListener(
    'click',
    (e) => {

      if (
        e.target === modal
      ) {
        closeModal();
      }
    }
  );
}