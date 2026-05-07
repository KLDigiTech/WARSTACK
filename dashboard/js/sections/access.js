import {
  createPanel
} from '../components/panel.js';

import {
  getDashboardRoles,
  getRolePermissions,
  saveRolePermissions,
  createDashboardRole,
  updateDashboardRole,
  deleteDashboardRole
} from '../services/accessService.js';

import {
  showModal
} from '../ui/modal.js';

const ALL_PERMISSIONS = [

  'overview',
  'players',
  'tournament',

  'welcome',
  'roles',
  'birthdays',
  'suggestions',

  'moderation',
  'automod',
  'tickets',
  'logs',

  'messages',
  'reactions',
  'channels',

  'access',
  'settings'
];

export async function initAccess() {

  const roles =
    await getDashboardRoles();

  const rolesHTML =
    roles.map(role => `

      <div
        class="access-role-card"
        data-role-id="${role.id}"
      >

        <div class="access-role-header">

          <div>

            <div
              class="access-role-name"
              style="
                color:
                ${role.color || '#ffffff'}
              "
            >
              ${role.name}
            </div>

          </div>

          <div class="access-role-badge">

            ${role.is_system
              ? 'SYSTEM'
              : 'CUSTOM'}

          </div>

        </div>

      </div>

    `).join('');

  document.getElementById(
    'section-content'
  ).innerHTML = `

    ${createPanel({

      title: '🔐 Accès Dashboard',

      body: `

        <div class="access-topbar">

          <button
            class="access-create-btn"
            id="create-role-btn"
          >

            <i class="fas fa-plus"></i>

            Nouveau rôle

          </button>

        </div>

        <div class="access-roles-grid">

          ${rolesHTML}

        </div>

      `
    })}

  `;

  // =========================================
  // CREATE ROLE
  // =========================================

  const createBtn =
    document.getElementById(
      'create-role-btn'
    );

  createBtn?.addEventListener(
    'click',
    () => {

      showModal({

        title:
          'Créer un rôle',

        body: `

          <div class="create-role-modal">

            <label class="modal-label">
              Nom du rôle
            </label>

            <input
              type="text"
              id="new-role-name"
              class="modal-input"
              placeholder="Ex: Staff"
            >

            <button
              class="access-save-btn"
              id="confirm-create-role"
            >

              Créer le rôle

            </button>

          </div>

        `
      });

      setTimeout(() => {

        const confirmBtn =
          document.getElementById(
            'confirm-create-role'
          );

        confirmBtn?.addEventListener(
          'click',
          async () => {

            const roleName =
              document.getElementById(
                'new-role-name'
              )
                .value
                .trim();

            if (!roleName) {
              return;
            }

            await createDashboardRole(
              roleName
            );

            window.location.reload();
          }
        );

      }, 50);
    }
  );

  initRoleEvents(roles);
}

// ============================================
// ROLE EVENTS
// ============================================

function initRoleEvents(roles) {

  document
    .querySelectorAll('.access-role-card')
    .forEach(card => {

      card.addEventListener(
        'click',
        async () => {

          const roleId =
            card.dataset.roleId;

          const role =
            roles.find(
              r => r.id == roleId
            );

          const permissions =
            await getRolePermissions(
              roleId
            );

          const currentPermissions =
            permissions.map(
              p => p.module_key
            );

          const permissionsHTML =
            ALL_PERMISSIONS.map(permission => `

              <label class="permission-toggle">

                <span>
                  ${permission}
                </span>

                <input
                  type="checkbox"
                  ${currentPermissions.includes(permission)
                    ? 'checked'
                    : ''}
                >

              </label>

            `).join('');

          // =====================================
          // ROLE MODAL
          // =====================================

          showModal({

            title:
              'Permissions du rôle',

            body: `

              <div class="edit-role-section">

                <!-- ========================= -->
                <!-- ROLE NAME -->
                <!-- ========================= -->

                <label class="modal-label">
                  Nom du rôle
                </label>

                <input
                  type="text"
                  id="edit-role-name"
                  class="modal-input"
                  value="${role.name || ''}"
                >

                <!-- ========================= -->
                <!-- ROLE COLOR -->
                <!-- ========================= -->

                <label class="modal-label">
                  Couleur
                </label>

                <div class="role-color-picker">

                  <div
                    class="role-color"
                    data-color="#5865F2"
                    style="background:#5865F2"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#57F287"
                    style="background:#57F287"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#ED4245"
                    style="background:#ED4245"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#FAA61A"
                    style="background:#FAA61A"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#EB459E"
                    style="background:#EB459E"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#00D1FF"
                    style="background:#00D1FF"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#9B59B6"
                    style="background:#9B59B6"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#FEE75C"
                    style="background:#FEE75C"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#FFFFFF"
                    style="
                      background:#FFFFFF;
                      border:2px solid #333;
                    "
                  ></div>

                  <div
                    class="role-color"
                    data-color="#95A5A6"
                    style="background:#95A5A6"
                  ></div>

                  <div
                    class="role-color"
                    data-color="#111111"
                    style="
                      background:#111111;
                      border:2px solid #333;
                    "
                  ></div>

                  <div
                    class="role-color"
                    data-color="#FFD700"
                    style="background:#FFD700"
                  ></div>

                </div>

              </div>

              <!-- ========================= -->
              <!-- PERMISSIONS -->
              <!-- ========================= -->

              <div class="permissions-grid">

                ${permissionsHTML}

              </div>

              <!-- ========================= -->
              <!-- ACTIONS -->
              <!-- ========================= -->

              <div class="access-role-actions">

                <button
                  class="access-delete-btn"
                  id="delete-role-btn"
                >

                  Supprimer le rôle

                </button>

                <button
                  class="access-save-btn"
                  id="save-permissions-btn"
                >

                  Sauvegarder

                </button>

              </div>

            `
          });

          setTimeout(() => {

            // =================================
            // COLOR PICKER
            // =================================

            let selectedColor =
              role.color || '#5865F2';

            document
              .querySelectorAll('.role-color')
              .forEach(color => {

                if (
                  color.dataset.color === role.color
                ) {
                  color.classList.add('active');
                }

                color.addEventListener(
                  'click',
                  () => {

                    document
                      .querySelectorAll('.role-color')
                      .forEach(c =>
                        c.classList.remove('active')
                      );

                    color.classList.add('active');

                    selectedColor =
                      color.dataset.color;
                  }
                );
              });

            // =================================
            // DELETE ROLE
            // =================================

            const deleteBtn =
              document.getElementById(
                'delete-role-btn'
              );

            deleteBtn?.addEventListener(
              'click',
              async () => {

                const confirmDelete =
                  confirm(
                    'Supprimer ce rôle ?'
                  );

                if (!confirmDelete) {
                  return;
                }

                await deleteDashboardRole(
                  roleId
                );

                window.location.reload();
              }
            );

            // =================================
            // SAVE BUTTON
            // =================================

            const saveBtn =
              document.getElementById(
                'save-permissions-btn'
              );

            saveBtn?.addEventListener(
              'click',
              async () => {

                const roleName =
                  document.getElementById(
                    'edit-role-name'
                  )
                    .value
                    .trim();

                // =============================
                // UPDATE ROLE
                // =============================

                await updateDashboardRole(
                  roleId,
                  {
                    name: roleName,
                    color: selectedColor
                  }
                );

                // =============================
                // GET SELECTED PERMISSIONS
                // =============================

                const selectedPermissions = [];

                document
                  .querySelectorAll(
                    '.permission-toggle input'
                  )
                  .forEach(input => {

                    if (input.checked) {

                      const permission =

                        input
                          .closest(
                            '.permission-toggle'
                          )
                          .querySelector('span')
                          .textContent
                          .trim();

                      selectedPermissions.push(
                        permission
                      );
                    }
                  });

                // =============================
                // SAVE PERMISSIONS
                // =============================

                await saveRolePermissions(
                  roleId,
                  selectedPermissions
                );

                saveBtn.textContent =
                  'Sauvegardé';

                window.location.reload();
              }
            );

          }, 50);
        }
      );
    });
}