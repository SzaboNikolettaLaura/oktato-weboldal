export default defineNuxtRouteMiddleware((to, from) => {
  const {userData} = useUserData();
  // isAuthenticated() is an example method verifying if a user is authenticated
  if (userData.value.role === 'guest') {
    return navigateTo('/login')
  }
  return navigateTo('/landing');
})
