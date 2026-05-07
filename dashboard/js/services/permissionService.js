import {
  fetchSupabase
} from '../api.js';

import {
  GUILD_ID
} from '../config.js';

// ============================================
// CURRENT USER
// ============================================

const CURRENT_DISCORD_ID =
  '1233271006236377180';

// ============================================
// GET USER PERMISSIONS
// ============================================

export async function getUserPermissions() {

  try {

    // USER ROLE

    const userRoles =
      await fetchSupabase(
        'dashboard_user_roles?select=*'
      );

    const userRole =
      userRoles.find(role =>

        String(role.guild_id)
          === String(GUILD_ID)

        &&

        String(role.discord_id)
          === String(CURRENT_DISCORD_ID)

      );

    if (!userRole) {

      console.warn(
        'Aucun rôle utilisateur'
      );

      return [];
    }

    // ROLE PERMISSIONS

    const permissions =
      await fetchSupabase(
        'dashboard_role_permissions?select=*'
      );

    const rolePermissions =
      permissions.filter(permission =>

        String(permission.role_id)
          === String(userRole.role_id)

      );

    return rolePermissions.map(
      permission =>
        permission.module_key
    );

  } catch (err) {

    console.error(
      'Permission service error:',
      err
    );

    return [];
  }
}