import { validateUserPermissions } from "../utils/validateUserPermissions"
import { useAuth } from "./useAuth"

type UseCanProps = {
  permissions?: string[]
  roles?: string[]
}

export const useCan = ({ permissions = [], roles = [] }: UseCanProps): boolean => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return false
  }

  const userHasValidPermission = validateUserPermissions({
    user,
    permissions,
    roles
  })

  return userHasValidPermission
}
