import axios from "axios";
import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";
import { handleApiError } from "api/utils/handleApiError";
import { buildPermissionUrl } from "api/permissions/utils";
import { Permission } from "app/entities/permission";

export const getPermissions = async () => {
  try {
    return await axios.get(buildJsonUrl(Url.Admin.Permissions));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getPermissionsForMember = async (memberId: string) => {
  try {
    return await axios.get(buildPermissionUrl(memberId));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const putPermissions = async (memberId: string, permissionsList: Permission[]) => {
  try {
    return await axios.put(buildPermissionUrl(memberId, true), {
      member: { permissionsList }
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}